from pydantic import BaseModel

class Feedback(BaseModel):
    id: int
    event_id: int
    user_id: int
    rating: int
    comments: str
