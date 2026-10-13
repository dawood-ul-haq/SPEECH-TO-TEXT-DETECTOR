from datetime import datetime, timezone
from functools import lru_cache

from pymongo import DESCENDING, MongoClient
from pymongo.errors import PyMongoError
from bson import ObjectId


Error = PyMongoError


@lru_cache(maxsize=4)
def _get_client(uri):
    return MongoClient(uri, serverSelectionTimeoutMS=5000)


def get_connection(config):
    client = _get_client(config["MONGO_URI"])
    client.admin.command("ping")
    return client[config["MONGO_DATABASE"]]


def ensure_schema(database):
    database.analyses.create_index([("created_at", DESCENDING)])


def save_analysis(database, audio_filename, transcript, language, analysis):
    document = {
        "audio_filename": audio_filename,
        "transcript": transcript,
        "language": language,
        "word_count": analysis["word_count"],
        "sentence_count": analysis["sentence_count"],
        "character_count": analysis["character_count"],
        "keywords": analysis["keywords"],
        "named_entities": analysis["named_entities"],
        "sentiment": analysis["sentiment"],
        "created_at": datetime.now(timezone.utc),
    }
    result = database.analyses.insert_one(document)
    return str(result.inserted_id)


def _serialize_document(document):
    document["id"] = str(document.pop("_id"))
    created_at = document["created_at"]
    return {
        **document,
        "created_at": created_at.isoformat() if created_at else None,
    }


def list_analyses(database):
    documents = database.analyses.find().sort(
        [("created_at", DESCENDING), ("_id", DESCENDING)]
    )
    return [_serialize_document(document) for document in documents]


def get_analysis(database, analysis_id):
    document = database.analyses.find_one({"_id": ObjectId(analysis_id)})
    return _serialize_document(document) if document else None


def delete_analysis(database, analysis_id):
    result = database.analyses.delete_one({"_id": ObjectId(analysis_id)})
    return result.deleted_count > 0


__all__ = [
    "Error",
    "delete_analysis",
    "ensure_schema",
    "get_analysis",
    "get_connection",
    "list_analyses",
    "save_analysis",
]
