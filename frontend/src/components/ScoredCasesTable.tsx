import { useState, Fragment } from "react"
import { ChevronDown, MessageSquare, Pencil, AlertTriangle } from "lucide-react"
import { MiniScoreBadge } from "./ui/StatusPill"
import { Disclosure } from "./ui/Disclosure"
import { CodeStatusBadge, CodeStatusSelect } from "./ui/ScoreBadge"
import type { ProbandDraft } from "./modals/ProbandModal"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CaseControlScores {
  CLN_CCS: number | null
  CLN_DNV: number | null
  [key: string]: number | null | undefined
}

interface CaseControlReasoning {
  [key: string]: string[]
}

export interface CaseControlObservation {
  label: string
  source: string
  caseCount: string
  cohortSize: string
  generalComment: string
  scores: CaseControlScores
  reasoning: CaseControlReasoning
}

interface CodeComments {
  [code: string]: string
}

interface HasCodeComment {
  [code: string]: boolean
}

// ---------------------------------------------------------------------------
// Scoring stub helpers
//
// These will be replaced by imports from the full scoring engine once it
// is migrated to lib/scoring.ts / ScoringContext.
// ---------------------------------------------------------------------------

/** Evidence code ordering for the scored cases table. */
const CASE_ROW_ORDER = [
  "CLN_AFF",
  "CLN_CCS",
  "CLN_DNV",
  "CLN_UAF",
  "CLN_ALT",
  "LOC_PHE",
  "LOC_SEG",
  "LOC",
] as const

type CaseRowCode = (typeof CASE_ROW_ORDER)[number]

interface CaseRowMeta {
  desc: string
}

const CASE_ROW_META: Record<CaseRowCode, CaseRowMeta> = {
  CLN_AFF: { desc: "Affected proband" },
  CLN_CCS: { desc: "Case-control study" },
  CLN_DNV: { desc: "de novo" },
  CLN_UAF: { desc: "Unaffected proband" },
  CLN_ALT: { desc: "Alternative cause" },
  LOC_PHE: { desc: "Specific phenotype" },
  LOC_SEG: { desc: "Co-segregation" },
  LOC: { desc: "Locus (combined)" },
}

// Stub scoring functions -- return null until the full engine is migrated
function caseScoreFor(_code: string, _proband: ProbandDraft, _moi: string): number | null {
  return null
}

function caseReasoningFor(_code: string, _proband: ProbandDraft, _moi: string): string[] {
  return []
}

interface CaseRowPlan {
  type: "active" | "na" | "mergeStart" | "mergeSkip"
  span?: number
}

function caseRowPlan(scoringMode: string): Record<string, CaseRowPlan> {
  // Simple stub -- mark codes as active or na based on scoring mode
  const plan: Record<string, CaseRowPlan> = {}
  for (const code of CASE_ROW_ORDER) {
    if (scoringMode === "affected") {
      plan[code] = ["CLN_AFF", "CLN_DNV", "LOC_PHE", "LOC_SEG", "LOC"].includes(code)
        ? { type: "active" }
        : { type: "na", span: 1 }
    } else if (scoringMode === "unaffected") {
      plan[code] = code === "CLN_UAF" ? { type: "active" } : { type: "na", span: 1 }
    } else if (scoringMode === "alternative") {
      plan[code] = code === "CLN_ALT" ? { type: "active" } : { type: "na", span: 1 }
    } else {
      plan[code] = { type: "na", span: 1 }
    }
  }
  return plan
}

function needsMoiReview(proband: ProbandDraft, _moi: string): boolean {
  // Stub -- will check if clnTableAtSave differs from current
  return false && !!proband
}

// Aggregate stubs
function clnAffAggregate(_probands: ProbandDraft[], _moi: string): number | null { return null }
function clnUafAggregate(_probands: ProbandDraft[], _moi: string): number | null { return null }
function clnAltAggregate(_probands: ProbandDraft[]): number | null { return null }
function clnDnvAggregate(_probands: ProbandDraft[], _moi: string, _ccsDnv: number | null): number | null { return null }
function locPheAggregate(_probands: ProbandDraft[]): number { return 0 }
function locPheAfterSegregation(phe: number, seg: number | null): number { return seg === -4.0 ? 0 : phe }
function locSegAggregate(_probands: ProbandDraft[], _moi: string): number | null { return null }
function locCombinedScore(phe: number, seg: number | null): number | null {
  if (phe === 0 && seg === null) return null
  return phe + (seg ?? 0)
}

// Overridable codes pilot (per prototype)
const OVERRIDABLE_CODES = ["CLN_AFF", "LOC_PHE"]

const CASE_COUNTING_CODES = ["CLN_AFF", "CLN_UAF", "CLN_ALT"]
const NOT_APPLICABLE_TO_CASE_CONTROL = ["CLN_UAF", "CLN_ALT", "CLN_AFF", "LOC_PHE", "LOC_SEG", "LOC"]

// ---------------------------------------------------------------------------
// Case info rows
// ---------------------------------------------------------------------------

interface CaseInfoRow {
  label: string
  get: (p: ProbandDraft) => string
}

const CASE_INFO_ROWS: CaseInfoRow[] = [
  {
    label: "Source detail",
    get: (p) => {
      const d = p.sourceDetail
      if (!d) return ""
      if (p.source === "PMID") return d.pmid ? `ID ${d.pmid}` : ""
      if (p.source === "Clinical Lab" || p.source === "Clinic" || p.source === "Research Lab") return d.labName || ""
      if ((p.source || "").startsWith("Database")) return d.databaseName || ""
      if (p.source === "Other") return d.otherDescription || ""
      return ""
    },
  },
  { label: "Phenotypic features associated with proband(s) (HPO)", get: (p) => (p.hpoTags.length ? p.hpoTags.join(", ") : "") },
  { label: "Free text description of disease", get: (p) => p.freeTextPheno || "" },
  { label: "Zygosity of variant in proband", get: (p) => p.zygosity || "" },
  {
    label: "2nd variant (if compound het)",
    get: (p) =>
      p.zygosity === "Compound heterozygous"
        ? `${p.compoundHetVariant.alleleRegistryId || "—"} — ${p.compoundHetVariant.classification || "not yet selected"}, ${p.compoundHetVariant.phase || "phase not yet selected"}`
        : "",
  },
  { label: "Proband sex", get: (p) => p.sex || "" },
  { label: "Age at observation", get: (p) => p.ageAtObservation || "" },
  { label: "Country of origin", get: (p) => p.countryOfOrigin || "" },
  {
    label: "de novo status",
    get: (p) => (p.scoringMode === "affected" ? `${p.clnDnv.deNovoStatus} / ${p.clnDnv.parentalConfirmation}` : ""),
  },
  {
    label: "Number of probands",
    get: (p) => (p.multipleProbandsEnabled && p.numberOfProbands ? p.numberOfProbands : ""),
  },
]

// ---------------------------------------------------------------------------
// Section divider row
// ---------------------------------------------------------------------------

interface SectionDividerRowProps {
  colSpan: number
  label: string
  collapsible?: boolean
  open?: boolean
  onToggle?: () => void
}

function SectionDividerRow({ colSpan, label, collapsible, open, onToggle }: SectionDividerRowProps) {
  return (
    <tr className="bg-blue-50/70 border-b border-blue-100">
      <td colSpan={colSpan} className="px-3 py-1.5 sticky left-0 bg-blue-50/70">
        {collapsible ? (
          <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wide" onClick={onToggle}>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            {label} {open ? "(click to hide)" : "(click to show)"}
          </button>
        ) : (
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{label}</span>
        )}
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// ScoredCasesTable
// ---------------------------------------------------------------------------

interface ScoredCasesTableProps {
  probands: ProbandDraft[]
  modeOfInheritance: string
  diseaseTerm?: string
  /** Case-control observation data, or null if none exists. */
  caseControlObservation?: CaseControlObservation | null
  /** Whether case-control data has been saved. */
  hasCaseControlData?: boolean
  /** Per-code comments (keyed by code). */
  codeComments?: CodeComments
  /** Which codes have a comment field. */
  hasCodeComment?: HasCodeComment
  /** Current evidence override status per code. */
  evidenceOverrideStatus?: (code: string) => string
  /** Set evidence override status for a code. */
  setEvidenceOverrideStatus?: (code: string, status: string) => void
  /** Raw score for overridable codes (pre-override value). */
  rawScoreFor?: (code: string) => number | null
  /** Callback when a code comment changes. */
  onCodeCommentChange?: (code: string, value: string) => void
  /** Callback to edit a proband. */
  onEditProband?: (proband: ProbandDraft) => void
  /** Callback to edit the case-control study. */
  onEditCaseControl?: () => void
}

export function ScoredCasesTable({
  probands,
  modeOfInheritance,
  diseaseTerm = "",
  caseControlObservation = null,
  hasCaseControlData = false,
  codeComments = {},
  hasCodeComment = {},
  evidenceOverrideStatus = () => "score",
  setEvidenceOverrideStatus = () => {},
  rawScoreFor = () => null,
  onCodeCommentChange = () => {},
  onEditProband = () => {},
  onEditCaseControl = () => {},
}: ScoredCasesTableProps) {
  const [showCaseInfo, setShowCaseInfo] = useState(true)
  const [openComments, setOpenComments] = useState<Set<string>>(new Set())

  const toggleComment = (code: string) => {
    setOpenComments((s) => {
      const next = new Set(s)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const caseControlActive = !!hasCaseControlData
  const observationCount = probands.length + (caseControlObservation ? 1 : 0)
  const totalCols = 2 + probands.length * 2 + (caseControlObservation ? 2 : 0)

  return (
    <Disclosure
      title="Case Information & Scored Cases"
      description={`${observationCount} saved observation${observationCount === 1 ? "" : "s"}`}
      defaultOpen={true}
    >
      <div className="mb-3 text-xs text-gray-700">
        <div>
          <span className="font-semibold italic">Mode of inheritance</span> = {modeOfInheritance || "—"}
        </div>
        <div>
          <span className="font-semibold italic">Disease</span> = {diseaseTerm || "—"}
        </div>
        {caseControlActive && (
          <div className="text-amber-700 text-xs mt-1">
            Case-control study in use -- CLN_AFF / CLN_UAF / CLN_ALT are Not Applicable per Supplement 4.
          </div>
        )}
      </div>

      <div className="overflow-auto border border-gray-200 rounded-md max-h-[36rem]">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2 font-semibold text-gray-700 sticky top-0 left-0 z-20 bg-gray-50 border-r border-gray-200">
                Field
              </th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700 sticky top-0 z-10 border-r border-gray-200 bg-amber-50">
                Aggregate
              </th>
              {probands.map((p, i) => (
                <th
                  key={i}
                  className="text-left px-3 py-2 font-semibold text-gray-700 sticky top-0 z-10 bg-gray-50 border-r border-gray-200 whitespace-nowrap"
                  colSpan={2}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{p.label || `Proband ${i + 1}`}</span>
                    <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => onEditProband(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 normal-case">{p.source}</div>
                </th>
              ))}
              {caseControlObservation && (
                <th
                  className="text-left px-3 py-2 font-semibold text-gray-700 sticky top-0 z-10 bg-gray-50 border-r border-gray-200 whitespace-nowrap"
                  colSpan={2}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{caseControlObservation.label || "Case-Control Study"}</span>
                    <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={onEditCaseControl}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 normal-case">{caseControlObservation.source}</div>
                  <div className="text-[10px] font-mono text-gray-400 normal-case">
                    {caseControlObservation.caseCount || "—"} cases / {caseControlObservation.cohortSize || "—"}{" "}
                    cohort
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Comment row */}
            <tr className="border-b border-gray-200 bg-blue-50/30">
              <td className="px-3 py-2 sticky left-0 bg-blue-50/30 border-r border-gray-200 font-medium text-gray-700 whitespace-nowrap">
                Comment
              </td>
              <td className="px-3 py-2 text-right border-r border-gray-200 bg-amber-50/40"></td>
              {probands.map((p, i) => (
                <td key={i} colSpan={2} className="px-3 py-2 border-r border-gray-200 text-gray-700">
                  {p.generalComment}
                </td>
              ))}
              {caseControlObservation && (
                <td colSpan={2} className="px-3 py-2 border-r border-gray-200 text-gray-700">
                  {caseControlObservation.generalComment}
                </td>
              )}
            </tr>

            {/* Scored Cases (CLN / LOC codes) */}
            <SectionDividerRow colSpan={totalCols} label="Scored Cases (CLN / LOC)" />
            {CASE_ROW_ORDER.map((code) => {
              const meta = CASE_ROW_META[code]
              const codeIsNAInCaseControl = caseControlActive && CASE_COUNTING_CODES.includes(code)
              const locSegValue = locSegAggregate(probands, modeOfInheritance)
              const locPheValue = locPheAfterSegregation(locPheAggregate(probands), locSegValue)

              const aggregate = codeIsNAInCaseControl
                ? null
                : code === "CLN_UAF"
                ? clnUafAggregate(probands, modeOfInheritance)
                : code === "CLN_ALT"
                ? clnAltAggregate(probands)
                : code === "CLN_AFF"
                ? clnAffAggregate(probands, modeOfInheritance)
                : code === "LOC_PHE"
                ? locPheValue
                : code === "LOC_SEG"
                ? locSegValue
                : code === "LOC"
                ? locCombinedScore(locPheValue, locSegValue)
                : code === "CLN_CCS"
                ? (caseControlObservation ? caseControlObservation.scores.CLN_CCS : null)
                : code === "CLN_DNV"
                ? clnDnvAggregate(probands, modeOfInheritance, caseControlObservation ? caseControlObservation.scores.CLN_DNV : null)
                : null

              const aggregateHasData = codeIsNAInCaseControl
                ? false
                : code === "CLN_UAF"
                ? probands.some((p) => p.scoringMode === "unaffected")
                : code === "CLN_ALT"
                ? probands.some((p) => p.scoringMode === "alternative")
                : code === "CLN_AFF"
                ? probands.some((p) => p.scoringMode === "affected")
                : code === "LOC_PHE"
                ? probands.some((p) => p.scoringMode === "affected")
                : code === "LOC_SEG"
                ? locSegValue !== null
                : code === "LOC"
                ? aggregate !== null
                : code === "CLN_CCS"
                ? !!caseControlObservation
                : code === "CLN_DNV"
                ? probands.some((p) => p.scoringMode === "affected") || !!caseControlObservation
                : false

              return (
                <Fragment key={code}>
                  <tr className="border-b border-gray-100 align-top">
                    <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-200 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-gray-800">{code}</span>
                        {hasCodeComment[code] && (
                          <button
                            className={`flex-none ${codeComments[code] ? "text-blue-600" : "text-gray-400 hover:text-blue-600"}`}
                            title={codeComments[code] ? "Edit comment for Summary" : "Add comment for Summary"}
                            onClick={() => toggleComment(code)}
                          >
                            <MessageSquare className="h-3.5 w-3.5" fill={codeComments[code] ? "currentColor" : "none"} />
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 italic">{meta.desc}</div>
                    </td>
                    <td className="px-3 py-2 text-right border-r border-gray-200 bg-amber-50/40 font-mono">
                      {codeIsNAInCaseControl ? (
                        <span className="text-gray-300 italic text-xs">N/A</span>
                      ) : OVERRIDABLE_CODES.includes(code) ? (
                        <div className="flex flex-col items-end gap-1 whitespace-nowrap">
                          <CodeStatusBadge
                            code={code}
                            status={evidenceOverrideStatus(code)}
                            rawValue={rawScoreFor(code)}
                            ready={true}
                          />
                          <CodeStatusSelect
                            status={evidenceOverrideStatus(code)}
                            onChange={(status) => setEvidenceOverrideStatus(code, status)}
                          />
                        </div>
                      ) : aggregateHasData && aggregate !== null ? (
                        aggregate.toFixed(1)
                      ) : (
                        <span className="text-gray-400 italic text-xs">Not Evaluated</span>
                      )}
                    </td>
                    {probands.map((p, i) => {
                      const plan = codeIsNAInCaseControl
                        ? { type: "na" as const }
                        : caseRowPlan(p.scoringMode || "affected")[code]
                      if (plan.type === "mergeSkip") return null
                      if (plan.type === "na") {
                        return (
                          <td key={i} colSpan={2} rowSpan={plan.span} className="px-3 py-2 border-r border-gray-200"></td>
                        )
                      }
                      if (plan.type === "mergeStart") {
                        return (
                          <td key={i} colSpan={2} rowSpan={plan.span} className="px-3 py-2 border-r border-gray-200"></td>
                        )
                      }
                      const moiReview = code === "CLN_AFF" && needsMoiReview(p, modeOfInheritance)
                      const score = moiReview ? null : caseScoreFor(code, p, modeOfInheritance)
                      const reasoning = caseReasoningFor(code, p, modeOfInheritance)
                      return (
                        <td key={i} colSpan={2} className="px-3 py-2 border-r border-gray-200">
                          {moiReview ? (
                            <div className="flex items-center gap-1.5 text-xs text-amber-700">
                              <AlertTriangle className="h-3.5 w-3.5 flex-none" />
                              Needs review -- Mode of Inheritance changed since last saved
                            </div>
                          ) : (
                            score !== null && (
                              <div className="flex gap-3">
                                <div className="flex-none w-14">
                                  <MiniScoreBadge code="" value={score} />
                                </div>
                                <ul className="text-xs text-gray-700 list-disc pl-4 space-y-0.5">
                                  {reasoning.map((line, li) => (
                                    <li key={li}>{line}</li>
                                  ))}
                                </ul>
                              </div>
                            )
                          )}
                        </td>
                      )
                    })}
                    {caseControlObservation &&
                      (NOT_APPLICABLE_TO_CASE_CONTROL.includes(code) ? (
                        <td colSpan={2} className="px-3 py-2 border-r border-gray-200"></td>
                      ) : (
                        <td colSpan={2} className="px-3 py-2 border-r border-gray-200">
                          {caseControlObservation.scores[code] !== null &&
                            caseControlObservation.scores[code] !== undefined && (
                              <div className="flex gap-3">
                                <div className="flex-none w-14">
                                  <MiniScoreBadge code="" value={caseControlObservation.scores[code]!} />
                                </div>
                                <ul className="text-xs text-gray-700 list-disc pl-4 space-y-0.5">
                                  {(caseControlObservation.reasoning[code] || []).map((line, li) => (
                                    <li key={li}>{line}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </td>
                      ))}
                  </tr>
                  {hasCodeComment[code] && openComments.has(code) && (
                    <tr className="border-b border-gray-100 bg-blue-50/40">
                      <td colSpan={totalCols} className="px-3 py-2">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Comment for Classification Summary{" "}
                          <span className="font-normal text-gray-400">
                            ({code} {"—"} flows through to the Classification Summary tab)
                          </span>
                        </label>
                        <textarea
                          className="w-full border border-gray-300 rounded-md p-2 text-xs bg-white"
                          rows={2}
                          placeholder={`Summary of the ${code} assessment across every proband and/or the case-control study above...`}
                          value={codeComments[code] || ""}
                          onChange={(e) => onCodeCommentChange(code, e.target.value)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}

            {/* Case Information (collapsible) */}
            <SectionDividerRow
              colSpan={totalCols}
              label="Case Information"
              collapsible
              open={showCaseInfo}
              onToggle={() => setShowCaseInfo(!showCaseInfo)}
            />
            {showCaseInfo &&
              CASE_INFO_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-gray-100">
                  <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-200 font-medium text-gray-700 whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-gray-200 bg-amber-50/40"></td>
                  {probands.map((p, i) => (
                    <td key={i} colSpan={2} className="px-3 py-2 border-r border-gray-200 text-gray-700">
                      {row.get(p)}
                    </td>
                  ))}
                  {caseControlObservation && <td colSpan={2} className="px-3 py-2 border-r border-gray-200"></td>}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 italic mt-2">
        Case Information and Scored Cases shows one column per entry.
      </p>
    </Disclosure>
  )
}
