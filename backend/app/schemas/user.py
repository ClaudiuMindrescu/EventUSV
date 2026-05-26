from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    is_organizer: Optional[bool] = False

class UserRead(UserCreate):
    id: int
