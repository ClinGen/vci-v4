from sqlalchemy import CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, CreatedAt, UUIDPrimaryKey


class Disease(Base, UUIDPrimaryKey, CreatedAt):
    __tablename__ = "diseases"

    mondo_id: Mapped[str] = mapped_column(unique=True)
    label: Mapped[str]

    __table_args__ = (
        CheckConstraint("mondo_id ~ '^MONDO:[0-9]{7}$'", name="mondo_id_format"),
    )
