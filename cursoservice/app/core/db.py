from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "enseniamelo")

_client = MongoClient(MONGODB_URI)
_db = _client[MONGODB_DB]

def get_db():
    """Devuelve la referencia de base de datos MongoDB."""
    return _db

def get_collection(name: str):
    """Devuelve una colección específica."""
    return _db[name]
