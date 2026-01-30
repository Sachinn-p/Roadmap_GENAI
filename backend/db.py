
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from urllib.parse import quote_plus

# Helper function to convert ObjectId to string
def convert_objectid_to_str(document):
    if document:
        document["_id"] = str(document["_id"])
    return document



# Helper to build a safe MongoDB Atlas URI
def get_mongo_uri():
    uri = os.getenv('MONGODB_URI')
    if uri:
        return uri
    # If not, build from components
    user = os.getenv('MONGODB_USER')
    pwd = os.getenv('MONGODB_PASS')
    cluster = os.getenv('MONGODB_CLUSTER')
    params = os.getenv('MONGODB_PARAMS', 'retryWrites=true&w=majority')
    if user and pwd and cluster:
        user_enc = quote_plus(user)
        pwd_enc = quote_plus(pwd)
        return f"mongodb+srv://{user_enc}:{pwd_enc}@{cluster}/?{params}"
    # fallback to localhost
    return 'mongodb://mongodb:27017/'

def get_db():
    mongodb_uri = get_mongo_uri()
    client = MongoClient(mongodb_uri)
    db_name = os.getenv('MONGODB_DB', 'education')
    db = client[db_name]
    collection_name = os.getenv('MONGODB_COLLECTION', 'roadmaps')
    if collection_name not in db.list_collection_names():
        db.create_collection(collection_name)
    return db



class MongoDBClient:
    def __init__(self, connection_string: str, database_name: str, collection_name: str):
        # Use get_mongo_uri to ensure safe URI
        self.client = MongoClient(get_mongo_uri())
        self.database = self.client[database_name]
        if collection_name not in self.database.list_collection_names():
            self.database.create_collection(collection_name)
        self.collection = self.database[collection_name]

    def create_document(self, document: dict) -> dict:
        result = self.collection.insert_one(document)
        new_document = self.collection.find_one({"_id": result.inserted_id})
        return convert_objectid_to_str(new_document)

    def create_documents(self, documents: list) -> list:
        # Insert multiple documents into the collection
        result = self.collection.insert_many(documents)
        
        # Retrieve the newly inserted documents using their _ids
        new_documents = []
        for inserted_id in result.inserted_ids:
            document = self.collection.find_one({"_id": inserted_id})
            new_documents.append(convert_objectid_to_str(document))
        
        return new_documents

    def read_document(self, document_id: str) -> dict:
        document = self.collection.find_one({"_id": ObjectId(document_id)})
        return convert_objectid_to_str(document)
    

    def read_documents_by_course(self, name: str) -> list:
        """
        Fetch all documents and filter those where curriculum.roadMap.course_name matches the provided course_name.
        """
        documents = self.collection.find()  # Fetch all documents
        
        result = []
        for doc in documents:
            # Check if the document contains the course_name
            if doc.get("curriculum", {}).get("roadMap", {}).get("name") == name:
                result.append(convert_objectid_to_str(doc))

        if not result:
            print(f"No documents found for course_name: {name}")
        
        return result


    
    def update_document(self, document_id: str, updated_data: dict) -> bool:
        result = self.collection.update_one(
            {"_id": ObjectId(document_id)}, {"$set": updated_data}
        )
        return result.modified_count > 0

    def delete_document(self, document_id: str) -> bool:
        result = self.collection.delete_one({"_id": ObjectId(document_id)})
        return result.deleted_count > 0

    def list_documents(self) -> list:
        documents = []
        for document in self.collection.find():
            documents.append(convert_objectid_to_str(document))
        return documents