import { FieldRow } from "./ui/Modal"
import { sourceKind } from "../lib/sourceDetail"

interface SourceDetailFieldsProps {
  source: string
  pmid: string
  setPmid: (v: string) => void
  labName: string
  setLabName: (v: string) => void
  databaseName: string
  setDatabaseName: (v: string) => void
  otherDescription: string
  setOtherDescription: (v: string) => void
}

export default function SourceDetailFields({
  source, pmid, setPmid,
  labName, setLabName, databaseName, setDatabaseName, otherDescription, setOtherDescription,
}: SourceDetailFieldsProps) {
  const kind = sourceKind(source);
  if (!kind) return null;

  if (kind === "pmid") {
    return (
      <FieldRow label="Literature identifier" required empty={!pmid}>
        <input
          type="text"
          className="w-56 border rounded-md p-2 text-xs font-mono"
          placeholder="e.g. 30311390, or a DOI/PMCID/other identifier"
          value={pmid}
          onChange={(e) => setPmid(e.target.value)}
        />
        <p className="text-[11px] text-gray-500 mt-1">Any literature identifier works for this prototype.</p>
      </FieldRow>
    );
  }

  if (kind === "lab") {
    return (
      <FieldRow label={source === "Clinic" ? "Clinic name" : "Lab name"} required empty={!labName.trim()}>
        <input
          className="w-full border rounded-md p-2 text-xs"
          placeholder={source === "Clinic" ? "e.g. Boston Children's Hospital Genetics Clinic" : "e.g. Stanford Medical Clinical Genomics Laboratory"}
          value={labName}
          onChange={(e) => setLabName(e.target.value)}
        />
      </FieldRow>
    );
  }

  if (kind === "database") {
    return (
      <FieldRow label="Database name" required empty={!databaseName.trim()}>
        <input
          className="w-full border rounded-md p-2 text-xs"
          placeholder="e.g. ClinVar, gnomAD, HGMD, LOVD"
          value={databaseName}
          onChange={(e) => setDatabaseName(e.target.value)}
        />
      </FieldRow>
    );
  }

  return (
    <FieldRow label="Describe the source" required empty={!otherDescription.trim()}>
      <input
        className="w-full border rounded-md p-2 text-xs"
        placeholder="e.g. Personal communication with the referring clinician"
        value={otherDescription}
        onChange={(e) => setOtherDescription(e.target.value)}
      />
    </FieldRow>
  );
}
