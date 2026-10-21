from sqlalchemy import BigInteger
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, Timestamps, UUIDPrimaryKey


class Variant(Base, UUIDPrimaryKey, Timestamps):
    __tablename__ = "variants"

    caid: Mapped[str] = mapped_column(unique=True)
    clinvar_variation_id: Mapped[str | None]
    preferred_title: Mapped[str]
    gene_symbol: Mapped[str | None]
    hgnc_id: Mapped[str | None]
    # GRCh38
    chromosome: Mapped[str | None]
    position: Mapped[int | None] = mapped_column(BigInteger)
    ref: Mapped[str | None]
    alt: Mapped[str | None]
