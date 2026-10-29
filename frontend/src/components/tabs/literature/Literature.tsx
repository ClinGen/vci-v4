import { useState } from "react"
import { Check, ChevronDown, ChevronRight, FileText, RefreshCw, Search, User, Users } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card"
import { Button } from "../../ui/Button"
import { Badge } from "../../ui/Badge"
import { ExtIcon } from "../../ui/ExtIcon"

const DASH = "–"

interface PhenopacketField {
  label: string
  value?: string | number | null
}

interface CuratedEntry {
  id: string
  kind: "proband" | "case-control"
  dataSource?: string
  fields: PhenopacketField[]
  generalComment?: string
  badgeLabel?: string
  badgeTone?: string
  onMove?: () => void
}

const KIND_STYLES: Record<string, { label: string; icon: typeof User; pill: string }> = {
  proband: { label: "Proband", icon: User, pill: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  "case-control": { label: "Case-control study", icon: Users, pill: "bg-teal-50 text-teal-700 border border-teal-200" },
}

const TONE_STYLES: Record<string, string> = {
  applied: "border-l-4 border-l-blue-400",
  available: "border-l-4 border-l-gray-300",
}

const BADGE_TONES: Record<string, string> = {
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
  slate: "bg-slate-100 text-slate-600 border border-slate-300",
}

function PhenopacketCard({ badgeLabel = "Curated in the VCI", badgeTone = "purple", dataSource, fields, generalComment, hideByline, kind, onMove, tone }: {
  badgeLabel?: string; badgeTone?: string; dataSource?: string; fields: PhenopacketField[]
  generalComment?: string; hideByline?: boolean; kind: string; onMove?: () => void; tone: string
}) {
  const [open, setOpen] = useState(false)
  const { label: kindLabel, icon: KindIcon, pill: kindPill } = KIND_STYLES[kind] || KIND_STYLES.proband
  return (
    <div className={`border border-gray-200 rounded-md bg-white overflow-hidden ${TONE_STYLES[tone] || ""}`}>
      <button className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left" onClick={() => setOpen(!open)}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <ChevronDown className={`h-4 w-4 flex-none text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
            <span className="text-xs font-medium text-gray-800 truncate">{fields[0]?.value || "(unlabeled)"}</span>
            <Badge className={`${BADGE_TONES[badgeTone || "purple"] || BADGE_TONES.purple} flex-none`}>{badgeLabel}</Badge>
            {tone === "applied" && <Badge className="bg-blue-50 text-blue-700 border border-blue-200 flex-none">Clinical and Locus</Badge>}
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium tracking-wide rounded px-1.5 py-0.5 flex-none ${kindPill}`}>
              <KindIcon className="h-2.5 w-2.5" /> {kindLabel}
            </span>
          </div>
          {!hideByline && dataSource && <div className="pl-6 mt-0.5 text-[11px] text-gray-500 truncate">{dataSource}</div>}
        </div>
        {tone === "available" && onMove && (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onMove() }}>
            Move to Clinical and Locus
          </Button>
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-3">
          <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {fields.slice(1).map((f) => (
              <div key={f.label} className="flex gap-2">
                <dt className="text-gray-500 flex-none">{f.label}:</dt>
                <dd className="text-gray-800">{f.value || DASH}</dd>
              </div>
            ))}
          </dl>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5">
            <div className="text-xs font-semibold text-gray-600 mb-0.5">Curator comments</div>
            <p className="text-xs text-gray-700">{generalComment || <span className="text-gray-400 italic">None entered</span>}</p>
          </div>
          {tone === "applied" && (
            <p className="text-xs text-gray-400 italic">
              Currently applied to this record's classification. Click Edit on the source in Clinical and Locus,
              then use "Remove from Clinical and Locus" to pull it back out without deleting it.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface StudyGroupData {
  key: string
  dataSource?: string
  entries: CuratedEntry[]
}

function groupBySource(entries: CuratedEntry[]): StudyGroupData[] {
  const order: string[] = []
  const byKey = new Map<string, StudyGroupData>()
  entries.forEach((e) => {
    const key = e.dataSource || `__ungrouped-${e.id}`
    if (!byKey.has(key)) {
      byKey.set(key, { key, dataSource: e.dataSource, entries: [] })
      order.push(key)
    }
    byKey.get(key)!.entries.push(e)
  })
  return order.map((k) => byKey.get(k)!)
}

function StudyGroup({ group, renderCard }: { group: StudyGroupData; renderCard: (e: CuratedEntry, grouped: boolean) => React.ReactNode }) {
  const [open, setOpen] = useState(true)
  if (group.entries.length === 1) {
    return (
      <div>
        <div className="flex items-center gap-2 px-1 pb-1.5">
          <FileText className="h-3.5 w-3.5 flex-none text-gray-400" />
          <span className="text-xs font-medium text-gray-700 truncate">{group.dataSource || "Source not yet identified"}</span>
        </div>
        {renderCard(group.entries[0], true)}
      </div>
    )
  }
  return (
    <div className="border border-gray-200 rounded-md bg-gray-50/60 overflow-hidden">
      <button className="w-full flex items-center gap-2 px-3 py-2 text-left" onClick={() => setOpen(!open)}>
        <ChevronDown className={`h-3.5 w-3.5 flex-none text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        <FileText className="h-3.5 w-3.5 flex-none text-gray-400" />
        <span className="text-xs font-medium text-gray-700 truncate">{group.dataSource || "Source not yet identified"}</span>
        <Badge className="bg-gray-100 text-gray-600 border border-gray-200 flex-none">{group.entries.length} entries</Badge>
      </button>
      {open && <div className="px-2 pb-2 space-y-2">{group.entries.map((e) => renderCard(e, true))}</div>}
    </div>
  )
}

function EmptySection({ text }: { text: string }) {
  return <div className="border border-dashed border-gray-300 rounded-md p-4 text-center text-xs text-gray-400 italic">{text}</div>
}

interface CandidatePaper {
  pmid: string
  title?: string
  year?: string
  authors?: string
  journal?: string
  foundVia: string[]
  reviewStatus: string
}

const CANDIDATE_REVIEW_OPTIONS = [
  { value: "unreviewed", label: "Not reviewed" },
  { value: "relevant", label: "Relevant" },
  { value: "not-relevant", label: "Not relevant" },
  { value: "already-captured", label: "Already captured" },
  { value: "reference-publication", label: "Reference publication (hide VCI-wide)" },
]

export default function Literature() {
  const [literatureSearchCollapsed, setLiteratureSearchCollapsed] = useState(false)
  const [showHiddenReferencePublications, setShowHiddenReferencePublications] = useState(false)
  const [manualPmidInput, setManualPmidInput] = useState("")
  const [candidates, setCandidates] = useState<CandidatePaper[]>([])

  const appliedEntries: CuratedEntry[] = []
  const notYetAppliedEntries: CuratedEntry[] = []
  const appliedGroups = groupBySource(appliedEntries)
  const notYetAppliedGroups = groupBySource(notYetAppliedEntries)
  const visibleCandidates = candidates.filter((c) => c.reviewStatus !== "reference-publication")
  const hiddenReferencePublications = candidates.filter((c) => c.reviewStatus === "reference-publication")

  const setReviewStatus = (pmid: string, status: string) => {
    setCandidates((prev) => prev.map((c) => c.pmid === pmid ? { ...c, reviewStatus: status } : c))
  }

  return (
    <Card tone="reference">
      <CardHeader><CardTitle>Literature</CardTitle><CardDescription>Published literature and other curated evidence related to this variant</CardDescription></CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div>
            <h3 className="font-serif text-base font-bold text-gray-900 mb-2">Curated Clinical Evidence</h3>
            <div className="border border-gray-200 rounded-md bg-white p-3 space-y-4">
              <div className="bg-blue-50/40 border border-blue-100 rounded-md p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-1">
                  Applied to this record's classification <span className="font-normal text-gray-400">({appliedEntries.length})</span>
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  All evidence currently being scored in the Clinical and Locus tab.
                </p>
                {appliedEntries.length === 0 ? (
                  <EmptySection text="No sources applied yet -- add proband or case-control evidence in Clinical and Locus." />
                ) : (
                  <div className="space-y-2">
                    {appliedGroups.map((g) => (
                      <StudyGroup
                        key={g.key}
                        group={g}
                        renderCard={(e, grouped) => (
                          <PhenopacketCard key={e.id} tone="applied" hideByline={grouped} badgeLabel={e.badgeLabel} badgeTone={e.badgeTone} dataSource={e.dataSource} fields={e.fields} generalComment={e.generalComment} kind={e.kind} />
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-50/60 border border-gray-100 rounded-md p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-1">
                  Not yet applied <span className="font-normal text-gray-400">({notYetAppliedEntries.length})</span>
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  Available clinical and locus evidence curated for this variant -- available to score if you move to
                  clinical and locus.
                </p>
                {notYetAppliedEntries.length === 0 ? (
                  <EmptySection text="Nothing here right now." />
                ) : (
                  <div className="space-y-2">
                    {notYetAppliedGroups.map((g) => (
                      <StudyGroup
                        key={g.key}
                        group={g}
                        renderCard={(e, grouped) => (
                          <PhenopacketCard key={e.id} tone="available" hideByline={grouped} badgeLabel={e.badgeLabel} badgeTone={e.badgeTone} dataSource={e.dataSource} fields={e.fields} generalComment={e.generalComment} kind={e.kind} onMove={e.onMove} />
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setLiteratureSearchCollapsed((v) => !v)}
              className="w-full flex items-center justify-between mb-2 text-left"
            >
              <h3 className="font-serif text-base font-bold text-gray-900">Literature Search</h3>
              {literatureSearchCollapsed ? <ChevronRight className="h-4 w-4 text-gray-400 flex-none" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-none" />}
            </button>
            {!literatureSearchCollapsed && (
              <div className="border border-gray-200 rounded-md bg-white p-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <span className="flex items-center gap-1.5 text-gray-400 italic text-xs">
                    <Search className="h-3 w-3 flex-none" /> Google Scholar (variant query)
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400 italic text-xs">
                    <Search className="h-3 w-3 flex-none" /> LitVar2 (dbSNP rsID)
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 pt-1.5 mt-1.5 border-t border-gray-100">
                  Google Scholar searches combine several notations of this variant (coding change, protein
                  change, dbSNP ID) with OR, since papers describe the same variant inconsistently — adapted
                  from a published literature-search methodology written for PubMed, so not a guarantee of how
                  Google Scholar's own search handles it. LitVar2 searches by dbSNP rsID directly.
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-serif text-base font-bold text-gray-900">
                Candidate Papers {visibleCandidates.length > 0 && <span className="text-xs font-normal text-gray-400">({visibleCandidates.length})</span>}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 rounded-md p-2 mb-2">
              <Button size="sm" variant="outline" className="gap-1.5" disabled>
                <RefreshCw className="h-3 w-3" /> Europe PMC
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" disabled>
                <RefreshCw className="h-3 w-3" /> ClinVar Citations
              </Button>
              <span className="w-px h-5 bg-gray-300 mx-1 flex-none" />
              <input
                type="text"
                value={manualPmidInput}
                onChange={(e) => setManualPmidInput(e.target.value)}
                placeholder="Add PMID(s), comma-separated"
                className="text-xs border rounded-md p-1.5 w-56"
              />
              <Button size="sm" variant="outline" className="gap-1.5 flex-none" disabled={!manualPmidInput.trim()}>
                Add
              </Button>
            </div>
            {visibleCandidates.length > 0 ? (
              <div className="border border-gray-200 rounded-md bg-white divide-y divide-gray-100">
                {visibleCandidates.map((c) => (
                  <div key={c.pmid} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a href={`https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium text-xs flex items-center gap-1.5">
                          {c.title || `PMID ${c.pmid}`} <ExtIcon />
                        </a>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {c.year && <span className="font-bold text-gray-700">{c.year}</span>}
                          {[c.authors, c.journal].filter(Boolean).length > 0 && (c.year ? " — " : "")}
                          {[c.authors, c.journal].filter(Boolean).join(" — ")}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {c.foundVia.map((searchId) => (
                            <Badge key={searchId} className="bg-gray-100 text-gray-600">{searchId}</Badge>
                          ))}
                          {c.reviewStatus === "already-captured" && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-green-700"><Check className="h-3 w-3" /> Matches a PMID already curated for this variant</span>
                          )}
                        </div>
                      </div>
                      <select
                        className="text-xs border rounded-md p-1.5 bg-white flex-none"
                        value={c.reviewStatus}
                        onChange={(e) => setReviewStatus(c.pmid, e.target.value)}
                      >
                        {CANDIDATE_REVIEW_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic border border-dashed border-gray-200 rounded-md p-3 text-center">
                Run a search above or add a PMID to get started.
              </p>
            )}
          </div>

          {hiddenReferencePublications.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowHiddenReferencePublications((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showHiddenReferencePublications ? "" : "-rotate-90"}`} />
                Reference publications hidden VCI-wide ({hiddenReferencePublications.length})
              </button>
              {showHiddenReferencePublications && (
                <div className="mt-2 border border-gray-200 rounded-md bg-gray-50 divide-y divide-gray-200">
                  {hiddenReferencePublications.map((c) => (
                    <div key={c.pmid} className="p-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 text-xs text-gray-500">
                        <a href={`https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/`} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                          {c.title || `PMID ${c.pmid}`}
                        </a>
                        <span className="text-gray-400"> {"—"} hidden for every curator on every variant</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReviewStatus(c.pmid, "unreviewed")}
                        className="text-xs text-blue-600 underline hover:no-underline flex-none"
                      >
                        Un-hide
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
