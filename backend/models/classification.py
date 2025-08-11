from pydantic import BaseModel, Field
from typing import List, Optional

class ClassificationCreate(BaseModel):
    variant_record_id: int
    disease: str = Field(..., min_length=1)
    moi: str = Field(..., min_length=1)                # AD/AR/etc
    method: str = Field(..., min_length=1)             # SPEC01/etc
    daf_threshold: Optional[float] = None
    calc_score: Optional[float] = None
    final_score: Optional[float] = None
    classification: Optional[str] = None               # Pathogenic / Benign, etc.
    selected_trx: Optional[str] = None
    select_trx_nmd_boundary: Optional[str] = None
    alt_inframe_start: Optional[list[str]] = None
    critical_region_list: Optional[list[str]] = None
    transcript_protein_size: Optional[int] = None

class Classification(ClassificationCreate):
    id: int
