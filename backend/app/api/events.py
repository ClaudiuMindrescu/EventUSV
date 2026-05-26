from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from supabase import create_client
import os
from .auth import get_current_user

router = APIRouter()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

class EventCreate(BaseModel):
    title: str
    short_description: str
    full_description: str
    location_id: str
    date_start: datetime
    date_end: datetime
    category: str
    image_url: Optional[str] = None
    registration_link: Optional[str] = None
    qr_code_data: Optional[str] = None
    mode: Optional[str] = None
    status: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    location_id: Optional[str] = None
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    registration_link: Optional[str] = None
    qr_code_data: Optional[str] = None
    mode: Optional[str] = None
    status: Optional[str] = None


def _parse_datetime(value):
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        cleaned = value.replace("Z", "+00:00")
        return datetime.fromisoformat(cleaned)
    return None


def _can_manage_events(user: dict):
    return user.get("role") == "ADMIN" or user.get("is_organizer") is True

@router.get("/")
async def list_events(user: dict = Depends(get_current_user)):
    query = supabase.table("events").select("*")
    if user.get("role") == "ADMIN":
        pass
    elif _can_manage_events(user):
        query = query.eq("organizer_id", user["id"])
    else:
        query = query.eq("status", "approved")
    response = query.execute()
    return {"data": response.data}

@router.post("/")
async def create_event(event: EventCreate, user: dict = Depends(get_current_user)):
    if not _can_manage_events(user):
        raise HTTPException(status_code=403, detail="Only organizers or admins can create events")
    event_data = event.dict()
    event_data["organizer_id"] = user["id"]
    event_data["status"] = event_data.get("status") or "pending"

    approved_response = supabase.table("events").select("date_start,date_end").eq("location_id", event_data["location_id"]).eq("status", "approved").execute()
    for approved_event in approved_response.data or []:
        existing_start = _parse_datetime(approved_event["date_start"])
        existing_end = _parse_datetime(approved_event["date_end"])
        if existing_start and existing_end and event_data["date_start"] <= existing_end and existing_start <= event_data["date_end"]:
            raise HTTPException(status_code=409, detail="Location is already occupied for the selected interval")

    response = supabase.table("events").insert(event_data).execute()
    return {"data": response.data}

@router.put("/{event_id}")
async def update_event(event_id: str, event: EventUpdate, user: dict = Depends(get_current_user)):
    existing = supabase.table("events").select("*").eq("id", event_id).execute()
    if not existing.data:
        raise HTTPException(404, "Event not found")
    if not _can_manage_events(user) or (user.get("role") != "ADMIN" and existing.data[0]["organizer_id"] != user["id"]):
        raise HTTPException(403, "Not authorized")
    update_data = {k: v for k, v in event.dict().items() if v is not None}
    response = supabase.table("events").update(update_data).eq("id", event_id).execute()
    return {"data": response.data}

@router.delete("/{event_id}")
async def delete_event(event_id: str, user: dict = Depends(get_current_user)):
    existing = supabase.table("events").select("*").eq("id", event_id).execute()
    if not existing.data:
        raise HTTPException(404, "Event not found")
    if not _can_manage_events(user) or (user.get("role") != "ADMIN" and existing.data[0]["organizer_id"] != user["id"]):
        raise HTTPException(403, "Not authorized")
    response = supabase.table("events").delete().eq("id", event_id).execute()
    return {"message": "Event deleted"}
