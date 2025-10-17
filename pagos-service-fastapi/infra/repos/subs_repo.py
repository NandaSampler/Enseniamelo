from infra.mongo import db
from infra.bson_tools import to_out
from domain.settings import settings

class SubsRepo:
    coll = lambda: db()[settings.coll_suscripcion]

    @staticmethod
    async def list(filters: dict | None = None):
        cur = SubsRepo.coll().find(filters or {})
        return [to_out(d) async for d in cur]

    @staticmethod
    async def get(sid: str):
        return to_out(await SubsRepo.coll().find_one({"_id": sid}))

    @staticmethod
    async def create(subs: dict):
        doc = {**subs, "_id": subs["id"]}
        doc.pop("id", None)
        await SubsRepo.coll().insert_one(doc)
        return {**subs}

    @staticmethod
    async def update(sid: str, patch: dict):
        patch.pop("id", None)
        res = await SubsRepo.coll().update_one({"_id": sid}, {"$set": patch})
        if res.matched_count == 0:
            return None
        return await SubsRepo.get(sid)

    @staticmethod
    async def delete(sid: str):
        res = await SubsRepo.coll().delete_one({"_id": sid})
        return res.deleted_count == 1
