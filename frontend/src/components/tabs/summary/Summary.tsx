import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card"
import { Button } from "../../ui/Button"
import { ScoreBadge, ResultBadge, CodeStatusBadge } from "../../ui/ScoreBadge"
import { CLASSIFICATION_TONES } from "../../../lib/scoring"

const CATEGORY_STRIPE: Record<string, string> = {
  POP: "border-l-blue-400",
  CLN: "border-l-blue-400",
  LOC: "border-l-blue-400",
  MIS: "border-l-amber-400",
  CDS: "border-l-amber-400",
  NUL: "border-l-amber-400",
  SPL: "border-l-amber-400",
  NCG: "border-l-gray-400",
  REG: "border-l-gray-400",
}

interface SummaryRow {
  code: string
  desc: string
  group: string
  gray?: boolean
}

const SUMMARY_ROWS: SummaryRow[] = [
  { code: "POP_FRQ", desc: "Population frequency", group: "POP" },
  { code: "POP_HMZ", desc: "Hom/Hemi observations", group: "POP" },
  { code: "CLN_UAF", desc: "Unaffecteds", group: "CLN" },
  { code: "CLN_ALT", desc: "Alternate cause", group: "CLN" },
  { code: "CLN_AFF", desc: "Affected observations", group: "CLN" },
  { code: "CLN_DNV", desc: "de novo occurrence", group: "CLN" },
  { code: "CLN_CCS", desc: "Case-control studies", group: "CLN" },
  { code: "LOC_PHE", desc: "Specific phenotype", group: "LOC" },
  { code: "LOC_SEG", desc: "Co-segregation", group: "LOC" },
  { code: "LOC", desc: "Combined locus evidence", group: "LOC" },
  { code: "MIS_PRD", desc: "Prediction for single amino acid change", group: "MIS" },
  { code: "MIS_FXN", desc: "Functional assessment", group: "MIS" },
  { code: "MIS_INF", desc: "Informative variants", group: "MIS" },
  { code: "CDS_PRD", desc: "Prediction for alteration/truncation", group: "CDS" },
  { code: "CDS_FXN", desc: "Functional assessment", group: "CDS" },
  { code: "CDS_INF", desc: "Informative variants", group: "CDS" },
  { code: "NUL_PRD", desc: "Prediction for absent protein", group: "NUL" },
  { code: "NUL_FXN", desc: "Functional assessment", group: "NUL" },
  { code: "NUL_INF", desc: "Informative variants", group: "NUL" },
  { code: "SPL_PRD", desc: "Prediction for alteration to splicing", group: "SPL" },
  { code: "SPL_SPA", desc: "Observation of alteration to splicing", group: "SPL" },
  { code: "SPL_FXN", desc: "Functional assessment", group: "SPL" },
  { code: "SPL_INF", desc: "Informative variants", group: "SPL" },
  { code: "NCG_PRD", desc: "Prediction for effect on function", group: "NCG", gray: true },
  { code: "NCG_FXN", desc: "Functional assessment", group: "NCG", gray: true },
  { code: "NCG_INF", desc: "Informative variants", group: "NCG", gray: true },
  { code: "REG_PRD", desc: "Prediction for effect on expression", group: "REG", gray: true },
  { code: "REG_FXN", desc: "Functional assessment", group: "REG", gray: true },
  { code: "REG_INF", desc: "Informative variants", group: "REG", gray: true },
]

interface RowState {
  type: "score" | "nd" | "na" | "notEvaluated"
  value?: number
  computedValue?: number | null
}

function renderScoreBadge(state: RowState, code: string) {
  if (state.type === "score") return <ScoreBadge code="" value={state.value!} />
  if (state.type === "nd" || state.type === "na") {
    return <CodeStatusBadge code={code} status={state.type} rawValue={state.computedValue ?? null} ready={true} />
  }
  return <ResultBadge code="" />
}

function SummaryTable({ rowsToRender, hiddenCount, showAll, setShowAll }: {
  rowsToRender: (SummaryRow & { state: RowState; comment: string })[]
  hiddenCount: number
  showAll: boolean
  setShowAll: (v: boolean) => void
}) {
  return (
    <Card tone="reference">
      <CardHeader><CardTitle>Code Summary</CardTitle><CardDescription>Full evidence-code framework, with workflow scores populated from what's been entered elsewhere in this record</CardDescription></CardHeader>
      <CardContent>
        {rowsToRender.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-200">Code</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700 bg-amber-50">Workflow Score</th>
                </tr>
              </thead>
              <tbody>
                {rowsToRender.map((row, i) => {
                  const isNewGroup = i > 0 && rowsToRender[i - 1].group !== row.group
                  return (
                    <tr key={row.code} className={`border-b border-gray-100 ${row.gray ? "bg-gray-100/60" : ""} ${isNewGroup ? "border-t-2 border-t-gray-300" : ""}`}>
                      <td className={`px-3 py-2 border-r border-gray-200 border-l-4 ${CATEGORY_STRIPE[row.group] || "border-l-transparent"}`}>
                        <b className={row.gray ? "text-gray-400" : ""}>{row.code}</b>
                        <div className="italic text-gray-600">{row.desc}</div>
                        {row.comment && (
                          <div className="text-xs text-blue-700 mt-1">
                            <span className="font-semibold">Comment:</span> {row.comment}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">{renderScoreBadge(row.state, row.code)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-md p-4 text-center text-xs text-gray-400 italic">
            No codes have a live score yet in this record.
          </div>
        )}
        {hiddenCount > 0 && (
          <button
            className="flex items-center gap-1.5 text-xs font-medium text-blue-700 mt-2"
            onClick={() => setShowAll(!showAll)}
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAll ? "rotate-180" : ""}`} />
            {showAll ? "Hide" : "Show"} {hiddenCount} Not Applicable / Not Evaluated code{hiddenCount === 1 ? "" : "s"}
          </button>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-3.5 rounded-sm bg-blue-400" /> Human Observational Data</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-3.5 rounded-sm bg-amber-400" /> Predicted/Functional Data</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-3.5 rounded-sm bg-gray-400" /> Not yet scored (NCG/REG)</span>
        </div>
        <p className="text-xs text-gray-400 italic mt-3">
          Reference list per the SVCv4.0 evidence-code framework. Only codes with a live workflow score show by
          default — Not Applicable and Not Evaluated codes are tucked behind the toggle above so this stays
          scannable as the record fills in.
        </p>
      </CardContent>
    </Card>
  )
}

export default function Summary() {
  const [showAll, setShowAll] = useState(false)
  const [summaryStatement, setSummaryStatement] = useState("")
  const [summaryStatementSaved, setSummaryStatementSaved] = useState(false)

  const classification: string | null = null
  const totalScore = 0
  const anyScored = false
  const variantHgvs: string | null = null
  const diseaseTerm: string | null = null
  const modeOfInheritance: string | null = null
  const criteriaDoc: string | null = null

  const tone = classification
    ? CLASSIFICATION_TONES[classification] || { bg: "bg-gray-100", text: "text-gray-500", divider: "border-gray-400/20" }
    : { bg: "bg-gray-100", text: "text-gray-500", divider: "border-gray-400/20" }

  // Every row is "not evaluated" until scoring state is shared across tabs (Phase 3).
  const rowsWithState = SUMMARY_ROWS.map((row): SummaryRow & { state: RowState; comment: string } => ({
    ...row,
    state: { type: "notEvaluated" },
    comment: "",
  }))
  const scoredRows = rowsWithState.filter((r) => r.state.type === "score")
  const hiddenCount = rowsWithState.length - scoredRows.length
  const rowsToRender = showAll ? rowsWithState : scoredRows

  return (
    <>
      <div className={`rounded-lg border border-gray-200 mb-4 overflow-hidden ${tone.bg}`}>
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wide ${tone.text} opacity-70`}>Classification</div>
            <div className={`text-xl font-serif font-bold ${tone.text}`}>{classification || "Not yet determined"}</div>
          </div>
          <div className="text-right">
            <div className={`text-xs font-semibold uppercase tracking-wide ${tone.text} opacity-70`}>Score</div>
            <div className={`text-xl font-mono font-bold ${tone.text}`}>{anyScored ? `${totalScore >= 0 ? "+" : ""}${totalScore.toFixed(1)}` : "—"}</div>
          </div>
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 pt-3 border-t ${tone.divider} text-xs`}>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wide ${tone.text} opacity-70`}>Variant (HGVS)</div>
            <div className={`font-mono ${tone.text} break-words`}>{variantHgvs || "—"}</div>
          </div>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wide ${tone.text} opacity-70`}>Disease (MONDO)</div>
            <div className={`${tone.text} break-words`}>{diseaseTerm || "—"}</div>
          </div>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wide ${tone.text} opacity-70`}>Mode of Inheritance</div>
            <div className={`${tone.text} break-words`}>{modeOfInheritance || "—"}</div>
          </div>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wide ${tone.text} opacity-70`}>Criteria Specifications</div>
            <div className={`${tone.text} break-words`}>{criteriaDoc || "—"}</div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 italic mb-4">
        Based on Population, Clinical (Unaffected / Alternate Cause / Case-Control), and Predicted Effect scores
        currently wired up. CLN_AFF, CLN_DNV, LOC_PHE, and LOC_SEG aren't included yet since they have no scoring
        logic built. Uncertain Significance sub-tiers (Low/Mid/High) aren't reported yet either.
      </p>

      <Card tone="reference" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Summary Statement</CardTitle>
              <CardDescription>
                Free text for now — eventually this should pull in and assemble the reasoning already entered
                throughout this record (case descriptions, functional assessments, segregation notes, etc.) rather
                than requiring a second write-up here.
              </CardDescription>
            </div>
            {summaryStatementSaved && (
              <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium flex-none">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full border rounded-md p-3 text-xs min-h-[140px] disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="e.g. This variant was identified in 3 unrelated probands with a phenotype specific for Li-Fraumeni syndrome, including one confirmed de novo occurrence. Population frequency data and predicted effect are both consistent with pathogenicity..."
            value={summaryStatement}
            disabled={summaryStatementSaved}
            onChange={(e) => setSummaryStatement(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            {!summaryStatementSaved ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => setSummaryStatementSaved(true)}
              >
                <Check className="h-3.5 w-3.5" /> Save
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setSummaryStatementSaved(false)}>
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <SummaryTable
        rowsToRender={rowsToRender}
        hiddenCount={hiddenCount}
        showAll={showAll}
        setShowAll={setShowAll}
      />
    </>
  )
}
