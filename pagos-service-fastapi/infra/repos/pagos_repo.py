from infra.mongo import db
from infra.bson_tools import to_out
from domain.settings import settings

class PagosRepo:
    coll = lambda: db()[settings.coll_pago]

    @staticmethod
    async def list(filters: dict | None = None):
        cur = PagosRepo.coll().find(filters or {})
        return [to_out(d) async for d in cur]

    @staticmethod
    async def get(pid: str):
        return to_out(await PagosRepo.coll().find_one({"_id": pid}))

    @staticmethod
    async def create(pago: dict):
        doc = {**pago, "_id": pago["id"]}
        doc.pop("id", None)
        await PagosRepo.coll().insert_one(doc)
        return {**pago}

    @staticmethod
    async def update(pid: str, patch: dict):
        patch.pop("id", None)
        res = await PagosRepo.coll().update_one({"_id": pid}, {"$set": patch})
        if res.matched_count == 0:
            return None
        return await PagosRepo.get(pid)

    @staticmethod
    async def delete(pid: str):
        res = await PagosRepo.coll().delete_one({"_id": pid})
        return res.deleted_count == 1
