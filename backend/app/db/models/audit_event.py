import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, ForeignKey, Identity, Index, Text, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AuditEvent(Base):
    """Append-only. A trigger in the migration rejects UPDATE, DELETE and TRUNCATE."""

    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    classification_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("classifications.id"))
    actor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), index=True)
    occurred_at: Mapped[datetime] = mapped_column(server_default=func.now())
    action: Mapped[str]
    codes: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    entity_type: Mapped[str | None]
    entity_id: Mapped[uuid.UUID | None]
    detail: Mapped[str | None]
    before: Mapped[dict[str, Any] | None]
    after: Mapped[dict[str, Any] | None]

    __table_args__ = (Index("ix_audit_events_classification_order", "classification_id", "id"),)
