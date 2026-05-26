import os
from dotenv import load_dotenv

# Manually point to the .env file in the parent directory
load_dotenv(dotenv_path="../.env") 

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
print(f"DEBUG BACKEND: URL is {supabase_url}") # To see it in terminal

from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client

from app.api import auth, users, events, participation, feedback
from app.api.auth import get_current_user

if not supabase_url or not supabase_key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in the environment")

supabase = create_client(supabase_url, supabase_key)

app = FastAPI(title="EventUSV", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(participation.router, prefix="/api/participation", tags=["participation"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])


@app.get("/")
async def root():
    return {"message": "EventUSV API is running"}


@app.get("/events")
async def list_events(
    category: Optional[str] = Query(None),
    image_url: Optional[str] = Query(None),
):
    query = supabase.table("events").select("id,title,short_description,category,image_url,date_start").eq("status", "approved")
    if category:
        query = query.eq("category", category)
    response = query.execute()
    return {"data": response.data}


@app.get("/events/{event_id}")
async def get_event(event_id: str, user: dict = Depends(get_current_user)):
    response = supabase.table("events").select("*,location:locations(*)").eq("id", event_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"data": response.data}


@app.get("/locations")
async def list_locations():
    response = supabase.table("locations").select("id,name").execute()
    return {"data": response.data}
