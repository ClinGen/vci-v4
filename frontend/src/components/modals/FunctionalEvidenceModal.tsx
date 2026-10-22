import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "../ui/Button"
import { Modal, FieldRow, ModalSection } from "../ui/Modal"
import SourceDetailFields from "../SourceDetailFields"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EvidenceKind = "literature" | "mave" | "model-organism"
export type EvidencePathway = "aa" | "splice"

export interface FunctionalEvidenceEntry {
  id: string
  kind: EvidenceKind
  pathway: EvidencePathway
  source: string
  sourcePmidVerifyStatus: string
  assayId: string
  functionalReadout: string
  mechanismConsistent: boolean | ""
  numBenignControls: string
  numPathogenicControls: string
  resultRange: string
  modelOrganism: string
  manualPoints: string
  includeInScore: boolean
  comment: string
}

function emptyEntry(): FunctionalEvidenceEntry {
  return {
    id: `fxn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: "literature",
    pathway: "aa",
    source: "",
    sourcePmidVerifyStatus: "",
    assayId: "",
    functionalReadout: "",
    mechanismConsistent: "",
    numBenignControls: "",
    numPathogenicControls: "",
    resultRange: "",
    modelOrganism: "",
    manualPoints: "",
    includeInScore: true,
    comment: "",
  }
}

// ---------------------------------------------------------------------------
// Scoring stub helpers
//
// These reference tables and the points function are stubs until the full
// scoring engine is migrated. The real implementation uses OddsPath lookup
// tables from Supplement 20 and mechanism-override logic.
// ---------------------------------------------------------------------------

/** OddsPath pathogenic-direction table (benign control count x pathogenic control count). */
const ODDS_PATH_PATHOGENIC_TABLE: number[][] = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0.5, 1.0, 1.5, 2.0],
  [0, 0, 0.5, 1.0, 1.5, 2.0],
  [0, 0, 0.5, 1.5, 2.0, 2.5],
]

/** OddsPath benign-direction table. */
const ODDS_PATH_BENIGN_TABLE: number[][] = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, -0.5, -1.0, -1.5, -2.0],
  [0, 0, -0.5, -1.0, -1.5, -2.0],
  [0, 0, -0.5, -1.5, -2.0, -2.5],
]

/** Animal model scoring reference (Table 3). */
interface AnimalModelRow {
  phenotypicConsistency: string
  inheritancePattern: string
  proteinSimilarity: string
  points: number
}

const TABLE_3_ANIMAL_MODEL: AnimalModelRow[] = [
  { phenotypicConsistency: "Specific for MDE", inheritancePattern: "Same as MDE", proteinSimilarity: "Orthologous protein", points: 2.0 },
  { phenotypicConsistency: "Consistent with MDE", inheritancePattern: "Same as MDE", proteinSimilarity: "Orthologous protein", points: 1.0 },
  { phenotypicConsistency: "Consistent with MDE", inheritancePattern: "Different from MDE", proteinSimilarity: "Orthologous protein", points: 0.5 },
  { phenotypicConsistency: "Consistent with MDE", inheritancePattern: "Any", proteinSimilarity: "Non-orthologous protein", points: 0.5 },
  { phenotypicConsistency: "Not consistent", inheritancePattern: "Any", proteinSimilarity: "Any", points: 0.0 },
]

function functionalEvidencePoints(entry: FunctionalEvidenceEntry): number | null {
  if (entry.kind === "model-organism") {
    return entry.manualPoints !== "" ? parseFloat(entry.manualPoints) : null
  }
  if (entry.mechanismConsistent === false) return 0
  const benign = parseInt(entry.numBenignControls, 10)
  const path = parseInt(entry.numPathogenicControls, 10)
  if (isNaN(benign) || isNaN(path)) return null
  if (!entry.resultRange) return null
  const bIdx = Math.min(benign, 5)
  const pIdx = Math.min(path, 5)
  const table = entry.resultRange === "pathogenic" ? ODDS_PATH_PATHOGENIC_TABLE : ODDS_PATH_BENIGN_TABLE
  return table[bIdx]?.[pIdx] ?? null
}

// ---------------------------------------------------------------------------
// Reference sub-components
// ---------------------------------------------------------------------------

function OddsPathReferenceTables() {
  return (
    <div className="mt-2 space-y-3 text-xs">
      {[
        { title: "Table 1 -- Pathogenicity (VBC result in pathogenic control range)", table: ODDS_PATH_PATHOGENIC_TABLE },
        { title: "Table 2 -- Benignity (VBC result in benign control range)", table: ODDS_PATH_BENIGN_TABLE },
      ].map(({ title, table }) => (
        <div key={title} className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-gray-50 px-2 py-1.5 font-medium text-gray-700">{title}</div>
          <div className="overflow-x-auto">
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-1.5 py-1 text-[10px]">benign \ path.</th>
                  {table[0].map((_, p) => (
                    <th key={p} className="border border-gray-200 bg-gray-50 px-1.5 py-1 font-mono">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.map((row, b) => (
                  <tr key={b}>
                    <th className="border border-gray-200 bg-gray-50 px-1.5 py-1 font-mono">{b}</th>
                    {row.map((v, p) => (
                      <td key={p} className="border border-gray-200 px-1.5 py-1 text-center font-mono text-gray-700">
                        {v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

function AnimalModelReferenceTable() {
  return (
    <div className="mt-2 border border-gray-200 rounded-md overflow-hidden text-xs">
      <table className="border-collapse w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-2 py-1.5 text-left">Phenotypic consistency</th>
            <th className="border border-gray-200 px-2 py-1.5 text-left">Inheritance pattern</th>
            <th className="border border-gray-200 px-2 py-1.5 text-left">Protein-level similarity</th>
            <th className="border border-gray-200 px-2 py-1.5 text-left">Points</th>
          </tr>
        </thead>
        <tbody>
          {TABLE_3_ANIMAL_MODEL.map((row, i) => (
            <tr key={i}>
              <td className="border border-gray-200 px-2 py-1.5 text-gray-700">{row.phenotypicConsistency}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-gray-700">{row.inheritancePattern}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-gray-700">{row.proteinSimilarity}</td>
              <td className="border border-gray-200 px-2 py-1.5 font-mono text-gray-700">
                {row.points > 0 ? `+${row.points.toFixed(1)}` : row.points.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FunctionalEvidenceModal
// ---------------------------------------------------------------------------

interface FunctionalEvidenceModalProps {
  /** Whether the current variant is missense (enables pathway selector). */
  isMissense?: boolean
  /** Callback to close the modal. */
  onClose: () => void
  /** Callback when saving. Receives the complete functional evidence entry. */
  onSave: (entry: FunctionalEvidenceEntry) => void
}

export function FunctionalEvidenceModal({ isMissense = false, onClose, onSave }: FunctionalEvidenceModalProps) {
  const [draft, setDraft] = useState<FunctionalEvidenceEntry>(emptyEntry())
  const [showReference, setShowReference] = useState(false)
  const update = <K extends keyof FunctionalEvidenceEntry>(field: K, value: FunctionalEvidenceEntry[K]) =>
    setDraft({ ...draft, [field]: value })

  const points = functionalEvidencePoints(draft)

  const saveBlockedReason = !draft.source
    ? "Enter the MAVEdb record ID or URL above before saving."
    : draft.kind === "model-organism"
    ? !draft.modelOrganism.trim()
      ? "Enter a Model organism above before saving."
      : draft.manualPoints === ""
      ? "Enter Points above before saving."
      : ""
    : draft.mechanismConsistent === ""
    ? "Answer whether this assay is consistent with the mechanism of disease above before saving."
    : draft.mechanismConsistent === false
    ? ""
    : draft.numBenignControls === ""
    ? "Enter # Benign control variants above before saving."
    : draft.numPathogenicControls === ""
    ? "Enter # Pathogenic control variants above before saving."
    : !draft.resultRange
    ? "Select where the VBC result falls above before saving."
    : ""

  return (
    <Modal
      title="Add Functional Evidence"
      onClose={onClose}
      headerRight={
        <Button
          size="sm"
          className={`gap-1 disabled:!opacity-100 ${
            saveBlockedReason ? "!bg-blue-800 !text-blue-200" : "!bg-white !text-blue-700 hover:!bg-blue-50"
          }`}
          disabled={!!saveBlockedReason}
          title={saveBlockedReason || undefined}
          onClick={() => onSave(draft)}
        >
          Save
        </Button>
      }
    >
      {/* ---- Evidence Type ---- */}
      <ModalSection id="section-type" title="Evidence Type">
        <FieldRow label="Type" required>
          <select
            className="w-full border rounded-md p-2 bg-white text-xs"
            value={draft.kind}
            onChange={(e) => setDraft({ ...emptyEntry(), pathway: draft.pathway, kind: e.target.value as EvidenceKind })}
          >
            <option value="literature">Literature (PMID or other identifier)</option>
            <option value="mave">MAVE</option>
            <option value="model-organism">Model Organism</option>
          </select>
        </FieldRow>
        {isMissense && (
          <FieldRow label="Score toward" required>
            <select
              className="w-full border rounded-md p-2 bg-white text-xs"
              value={draft.pathway}
              onChange={(e) => update("pathway", e.target.value as EvidencePathway)}
            >
              <option value="aa">Missense Effect (MIS_FXN)</option>
              <option value="splice">Splice Effect (SPL_FXN)</option>
            </select>
          </FieldRow>
        )}
        <FieldRow label="Functional readout">
          <input
            className="w-full border rounded-md p-2 text-xs"
            placeholder="e.g. enzyme activity, protein stability, cell viability"
            value={draft.functionalReadout}
            onChange={(e) => update("functionalReadout", e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">
            What this assay measures. Used to detect when two entries test the same thing (see the note near Comment, below)
            -- leave blank if unsure; entries are never auto-grouped without it.
          </div>
        </FieldRow>
        {draft.kind !== "model-organism" && (
          <FieldRow label="Consistent with mechanism of disease?" required empty={draft.mechanismConsistent === ""}>
            <div className="flex flex-col gap-2">
              <label className="flex items-start gap-2 text-xs">
                <input
                  type="radio"
                  className="mt-1"
                  checked={draft.mechanismConsistent === true}
                  onChange={() => update("mechanismConsistent", true)}
                />
                Yes -- the assay is a faithful recapitulation of the disease pathophysiology for this MDE
              </label>
              <label className="flex items-start gap-2 text-xs">
                <input
                  type="radio"
                  className="mt-1"
                  checked={draft.mechanismConsistent === false}
                  onChange={() => update("mechanismConsistent", false)}
                />
                No -- scored 0.0 regardless of controls/result below, per Supplement 20
              </label>
            </div>
          </FieldRow>
        )}
      </ModalSection>

      {/* ---- MAVE Evidence ---- */}
      {draft.kind === "mave" && (
        <ModalSection id="section-mave" title="MAVE Evidence">
          <FieldRow label="MaveDB">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open("https://www.mavedb.org/", "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-3.5 w-3.5" /> Search MaveDB
            </Button>
          </FieldRow>
          <FieldRow label="MAVEdb record ID or URL" required empty={!draft.source}>
            <input
              className="w-full border rounded-md p-2 text-xs"
              placeholder="e.g. urn:mavedb:00000001-a-1, or a MaveDB URL"
              value={draft.source}
              onChange={(e) => update("source", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Assay ID (if it exists)">
            <input
              className="w-full border rounded-md p-2 text-xs"
              value={draft.assayId}
              onChange={(e) => update("assayId", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="# Pathogenic control variants"
            required={draft.mechanismConsistent !== false}
            empty={draft.numPathogenicControls === "" && draft.mechanismConsistent !== false}
          >
            <input
              type="number"
              min="0"
              max="10"
              className="w-32 border rounded-md p-2 text-xs font-mono"
              value={draft.numPathogenicControls}
              onChange={(e) => update("numPathogenicControls", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="# Benign control variants"
            required={draft.mechanismConsistent !== false}
            empty={draft.numBenignControls === "" && draft.mechanismConsistent !== false}
          >
            <input
              type="number"
              min="0"
              max="10"
              className="w-32 border rounded-md p-2 text-xs font-mono"
              value={draft.numBenignControls}
              onChange={(e) => update("numBenignControls", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="VBC result falls in..."
            required={draft.mechanismConsistent !== false}
            empty={!draft.resultRange && draft.mechanismConsistent !== false}
          >
            <select
              className="w-full border rounded-md p-2 bg-white text-xs"
              value={draft.resultRange}
              onChange={(e) => update("resultRange", e.target.value)}
            >
              <option value="">Select...</option>
              <option value="pathogenic">Pathogenic control range</option>
              <option value="benign">Benign control range</option>
            </select>
          </FieldRow>
        </ModalSection>
      )}

      {/* ---- Literature Evidence ---- */}
      {draft.kind === "literature" && (
        <ModalSection id="section-literature" title="Literature Evidence">
          <SourceDetailFields
            source="PMID"
            pmid={draft.source}
            setPmid={(v) => update("source", v)}
            labName=""
            setLabName={() => {}}
            databaseName=""
            setDatabaseName={() => {}}
            otherDescription=""
            setOtherDescription={() => {}}
          />
          <FieldRow label="Assay ID (if it exists)">
            <input
              className="w-full border rounded-md p-2 text-xs"
              value={draft.assayId}
              onChange={(e) => update("assayId", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="# Pathogenic control variants"
            required={draft.mechanismConsistent !== false}
            empty={draft.numPathogenicControls === "" && draft.mechanismConsistent !== false}
          >
            <input
              type="number"
              min="0"
              max="10"
              className="w-32 border rounded-md p-2 text-xs font-mono"
              value={draft.numPathogenicControls}
              onChange={(e) => update("numPathogenicControls", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="# Benign control variants"
            required={draft.mechanismConsistent !== false}
            empty={draft.numBenignControls === "" && draft.mechanismConsistent !== false}
          >
            <input
              type="number"
              min="0"
              max="10"
              className="w-32 border rounded-md p-2 text-xs font-mono"
              value={draft.numBenignControls}
              onChange={(e) => update("numBenignControls", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="VBC result falls in..."
            required={draft.mechanismConsistent !== false}
            empty={!draft.resultRange && draft.mechanismConsistent !== false}
          >
            <select
              className="w-full border rounded-md p-2 bg-white text-xs"
              value={draft.resultRange}
              onChange={(e) => update("resultRange", e.target.value)}
            >
              <option value="">Select...</option>
              <option value="pathogenic">Pathogenic control range</option>
              <option value="benign">Benign control range</option>
            </select>
          </FieldRow>
        </ModalSection>
      )}

      {/* ---- Computed Points (MAVE / Literature) ---- */}
      {(draft.kind === "mave" || draft.kind === "literature") && (
        <div className="mb-6 px-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs">
              {draft.mechanismConsistent === false ? (
                <>
                  Computed points: <span className="font-mono font-semibold">0.0</span>{" "}
                  <span className="text-gray-500">(not consistent with mechanism of disease, per Supplement 20)</span>
                </>
              ) : (
                <>
                  Computed points (OddsPath tables):{" "}
                  {points !== null ? (
                    <span className="font-mono font-semibold">
                      {points > 0 ? "+" : ""}
                      {points.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">enter control counts + result range</span>
                  )}
                </>
              )}
            </div>
            <button className="text-xs text-blue-700 font-medium" onClick={() => setShowReference(!showReference)}>
              {showReference ? "Hide" : "View"} OddsPath reference tables
            </button>
          </div>
          {showReference && <OddsPathReferenceTables />}
        </div>
      )}

      {/* ---- Model Organism Evidence ---- */}
      {draft.kind === "model-organism" && (
        <ModalSection id="section-model-organism" title="Model Organism Evidence">
          <SourceDetailFields
            source="PMID"
            pmid={draft.source}
            setPmid={(v) => update("source", v)}
            labName=""
            setLabName={() => {}}
            databaseName=""
            setDatabaseName={() => {}}
            otherDescription=""
            setOtherDescription={() => {}}
          />
          <FieldRow label="Model organism" required empty={!draft.modelOrganism.trim()}>
            <input
              className="w-full border rounded-md p-2 text-xs"
              placeholder="e.g. Mouse (Mus musculus), CRISPR knock-in"
              value={draft.modelOrganism}
              onChange={(e) => update("modelOrganism", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Points" required empty={draft.manualPoints === ""}>
            <input
              type="number"
              step="0.5"
              className="w-32 border rounded-md p-2 text-xs font-mono"
              value={draft.manualPoints}
              onChange={(e) => update("manualPoints", e.target.value)}
            />
          </FieldRow>
          <div className="px-3 py-2">
            <button className="text-xs text-blue-700 font-medium" onClick={() => setShowReference(!showReference)}>
              {showReference ? "Hide" : "View"} animal model scoring guide (Table 3)
            </button>
            {showReference && <AnimalModelReferenceTable />}
          </div>
        </ModalSection>
      )}

      {/* ---- Include / Comment ---- */}
      <div className="px-1">
        <label className="flex items-start gap-2 text-xs mb-3">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={draft.includeInScore}
            onChange={(e) => update("includeInScore", e.target.checked)}
          />
          <span>
            Include this entry in the computed FXN score.
            <span className="block text-gray-500 mt-0.5">
              Per Supplement 20: when multiple assays test distinct, separable functions (e.g. an animal model plus a
              separate enzyme assay), only the one most relevant to the disease mechanism should be scored -- uncheck any
              entry you're not counting toward the total. Entries that share the same Functional readout above are handled
              automatically instead (strongest one counts if they agree, both count if they conflict).
            </span>
          </span>
        </label>
        <label className="text-xs text-gray-700 block mb-1.5">Comment</label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 text-xs"
          rows={2}
          placeholder="Optional notes on this evidence..."
          value={draft.comment}
          onChange={(e) => update("comment", e.target.value)}
        />
      </div>
    </Modal>
  )
}
