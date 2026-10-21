"""Rules the database enforces on its own, even if application code is wrong."""

import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError, IntegrityError

from app.db.models import AuditEvent, Classification, CodeAssessment, Disease, User, Variant


@pytest.fixture
def records(db):
    user = User(clerk_user_id="user_test", display_name="Test Curator")
    variant = Variant(caid="CA000001", preferred_title="NM_000546.6(TP53):c.215C>G")
    disease = Disease(mondo_id="MONDO:0018875", label="Li-Fraumeni syndrome")
    db.add_all([user, variant, disease])
    db.flush()
    return user, variant, disease


def classification(records, **overrides) -> Classification:
    user, variant, disease = records
    values = {
        "variant_id": variant.id,
        "affiliation_id": "10007",
        "disease_id": disease.id,
        "moi": "HP:0000006",
        "created_by": user.id,
    }
    return Classification(**(values | overrides))


def add(db, *rows):
    """Insert inside a savepoint, so a rejected row doesn't end the test's transaction."""
    with db.begin_nested():
        db.add_all(rows)
        db.flush()


def test_one_record_per_variant_disease_moi_affiliation(db, records):
    add(db, classification(records))
    with pytest.raises(IntegrityError, match="uq_classifications_scope"):
        add(db, classification(records))


def test_same_scope_is_allowed_under_another_affiliation(db, records):
    add(db, classification(records), classification(records, affiliation_id="10099"))


def test_drafts_without_disease_or_moi_can_coexist(db, records):
    add(
        db,
        classification(records, disease_id=None, moi=None),
        classification(records, disease_id=None, moi=None),
    )


def test_moi_other_requires_text(db, records):
    with pytest.raises(IntegrityError, match="ck_classifications_moi_other_text"):
        add(db, classification(records, moi="other"))


def test_moi_other_text_counts_toward_uniqueness(db, records):
    add(
        db,
        classification(records, moi="other", moi_other_text="digenic"),
        classification(records, moi="other", moi_other_text="mosaic"),
    )
    with pytest.raises(IntegrityError, match="uq_classifications_scope"):
        add(db, classification(records, moi="other", moi_other_text="digenic"))


@pytest.mark.parametrize("moi", ["Autosomal dominant inheritance", "HP:6", "hp:0000006"])
def test_moi_must_be_an_hpo_term_or_other(db, records, moi):
    with pytest.raises(IntegrityError, match="ck_classifications_moi_format"):
        add(db, classification(records, moi=moi))


def test_status_has_no_published_value(db, records):
    with pytest.raises(IntegrityError, match="ck_classifications_status"):
        add(db, classification(records, status="published"))


def test_result_uses_svcv4_values_not_display_labels(db, records):
    with pytest.raises(IntegrityError, match="ck_classifications_result"):
        add(db, classification(records, result="Pathogenic"))


def test_override_points_require_a_reason(db, records):
    record = classification(records)
    add(db, record)
    assessment = CodeAssessment(
        classification_id=record.id,
        code="POP_FRQ",
        status="score",
        override_points=2,
        updated_by=records[0].id,
    )
    with pytest.raises(IntegrityError, match="ck_code_assessments_override_reason"):
        add(db, assessment)


@pytest.mark.parametrize(
    "statement",
    [
        "UPDATE audit_events SET detail = 'tampered'",
        "DELETE FROM audit_events",
        "TRUNCATE audit_events",
    ],
)
def test_audit_events_are_append_only(db, records, statement):
    record = classification(records)
    add(db, record)
    add(db, AuditEvent(classification_id=record.id, actor_id=records[0].id, action="moi_set"))

    with pytest.raises(DBAPIError, match="append-only"):
        with db.begin_nested():
            db.execute(text(statement))
