import uuid
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Index, Numeric, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, Timestamps, UUIDPrimaryKey, check_in
from app.db.vocab import ClassificationResult, ClassificationStatus


class Classification(Base, UUIDPrimaryKey, Timestamps):
    """A classification record: one variant, for one disease and MOI, under one affiliation."""

    __tablename__ = "classifications"

    variant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("variants.id"), index=True)
    # Affiliations Service ID; becomes a foreign key when the affiliations table exists.
    affiliation_id: Mapped[str] = mapped_column(index=True)
    disease_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("diseases.id"), index=True)
    moi: Mapped[str | None]
    moi_other_text: Mapped[str | None]
    transcript: Mapped[str | None]
    cspec_id: Mapped[str | None]
    cspec_version: Mapped[str | None]
    status: Mapped[str] = mapped_column(
        default=ClassificationStatus.IN_PROGRESS.value,
        server_default=ClassificationStatus.IN_PROGRESS.value,
    )
    result: Mapped[str | None]
    total_points: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    summary_statement: Mapped[str | None]
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)

    __table_args__ = (
        CheckConstraint(check_in("status", ClassificationStatus), name="status"),
        CheckConstraint(check_in("result", ClassificationResult), name="result"),
        CheckConstraint("moi = 'other' OR moi ~ '^HP:[0-9]{7}$'", name="moi_format"),
        CheckConstraint(
            "moi IS DISTINCT FROM 'other' OR moi_other_text IS NOT NULL", name="moi_other_text"
        ),
        # A new record has no disease or MOI yet, so uniqueness applies once both are set.
        Index(
            "uq_classifications_scope",
            "variant_id",
            "affiliation_id",
            "disease_id",
            "moi",
            text("coalesce(moi_other_text, '')"),
            unique=True,
            postgresql_where=text("disease_id IS NOT NULL AND moi IS NOT NULL"),
        ),
    )
