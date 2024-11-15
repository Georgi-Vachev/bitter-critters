
from pymongo import MongoClient

client = MongoClient('mongodb+srv://gvachev:669574@cluster0.f8m81.mongodb.net/')
db = client["FetchThemAll"]
users_collection = db["users"]
characters_collection = db["characters"]  # Collection for characters
abilities_collection = db["abilities"]
