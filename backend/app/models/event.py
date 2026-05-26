from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Event(BaseModel):
    id: int
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
    status: str
    organizer_id: Optional[str] = None
