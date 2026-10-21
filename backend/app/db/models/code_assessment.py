import uuid
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, Timestamps, UUIDPrimaryKey, check_in
from app.db.vocab import CodeStatus


class CodeAssessment(Base, UUIDPrimaryKey, Timestamps):
    """The outcome for one evidence code. No row means not evaluated (NE in the UI)."""

    __tablename__ = "code_assessments"

    classification_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("classifications.id"))
    code: Mapped[str]
    status: Mapped[str]
    computed_points: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    override_points: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    override_reason: Mapped[str | None]
    comment: Mapped[str | None]
    updated_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)

    __table_args__ = (
        UniqueConstraint("classification_id", "code"),
        CheckConstraint(check_in("status", CodeStatus), name="status"),
        CheckConstraint(
            "override_points IS NULL OR override_reason IS NOT NULL", name="override_reason"
        ),
    )
