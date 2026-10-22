import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "./ui/Badge"
import { Table, THead, TBody, TR, TH, TD } from "./ui/Table"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TranscriptRow {
  /** Nucleotide change label (e.g. "NM_000546.6:c.422G>A"). */
  change: string
  /** Exon number in "N/M" format, or empty if intronic. */
  exon: string
  /** Intron number in "N/M" format, or empty if exonic. */
  intron?: string
  /** Protein change (e.g. "p.Arg141His"). */
  protein: string
  /** Molecular consequence (e.g. "missense_variant"). */
  consequence: string
  /** Whether this is the MANE Select transcript. */
  mane?: boolean
  /** Whether this is a MANE Plus Clinical transcript. */
  manePlusClinical?: boolean
}

interface Locus {
  kind: "exon" | "intron"
  value: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rowLocus(r: TranscriptRow): Locus | null {
  if (r.exon) return { kind: "exon", value: r.exon }
  if (r.intron) return { kind: "intron", value: r.intron }
  return null
}

function formatLocus(locus: Locus | null): string {
  if (!locus) return "—"
  return `${locus.kind === "exon" ? "Exon" : "Intron"} ${locus.value}`
}

function sameLocus(a: Locus | null, b: Locus | null): boolean {
  return !!a && !!b && a.kind === b.kind && a.value === b.value
}

// ---------------------------------------------------------------------------
// LocusMatchSummary
// ---------------------------------------------------------------------------

function LocusMatchSummary({ rows, maneRow }: { rows: TranscriptRow[]; maneRow: TranscriptRow }) {
  const maneLocus = rowLocus(maneRow)
  if (!maneLocus) return null
  const withLocus = rows.filter((r) => r !== maneRow && rowLocus(r))
  if (withLocus.length === 0) return null
  const matching = withLocus.filter((r) => sameLocus(rowLocus(r), maneLocus))
  return (
    <p className="text-[11px] text-gray-500 px-3 py-1.5 border-t border-gray-200 bg-gray-50">
      Reference: {matching.length} of {withLocus.length} other listed transcripts share MANE Select's{" "}
      {formatLocus(maneLocus).toLowerCase()} -- use your own judgment on which of these are clinically relevant.
    </p>
  )
}

// ---------------------------------------------------------------------------
// TranscriptTable sub-component
// ---------------------------------------------------------------------------

interface TranscriptTableProps {
  title: string
  rows: TranscriptRow[]
  hasFetched: boolean
}

function TranscriptTable({ title, rows, hasFetched }: TranscriptTableProps) {
  const [showAll, setShowAll] = useState(false)
  const maneRow = rows.find((r) => r.mane)
  const manePlusClinicalRow = rows.find((r) => r.manePlusClinical)
  const rest = rows.filter((r) => r !== maneRow && r !== manePlusClinicalRow)

  const sameAsMane = maneRow
    ? rest.filter((r) => sameLocus(rowLocus(r), rowLocus(maneRow)) && r.consequence === maneRow.consequence)
    : []
  const different = maneRow ? rest.filter((r) => !sameAsMane.includes(r)) : rest

  const collapsedRows = [...(maneRow ? [maneRow] : []), ...(manePlusClinicalRow ? [manePlusClinicalRow] : [])]
  const orderedRows = showAll ? [...collapsedRows, ...different, ...sameAsMane] : collapsedRows

  return (
    <div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <div className="border rounded-md overflow-hidden mt-1">
        <Table>
          <THead className="bg-gray-50">
            <TR>
              <TH>Nucleotide Change</TH>
              <TH>Exon / Intron</TH>
              <TH>Protein Change</TH>
              <TH>Molecular Consequence</TH>
            </TR>
          </THead>
          <TBody>
            {orderedRows.length > 0 ? (
              orderedRows.map((r) => (
                <TR key={r.change} className={`border-t ${sameAsMane.includes(r) ? "bg-gray-100" : ""}`}>
                  <TD>
                    <span className="font-mono text-xs">{r.change}</span>
                    {r.mane && <Badge className="bg-yellow-100 text-yellow-800 ml-2">MANE Select</Badge>}
                    {r.manePlusClinical && <Badge className="bg-blue-100 text-blue-800 ml-2">MANE Plus Clinical</Badge>}
                  </TD>
                  <TD className={r.exon ? "text-gray-700" : "text-gray-500 italic"}>{formatLocus(rowLocus(r))}</TD>
                  <TD className="text-gray-700">{r.protein}</TD>
                  <TD className="text-gray-700">{r.consequence}</TD>
                </TR>
              ))
            ) : (
              <TR>
                <TD colSpan={4} className="text-gray-400 italic text-center py-3">
                  {hasFetched
                    ? "No MANE Select/Plus Clinical transcript on file -- expand to see all transcripts."
                    : "Not fetched yet -- see External Data Sources on this tab."}
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
        {maneRow && <LocusMatchSummary rows={rows} maneRow={maneRow} />}
        {(different.length > 0 || sameAsMane.length > 0) && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-blue-700 border-t border-gray-200 hover:bg-blue-50 transition-colors"
          >
            {showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showAll
              ? "Show only MANE Select/Plus Clinical"
              : `Show all transcripts (${different.length + sameAsMane.length} more)`}
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TranscriptTables (main export)
// ---------------------------------------------------------------------------

interface TranscriptTablesProps {
  /** Ensembl transcript rows from a VEP fetch. Null if not fetched yet. */
  ensemblRows?: TranscriptRow[] | null
  /** RefSeq transcript rows from a VEP fetch. Null if not fetched yet. */
  refSeqRows?: TranscriptRow[] | null
}

export function TranscriptTables({ ensemblRows = null, refSeqRows = null }: TranscriptTablesProps) {
  return (
    <div className="space-y-4">
      <TranscriptTable title="RefSeq Transcripts" rows={refSeqRows || []} hasFetched={!!refSeqRows} />
      <TranscriptTable title="Ensembl Transcripts" rows={ensemblRows || []} hasFetched={!!ensemblRows} />
    </div>
  )
}
