from pydantic import BaseModel, Field
from typing import List

class User(BaseModel):
    username: str = Field(..., max_length=50)
    hashed_password: str
    level: int = 1
    unlocked_characters: List[str] = []
