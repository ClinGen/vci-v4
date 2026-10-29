import { useState } from "react"
import { AlertTriangle, Check } from "lucide-react"
import { Button } from "../ui/Button"
import { ScoreBadge, ResultBadge } from "../ui/ScoreBadge"
import { Modal, FieldRow, ModalSection } from "../ui/Modal"
import SourceDetailFields from "../SourceDetailFields"
import { isSourceDetailComplete, curationSourceLabel } from "../../lib/sourceDetail"
import { clnCcsDnvScore, clnCcsEligible, clnCcsScore } from "../../lib/scoring"
import {
  INHERITANCE_OPTIONS,
  PROBAND_SOURCE_OPTIONS,
  PROBAND_SOURCE_OPTION_LABELS,
} from "../../lib/referenceData"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SourceDetail {
  pmid: string
  labName: string
  databaseName: string
  otherDescription: string
}

export interface CaseControlDraft {
  source: string
  sourceDetail: SourceDetail
  curatedDisease: string
  curatedMoi: string
  generalComment: string
  label: string
  caseCount: string
  cohortSize: string
  oddsRatio: string
  ciExcludes1: string
  dnvPhenotypicSpecificity: string
  dnvStatus: string
  dnvParentalConfirmation: string
  curatedAtMs: number | null
  curatedBy: string | null
}

export function emptyCaseControlDraft(): CaseControlDraft {
  return {
    source: "",
    sourceDetail: { pmid: "", labName: "", databaseName: "", otherDescription: "" },
    curatedDisease: "",
    curatedMoi: "",
    generalComment: "",
    label: "",
    caseCount: "",
    cohortSize: "",
    oddsRatio: "",
    ciExcludes1: "",
    dnvPhenotypicSpecificity: "",
    dnvStatus: "",
    dnvParentalConfirmation: "",
    curatedAtMs: null,
    curatedBy: null,
  }
}

// ---------------------------------------------------------------------------
// CaseControlModal
// ---------------------------------------------------------------------------

interface CaseControlModalProps {
  /** Criteria spec document label, used for curation source stamping. */
  criteriaDoc?: string | null
  /** The current mode of inheritance for this variant curation. */
  modeOfInheritance?: string
  /** Whether this study has been saved before (editing vs new). */
  isExisting?: boolean
  /** Initial data when editing an existing case-control study. */
  initialData?: CaseControlDraft
  /** Callback to close the modal. */
  onClose: () => void
  /** Callback when saving. Receives the complete case-control data. */
  onSave?: (data: CaseControlDraft) => void
  /** Callback to remove this study from clinical and locus data. */
  onRemove?: () => void
}

export function CaseControlModal({
  criteriaDoc = null,
  modeOfInheritance = "",
  isExisting = false,
  initialData,
  onClose,
  onSave,
  onRemove,
}: CaseControlModalProps) {
  const [draft, setDraft] = useState<CaseControlDraft>(initialData ?? emptyCaseControlDraft())

  const sourceDetail = draft.sourceDetail

  const saveBlockedReason = !draft.source
    ? "Select a Source above before saving."
    : !draft.label.trim()
    ? "Enter a Label above before saving."
    : !isSourceDetailComplete(draft.source, sourceDetail)
    ? "Finish the source details above before saving."
    : ""

  const clnCcsValue = clnCcsScore(draft.oddsRatio, draft.ciExcludes1)
  const clnCcsDnvValue = clnCcsDnvScore(
    modeOfInheritance,
    draft.dnvPhenotypicSpecificity,
    draft.dnvStatus,
    draft.dnvParentalConfirmation,
  )
  const clnCcsIsEligible = clnCcsEligible(draft.caseCount, draft.cohortSize)

  const handleSave = () => {
    const curatedAtMs = draft.curatedAtMs || Date.now()
    const curatedBy = draft.curatedBy || curationSourceLabel(criteriaDoc, null)
    const saved: CaseControlDraft = {
      ...draft,
      curatedAtMs,
      curatedBy,
    }
    onSave?.(saved)
    onClose()
  }

  return (
    <Modal
      title="Case-Control Study Evidence Collection"
      onClose={onClose}
      navItems={
        draft.source
          ? [
              { id: "section-source", label: "Source" },
              { id: "section-owner-notes", label: "Comments" },
              { id: "section-general", label: "General Info" },
              { id: "section-cln-ccs", label: "CLN_CCS" },
              { id: "section-cln-dnv", label: "CLN_DNV" },
            ]
          : [{ id: "section-source", label: "Source" }]
      }
      headerRight={
        <div className="flex items-center gap-2">
          {isExisting && onRemove && (
            <button
              className="text-xs text-blue-100 hover:text-white underline"
              onClick={() => {
                onRemove()
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
          setPmid={(v) => setDraft({ ...draft, sourceDetail: { ...draft.sourceDetail, pmid: v } })}
          labName={draft.sourceDetail.labName}
          setLabName={(v) => setDraft({ ...draft, sourceDetail: { ...draft.sourceDetail, labName: v } })}
          databaseName={draft.sourceDetail.databaseName}
          setDatabaseName={(v) => setDraft({ ...draft, sourceDetail: { ...draft.sourceDetail, databaseName: v } })}
          otherDescription={draft.sourceDetail.otherDescription}
          setOtherDescription={(v) => setDraft({ ...draft, sourceDetail: { ...draft.sourceDetail, otherDescription: v } })}
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
              Confirm the mode of inheritance and the disease align between this source and the curated MOI/Disease.
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
            <FieldRow label="Label">
              <input
                className="w-full border rounded-md p-2 text-xs"
                placeholder="e.g. Smith et al. 2021 cohort"
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              />
            </FieldRow>
          </ModalSection>

          {/* ---- CLN_CCS ---- */}
          <ModalSection
            id="section-cln-ccs"
            title="Case-Control Study (CLN_CCS)"
            badge={clnCcsValue !== null ? <ScoreBadge code="CLN_CCS" value={clnCcsValue} /> : <ResultBadge code="CLN_CCS" value="ND" />}
          >
            <FieldRow label="Unrelated cases with VBC">
              <input
                type="number"
                min="0"
                step="1"
                className="w-32 border rounded-md p-2 text-xs font-mono"
                value={draft.caseCount}
                onChange={(e) => setDraft({ ...draft, caseCount: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Total case cohort size">
              <input
                type="number"
                min="0"
                step="1"
                className="w-32 border rounded-md p-2 text-xs font-mono"
                value={draft.cohortSize}
                onChange={(e) => setDraft({ ...draft, cohortSize: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Odds Ratio">
              <input
                type="number"
                min="0"
                step="any"
                className="w-32 border rounded-md p-2 text-xs font-mono"
                value={draft.oddsRatio}
                onChange={(e) => setDraft({ ...draft, oddsRatio: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="95% CI excludes 1.0?">
              <select
                className="w-full border rounded-md p-2 bg-white text-xs"
                value={draft.ciExcludes1}
                onChange={(e) => setDraft({ ...draft, ciExcludes1: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </FieldRow>
            {(draft.caseCount || draft.cohortSize) && !clnCcsIsEligible && (
              <div className="px-3 py-1.5 text-[11px] text-amber-600 flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 flex-none mt-0.5" />
                Case-control criteria not met (Supplement 4 recommends {"≥"} 5 cases with the variant in a cohort of{" "}
                {"≥"} 100) -- consider individual proband counting instead.
              </div>
            )}
          </ModalSection>

          {/* ---- CLN_DNV ---- */}
          <ModalSection
            id="section-cln-dnv"
            title="de novo (CLN_DNV)"
            badge={clnCcsDnvValue !== null ? <ScoreBadge code="CLN_DNV" value={clnCcsDnvValue} /> : <ResultBadge code="CLN_DNV" />}
            note="For a de novo case identified within this cohort, not tied to an individual proband record."
          >
            <FieldRow label="Phenotype Consistency">
              <select
                className="w-full border rounded-md p-2 bg-white text-xs"
                value={draft.dnvPhenotypicSpecificity}
                onChange={(e) => setDraft({ ...draft, dnvPhenotypicSpecificity: e.target.value })}
              >
                <option value="">Select...</option>
                <option>Specific for MDE</option>
                <option>Consistent with MDE</option>
                <option>Not consistent</option>
              </select>
            </FieldRow>
            <FieldRow label="de novo status">
              <select
                className="w-full border rounded-md p-2 bg-white text-xs"
                value={draft.dnvStatus}
                onChange={(e) => setDraft({ ...draft, dnvStatus: e.target.value })}
              >
                <option value="">Select...</option>
                <option>Is de novo</option>
                <option>Not de novo</option>
                <option>Unknown</option>
              </select>
            </FieldRow>
            {draft.dnvStatus === "Is de novo" && (
              <FieldRow label="Parental confirmation">
                <select
                  className="w-full border rounded-md p-2 bg-white text-xs"
                  value={draft.dnvParentalConfirmation}
                  onChange={(e) => setDraft({ ...draft, dnvParentalConfirmation: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option>Confirmed</option>
                  <option>Not confirmed</option>
                </select>
              </FieldRow>
            )}
            {((modeOfInheritance || "").startsWith("Semidominant") ||
              (modeOfInheritance || "").startsWith("X-linked recessive")) && (
              <div className="px-3 py-1.5 text-[11px] text-amber-600 flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 flex-none mt-0.5" />
                {modeOfInheritance} needs the individual's zygosity/sex to know whether Table 1 or Table 2 applies -- that
                isn't available at the cohort level. Enter this case as an individual proband instead so CLN_DNV can be
                scored.
              </div>
            )}
          </ModalSection>

          <p className="text-xs text-gray-400 italic -mt-3">
            This study is variant-level, not per-proband -- it's independent of any individually-counted probands entered
            separately.
          </p>
        </>
      )}
    </Modal>
  )
}
