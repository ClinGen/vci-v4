import { useState } from "react"
import { AlertTriangle, Lock, Plus, X } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card"
import { Button } from "../../ui/Button"
import { ExtIcon } from "../../ui/ExtIcon"
import { ResultBadge, CodeStatusBadge } from "../../ui/ScoreBadge"
import { SaveEvidenceAndComplete } from "../../ui/MarkComplete"
import { LockedNotice } from "../../ui/LockedNotice"
import { useTabContext } from "../../../contexts/useTabContext"
import { CSpecGuidanceBanner } from "../../ui/CSpecGuidance"
import { Table, THead, TBody, TR, TH, TD } from "../../ui/Table"
import ExternalDataSourcesPanel from "../../ExternalDataSourcesPanel"
import { GUIDANCE_DOC_LINKS } from "../../../lib/referenceData"

const AA_CATEGORY_LABEL: Record<string, string> = {
  "same-codon": "Same codon, same amino acid change",
  "distinct-aa": "Distinct amino acid change",
  motif: "Robustly-defined motif bonus (+2.0, one-time)",
}

interface InfVariantEntry {
  id: string
  variantId: string
  classification?: string
  pathway?: string
  aaCategory?: string
}

interface CodonVariant {
  variationId: string
  title?: string
  classification?: string
  reviewStatus?: string
  url: string
}

function InfVariantCard({ entry, onRemove }: { entry: InfVariantEntry; onRemove: () => void }) {
  const isMotif = entry.aaCategory === "motif"
  return (
    <div className="flex items-center justify-between text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
      <div className="min-w-0">
        <span className="font-mono text-xs">{entry.variantId}</span>
        {isMotif ? (
          <span className="text-blue-700 ml-2">{AA_CATEGORY_LABEL.motif}</span>
        ) : (
          <>
            <span className="text-gray-700 ml-2">{entry.classification}</span>
            {entry.pathway === "aa" && entry.aaCategory && (
              <span className="text-gray-400 text-xs ml-2">({AA_CATEGORY_LABEL[entry.aaCategory]})</span>
            )}
          </>
        )}
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 flex-none">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function InfVariantList({ entries, onRemove, emptyText }: { entries: InfVariantEntry[]; onRemove: (e: InfVariantEntry) => void; emptyText: string }) {
  if (entries.length === 0) return <p className="text-xs text-gray-400 italic mt-2">{emptyText}</p>
  return (
    <div className="mt-2 space-y-1">
      {entries.map((entry) => (
        <InfVariantCard key={entry.id} entry={entry} onRemove={() => onRemove(entry)} />
      ))}
    </div>
  )
}

export default function InformativeVariants() {
  const [variants, setVariants] = useState<InfVariantEntry[]>([])
  const [infComment, setInfComment] = useState("")
  const [infEvidenceSaved, setInfEvidenceSaved] = useState(false)
  const [sectionComplete, setSectionComplete] = useState(false)
  const [codonVariants] = useState<CodonVariant[]>([])
  const [codonVariantsStatus] = useState<"idle" | "loading" | "error" | "success">("idle")
  const [codonVariantsError] = useState<string | null>(null)

  const { setActiveTab } = useTabContext()
  const inheritanceSet = false
  const isPredictedEffectScoringActive = false
  const variantType: string | null = null
  const isMissense = variantType === "missense"
  const geneSymbol: string | null = null
  const displayProteinChange: string | null = null

  const removeVariant = (entry: InfVariantEntry) => {
    setVariants((prev) => prev.filter((v) => v !== entry))
  }

  return (
    <div className="space-y-4">
      <Card tone="action" className="!bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informative Variants Scoring</CardTitle>
            <div className="flex items-center gap-3">
              {isPredictedEffectScoringActive && variantType && inheritanceSet && (
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Add Informative Variant
                </Button>
              )}
              {isPredictedEffectScoringActive && variantType && (
                <SaveEvidenceAndComplete
                  complete={sectionComplete}
                  completeDisabledReason="Click Save Evidence before checking Tab Completed."
                  evidenceSaved={infEvidenceSaved}
                  onSaveEvidence={() => setInfEvidenceSaved(true)}
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
              Select a variant type on the Predicted Effect tab before adding informative variants.
            </div>
          ) : (
            <>
              <CSpecGuidanceBanner
                links={GUIDANCE_DOC_LINKS.informativeVariants}
                note={isMissense ? "Per Supplement 6, each pathway has its own Informative Variants rule." : undefined}
              />

              {isMissense ? (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="border border-gray-200 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-800">Missense Effect</span>
                      <CodeStatusBadge code="MIS_INF_" status="score" rawValue={null} ready={false} />
                    </div>
                    <InfVariantList
                      entries={variants.filter((v) => v.pathway === "aa")}
                      onRemove={removeVariant}
                      emptyText="No informative variants added yet."
                    />
                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                      <span className="text-gray-600">Missense Effect total (MIS_)</span>
                      <ResultBadge code="MIS_" />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-800">Splice Effect</span>
                      <ResultBadge code="SPL_INF_" />
                    </div>
                    <p className="text-xs text-gray-600 italic mt-2">Select a predicted splice impact on the Predicted Effect tab first.</p>
                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                      <span className="text-gray-600">Splice Effect total (SPL_)</span>
                      <ResultBadge code="SPL_" />
                    </div>
                  </div>
                </div>
              ) : (
                <InfVariantList
                  entries={variants}
                  onRemove={removeVariant}
                  emptyText="No informative variants added yet."
                />
              )}

              {isMissense ? (
                <div className="mt-4 border-2 border-indigo-200 bg-indigo-50 rounded-md p-3">
                  <p className="text-xs text-indigo-900 mb-2">
                    Per Supplement 6, Splice Effect only competes with Missense Effect when its total is
                    positive -- whichever is higher wins, with ties (and any negative Splice Effect total)
                    going to Missense Effect.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-indigo-200">
                    <span className="text-xs font-semibold text-indigo-900">
                      Final total -- Missense Effect wins
                    </span>
                    <ResultBadge code="MIS_/SPL_" />
                  </div>
                </div>
              ) : (
                <div className="mt-4 border-2 border-indigo-200 bg-indigo-50 rounded-md p-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-900">Final total (PRD + FXN + INF)</span>
                  <ResultBadge code="" />
                </div>
              )}
            </>
          )}
          {isPredictedEffectScoringActive && variantType && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-xs text-gray-700 block mb-1.5">Comment on Informative Variants (INF)</label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-xs"
                rows={2}
                placeholder="Summarize the informative variants assessment"
                value={infComment}
                onChange={(e) => setInfComment(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card tone="reference">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Identified Variants in Codon</CardTitle>
              <CardDescription>Other variants ClinVar has at the same codon position ({geneSymbol && displayProteinChange ? `${geneSymbol} ${displayProteinChange}` : "waiting on gene/protein change"})</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2 flex-none" onClick={() => window.open("https://en.wikipedia.org/wiki/Amino_acid_replacement#Grantham's_distance", "_blank", "noopener,noreferrer")}><ExtIcon className="h-4 w-4" />View Grantham chart</Button>
          </div>
        </CardHeader>
        <CardContent>
          {!geneSymbol || !displayProteinChange ? (
            <p className="text-xs text-gray-400 italic">Waiting on the gene symbol and protein change to be known before this can be searched.</p>
          ) : codonVariantsStatus === "idle" ? (
            <p className="text-xs text-gray-400 italic">Not fetched yet -- see External Data Sources below.</p>
          ) : codonVariantsStatus === "loading" ? (
            <p className="text-xs text-gray-500">Searching ClinVar...</p>
          ) : codonVariantsStatus === "error" ? (
            <p className="text-xs text-red-600 flex items-start gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 flex-none mt-0.5" /> {codonVariantsError}
            </p>
          ) : codonVariants.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <THead><TR className="bg-gray-50"><TH>Variant</TH><TH>Classification</TH><TH>Review Status</TH><TH>Link</TH></TR></THead>
                <TBody>
                  {codonVariants.map((v) => (
                    <TR key={v.variationId} className="border-t">
                      <TD className="font-mono text-xs">{v.title || v.variationId}</TD>
                      <TD>{v.classification || <span className="text-gray-400 italic">Not provided</span>}</TD>
                      <TD className="text-xs">{v.reviewStatus || "—"}</TD>
                      <TD><a href={v.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 font-medium"><ExtIcon className="h-3.5 w-3.5" />ClinVar</a></TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No other variants found in ClinVar at this codon.</p>
          )}
        </CardContent>
      </Card>

      <ExternalDataSourcesPanel
        sources={[
          {
            key: "clinvarCodon",
            label: "NCBI ClinVar (same-codon search)",
            description: "Other variants ClinVar has at this codon, above -- via esearch/esummary, keyed on gene symbol + protein change.",
            status: codonVariantsStatus,
            error: codonVariantsError || undefined,
            lastFetchedAt: null,
            onRetry: () => {},
            retryDisabled: !geneSymbol || !displayProteinChange,
          },
        ]}
      />
    </div>
  )
}
