import { useState } from "react"
import { ExternalLink, Lock, Plus, X } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/Card"
import { Button } from "../../ui/Button"
import { ScoreBadge, CodeStatusBadge, formatSignedScore } from "../../ui/ScoreBadge"
import { SaveEvidenceAndComplete } from "../../ui/MarkComplete"
import { LockedNotice } from "../../ui/LockedNotice"
import { useTabContext } from "../../../contexts/useTabContext"
import { CSpecGuidanceBanner } from "../../ui/CSpecGuidance"
import { Table, THead, TBody, TR, TH, TD } from "../../ui/Table"
import { GUIDANCE_DOC_LINKS } from "../../../lib/referenceData"

const KIND_LABEL: Record<string, string> = { mave: "MAVE", literature: "Literature", "model-organism": "Model Organism" }

interface FunctionalEntry {
  id: string
  kind: string
  source?: string
  pathway?: string
  functionalReadout?: string
  modelOrganism?: string
  assayId?: string
  numPathogenicControls?: number
  numBenignControls?: number
  resultRange?: string
  comment?: string
  resultDirection?: string
  pointsOverride?: number
}

interface ContributionStatus {
  counted: boolean
  reason?: string
}

function ContributionNote({ status }: { status?: ContributionStatus }) {
  if (!status) return null
  if (status.reason === "excluded") {
    return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-300">Excluded from score</span>
  }
  if (status.reason === "superseded") {
    return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Superseded by stronger same-readout evidence</span>
  }
  if (status.reason === "conflicting-summed") {
    return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">Conflicting same-readout evidence -- summed</span>
  }
  return null
}

function EvidenceCard({ entry, status, onRemove }: { entry: FunctionalEntry; status?: ContributionStatus; onRemove: () => void }) {
  const points = entry.pointsOverride ?? null
  return (
    <div className={`border rounded-md p-3 bg-white ${status && !status.counted ? "border-gray-200 opacity-70" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">{KIND_LABEL[entry.kind] || entry.kind}</span>
            {points !== null ? (
              <ScoreBadge code="" value={points} />
            ) : (
              <span className="text-[10px] font-mono text-gray-400">Incomplete</span>
            )}
            <ContributionNote status={status} />
          </div>
          <div className="text-xs text-gray-800 mt-1 font-mono break-all">
            {entry.kind === "model-organism" ? `ID ${entry.source || "—"}` : entry.kind === "mave" ? entry.source || "—" : `ID ${entry.source || "—"}`}
          </div>
          {entry.functionalReadout && <div className="text-xs text-gray-600 mt-0.5">Readout: {entry.functionalReadout}</div>}
          {entry.kind === "model-organism" ? (
            <div className="text-xs text-gray-600 mt-0.5">{entry.modelOrganism || "—"}</div>
          ) : (
            <div className="text-xs text-gray-600 mt-0.5">
              {entry.assayId && <>{entry.assayId} {"·"} </>}
              {entry.numPathogenicControls || 0} pathogenic / {entry.numBenignControls || 0} benign controls
              {entry.resultRange && <> {"—"} VBC in {entry.resultRange} range</>}
            </div>
          )}
          {entry.comment && <div className="text-xs text-blue-700 mt-1"><span className="font-semibold">Comment:</span> {entry.comment}</div>}
        </div>
        <button className="text-gray-400 hover:text-red-500 flex-none" onClick={onRemove} title="Remove evidence">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function CombinedTotal({ label, value }: { label: string; value: number | null | undefined }) {
  if (value === null || value === undefined) return null
  return (
    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
      <span className="text-gray-600">{label}</span>
      <span className="font-mono font-semibold text-gray-800">{formatSignedScore(value)}</span>
    </div>
  )
}

function EvidenceList({ title, badgeCode, entries, total, status, onRemove, combined }: {
  title: string
  badgeCode: string
  entries: FunctionalEntry[]
  total: number | null
  status: string
  onRemove: (entry: FunctionalEntry) => void
  combined?: React.ReactNode
}) {
  return (
    <div className="border border-gray-200 rounded-md">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-800">{title}</span>
        <CodeStatusBadge code={badgeCode} status={status} rawValue={total} ready={entries.length > 0} />
      </div>
      <div className="p-3 space-y-2">
        {status !== "score" ? (
          <p className="text-xs text-gray-400 italic">
            Marked {status === "nd" ? "No Data" : "Not Applicable"} -- doesn't contribute to the classification total.
          </p>
        ) : entries.length > 0 ? (
          entries.map((entry) => <EvidenceCard key={entry.id} entry={entry} onRemove={() => onRemove(entry)} />)
        ) : (
          <p className="text-xs text-gray-400 italic">No functional evidence added yet.</p>
        )}
        {combined}
      </div>
    </div>
  )
}

export default function Functional() {
  const [evidence, setEvidence] = useState<FunctionalEntry[]>([])
  const [fxnComment, setFxnComment] = useState("")
  const [fxnEvidenceSaved, setFxnEvidenceSaved] = useState(false)
  const [sectionComplete, setSectionComplete] = useState(false)

  const { setActiveTab } = useTabContext()
  const inheritanceSet = false
  const isPredictedEffectScoringActive = false
  const variantType: string | null = null
  const isMissense = variantType === "missense"
  const displayCaid: string | null = null
  const mavedbHref = displayCaid ? `https://www.mavedb.org/mavemd?search=${displayCaid}&searchType=clinGenAlleleId` : "https://www.mavedb.org/"

  const removeEvidence = (entry: FunctionalEntry) => {
    setEvidence((prev) => prev.filter((e) => e !== entry))
  }

  return (
    <div className="space-y-4">
      <Card tone="action" className="!bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Functional Scoring</CardTitle>
            <div className="flex items-center gap-3">
              {isPredictedEffectScoringActive && variantType && inheritanceSet && (
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Add Functional Evidence
                </Button>
              )}
              {isPredictedEffectScoringActive && variantType && (
                <SaveEvidenceAndComplete
                  complete={sectionComplete}
                  completeDisabledReason="Click Save Evidence before checking Tab Completed."
                  evidenceSaved={fxnEvidenceSaved}
                  onSaveEvidence={() => setFxnEvidenceSaved(true)}
                  onToggleComplete={(checked) => setSectionComplete(checked)}
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!inheritanceSet ? (
            <LockedNotice onGoToParameters={() => setActiveTab("general-information")} />
          ) : !isPredictedEffectScoringActive || !variantType ? (
            <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-gray-700 flex items-center gap-2 text-xs">
              <Lock className="h-4 w-4 text-gray-500 flex-none" />
              Select a variant type on the Predicted Effect tab before entering functional evidence.
            </div>
          ) : (
            <>
              <CSpecGuidanceBanner
                links={GUIDANCE_DOC_LINKS.functionalData}
                note={
                  (variantType === "missense" || variantType === "canonical-splice")
                    ? "Note: Splice Assay Results (SPL_SPA evidence such as RT-PCR/RNA-seq/minigene data showing an aberrant splice product) are collected in the Predicted Effect tab."
                    : undefined
                }
              />

              {isMissense ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <EvidenceList
                    title="Missense Effect"
                    badgeCode="MIS_FXN_"
                    entries={evidence.filter((e) => e.pathway === "aa")}
                    total={null}
                    status="score"
                    onRemove={removeEvidence}
                    combined={<CombinedTotal label="Combined (MIS_PRD_ + MIS_FXN_)" value={null} />}
                  />
                  <EvidenceList
                    title="Splice Effect"
                    badgeCode="SPL_FXN_"
                    entries={evidence.filter((e) => e.pathway === "splice")}
                    total={null}
                    status="score"
                    onRemove={removeEvidence}
                    combined={<CombinedTotal label="Combined (SPL_PRD_ + SPL_SPA_ + SPL_FXN_)" value={null} />}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {evidence.length > 0 ? (
                    evidence.map((entry, i) => <EvidenceCard key={entry.id} entry={entry} onRemove={() => setEvidence((prev) => prev.filter((_, j) => j !== i))} />)
                  ) : (
                    <p className="text-xs text-gray-400 italic">No functional evidence added yet.</p>
                  )}
                </div>
              )}
            </>
          )}
          {isPredictedEffectScoringActive && variantType && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-xs text-gray-700 block mb-1.5">Comment on Functional Assessment (FXN)</label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-xs"
                rows={2}
                placeholder="Summarize the functional assessment"
                value={fxnComment}
                onChange={(e) => setFxnComment(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card tone="reference">
        <CardHeader>
          <CardTitle>Functional Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <span className="font-serif font-bold text-gray-900">
                External Functional Evidence Resources <span className="font-sans font-normal text-gray-600">(1)</span>
              </span>
              <div className="text-xs text-gray-500 mt-0.5">
                External tools -- search there, then record the resulting evidence above. Not all variants have
                MAVE data available.
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <THead className="bg-gray-50">
                  <TR>
                    <TH className="text-center">Resource</TH>
                    <TH className="text-center">Search</TH>
                  </TR>
                </THead>
                <TBody>
                  <TR className="hover:bg-gray-50">
                    <TD className="text-center font-medium text-gray-800">MaveDB</TD>
                    <TD className="text-center">
                      <a href={mavedbHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 text-blue-600 font-medium hover:text-blue-800">
                        Search <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </TD>
                  </TR>
                </TBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
