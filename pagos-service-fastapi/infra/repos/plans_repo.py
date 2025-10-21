from infra.mongo import db
from infra.bson_tools import to_out
from domain.settings import settings

class PlansRepo:
    coll = lambda: db()[settings.coll_plan]

    @staticmethod
    async def list(filters: dict | None = None):
        cur = PlansRepo.coll().find(filters or {})
        return [to_out(d) async for d in cur]

    @staticmethod
    async def get(pid: str):
        doc = await PlansRepo.coll().find_one({"_id": pid})
        return to_out(doc)

    @staticmethod
    async def create(plan: dict):
        # asegura _id string (evita ObjectId)
        doc = {**plan, "_id": plan["id"]}
        doc.pop("id", None)
        await PlansRepo.coll().insert_one(doc)
        return {**plan}

    @staticmethod
    async def upsert(plan: dict):
        doc = {**plan, "_id": plan["id"]}
        doc.pop("id", None)
        await PlansRepo.coll().replace_one({"_id": doc["_id"]}, doc, upsert=True)
        return {**plan}

    @staticmethod
    async def update(pid: str, patch: dict):
        if "id" in patch:
            patch.pop("id")
        res = await PlansRepo.coll().update_one({"_id": pid}, {"$set": patch})
        if res.matched_count == 0:
            return None
        return await PlansRepo.get(pid)

    @staticmethod
    async def delete(pid: str):
        res = await PlansRepo.coll().delete_one({"_id": pid})
        return res.deleted_count == 1
