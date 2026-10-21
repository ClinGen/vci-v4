from enum import StrEnum


class ClassificationStatus(StrEnum):
    """Where the record is in its workflow. Whether a version is published is tracked
    per snapshot, because an earlier approved version can stay published while the
    record is reopened."""

    IN_PROGRESS = "in_progress"
    PROVISIONAL = "provisional"
    APPROVED = "approved"


class ClassificationResult(StrEnum):
    """Same values as the SVCv4 model's VariantPathogenicityClassification."""

    BENIGN = "benign"
    LIKELY_BENIGN = "likely_benign"
    VUS = "variant_of_uncertain_significance"
    LIKELY_PATHOGENIC = "likely_pathogenic"
    PATHOGENIC = "pathogenic"


class Section(StrEnum):
    GENERAL_INFORMATION = "general_information"
    POPULATION = "population"
    CLINICAL = "clinical"
    PREDICTED_EFFECT = "predicted_effect"
    FUNCTIONAL = "functional"
    INFORMATIVE_VARIANTS = "informative_variants"


class CodeStatus(StrEnum):
    SCORE = "score"
    NO_DATA = "nd"
    NOT_APPLICABLE = "na"


class EvidenceKind(StrEnum):
    PROBAND = "proband"
    CASE_CONTROL = "case_control"
    FUNCTIONAL = "functional"
    INFORMATIVE_VARIANT = "informative_variant"
