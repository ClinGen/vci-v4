import { useState } from "react"
import { Button } from "../ui/Button"
import { Modal, FieldRow, ModalSection } from "../ui/Modal"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const CLASSIFICATION_OPTIONS = [
  "Pathogenic",
  "Likely Pathogenic",
  "Variant of Uncertain Significance",
  "Likely Benign",
  "Benign",
  "Unknown",
] as const

export type InformativeVariantClassification = (typeof CLASSIFICATION_OPTIONS)[number] | ""

export interface InformativeVariantEntry {
  id: string
  variantId: string
  classification: InformativeVariantClassification
  pathway: "aa" | "splice" | ""
  aaCategory: "same-codon" | "distinct-aa" | "motif" | ""
}

function emptyEntry(): InformativeVariantEntry {
  return {
    id: `inf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    variantId: "",
    classification: "",
    pathway: "aa",
    aaCategory: "same-codon",
  }
}

// ---------------------------------------------------------------------------
// InformativeVariantModal
// ---------------------------------------------------------------------------

interface InformativeVariantModalProps {
  /** Whether the current variant is missense (enables pathway/category selectors). */
  isMissense?: boolean
  /** Callback to close the modal. */
  onClose: () => void
  /** Callback when saving. Receives the complete entry. */
  onSave: (entry: InformativeVariantEntry) => void
}

export function InformativeVariantModal({ isMissense = false, onClose, onSave }: InformativeVariantModalProps) {
  const [draft, setDraft] = useState<InformativeVariantEntry>(emptyEntry())
  const update = <K extends keyof InformativeVariantEntry>(field: K, value: InformativeVariantEntry[K]) =>
    setDraft({ ...draft, [field]: value })

  const isMotif = isMissense && draft.pathway === "aa" && draft.aaCategory === "motif"

  const saveBlockedReason = !draft.variantId
    ? "Enter a Variant ID above before saving."
    : !isMotif && !draft.classification
    ? "Select a Classification above before saving."
    : ""

  const handleSave = () => {
    onSave({
      ...draft,
      classification: isMotif ? "" : draft.classification,
      pathway: isMissense ? draft.pathway : "",
      aaCategory: isMissense && draft.pathway === "aa" ? draft.aaCategory : "",
    })
  }

  return (
    <Modal
      title="Add Informative Variant"
      onClose={onClose}
      headerRight={
        <Button
          size="sm"
          className={`gap-1 disabled:!opacity-100 ${
            saveBlockedReason ? "!bg-blue-800 !text-blue-200" : "!bg-white !text-blue-700 hover:!bg-blue-50"
          }`}
          disabled={!!saveBlockedReason}
          title={saveBlockedReason || undefined}
          onClick={handleSave}
        >
          Save
        </Button>
      }
    >
      <ModalSection id="section-variant" title="Variant">
        <FieldRow label="Variant ID" required empty={!draft.variantId}>
          <input
            className="w-full border rounded-md p-2 text-xs"
            placeholder="Use ClinVar ID or ClinGen Allele Registry ID"
            value={draft.variantId}
            onChange={(e) => update("variantId", e.target.value)}
          />
        </FieldRow>
        {isMissense && (
          <FieldRow label="Score toward" required>
            <select
              className="w-full border rounded-md p-2 bg-white text-xs"
              value={draft.pathway}
              onChange={(e) => update("pathway", e.target.value as "aa" | "splice")}
            >
              <option value="aa">Missense Effect (MIS_INF_)</option>
              <option value="splice">Splice Effect (SPL_INF_)</option>
            </select>
          </FieldRow>
        )}
        {isMissense && draft.pathway === "aa" && (
          <FieldRow label="Category" required>
            <select
              className="w-full border rounded-md p-2 bg-white text-xs"
              value={draft.aaCategory}
              onChange={(e) => update("aaCategory", e.target.value as "same-codon" | "distinct-aa" | "motif")}
            >
              <option value="same-codon">Same codon, same amino acid change</option>
              <option value="distinct-aa">Distinct amino acid change (Grantham-relationship implied by classification)</option>
              <option value="motif">Robustly-defined motif (e.g. collagen Gly-X-Y), no other P/LP at codon (+2.0, one-time)</option>
            </select>
          </FieldRow>
        )}
        {isMotif ? (
          <div className="px-3 py-2 text-[11px] text-indigo-600">Classification isn't applicable for the motif bonus.</div>
        ) : (
          <FieldRow label="Classification" required empty={!draft.classification}>
            <select
              className="w-full border rounded-md p-2 bg-white text-xs"
              value={draft.classification}
              onChange={(e) => update("classification", e.target.value as InformativeVariantClassification)}
            >
              <option value="">Select</option>
              {CLASSIFICATION_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </FieldRow>
        )}
      </ModalSection>
    </Modal>
  )
}
