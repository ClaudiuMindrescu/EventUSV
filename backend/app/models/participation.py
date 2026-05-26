from pydantic import BaseModel

class Participation(BaseModel):
    id: int
    event_id: int
    user_id: int
