# Every model must be imported here so Alembic sees it when autogenerating migrations.
from app.db.models.audit_event import AuditEvent
from app.db.models.classification import Classification
from app.db.models.classification_section import ClassificationSection
from app.db.models.code_assessment import CodeAssessment
from app.db.models.disease import Disease
from app.db.models.evidence_item import EvidenceItem
from app.db.models.user import User
from app.db.models.variant import Variant

__all__ = [
    "AuditEvent",
    "Classification",
    "ClassificationSection",
    "CodeAssessment",
    "Disease",
    "EvidenceItem",
    "User",
    "Variant",
]
