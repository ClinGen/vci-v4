import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VariantCreate(BaseModel):
    caid: str = Field(pattern=r"^CA\d+$", examples=["CA000123"])
    preferred_title: str = Field(min_length=1, examples=["NM_000546.6(TP53):c.215C>G"])
    clinvar_variation_id: str | None = None
    gene_symbol: str | None = None
    hgnc_id: str | None = None
    chromosome: str | None = None
    position: int | None = None
    ref: str | None = None
    alt: str | None = None


class VariantRead(VariantCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
