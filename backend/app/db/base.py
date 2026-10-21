import uuid
from datetime import datetime
from enum import StrEnum
from typing import Any

from sqlalchemy import DateTime, MetaData, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Deterministic constraint names, so Alembic can find and alter them later.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)
    type_annotation_map = {
        str: Text,
        datetime: DateTime(timezone=True),
        dict[str, Any]: JSONB,
    }


class UUIDPrimaryKey:
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
        sort_order=-10,
    )


class CreatedAt:
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), sort_order=10)


class Timestamps(CreatedAt):
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), sort_order=11
    )


def check_in(column: str, values: type[StrEnum]) -> str:
    allowed = ", ".join(f"'{v.value}'" for v in values)
    return f"{column} IN ({allowed})"
