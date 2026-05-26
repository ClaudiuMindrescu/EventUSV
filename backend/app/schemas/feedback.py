from pydantic import BaseModel

class FeedbackCreate(BaseModel):
    event_id: int
    user_id: int
    rating: int
    comments: str

class FeedbackRead(FeedbackCreate):
    id: int
