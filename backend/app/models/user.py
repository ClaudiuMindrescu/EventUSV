from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_organizer: bool = False
