import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, ForeignKey, false, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, Timestamps, check_in
from app.db.vocab import Section


class ClassificationSection(Base, Timestamps):
    __tablename__ = "classification_sections"

    classification_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("classifications.id"), primary_key=True
    )
    section: Mapped[str] = mapped_column(primary_key=True)
    inputs: Mapped[dict[str, Any]] = mapped_column(default=dict, server_default=text("'{}'::jsonb"))
    inputs_schema_version: Mapped[int] = mapped_column(default=1, server_default="1")
    complete: Mapped[bool] = mapped_column(default=False, server_default=false())
    completed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), index=True)
    completed_at: Mapped[datetime | None]

    __table_args__ = (CheckConstraint(check_in("section", Section), name="section"),)
