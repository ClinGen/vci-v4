import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink, Search } from "lucide-react"
import { Badge } from "./ui/Badge"
import { Table, THead, TBody, TR, TH, TD } from "./ui/Table"
import { CLINGEN_PREDICTORS, OTHER_PREDICTORS } from "../lib/referenceData"
import { misPredictorScore } from "../lib/scoring"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PredictorRef {
  tool: string
  version?: string
  scoreRange: string
}

interface LivePredictorData {
  score: number | string | null
  transcriptId?: string
  version?: string
}

interface ManeTranscript {
  id: string
  label: string
}

interface PredictorRow extends PredictorRef {
  score: number | string | null
  transcript: string | null
  isManeSelect: boolean
  svcPoints: string | null
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MISSENSE_TOOL_NAMES = [
  "REVEL", "AlphaMissense", "BayesDel", "ESM1b", "MutPred2",
  "VARITY_R", "VEST4", "CADD", "MPC", "PrimateAI-3D", "SIFT",
]
const INDEL_TOOL_NAMES = ["Mutation Taster", "PROVEAN"]

const SVC_METHOD_TOOLS = new Set<string>(CLINGEN_PREDICTORS.map((p) => p.tool))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findTool(name: string): PredictorRef | undefined {
  return (
    (CLINGEN_PREDICTORS as readonly PredictorRef[]).find((p) => p.tool === name) ||
    (OTHER_PREDICTORS as readonly PredictorRef[]).find((p) => p.tool === name)
  )
}

function formatSvcPoints(pts: number | null | undefined): string | null {
  if (pts === null || pts === undefined) return null
  if (pts === 0) return "0.0"
  return pts > 0 ? `+${pts.toFixed(1)}` : `−${Math.abs(pts).toFixed(1)}`
}

function withLiveData(
  predictor: PredictorRef,
  live: LivePredictorData | undefined,
  maneTranscript: ManeTranscript | null | undefined,
  allowManeFallback = true,
): PredictorRow {
  const maneBase = maneTranscript?.id?.split(".")[0]
  if (!live) {
    return { ...predictor, score: null, transcript: null, isManeSelect: false, svcPoints: null }
  }
  const liveBase = live.transcriptId?.split(".")[0]
  const isManeSelect = !!liveBase && !!maneBase && liveBase === maneBase
  const fallback = allowManeFallback && maneTranscript
  const transcript = live.transcriptId || (fallback ? maneTranscript!.label : null)
  const svcPoints = formatSvcPoints(live.score === null ? null : misPredictorScore(predictor.tool, String(live.score)))
  return {
    ...predictor,
    score: live.score,
    transcript,
    isManeSelect: isManeSelect || (!live.transcriptId && !!fallback),
    version: live.version || predictor.version,
    svcPoints,
  }
}

function buildPredictorLists(
  livePredictors: Record<string, LivePredictorData> | null | undefined,
  maneTranscript: ManeTranscript | null | undefined,
) {
  const missense = MISSENSE_TOOL_NAMES.map(findTool)
    .filter((p): p is PredictorRef => !!p)
    .map((p) => withLiveData(p, livePredictors?.[p.tool], maneTranscript, p.tool !== "REVEL"))
  const indel = INDEL_TOOL_NAMES.map(findTool)
    .filter((p): p is PredictorRef => !!p)
    .map((p) => withLiveData(p, livePredictors?.[p.tool], maneTranscript))
  return { missense, indel }
}

function renderValue(value: string | number | null | undefined) {
  return value ? value : <span className="text-gray-400">{"–"}</span>
}

function svcPointsToneClass(value: string | null): string {
  if (!value) return "bg-gray-50 text-gray-400"
  const trimmed = String(value).trim()
  if (trimmed.startsWith("+")) return "bg-red-50 text-red-700"
  if (trimmed.startsWith("−") || trimmed.startsWith("-")) return "bg-green-50 text-green-700"
  return "bg-gray-50 text-gray-500"
}

// ---------------------------------------------------------------------------
// PredictorTable sub-component
// ---------------------------------------------------------------------------

interface PredictorTableProps {
  title: string
  subtitle?: string
  rows: PredictorRow[]
  hiddenRows?: PredictorRow[]
  showSvcPoints: boolean
}

function PredictorTable({ title, subtitle, rows, hiddenRows, showSvcPoints }: PredictorTableProps) {
  const [showHidden, setShowHidden] = useState(false)
  const allRows = showHidden ? [...rows, ...(hiddenRows || [])] : rows

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <span className="font-serif font-bold text-gray-900">
          {title} <span className="font-sans font-normal text-gray-600">({allRows.length})</span>
        </span>
        {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <THead className="bg-gray-50">
            <TR>
              <TH className="text-center">Tool</TH>
              <TH className="text-center">Score</TH>
              <TH className="text-center">Transcript</TH>
              <TH className="text-center">Score Range</TH>
              {showSvcPoints && <TH className="text-center">SVCv4 Points</TH>}
            </TR>
          </THead>
          <TBody>
            {allRows.map((row, rIdx) => (
              <TR key={rIdx} className="hover:bg-gray-50">
                <TD className="text-center align-top">
                  <span className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800 cursor-pointer">
                    {row.tool} <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                  {row.version && <div className="text-[10px] font-mono text-gray-400 mt-0.5">v{row.version}</div>}
                </TD>
                <TD className="text-center font-mono">{renderValue(row.score)}</TD>
                <TD className="text-center">
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="font-mono text-xs text-gray-600">{renderValue(row.transcript)}</span>
                    {row.isManeSelect && row.transcript && (
                      <Badge className="bg-yellow-100 text-yellow-800">MANE Select</Badge>
                    )}
                  </span>
                </TD>
                <TD className="text-center text-gray-600 text-xs align-top">{renderValue(row.scoreRange)}</TD>
                {showSvcPoints && (
                  <TD className="text-center align-top">
                    {row.svcPoints ? (
                      <Badge className={svcPointsToneClass(row.svcPoints)}>{row.svcPoints}</Badge>
                    ) : (
                      <span className="text-gray-400">{"–"}</span>
                    )}
                  </TD>
                )}
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {hiddenRows && hiddenRows.length > 0 && (
        <button
          onClick={() => setShowHidden(!showHidden)}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-blue-700 border-t border-gray-200 hover:bg-blue-50 transition-colors"
        >
          {showHidden ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showHidden ? "Hide" : "Show"} {hiddenRows.length} predictor{hiddenRows.length === 1 ? "" : "s"} without an
          SVCv4.0 point recommendation
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PredictorTables (main export)
// ---------------------------------------------------------------------------

interface PredictorTablesProps {
  /** Live predictor scores keyed by tool name, from an LDH fetch. */
  livePredictors?: Record<string, LivePredictorData> | null
  /** The record's MANE Select transcript (id + label). */
  maneTranscript?: ManeTranscript | null
}

export function PredictorTables({ livePredictors = null, maneTranscript = null }: PredictorTablesProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const matches = (row: PredictorRow) => {
    const q = searchQuery.toLowerCase()
    if (!q) return true
    if (row.tool.toLowerCase().includes(q)) return true
    if (row.transcript?.toLowerCase().includes(q)) return true
    return false
  }

  const { missense: MISSENSE_PREDICTORS, indel: INDEL_PREDICTORS } = buildPredictorLists(livePredictors, maneTranscript)
  const missenseVisible = MISSENSE_PREDICTORS.filter((r) => SVC_METHOD_TOOLS.has(r.tool)).filter(matches)
  const missenseHidden = MISSENSE_PREDICTORS.filter((r) => !SVC_METHOD_TOOLS.has(r.tool)).filter(matches)
  const indelRows = INDEL_PREDICTORS.filter(matches)

  return (
    <div className="space-y-3">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search predictors or transcripts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-xs w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      </div>

      <PredictorTable title="Predictors for Missense Assessment" rows={missenseVisible} hiddenRows={missenseHidden} showSvcPoints={true} />
      <PredictorTable title="Predictors for InDel Assessment" rows={indelRows} showSvcPoints={false} />
    </div>
  )
}
