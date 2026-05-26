from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from supabase import create_client
import os
from .auth import get_current_user

router = APIRouter()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    # Get profile from profiles table
    response = supabase.table("profiles").select("*,departments(name),faculties(name)").eq("id", user["id"]).single().execute()
    if response.data:
        profile_data = response.data
        # Flatten department and faculty names
        if profile_data.get("departments"):
            profile_data["department"] = profile_data["departments"]["name"]
            del profile_data["departments"]
        if profile_data.get("faculties"):
            profile_data["faculty"] = profile_data["faculties"]["name"]
            del profile_data["faculties"]
        return {"data": profile_data}
    else:
        # Fallback to auth user data
        return {"data": user}

@router.get("/")
async def list_users():
    return {"message": "List users"}
