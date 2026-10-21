from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.models import Variant
from app.db.session import get_session
from app.schemas.variant import VariantCreate, VariantRead

router = APIRouter(prefix="/api/variants", tags=["variants"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("", response_model=VariantRead, status_code=status.HTTP_201_CREATED)
def create_variant(body: VariantCreate, session: SessionDep) -> Variant:
    variant = Variant(**body.model_dump())
    session.add(variant)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, f"Variant {body.caid} already exists")
    return variant


@router.get("/{caid}", response_model=VariantRead)
def get_variant(caid: str, session: SessionDep) -> Variant:
    variant = session.scalar(select(Variant).where(Variant.caid == caid))
    if variant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Variant {caid} not found")
    return variant
