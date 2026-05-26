from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from supabase import create_client
import os

router = APIRouter()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

security = HTTPBearer()

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginPayload(BaseModel):
    access_token: str


def _get_profile(user_id: str):
    profile_resp = supabase.table("profiles").select("role,is_organizer,full_name").eq("id", user_id).single().execute()
    if profile_resp.data:
        return profile_resp.data
    return {"role": "STUDENT", "is_organizer": False, "full_name": None}


def get_current_user(token: str = Depends(security)):
    try:
        user_response = supabase.auth.get_user(token.credentials)
        user = user_response.user
        if not user:
            raise ValueError("User not found")
        profile = _get_profile(user.id)
        return {
            "id": user.id,
            "email": user.email,
            "role": profile.get("role", "STUDENT"),
            "is_organizer": profile.get("is_organizer", False),
            "full_name": profile.get("full_name"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.post("/login")
async def login(payload: LoginPayload):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password,
        })
        user = response.user
        if not user:
            raise HTTPException(status_code=400, detail="Login failed")
        profile = _get_profile(user.id)
        return {
            "access_token": response.session.access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": profile.get("role", "STUDENT"),
                "is_organizer": profile.get("is_organizer", False),
                "full_name": profile.get("full_name"),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/google-login")
async def google_login(payload: GoogleLoginPayload):
    try:
        user_response = supabase.auth.get_user(payload.access_token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=400, detail="Invalid token")
        profile = _get_profile(user.id)
        return {
            "access_token": payload.access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": profile.get("role", "STUDENT"),
                "is_organizer": profile.get("is_organizer", False),
                "full_name": profile.get("full_name"),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
