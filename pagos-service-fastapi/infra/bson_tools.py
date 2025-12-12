from typing import Any, Mapping
from bson import ObjectId

def to_out(doc: Mapping[str, Any] | None):
    if not doc: 
        return None
    d = dict(doc)
    _id = d.pop("_id", None)
    if isinstance(_id, ObjectId):
        _id = str(_id)
    if _id is not None:
        d["id"] = _id
    return d

def many_to_out(cursor_docs):
    return [to_out(d) for d in cursor_docs]
