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

class FeedbackCreate(BaseModel):
    event_id: str
    rating: int
    comment: str

@router.post("/")
async def submit_feedback(feedback: FeedbackCreate, user: dict = Depends(get_current_user)):
    feedback_data = {
        "event_id": feedback.event_id,
        "student_id": user["id"],
        "rating": feedback.rating,
        "comment": feedback.comment
    }
    response = supabase.table("feedback").insert(feedback_data).execute()
    return {"data": response.data}
