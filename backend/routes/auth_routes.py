from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
from db import users_collection
from models.user_model import User
from auth.jwt_handler import create_jwt_token

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register/")
async def register(request: RegisterRequest):
    print("Received request data:", request)
    hashed_password = pwd_context.hash(request.password)
    user = {"username": request.username, "hashed_password": hashed_password, "level": 1, "unlocked_characters": []}
    
    if users_collection.find_one({"username": request.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    users_collection.insert_one(user)
    return {"message": "User registered successfully"}

@router.post("/login/")
async def login(request: LoginRequest):  # Use the model to parse the JSON body
    print("Received request data:", request.dict())  # Log incoming data
    
    user = users_collection.find_one({"username": request.username})
    
    if user and pwd_context.verify(request.password, user["hashed_password"]):
        token = create_jwt_token({"username": request.username})
        return {"access_token": token}
    
    raise HTTPException(status_code=400, detail="Invalid credentials")