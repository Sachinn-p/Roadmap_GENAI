from pymongo import MongoClient
from bson.objectid import ObjectId
import os

# Helper function to convert ObjectId to string
def convert_objectid_to_str(document):
    if document:
        document["_id"] = str(document["_id"])
    return document

def get_db():
    # Use environment variable or default to mongodb container service name
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://mongodb:27017/')
    return MongoClient(mongodb_uri)['education']

class MongoDBClient:
    def __init__(self, connection_string: str, database_name: str, collection_name: str):
        self.client = MongoClient(connection_string)
        self.database = self.client[database_name]
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