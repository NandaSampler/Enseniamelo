from infra.mongo import db
from domain.settings import settings

async def ensure_indexes():
    d = db()

    # Colección suscripcion
    await d[settings.coll_suscripcion].create_index("user_id", name="ix_suscripcion_user")
    await d[settings.coll_suscripcion].create_index("plan_id", name="ix_suscripcion_plan")
    await d[settings.coll_suscripcion].create_index("estado", name="ix_suscripcion_estado")

    # Colección pago
    await d[settings.coll_pago].create_index("suscripcion_id", name="ix_pago_suscripcion")
    await d[settings.coll_pago].create_index("estado", name="ix_pago_estado")

    # Colección plan (opcional)
    await d[settings.coll_plan].create_index("estado", name="ix_plan_estado")
