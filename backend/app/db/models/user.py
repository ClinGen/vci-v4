from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, Timestamps, UUIDPrimaryKey


class User(Base, UUIDPrimaryKey, Timestamps):
    __tablename__ = "users"

    clerk_user_id: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str | None]
    display_name: Mapped[str | None]
