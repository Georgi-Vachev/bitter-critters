from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your_secret_key"  # Replace with a secure key
ALGORITHM = "HS256"

def create_jwt_token(data: dict):
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_jwt_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
