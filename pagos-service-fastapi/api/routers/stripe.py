from fastapi import APIRouter, Header, HTTPException, status, Request
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timedelta
import httpx
import stripe

from domain.settings import settings
from infra.mongo import db

router = APIRouter(prefix="/stripe", tags=["stripe"])

class CheckoutIn(BaseModel):
    id_plan: str
    inicio: str  # "YYYY-MM-DDTHH:MM:SS"

def _now_iso():
    return datetime.utcnow().isoformat(timespec="seconds")

@router.post("/checkout-session")
async def create_checkout_session(payload: CheckoutIn, authorization: str | None = Header(None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token requerido")

    token = authorization.split(" ", 1)[1].strip()

    # 1) Obtener usuario (mongoId) desde usuarios-service
    async with httpx.AsyncClient(timeout=8.0) as client:
        r = await client.get(
            f"{settings.usuarios_service_url}/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Token inválido o usuario no accesible")
    user = r.json()
    id_usuario = user.get("id")
    if not id_usuario:
        raise HTTPException(status_code=400, detail="No se pudo obtener id de usuario")

    # 2) Buscar plan
    plans = db()[settings.coll_plan]
    plan = await plans.find_one({"_id": ObjectId(payload.id_plan)})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    if plan.get("estado") != "activo":
        raise HTTPException(status_code=409, detail="Plan inactivo")

    # 3) Asegurar Stripe price_id en el plan 
    stripe.api_key = settings.stripe_secret_key

    stripe_product_id = plan.get("stripe_product_id")
    stripe_price_id = plan.get("stripe_price_id")

    if not stripe_product_id:
        product = stripe.Product.create(name=plan["nombre"], description=plan.get("descripcion", ""))
        stripe_product_id = product["id"]

    if not stripe_price_id:
        unit_amount = int(round(float(plan["precio"]) * 100))
        price = stripe.Price.create(
            product=stripe_product_id,
            unit_amount=unit_amount,
            currency="usd",
        )
        stripe_price_id = price["id"]

    # Persistir ids en Mongo 
    await plans.update_one(
        {"_id": ObjectId(payload.id_plan)},
        {"$set": {"stripe_product_id": stripe_product_id, "stripe_price_id": stripe_price_id, "updatedAt": _now_iso()}},
    )

    # 4) Crear suscripción pendiente
    subs = db()[settings.coll_suscripcion]

    inicio_dt = datetime.fromisoformat(payload.inicio)
    fin_dt = inicio_dt + timedelta(days=int(plan["duracionDias"]))

    sub_doc = {
        "id_usuario": id_usuario,
        "id_plan": payload.id_plan,
        "inicio": payload.inicio,
        "fin": fin_dt.isoformat(timespec="seconds"),
        "estado": "pendiente",
        "createdAt": _now_iso(),
        "updatedAt": _now_iso(),
        "fechaCancelacion": None,
    }

    ins = await subs.insert_one(sub_doc)
    suscripcion_id = str(ins.inserted_id)

    # 5) Crear Checkout Session
    success_url = f"{settings.frontend_base_url}/planes?success=1&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url  = f"{settings.frontend_base_url}/planes?cancel=1"


    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{"price": stripe_price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "suscripcion_id": suscripcion_id,
            "id_usuario": id_usuario,
            "id_plan": payload.id_plan,
        },
    )

    # 6) (Opcional) crear pago "procesando" ya vinculado a session.id
    pagos = db()[settings.coll_pago]
    await pagos.insert_one({
        "id_suscripcion": suscripcion_id,
        "monto": float(plan["precio"]),
        "metodo": "stripe",
        "estado": "procesando",
        "stripeSessionId": session["id"],
        "createdAt": _now_iso(),
        "updatedAt": _now_iso(),
    })

    return {"url": session["url"], "suscripcion_id": suscripcion_id}


@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str | None = Header(None, alias="stripe-signature")):
    payload = await request.body()
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Falta stripe-signature")

    stripe.api_key = settings.stripe_secret_key

    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, settings.stripe_webhook_secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook inválido: {str(e)}")

    etype = event.get("type")
    obj = event["data"]["object"]

    # Idempotencia simple por stripeSessionId
    pagos = db()[settings.coll_pago]
    subs = db()[settings.coll_suscripcion]

    if etype == "checkout.session.completed":
        session_id = obj["id"]
        meta = obj.get("metadata") or {}
        suscripcion_id = meta.get("suscripcion_id")

        if suscripcion_id:
            # Si ya existe pago exitoso para esa session, no duplicar
            existing = await pagos.find_one({"stripeSessionId": session_id, "estado": "exitoso"})
            if not existing:
                amount_total = obj.get("amount_total")  # en centavos
                monto = (amount_total / 100.0) if isinstance(amount_total, int) else None

                await pagos.update_one(
                    {"stripeSessionId": session_id},
                    {"$set": {"estado": "exitoso", "monto": monto, "updatedAt": _now_iso()}},
                )

            await subs.update_one(
                {"_id": ObjectId(suscripcion_id)},
                {"$set": {"estado": "activa", "updatedAt": _now_iso()}},
            )

    # opcional: si expira/cancela
    if etype in ("checkout.session.expired",):
        meta = obj.get("metadata") or {}
        suscripcion_id = meta.get("suscripcion_id")
        if suscripcion_id:
            await subs.update_one(
                {"_id": ObjectId(suscripcion_id)},
                {"$set": {"estado": "cancelada", "fechaCancelacion": _now_iso(), "updatedAt": _now_iso()}},
            )

    return {"received": True, "type": etype}
