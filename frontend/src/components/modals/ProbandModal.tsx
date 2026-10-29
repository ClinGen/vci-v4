import { useState } from "react"
import { Lock, Check, ChevronDown, Plus, X } from "lucide-react"
import { Button } from "../ui/Button"
import { ScoreBadge, ResultBadge } from "../ui/ScoreBadge"
import { Modal, FieldRow, ModalSection } from "../ui/Modal"
import SourceDetailFields from "../SourceDetailFields"
import { isSourceDetailComplete, curationSourceLabel } from "../../lib/sourceDetail"
import {
  CLN_AFF_SECOND_VARIANT_OPTIONS,
  CLN_AFF_LIKELIHOOD_OPTIONS,
  INHERITANCE_OPTIONS,
  PROBAND_AGE_OPTIONS,
  PROBAND_COUNTRY_OPTIONS,
  PROBAND_SEX_OPTIONS,
  PROBAND_SOURCE_OPTIONS,
  PROBAND_SOURCE_OPTION_LABELS,
  PROBAND_ZYGOSITY_OPTIONS,
} from "../../lib/referenceData"
import {
  CLN_ALT_GENE_RELATIONSHIP_OPTIONS,
  CLN_ALT_SEVERITY_OPTIONS,
  CLN_UAF_SECOND_VARIANT_OPTIONS,
  LOC_PHE_ELIGIBILITY_OPTIONS,
  LOC_PHE_YIELD_BINS,
  caseScoreFor,
  clnTableFor,
  clnUafMoiBucket,
  locPheAggregate,
  locSegEntryPoints,
  locSegMoiBucket,
  locSegRowOptionsFor,
} from "../../lib/scoring"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SourceDetail {
  pmid: string
  labName: string
  databaseName: string
  otherDescription: string
}

interface CompoundHetVariant {
  alleleRegistryId: string
  classification: string
  phase: string
}

interface ClnAff {
  phenotypicSpecificity: string
  testingRelevance: string
  nonGeneticEtiology: string
  variantsOfInterest: string
  secondVariantCategory: string
  coOccurrenceLikelihood: string
}

interface ClnDnv {
  deNovoStatus: string
  parentalConfirmation: string
}

interface ClnUaf {
  phenotypicPenetrance: string
  secondVariantCategory: string
}

interface ClnAlt {
  secondVariantGeneRelationship: string
  severityCategory: string
}

interface LocPhe {
  vbcEligible: string
  diagnosticYield: string
}

interface SegregationObservation {
  id: string
  label: string
  optionValue: string
  penetranceNearComplete: string
  phaseEstablished: string
  nonSegregationConfirmed: string
}

interface LocSeg {
  observations: SegregationObservation[]
}

export interface ProbandDraft {
  id: string
  source: string
  sourceDetail: SourceDetail
  curatedDisease: string
  curatedMoi: string
  generalComment: string
  label: string
  hpoTags: string[]
  freeTextPheno: string
  zygosity: string
  compoundHetVariant: CompoundHetVariant
  sex: string
  ageAtObservation: string
  countryOfOrigin: string
  clnAff: ClnAff
  clnDnv: ClnDnv
  clnUaf: ClnUaf
  clnAlt: ClnAlt
  locPhe: LocPhe
  locSeg: LocSeg
  curatedAtMs: number | null
  curatedBy: string | null
  clnTableAtSave?: string
  scoringMode?: string
  multipleProbandsEnabled?: boolean
  numberOfProbands?: string
}

export type ScoringMode = "affected" | "unaffected" | "alternative"

type DraftGroup = "sourceDetail" | "compoundHetVariant" | "clnAff" | "clnDnv" | "clnUaf" | "clnAlt" | "locPhe" | "locSeg"

export function emptyProbandDraft(): ProbandDraft {
  return {
    id: "",
    source: "",
    sourceDetail: { pmid: "", labName: "", databaseName: "", otherDescription: "" },
    curatedDisease: "",
    curatedMoi: "",
    generalComment: "",
    label: "",
    hpoTags: [],
    freeTextPheno: "",
    zygosity: "",
    compoundHetVariant: { alleleRegistryId: "", classification: "", phase: "" },
    sex: "",
    ageAtObservation: "",
    countryOfOrigin: "",
    clnAff: {
      phenotypicSpecificity: "",
      testingRelevance: "",
      nonGeneticEtiology: "",
      variantsOfInterest: "",
      secondVariantCategory: "",
      coOccurrenceLikelihood: "",
    },
    clnDnv: { deNovoStatus: "", parentalConfirmation: "" },
    clnUaf: { phenotypicPenetrance: "", secondVariantCategory: "" },
    clnAlt: { secondVariantGeneRelationship: "", severityCategory: "" },
    locPhe: { vbcEligible: "", diagnosticYield: "" },
    locSeg: { observations: [] },
    curatedAtMs: null,
    curatedBy: null,
  }
}

// ---------------------------------------------------------------------------
// SegregationObservationRow (internal sub-component)
// ---------------------------------------------------------------------------

interface SegregationObservationRowProps {
  entry: SegregationObservation
  modeOfInheritance: string
  onRemove: () => void
  onUpdate: (next: SegregationObservation) => void
}

function SegregationObservationRow({ entry, modeOfInheritance, onRemove, onUpdate }: SegregationObservationRowProps) {
  const rows = locSegRowOptionsFor(modeOfInheritance)
  const opt = rows.find((o) => o.value === entry.optionValue)
  const points = locSegEntryPoints(entry, modeOfInheritance)
  const caveatUnmet =
    !!opt && !opt.nonSegregation && opt.unaffected && (entry.penetranceNearComplete !== "yes" || entry.phaseEstablished !== "yes")
  const nonSegCaveatUnmet = !!opt && opt.nonSegregation && entry.nonSegregationConfirmed !== "yes"

  return (
    <div className="border border-gray-200 rounded-md p-2 bg-white text-xs space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 border rounded-md p-1.5 text-xs"
          placeholder="Label (e.g. sibling II-2)"
          value={entry.label}
          onChange={(e) => onUpdate({ ...entry, label: e.target.value })}
        />
        <button onClick={onRemove} className="text-gray-400 hover:text-red-500 flex-none" title="Remove">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <select
        className="w-full border rounded-md p-1.5 bg-white text-xs"
        value={entry.optionValue}
        onChange={(e) =>
          onUpdate({
            ...entry,
            optionValue: e.target.value,
            penetranceNearComplete: "",
            phaseEstablished: "",
            nonSegregationConfirmed: "",
          })
        }
      >
        <option value="">Select relative category...</option>
        {rows.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
            {o.nonSegregation || o.points === undefined ? "" : ` (${o.points >= 0 ? "+" : ""}${o.points.toFixed(1)})`}
          </option>
        ))}
      </select>

      {opt && !opt.nonSegregation && opt.unaffected && (
        <div className="grid grid-cols-2 gap-2">
          <select
            className="border rounded-md p-1.5 bg-white text-xs"
            value={entry.penetranceNearComplete}
            onChange={(e) => onUpdate({ ...entry, penetranceNearComplete: e.target.value })}
          >
            <option value="">Penetrance near 100%?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <select
            className="border rounded-md p-1.5 bg-white text-xs"
            value={entry.phaseEstablished}
            onChange={(e) => onUpdate({ ...entry, phaseEstablished: e.target.value })}
          >
            <option value="">Phase established?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      )}

      {opt && opt.nonSegregation && (
        <select
          className="w-full border rounded-md p-1.5 bg-white text-xs"
          value={entry.nonSegregationConfirmed}
          onChange={(e) => onUpdate({ ...entry, nonSegregationConfirmed: e.target.value })}
        >
          <option value="">{opt.confirmLabel}</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      )}

      {opt && (
        <div className={caveatUnmet || nonSegCaveatUnmet ? "text-[11px] text-amber-600" : "text-[11px] text-gray-500"}>
          {opt.nonSegregation
            ? locSegMoiBucket(modeOfInheritance) === "recessive"
              ? "Not counted as benign evidence for autosomal recessive MDEs (Supplement 5)."
              : nonSegCaveatUnmet
              ? "Caveat not confirmed -- inconclusive (contributes +0.0)."
              : "Scores LOC_SEG_-4.0 for this locus, and zeroes out LOC_PHE."
            : caveatUnmet
            ? "Penetrance/phasing caveat not confirmed -- excluded from the total (contributes +0.0)."
            : `Contributes ${points >= 0 ? "+" : ""}${points.toFixed(1)}.`}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProbandModal
// ---------------------------------------------------------------------------

interface ProbandModalProps {
  /** Criteria spec document label, used for curation source stamping. */
  criteriaDoc?: string | null
  /** When editing an existing proband, its id. Null for new entries. */
  editingProbandId?: string | null
  /** The current mode of inheritance for this variant curation. */
  modeOfInheritance?: string
  /** Whether MOI has been set (unlocks scoring sections). */
  inheritanceSet?: boolean
  /** List of already-saved probands. */
  savedProbands?: ProbandDraft[]
  /** Callback to close the modal. */
  onClose: () => void
  /** Callback when saving a proband. Receives the complete proband data. */
  onSave?: (proband: ProbandDraft) => void
  /** Callback to remove a proband from clinical and locus data. */
  onRemove?: (id: string) => void
}

export function ProbandModal({
  criteriaDoc = null,
  editingProbandId = null,
  modeOfInheritance = "",
  inheritanceSet = false,
  savedProbands = [],
  onClose,
  onSave,
  onRemove,
}: ProbandModalProps) {
  const isEditing = !!editingProbandId

  // Local state -- self-contained, matching the pattern used in other migrated tabs
  const existingProband = isEditing ? savedProbands.find((p) => p.id === editingProbandId) : null
  const [draft, setDraft] = useState<ProbandDraft>(existingProband ?? emptyProbandDraft())
  const [scoringMode, setScoringMode] = useState<ScoringMode>(
    (existingProband?.scoringMode as ScoringMode) ?? "affected",
  )
  const [multipleProbandsEnabled, setMultipleProbandsEnabled] = useState(
    existingProband?.multipleProbandsEnabled ?? false,
  )
  const [numberOfProbands, setNumberOfProbands] = useState(existingProband?.numberOfProbands ?? "")
  const [showSwitchFormMenu, setShowSwitchFormMenu] = useState(false)

  const updateDraftGroup = <G extends DraftGroup, F extends keyof ProbandDraft[G]>(
    group: G,
    field: F,
    value: ProbandDraft[G][F],
  ) => {
    setDraft((prev) => ({ ...prev, [group]: { ...prev[group], [field]: value } }))
  }

  const currentLocPheValue = locPheAggregate([
    ...savedProbands.filter((p) => p.id !== draft.id),
    draft,
  ])

  // Validation
  const saveBlockedReason = !draft.source
    ? "Select a Source above before saving."
    : !draft.label.trim()
    ? "Enter a Label above before saving."
    : !isSourceDetailComplete(draft.source, draft.sourceDetail)
    ? "Finish the source details above before saving."
    : ""

  const handleSave = () => {
    const curatedAtMs = draft.curatedAtMs || Date.now()
    const curatedBy = draft.curatedBy || curationSourceLabel(criteriaDoc, null)
    const clnTableAtSave = clnTableFor(modeOfInheritance, draft) ?? undefined
    const newId = isEditing
      ? editingProbandId!
      : `proband-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const saved: ProbandDraft = {
      ...draft,
      id: newId,
      scoringMode,
      multipleProbandsEnabled,
      numberOfProbands,
      curatedAtMs,
      curatedBy,
      clnTableAtSave,
    }

    onSave?.(saved)
    onClose()
  }

  return (
    <Modal
      title={isEditing ? "Edit Proband Evidence" : "Proband Evidence Collection"}
      onClose={onClose}
      navItems={
        draft.source
          ? [
              { id: "section-source", label: "Source" },
              { id: "section-owner-notes", label: "Comments" },
              { id: "section-general", label: "General Info" },
              ...(scoringMode === "affected"
                ? [
                    { id: "section-cln-aff", label: "CLN_AFF" },
                    { id: "section-cln-dnv", label: "CLN_DNV" },
                    { id: "section-loc-phe", label: "LOC_PHE" },
                    { id: "section-loc-seg", label: "LOC_SEG" },
                  ]
                : scoringMode === "unaffected"
                ? [{ id: "section-cln-uaf", label: "CLN_UAF" }]
                : [{ id: "section-cln-alt", label: "CLN_ALT" }]),
            ]
          : [{ id: "section-source", label: "Source" }]
      }
      headerRight={
        <div className="flex items-center gap-2">
          {isEditing && onRemove && (
            <button
              className="text-xs text-blue-100 hover:text-white underline"
              onClick={() => {
                onRemove(editingProbandId!)
                onClose()
              }}
            >
              Remove from Clinical and Locus
            </button>
          )}
          <Button
            size="sm"
            className={`gap-1 disabled:!opacity-100 ${
              saveBlockedReason ? "!bg-blue-800 !text-blue-200" : "!bg-white !text-blue-700 hover:!bg-blue-50"
            }`}
            disabled={!!saveBlockedReason}
            title={saveBlockedReason || undefined}
            onClick={handleSave}
          >
            <Check className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
      }
    >
      <div onClick={() => { if (showSwitchFormMenu) setShowSwitchFormMenu(false) }}>
        {/* ---- Source ---- */}
        <ModalSection id="section-source" title="Select Source">
          <FieldRow label="Source" required empty={!draft.source}>
            <select
              className="w-full border rounded-md p-2 bg-white text-xs"
              value={draft.source}
              onChange={(e) => setDraft({ ...draft, source: e.target.value })}
            >
              <option value="">Select Source</option>
              {PROBAND_SOURCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {PROBAND_SOURCE_OPTION_LABELS[opt] || opt}
                </option>
              ))}
            </select>
          </FieldRow>
          <SourceDetailFields
            source={draft.source}
            pmid={draft.sourceDetail.pmid}
            setPmid={(v) => updateDraftGroup("sourceDetail", "pmid", v)}
            labName={draft.sourceDetail.labName}
            setLabName={(v) => updateDraftGroup("sourceDetail", "labName", v)}
            databaseName={draft.sourceDetail.databaseName}
            setDatabaseName={(v) => updateDraftGroup("sourceDetail", "databaseName", v)}
            otherDescription={draft.sourceDetail.otherDescription}
            setOtherDescription={(v) => updateDraftGroup("sourceDetail", "otherDescription", v)}
          />
          {draft.source && (
            <>
              <FieldRow label="Curated Disease/Condition (MONDO)">
                <input
                  className="w-full border rounded-md p-2 text-xs"
                  placeholder="e.g. Li-Fraumeni syndrome (MONDO:0018875)"
                  value={draft.curatedDisease}
                  onChange={(e) => setDraft({ ...draft, curatedDisease: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Curated Mode of Inheritance">
                <select
                  className="w-full border rounded-md p-2 bg-white text-xs"
                  value={draft.curatedMoi}
                  onChange={(e) => setDraft({ ...draft, curatedMoi: e.target.value })}
                >
                  <option value="">Select...</option>
                  {INHERITANCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FieldRow>
              <div className="px-3 py-1.5 text-[11px] text-indigo-600">
                Confirm the mode of inheritance and the disease align between this source and the curated
                MOI/Disease.
              </div>
            </>
          )}
        </ModalSection>

        {draft.source && (
          <>
            {/* ---- Comments ---- */}
            <ModalSection id="section-owner-notes" title="Comments">
              <FieldRow label="General Comment">
                <textarea
                  className="w-full border rounded-md p-2 text-xs"
                  rows={2}
                  placeholder="Visible to any curator viewing this source in the Literature tab..."
                  value={draft.generalComment}
                  onChange={(e) => setDraft({ ...draft, generalComment: e.target.value })}
                />
              </FieldRow>
            </ModalSection>

            {/* ---- General Information ---- */}
            <ModalSection id="section-general" title="General Information">
              <FieldRow label="Label" required empty={!draft.label}>
                <input
                  className="w-full border rounded-md p-2 text-xs"
                  placeholder="e.g. Family A, individual II-1"
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                />
              </FieldRow>

              <FieldRow
                label="Associated phenotypic features (HPO)"
                info="Disabled for this prototype -- use the free-text field below instead."
              >
                <div className="w-full border border-dashed border-gray-300 rounded-md p-2 bg-gray-100 opacity-60">
                  <div className="flex flex-wrap gap-1.5 mb-1.5 empty:mb-0">
                    {draft.hpoTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select className="flex-1 border rounded-md p-2 bg-gray-100 text-xs cursor-not-allowed" value="" disabled>
                      <option value="">Select HPO term... (adds immediately)</option>
                    </select>
                  </div>
                </div>
              </FieldRow>

              <FieldRow label="Associated phenotypic features (Free text)" required empty={!draft.freeTextPheno}>
                <input
                  className="w-full border rounded-md p-2 text-xs"
                  placeholder="Free-text phenotype description"
                  value={draft.freeTextPheno}
                  onChange={(e) => setDraft({ ...draft, freeTextPheno: e.target.value })}
                />
              </FieldRow>

              <FieldRow label="Zygosity of variant in proband" required empty={!draft.zygosity}>
                <select
                  className="w-full border rounded-md p-2 bg-white text-xs"
                  value={draft.zygosity}
                  onChange={(e) => setDraft({ ...draft, zygosity: e.target.value })}
                >
                  <option value="">Select...</option>
                  {PROBAND_ZYGOSITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </FieldRow>

              {draft.zygosity === "Compound heterozygous" && (
                <>
                  <FieldRow label="2nd variant: ClinVar/ClinGen Allele Registry ID" required empty={!draft.compoundHetVariant.alleleRegistryId}>
                    <input
                      className="w-full border rounded-md p-2 text-xs"
                      placeholder="e.g. VCV000012345 or CA123456"
                      value={draft.compoundHetVariant.alleleRegistryId}
                      onChange={(e) => updateDraftGroup("compoundHetVariant", "alleleRegistryId", e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow label="2nd variant: Classification" required empty={!draft.compoundHetVariant.classification}>
                    <select
                      className="w-full border rounded-md p-2 bg-white text-xs"
                      value={draft.compoundHetVariant.classification}
                      onChange={(e) => updateDraftGroup("compoundHetVariant", "classification", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option>Benign</option>
                      <option>Likely Benign</option>
                      <option>VUS</option>
                      <option>Likely Pathogenic</option>
                      <option>Pathogenic</option>
                      <option>Unclassified</option>
                    </select>
                  </FieldRow>
                  <FieldRow label="2nd variant: Phase" required empty={!draft.compoundHetVariant.phase}>
                    <select
                      className="w-full border rounded-md p-2 bg-white text-xs"
                      value={draft.compoundHetVariant.phase}
                      onChange={(e) => updateDraftGroup("compoundHetVariant", "phase", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option>Confirmed in trans</option>
                      <option>Assumed in trans</option>
                      <option>In cis</option>
                      <option>Unknown</option>
                    </select>
                  </FieldRow>
                  <div className="px-3 py-1.5 text-[11px] text-indigo-600">
                    Identifies the other variant found with the VBC in this proband, and its phase relative to it.
                    This is documentation only -- it doesn't set the CLN_AFF "Second variant (biallelic)" category
                    below, which still needs to be selected separately based on phase and confirmation status.
                  </div>
                </>
              )}

              <FieldRow label="Sex">
                <select
                  className="w-full border rounded-md p-2 bg-white text-xs"
                  value={draft.sex}
                  onChange={(e) => setDraft({ ...draft, sex: e.target.value })}
                >
                  <option value="">Select...</option>
                  {PROBAND_SEX_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Age at observation">
                <select
                  className="w-full border rounded-md p-2 bg-white text-xs"
                  value={draft.ageAtObservation}
                  onChange={(e) => setDraft({ ...draft, ageAtObservation: e.target.value })}
                >
                  <option value="">Select...</option>
                  {PROBAND_AGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Country of origin">
                <select
                  className="w-full border rounded-md p-2 bg-white text-xs"
                  value={draft.countryOfOrigin}
                  onChange={(e) => setDraft({ ...draft, countryOfOrigin: e.target.value })}
                >
                  <option value="">Select...</option>
                  {PROBAND_COUNTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </FieldRow>
            </ModalSection>

            {/* ---- Scoring Sections (gated on MOI) ---- */}
            {!inheritanceSet ? (
              <div className="bg-white border border-blue-200 rounded-md p-4 text-xs text-gray-700 flex items-start gap-2">
                <Lock className="h-4 w-4 text-blue-500 flex-none mt-0.5" />
                <span>
                  Set <b>Mode of inheritance</b> in Classification Parameters (General Information tab) before
                  scoring this proband -- CLN_AFF, CLN_DNV, and the other evidence codes below all depend on it.
                  You can still fill out Source and General Information above in the meantime.
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 -mt-2 relative">
                  <span className="text-xs font-mono uppercase tracking-wide text-gray-400">
                    {scoringMode === "affected"
                      ? `Affected Proband -- ${clnTableFor(modeOfInheritance, draft) === "biallelic" ? "Biallelic" : "Monoallelic"} Disorder`
                      : scoringMode === "unaffected"
                      ? "Unaffected Proband"
                      : "Observation of Alternative Causative Variant(s)"}
                  </span>

                  <div className="relative">
                    <Button
                      size="sm"
                      className="bg-green-700 hover:bg-green-600 gap-1 text-xs"
                      onClick={() => setShowSwitchFormMenu(!showSwitchFormMenu)}
                    >
                      Switch form{" "}
                      <ChevronDown className={`h-3 w-3 transition-transform ${showSwitchFormMenu ? "rotate-180" : ""}`} />
                    </Button>

                    {showSwitchFormMenu && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                        {scoringMode !== "unaffected" && (
                          <button
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                            onClick={() => { setScoringMode("unaffected"); setShowSwitchFormMenu(false) }}
                          >
                            Score Unaffected
                          </button>
                        )}
                        {scoringMode !== "alternative" && (
                          <button
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                            onClick={() => { setScoringMode("alternative"); setShowSwitchFormMenu(false) }}
                          >
                            Score Alternative Cause
                          </button>
                        )}
                        {scoringMode !== "affected" && (
                          <button
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                            onClick={() => { setScoringMode("affected"); setShowSwitchFormMenu(false) }}
                          >
                            Score Affected
                          </button>
                        )}
                        {scoringMode === "affected" && (
                          <button
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                            onClick={() => { setMultipleProbandsEnabled(!multipleProbandsEnabled); setShowSwitchFormMenu(false) }}
                          >
                            {multipleProbandsEnabled ? "Remove multiple probands" : "Add multiple probands"}
                            {multipleProbandsEnabled && <Check className="h-3.5 w-3.5 text-green-600" />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ---- CLN_AFF (Affected) ---- */}
                {scoringMode === "affected" && (
                  <>
                    <ModalSection
                      id="section-cln-aff"
                      title="Affected Proband (CLN_AFF)"
                      badge={(() => {
                        const v = caseScoreFor("CLN_AFF", draft, modeOfInheritance)
                        return v !== null ? <ScoreBadge code="CLN_AFF" value={v} /> : <ResultBadge code="CLN_AFF" />
                      })()}
                    >
                      <FieldRow label="Phenotype Consistency" required empty={!draft.clnAff.phenotypicSpecificity}>
                        <select
                          className="w-full border rounded-md p-2 bg-white text-xs"
                          value={draft.clnAff.phenotypicSpecificity}
                          onChange={(e) => updateDraftGroup("clnAff", "phenotypicSpecificity", e.target.value)}
                        >
                          <option value="">Select...</option>
                          <option>Specific for MDE</option>
                          <option>Consistent with MDE</option>
                          <option>Not consistent</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Testing Relevance" required empty={!draft.clnAff.testingRelevance}>
                        <select
                          className="w-full border rounded-md p-2 bg-white text-xs"
                          value={draft.clnAff.testingRelevance}
                          onChange={(e) => updateDraftGroup("clnAff", "testingRelevance", e.target.value)}
                        >
                          <option value="">Select...</option>
                          <option>All relevant genes for MDE were tested</option>
                          <option>Not all relevant genes for disorder tested OR High number of unexplained cases</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Non-Genetic Etiology Assessment">
                        <select
                          className="w-full border rounded-md p-2 bg-white text-xs"
                          value={draft.clnAff.nonGeneticEtiology}
                          onChange={(e) => updateDraftGroup("clnAff", "nonGeneticEtiology", e.target.value)}
                        >
                          <option value="">Select...</option>
                          <option>Unlikely</option>
                          <option>Cannot be excluded</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Variants of interest" required empty={!draft.clnAff.variantsOfInterest}>
                        <select
                          className="w-full border rounded-md p-2 bg-white text-xs"
                          value={draft.clnAff.variantsOfInterest}
                          onChange={(e) => updateDraftGroup("clnAff", "variantsOfInterest", e.target.value)}
                        >
                          <option value="">Select...</option>
                          <option>No additional variants of interest identified</option>
                          <option>Additional plausible VUS identified</option>
                          <option>Additional P/LP variant identified that explains phenotype</option>
                        </select>
                      </FieldRow>
                      {clnTableFor(modeOfInheritance, draft) === "biallelic" && (
                        <>
                          <FieldRow label="Second variant (biallelic)" required empty={!draft.clnAff.secondVariantCategory}>
                            <select
                              className="w-full border rounded-md p-2 bg-white text-xs"
                              value={draft.clnAff.secondVariantCategory}
                              onChange={(e) => updateDraftGroup("clnAff", "secondVariantCategory", e.target.value)}
                            >
                              <option value="">Select...</option>
                              {CLN_AFF_SECOND_VARIANT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </FieldRow>
                          {["confirmed-trans-plp", "assumed-trans-plp", "confirmed-trans-vus"].includes(
                            draft.clnAff.secondVariantCategory,
                          ) && (
                            <FieldRow label="gnomAD co-occurrence likelihood" required empty={!draft.clnAff.coOccurrenceLikelihood}>
                              <select
                                className="w-full border rounded-md p-2 bg-white text-xs"
                                value={draft.clnAff.coOccurrenceLikelihood}
                                onChange={(e) => updateDraftGroup("clnAff", "coOccurrenceLikelihood", e.target.value)}
                              >
                                <option value="">Select...</option>
                                {CLN_AFF_LIKELIHOOD_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </FieldRow>
                          )}
                        </>
                      )}
                      {multipleProbandsEnabled && (
                        <FieldRow label="Number of probands" required empty={!numberOfProbands}>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className="w-full border rounded-md p-2 font-mono text-xs"
                            placeholder="e.g. 3"
                            value={numberOfProbands}
                            onChange={(e) => {
                              const v = e.target.value
                              if (v === "" || /^[0-9]+$/.test(v)) setNumberOfProbands(v)
                            }}
                          />
                        </FieldRow>
                      )}
                    </ModalSection>

                    {/* ---- CLN_DNV ---- */}
                    <ModalSection
                      id="section-cln-dnv"
                      title="de novo (CLN_DNV)"
                      badge={(() => {
                        const v = caseScoreFor("CLN_DNV", draft, modeOfInheritance)
                        return v !== null ? <ScoreBadge code="CLN_DNV" value={v} /> : <ResultBadge code="CLN_DNV" />
                      })()}
                    >
                      <FieldRow label="de novo status">
                        <select
                          className="w-full border rounded-md p-2 bg-white text-xs"
                          value={draft.clnDnv.deNovoStatus}
                          onChange={(e) => updateDraftGroup("clnDnv", "deNovoStatus", e.target.value)}
                        >
                          <option value="">Select...</option>
                          <option>Is de novo</option>
                          <option>Not de novo</option>
                          <option>Unknown</option>
                        </select>
                      </FieldRow>
                      {draft.clnDnv.deNovoStatus === "Is de novo" && (
                        <>
                          <FieldRow label="Parental confirmation">
                            <select
                              className="w-full border rounded-md p-2 bg-white text-xs"
                              value={draft.clnDnv.parentalConfirmation}
                              onChange={(e) => updateDraftGroup("clnDnv", "parentalConfirmation", e.target.value)}
                            >
                              <option value="">Select...</option>
                              <option>Confirmed</option>
                              <option>Not confirmed</option>
                            </select>
                          </FieldRow>
                          <div className="px-3 py-1.5 text-[11px] text-indigo-600">
                            {!draft.clnAff.phenotypicSpecificity
                              ? "Select a Phenotype Consistency value in CLN_AFF above before de novo points can be determined."
                              : draft.clnAff.phenotypicSpecificity === "Not consistent"
                              ? "CLN_AFF phenotype is Not Consistent -- no de novo evidence points apply."
                              : `Using ${
                                  draft.clnAff.phenotypicSpecificity === "Specific for MDE"
                                    ? "the Specific"
                                    : "the Consistent"
                                } phenotype category from CLN_AFF above.`}
                          </div>
                        </>
                      )}
                    </ModalSection>

                    {/* ---- LOC_PHE ---- */}
                    <ModalSection
                      id="section-loc-phe"
                      title="Specific Phenotype (LOC_PHE)"
                      badge={(() => {
                        const v = caseScoreFor("LOC_PHE", draft, modeOfInheritance)
                        return v !== null ? <ScoreBadge code="LOC_PHE" value={v} /> : <ResultBadge code="LOC_PHE" />
                      })()}
                    >
                      <FieldRow label="Diagnostic yield / phenotype specificity data" required empty={!draft.locPhe.vbcEligible}>
                        <select
                          className="w-full border rounded-md p-2 bg-white text-xs"
                          value={draft.locPhe.vbcEligible}
                          onChange={(e) => updateDraftGroup("locPhe", "vbcEligible", e.target.value)}
                        >
                          <option value="">Select...</option>
                          {LOC_PHE_ELIGIBILITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </FieldRow>
                      {draft.locPhe.vbcEligible === "yes" && (
                        <FieldRow label="Diagnostic yield">
                          <select
                            className="w-full border rounded-md p-2 bg-white text-xs"
                            value={draft.locPhe.diagnosticYield}
                            onChange={(e) => updateDraftGroup("locPhe", "diagnosticYield", e.target.value)}
                          >
                            <option value="">Select...</option>
                            {LOC_PHE_YIELD_BINS.map((b) => (
                              <option key={b.value} value={b.value}>
                                {b.value}
                              </option>
                            ))}
                          </select>
                        </FieldRow>
                      )}
                      <div className="px-3 py-1.5 text-[11px] text-indigo-600">
                        Locus-level evidence (Supplement 5) -- this value applies to the variant only if this is the most
                        informative affected proband; the Scored Cases table below applies the single highest value across
                        probands, not a sum. Zeroed out if a non-segregation is confirmed in any proband's LOC_SEG entries
                        below.
                      </div>
                    </ModalSection>

                    {/* ---- LOC_SEG ---- */}
                    <ModalSection
                      id="section-loc-seg"
                      title="Co-Segregation (LOC_SEG)"
                      badge={(() => {
                        const v = caseScoreFor("LOC_SEG", draft, modeOfInheritance)
                        return v !== null ? <ScoreBadge code="LOC_SEG" value={v} /> : <ResultBadge code="LOC_SEG" />
                      })()}
                    >
                      {!locSegMoiBucket(modeOfInheritance) ? (
                        <div className="px-3 py-1.5 text-[11px] text-amber-600">
                          Figure 2 doesn't give a segregation heuristic for the current Mode of Inheritance -- no LOC_SEG
                          score can be computed.
                        </div>
                      ) : (
                        <>
                          <div className="px-3 pt-1.5 text-[11px] text-indigo-600">
                            Assumes locus heterogeneity (or homogeneity without high diagnostic yield) and a very low/zero
                            phenocopy rate for this MDE (Figure 2) -- a gene/locus-level judgment not separately tracked in
                            this prototype yet.
                          </div>
                          {currentLocPheValue === 4.0 && (
                            <div className="px-3 pt-1 text-[11px] text-amber-600">
                              LOC_PHE is already at +4.0 for this variant (diagnostic yield {"≥"}82%) -- per Supplement
                              5, once phenotype specificity this strongly implicates the locus (apparent locus homogeneity),
                              further co-segregation may not add pathogenicity evidence beyond that, since the phenotype match
                              alone is already doing the work segregation otherwise would.
                            </div>
                          )}
                          <div className="px-3 space-y-2">
                            {(draft.locSeg.observations || []).map((entry) => (
                              <SegregationObservationRow
                                key={entry.id}
                                entry={entry}
                                modeOfInheritance={modeOfInheritance}
                                onRemove={() =>
                                  updateDraftGroup(
                                    "locSeg",
                                    "observations",
                                    draft.locSeg.observations.filter((o) => o.id !== entry.id),
                                  )
                                }
                                onUpdate={(next) =>
                                  updateDraftGroup(
                                    "locSeg",
                                    "observations",
                                    draft.locSeg.observations.map((o) => (o.id === entry.id ? next : o)),
                                  )
                                }
                              />
                            ))}
                            {(!draft.locSeg.observations || draft.locSeg.observations.length === 0) && (
                              <p className="text-xs text-gray-400 italic">
                                No segregation observations entered for this proband's family yet.
                              </p>
                            )}
                          </div>
                          <div className="px-3 pb-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              onClick={() =>
                                updateDraftGroup("locSeg", "observations", [
                                  ...(draft.locSeg.observations || []),
                                  {
                                    id: `locseg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                                    label: "",
                                    optionValue: "",
                                    penetranceNearComplete: "",
                                    phaseEstablished: "",
                                    nonSegregationConfirmed: "",
                                  },
                                ])
                              }
                            >
                              <Plus className="h-3.5 w-3.5" /> Add segregation observation
                            </Button>
                          </div>
                        </>
                      )}
                    </ModalSection>
                  </>
                )}

                {/* ---- CLN_UAF (Unaffected) ---- */}
                {scoringMode === "unaffected" && (
                  <ModalSection
                    id="section-cln-uaf"
                    title="Unaffected Proband (CLN_UAF)"
                    badge={(() => {
                      const v = caseScoreFor("CLN_UAF", draft, modeOfInheritance)
                      return v !== null ? <ScoreBadge code="CLN_UAF" value={v} /> : <ResultBadge code="CLN_UAF" />
                    })()}
                  >
                    <FieldRow label="Phenotypic penetrance" required empty={!draft.clnUaf.phenotypicPenetrance}>
                      <select
                        className="w-full border rounded-md p-2 bg-white text-xs"
                        value={draft.clnUaf.phenotypicPenetrance}
                        onChange={(e) => updateDraftGroup("clnUaf", "phenotypicPenetrance", e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option>Age-matched penetrance of MDE is near 100%</option>
                        <option>Age-matched penetrance of MDE is 80{"–"}100%</option>
                        <option>Age-matched penetrance of MDE is {"<80%"}</option>
                        <option>Penetrance not established / unknown</option>
                      </select>
                    </FieldRow>
                    {clnUafMoiBucket(modeOfInheritance) === "recessive" &&
                      draft.clnUaf.phenotypicPenetrance &&
                      draft.clnUaf.phenotypicPenetrance !== "Penetrance not established / unknown" && (
                        <FieldRow
                          label="Zygosity / second variant (recessive or X-linked)"
                          required
                          empty={!draft.clnUaf.secondVariantCategory}
                        >
                          <select
                            className="w-full border rounded-md p-2 bg-white text-xs"
                            value={draft.clnUaf.secondVariantCategory}
                            onChange={(e) => updateDraftGroup("clnUaf", "secondVariantCategory", e.target.value)}
                          >
                            <option value="">Select...</option>
                            {CLN_UAF_SECOND_VARIANT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </FieldRow>
                      )}
                    <div className="px-3 py-1.5 text-[11px] text-indigo-600">
                      Per Supplement 4, Table 5 -- autosomal recessive and X-linked disorders score by the VBC's own
                      zygosity or its second-variant trans classification, not just penetrance; autosomal dominant and
                      semidominant disorders use penetrance alone.
                    </div>
                  </ModalSection>
                )}

                {/* ---- CLN_ALT (Alternative Cause) ---- */}
                {scoringMode === "alternative" && (
                  <ModalSection
                    id="section-cln-alt"
                    title="Alternative Cause (CLN_ALT)"
                    badge={(() => {
                      const v = caseScoreFor("CLN_ALT", draft, modeOfInheritance)
                      return v !== null ? <ScoreBadge code="CLN_ALT" value={v} /> : <ResultBadge code="CLN_ALT" />
                    })()}
                  >
                    <FieldRow
                      label="Alternative-cause variant location"
                      required
                      empty={!draft.clnAlt.secondVariantGeneRelationship}
                    >
                      <select
                        className="w-full border rounded-md p-2 bg-white text-xs"
                        value={draft.clnAlt.secondVariantGeneRelationship}
                        onChange={(e) => updateDraftGroup("clnAlt", "secondVariantGeneRelationship", e.target.value)}
                      >
                        <option value="">Select...</option>
                        {CLN_ALT_GENE_RELATIONSHIP_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </FieldRow>
                    <FieldRow label="Phenotype severity" required empty={!draft.clnAlt.severityCategory}>
                      <select
                        className="w-full border rounded-md p-2 bg-white text-xs"
                        value={draft.clnAlt.severityCategory}
                        onChange={(e) => updateDraftGroup("clnAlt", "severityCategory", e.target.value)}
                      >
                        <option value="">Select...</option>
                        {CLN_ALT_SEVERITY_OPTIONS.filter(
                          (opt) => !opt.sameGeneOnly || draft.clnAlt.secondVariantGeneRelationship === "same-gene",
                        ).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </FieldRow>
                    {!draft.clnAlt.secondVariantGeneRelationship && (
                      <div className="px-3 py-1.5 text-[11px] text-indigo-600">
                        Select the alternative-cause variant's gene relationship above -- the "not consistent with
                        established recessive disease entity" ({"−"}1.0) severity tier only appears once "Same gene as
                        VBC" is selected, per Supplement 4, Table 4.
                      </div>
                    )}
                  </ModalSection>
                )}
              </>
            )}

            <p className="text-xs text-gray-400 italic -mt-3">
              Preview only -- gating checklist and real Save/scoring logic still pending.
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
