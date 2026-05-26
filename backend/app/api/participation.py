from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client
import os
from .auth import get_current_user

router = APIRouter()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

class ParticipationCreate(BaseModel):
    event_id: int
    user_id: int

@router.post("/")
async def create_participation(payload: ParticipationCreate, user: dict = Depends(get_current_user)):
    # Check if user is already registered
    existing = supabase.table("participation").select("*").eq("event_id", payload.event_id).eq("user_id", user["id"]).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    participation_data = {
        "event_id": payload.event_id,
        "user_id": user["id"]
    }
    response = supabase.table("participation").insert(participation_data).execute()
    return {"data": response.data}

@router.get("/my-registrations")
async def get_my_registrations(user: dict = Depends(get_current_user)):
    response = supabase.table("participation").select("*,event:events(*)").eq("user_id", user["id"]).execute()
    return {"data": response.data}
