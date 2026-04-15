from pydantic import BaseModel
from typing import Optional

class AllocationView(BaseModel):
    id: str
    counselor_name: str
    status: str
    slot_time: Optional[str]
    created_at: str

    model_config = {"from_attributes": True}

class AllocationConfirmRequest(BaseModel):
    idempotency_key: str
