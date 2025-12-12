from pymongo import MongoClient
from dotenv import load_dotenv
import certifi
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "enseniamelo")

_client = MongoClient(
    MONGODB_URI,
    tls=True,                      # útil con Atlas; con mongodb+srv suele ser True igual
    tlsCAFile=certifi.where(),     # CA bundle correcto
    serverSelectionTimeoutMS=15000,
    connectTimeoutMS=15000,
    socketTimeoutMS=15000,
)

_db = _client[MONGODB_DB]

def get_db():
    return _db

def get_collection(name: str):
    return _db[name]
