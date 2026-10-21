import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, ForeignKey, Index, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, Timestamps, UUIDPrimaryKey, check_in
from app.db.vocab import EvidenceKind


class EvidenceItem(Base, UUIDPrimaryKey, Timestamps):
    __tablename__ = "evidence_items"

    classification_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("classifications.id"))
    kind: Mapped[str]
    data: Mapped[dict[str, Any]]
    schema_version: Mapped[int] = mapped_column(default=1, server_default="1")
    pmid: Mapped[str | None] = mapped_column(index=True)
    source: Mapped[dict[str, Any] | None]
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    updated_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    deleted_at: Mapped[datetime | None]

    __table_args__ = (
        CheckConstraint(check_in("kind", EvidenceKind), name="kind"),
        Index(
            "ix_evidence_items_live_by_classification",
            "classification_id",
            postgresql_where=text("deleted_at IS NULL"),
        ),
    )
