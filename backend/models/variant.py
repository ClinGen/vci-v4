from pydantic import BaseModel, Field
from typing import List, Optional, Any

class VariantCreate(BaseModel):
    car_id: str = Field(..., min_length=3)
    clinvar_id: str = Field(..., min_length=3)
    gene: str = Field(..., min_length=1)
    affiliation: str = Field(..., min_length=1)
    preferred_title: Optional[str] = None
    transcripts: List[str] = []
    clinvar_info: Optional[Any] = None

class Variant(VariantCreate):
    id: int
