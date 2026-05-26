from pydantic import BaseModel

class ParticipationCreate(BaseModel):
    event_id: int
    user_id: int

class ParticipationRead(ParticipationCreate):
    id: int
