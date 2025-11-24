from motor.motor_asyncio import AsyncIOMotorClient
from domain.settings import settings

_client: AsyncIOMotorClient | None = None
_db = None

async def connect_mongo():
    global _client, _db
    _client = AsyncIOMotorClient(settings.mongo_uri)
    _db = _client[settings.mongo_db]

async def close_mongo():
    if _client:
        _client.close()

def db():
    if _db is None:
        raise RuntimeError("Mongo not initialized. Call connect_mongo() in lifespan.")
    return _db
