import { useState, Fragment } from "react";
import { Button } from "../../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import { CodeStatusBadge, CodeStatusSelect } from "../../ui/ScoreBadge";
import { MiniScoreBadge } from "../../ui/StatusPill";
import { SaveEvidenceAndComplete } from "../../ui/MarkComplete";
import { LockedNotice } from "../../ui/LockedNotice";
import { useTabContext } from "../../../contexts/useTabContext";
import { CSpecGuidanceBanner, GuidanceButton, GuidanceModal } from "../../ui/CSpecGuidance";
import { Modal, FieldRow, ModalSection } from "../../ui/Modal";
import { Disclosure } from "../../ui/Disclosure";
import { GUIDANCE_DOC_LINKS } from "../../../lib/referenceData";

import { Plus, Pencil, ChevronDown, MessageSquare } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Proband {
  id: string;
  label: string;
  source: string;
  sourceDetail: string;
  hpoTags: string[];
  freeTextPheno: string;
  zygosity: string;
  sex: string;
  ageAtObservation: string;
  countryOfOrigin: string;
  deNovoStatus: string;
  parentalConfirmation: string;
  phenotypeConsistency: string;
  highlyConsistent: boolean;
  allRelevantGenesTested: boolean;
  generalComment: string;
  scores: Record<string, number | null>;
  reasoning: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Hardcoded example data matching prototype (TP53, X-linked)
// ---------------------------------------------------------------------------

const EXAMPLE_PROBANDS: Proband[] = [
  {
    id: "p1",
    label: "Coy et al. 2021 CASE 2",
    source: "PMID 2025233",
    sourceDetail: "PMID 2025233",
    hpoTags: ["HPO:223423232"],
    freeTextPheno:
      "Male age 8 with history of developmental delay, seizures beginning at 3 years of age. No urine creatine results available",
    zygosity: "Hemizygous",
    sex: "Male",
    ageAtObservation: "",
    countryOfOrigin: "",
    deNovoStatus: "",
    parentalConfirmation: "",
    phenotypeConsistency: "Phenotype consistent for gene",
    highlyConsistent: false,
    allRelevantGenesTested: true,
    generalComment: "Variant identified via clinical exome sequencing",
    scores: { CLN_AFF: 0.5, CLN_DNV: null, CLN_UAF: null, CLN_ALT: null, CLN_CCS: null, LOC_PHE: null, LOC_SEG: null },
    reasoning: {
      CLN_AFF: [
        "Phenotype consistent for gene and all relevant genes for disorder tested, with no other variant of interest.",
        "VBC is hemizygous",
      ],
    },
  },
  {
    id: "p2",
    label: "Lee et al. 2008 Proband B",
    source: "PMID 202343243",
    sourceDetail: "PMID 202343243",
    hpoTags: [],
    freeTextPheno:
      "Male age 4, severe developmental delays, urine creatine and MRS show decreased creatine levels.",
    zygosity: "Hemizygous",
    sex: "Male",
    ageAtObservation: "",
    countryOfOrigin: "",
    deNovoStatus: "Yes",
    parentalConfirmation: "Confirmed",
    phenotypeConsistency: "Phenotype consistent for gene",
    highlyConsistent: false,
    allRelevantGenesTested: true,
    generalComment: "",
    scores: { CLN_AFF: 0.5, CLN_DNV: 2.0, CLN_UAF: null, CLN_ALT: null, CLN_CCS: null, LOC_PHE: null, LOC_SEG: null },
    reasoning: {
      CLN_AFF: [
        "Phenotype consistent for gene and all relevant genes for disorder tested, with no other variant of interest.",
        "VBC is hemizygous.",
      ],
      CLN_DNV: [
        "Phenotype consistent for gene and all relevant genes for disorder tested.",
        "de novo with confirmed parental relationships.",
      ],
    },
  },
];

// Evidence code metadata
const CODE_META: Record<string, { group: string; desc: string }> = {
  CLN_AFF: { group: "Clinical Observations (CLN)", desc: "Affected Observations" },
  CLN_DNV: { group: "Clinical Observations (CLN)", desc: "De Novo Observations" },
  CLN_UAF: { group: "Clinical Observations (CLN)", desc: "Unaffected Observations" },
  CLN_ALT: { group: "Clinical Observations (CLN)", desc: "Alternate Cause" },
  CLN_CCS: { group: "Clinical Observations (CLN)", desc: "Case-Control Studies" },
  LOC_PHE: { group: "Locus Specificity (LOC)", desc: "Specific Phenotype" },
  LOC_SEG: { group: "Locus Specificity (LOC)", desc: "Segregations with Disease" },
  LOC: { group: "Locus Specificity (LOC)", desc: "Combined Locus Evidence" },
};

const CODE_ORDER = ["CLN_AFF", "CLN_DNV", "CLN_UAF", "CLN_ALT", "CLN_CCS", "LOC_PHE", "LOC_SEG", "LOC"];

// Case info fields for the curated-data section
const CASE_INFO_ROWS = [
  { label: "Source detail", get: (p: Proband) => p.sourceDetail },
  { label: "Phenotypic features (HPO)", get: (p: Proband) => p.hpoTags.join(", ") || "" },
  { label: "Free text description of disease", get: (p: Proband) => p.freeTextPheno },
  { label: "Is Unaffected", get: () => "" },
  { label: "Zygosity of variant in proband", get: (p: Proband) => p.zygosity },
  { label: "Proband(s) sex", get: (p: Proband) => p.sex },
  { label: "Variant in trans", get: () => "" },
  {
    label: "de novo status",
    get: (p: Proband) =>
      p.deNovoStatus
        ? `De novo status = ${p.deNovoStatus}${p.parentalConfirmation ? `\nMaternity/Paternity status = ${p.parentalConfirmation}` : ""}`
        : "",
  },
  { label: "Variant of interest", get: () => "" },
  { label: "Comment", get: (p: Proband) => p.generalComment },
];

const PHENOTYPE_ROWS = [
  { label: "Phenotype consistency", get: (p: Proband) => p.phenotypeConsistency },
  { label: "Phenotype highly consistent with disease", get: (p: Proband) => (p.highlyConsistent ? "Yes" : "No") },
  { label: "All relevant genes for disorder tested", get: (p: Proband) => (p.allRelevantGenesTested ? "Yes" : "No") },
  { label: "Observed MOI differs from scoring MOI", get: () => "" },
  { label: "Alternate Cause", get: () => "" },
  { label: "Multiple probands counted", get: () => "" },
  { label: "Comment", get: (p: Proband) => p.generalComment },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionDividerRow({ colSpan, label, collapsible, open, onToggle }: {
  colSpan: number; label: string; collapsible?: boolean; open?: boolean; onToggle?: () => void;
}) {
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
  );
}

// ---------------------------------------------------------------------------
// Proband Modal (compact, using Modal component)
// ---------------------------------------------------------------------------

function ProbandModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [label, setLabel] = useState("");
  const [hpo, setHpo] = useState("");
  const [freeText, setFreeText] = useState("");
  const [zygosity, setZygosity] = useState("");
  const [sex, setSex] = useState("");
  const [phenotypeConsistency, setPhenotypeConsistency] = useState("");
  const [testingRelevance, setTestingRelevance] = useState("");

  return (
    <Modal
      title="Proband Data Form"
      onClose={onClose}
      headerRight={<span className="text-xs text-blue-200">X-linked MOI</span>}
      navItems={[
        { id: "proband-case", label: "Case Information" },
        { id: "proband-phenotype", label: "Phenotype Analysis" },
        { id: "proband-family", label: "Family Data" },
      ]}
    >
      <ModalSection id="proband-case" title="Case Information">
        <FieldRow label="Label" required empty={!label}>
          <input
            className="w-full border rounded-md px-2 py-1 text-xs"
            placeholder="Enter label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </FieldRow>
        <FieldRow label="Phenotypic features (HPO)">
          <input
            className="w-full border rounded-md px-2 py-1 text-xs"
            placeholder="e.g HP:0010704, HP:0030300"
            value={hpo}
            onChange={(e) => setHpo(e.target.value)}
          />
        </FieldRow>
        <FieldRow label="Free text description">
          <textarea
            className="w-full border rounded-md px-2 py-1 text-xs"
            rows={2}
            placeholder="Enter phenotypic features"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
          />
        </FieldRow>
        <FieldRow label="Zygosity" required>
          <select className="w-full border rounded-md px-2 py-1 text-xs" value={zygosity} onChange={(e) => setZygosity(e.target.value)}>
            <option value="">Select zygosity</option>
            <option value="Heterozygous">Heterozygous</option>
            <option value="Homozygous">Homozygous</option>
            <option value="Hemizygous">Hemizygous</option>
            <option value="Compound heterozygous">Compound heterozygous</option>
            <option value="Unknown">Unknown</option>
          </select>
        </FieldRow>
        <FieldRow label="Sex">
          <select className="w-full border rounded-md px-2 py-1 text-xs" value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="">Select sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Unknown">Unknown</option>
          </select>
        </FieldRow>
        <FieldRow label="Comments">
          <textarea className="w-full border rounded-md px-2 py-1 text-xs" rows={2} placeholder="Comments about case" />
        </FieldRow>
      </ModalSection>

      <ModalSection id="proband-phenotype" title="Phenotype Consistency" note="These fields can only be completed if the disease and mode of inheritance have been defined">
        <FieldRow label="Phenotype consistency" required>
          <select className="w-full border rounded-md px-2 py-1 text-xs" value={phenotypeConsistency} onChange={(e) => setPhenotypeConsistency(e.target.value)}>
            <option value="">Select</option>
            <option value="specific">Phenotype specific for gene</option>
            <option value="consistent">Phenotype consistent with gene</option>
            <option value="not-consistent">Phenotype not consistent with gene</option>
          </select>
        </FieldRow>
        <FieldRow label="Testing relevance" required>
          <select className="w-full border rounded-md px-2 py-1 text-xs" value={testingRelevance} onChange={(e) => setTestingRelevance(e.target.value)}>
            <option value="">Select</option>
            <option value="all-tested">All relevant genes were tested</option>
            <option value="not-all-tested">Not all relevant genes were tested</option>
            <option value="unknown">Unknown</option>
          </select>
        </FieldRow>
        <FieldRow label="Phenotype comments">
          <textarea className="w-full border rounded-md px-2 py-1 text-xs" rows={2} placeholder="Comments about phenotype consistency" />
        </FieldRow>
      </ModalSection>

      <ModalSection id="proband-family" title="Co-segregation of variant in relatives" note="Scoring X-linked inheritance">
        <FieldRow label="Affected relatives with monoallelic genotype" dense>
          <input type="number" className="w-20 border rounded-md px-2 py-1 text-xs" placeholder="0" />
        </FieldRow>
        <FieldRow label="Unaffected relatives without monoallelic genotype" dense>
          <input type="number" className="w-20 border rounded-md px-2 py-1 text-xs" placeholder="0" />
        </FieldRow>
        <FieldRow label="Segregation comments">
          <textarea className="w-full border rounded-md px-2 py-1 text-xs" rows={2} placeholder="Comments about co-segregation" />
        </FieldRow>
      </ModalSection>

      <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 mt-3">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" className="!bg-green-600 hover:!bg-green-700 !text-white" onClick={() => { onSave(); onClose(); }}>Save Proband</Button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const Clinical = () => {
  // Local state
  const [inheritanceSet] = useState(true);
  const { setActiveTab } = useTabContext();
  const [modeOfInheritance] = useState("X-linked");
  const [diseaseTerm] = useState("Cerebral Creatine Deficiency Syndrome (MONDO:23432)");
  const [savedProbands] = useState<Proband[]>(EXAMPLE_PROBANDS);
  const [showProbandModal, setShowProbandModal] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [evidenceSaved, setEvidenceSaved] = useState(false);
  const [sectionComplete, setSectionComplete] = useState(false);
  const [showCaseInfo, setShowCaseInfo] = useState(true);
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());

  // Per-code comments for summary
  const [codeComments, setCodeComments] = useState<Record<string, string>>({
    CLN_AFF: "", CLN_DNV: "", CLN_UAF: "", CLN_ALT: "", LOC_PHE: "", LOC_SEG: "",
  });

  // Evidence override status (score / nd / na)
  const [overrides, setOverrides] = useState<Record<string, string>>({
    CLN_AFF: "score", LOC_PHE: "score",
  });

  const OVERRIDABLE_CODES = ["CLN_AFF", "LOC_PHE"];

  const toggleComment = (code: string) => {
    setOpenComments((s) => {
      const next = new Set(s);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  // Compute aggregate scores from saved probands
  const aggregateFor = (code: string): number | null => {
    const scores = savedProbands
      .map((p) => p.scores[code])
      .filter((s): s is number => s !== null);
    if (scores.length === 0) return null;
    if (code === "LOC_PHE") return Math.max(...scores); // max, not sum
    return scores.reduce((a, b) => a + b, 0);
  };

  const hasDataFor = (code: string): boolean => {
    return savedProbands.some((p) => p.scores[code] !== null);
  };

  const guidanceLinks = GUIDANCE_DOC_LINKS.clinicalAndLocus;

  const totalCols = 2 + savedProbands.length * 2;

  return (
    <>
      <Card tone="action">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clinical and Locus Evidence</CardTitle>
              <CardDescription>Clinical data related to this variant</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <GuidanceButton onClick={() => setShowGuidance(true)} links={guidanceLinks} />
              {savedProbands.length > 0 && (
                <SaveEvidenceAndComplete
                  complete={sectionComplete}
                  completeDisabledReason="Click Save Evidence before checking Tab Completed."
                  evidenceSaved={evidenceSaved}
                  onSaveEvidence={() => setEvidenceSaved(true)}
                  onToggleComplete={(checked) => setSectionComplete(checked)}
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!inheritanceSet ? (
            <LockedNotice onGoToParameters={() => setActiveTab("general-information")} />
          ) : (
            <div className="space-y-4">
              {/* Add evidence buttons */}
              <div className="flex flex-wrap gap-2">
                <Button className="gap-2" size="sm" onClick={() => setShowProbandModal(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add proband data
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-3.5 w-3.5" /> Add case-control study
                </Button>
              </div>
              <p className="text-xs text-gray-500 -mt-2">
                Individually-counted probands and case-control studies can both apply to this variant. Every
                source curated here will display in the Literature tab.
              </p>

              {/* CSpec Guidance */}
              <CSpecGuidanceBanner
                links={guidanceLinks}
                note="Clinical Observations (Supplement 4) and Locus Specificity (Supplement 5) are scored per proband."
              />

              {/* Scored Cases Table */}
              {savedProbands.length > 0 && (
                <Disclosure
                  title="Case Information & Scored Cases"
                  description={`${savedProbands.length} saved observation${savedProbands.length === 1 ? "" : "s"}`}
                  defaultOpen={true}
                >
                  <div className="mb-3 text-xs text-gray-700">
                    <div><span className="font-semibold italic">Mode of inheritance</span> = {modeOfInheritance}</div>
                    <div><span className="font-semibold italic">Disease</span> = {diseaseTerm}</div>
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
                          {savedProbands.map((p, i) => (
                            <th
                              key={p.id}
                              className="text-left px-3 py-2 font-semibold text-gray-700 sticky top-0 z-10 bg-gray-50 border-r border-gray-200 whitespace-nowrap"
                              colSpan={2}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{p.label || `Proband ${i + 1}`}</span>
                                <button className="text-blue-600 hover:text-blue-800" title="Edit">
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <div className="text-[10px] font-mono text-gray-400 normal-case">{p.source}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Comment row */}
                        <tr className="border-b border-gray-200 bg-blue-50/30">
                          <td className="px-3 py-2 sticky left-0 bg-blue-50/30 border-r border-gray-200 font-medium text-gray-700 whitespace-nowrap">
                            Comment
                          </td>
                          <td className="px-3 py-2 text-right border-r border-gray-200 bg-amber-50/40"></td>
                          {savedProbands.map((p) => (
                            <td key={p.id} colSpan={2} className="px-3 py-2 border-r border-gray-200 text-gray-700">
                              {p.generalComment}
                            </td>
                          ))}
                        </tr>

                        {/* Scored Cases divider */}
                        <SectionDividerRow colSpan={totalCols} label="Scored Cases (CLN / LOC)" />

                        {/* Code rows */}
                        {CODE_ORDER.map((code) => {
                          const meta = CODE_META[code];
                          if (!meta) return null;
                          const aggregate = aggregateFor(code);
                          const aggregateHasData = hasDataFor(code);

                          return (
                            <Fragment key={code}>
                              <tr className="border-b border-gray-100 align-top">
                                <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-200 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-semibold text-gray-800">{code}</span>
                                    {code !== "LOC" && code !== "CLN_CCS" && (
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
                                  {OVERRIDABLE_CODES.includes(code) ? (
                                    <div className="flex flex-col items-end gap-1 whitespace-nowrap">
                                      <CodeStatusBadge
                                        code={code}
                                        status={overrides[code] || "score"}
                                        rawValue={aggregate}
                                        ready={true}
                                      />
                                      <CodeStatusSelect
                                        status={overrides[code] || "score"}
                                        onChange={(status) => setOverrides((prev) => ({ ...prev, [code]: status }))}
                                      />
                                    </div>
                                  ) : aggregateHasData && aggregate !== null ? (
                                    aggregate.toFixed(1)
                                  ) : (
                                    <span className="text-gray-400 italic text-xs">Not Evaluated</span>
                                  )}
                                </td>
                                {savedProbands.map((p) => {
                                  const score = p.scores[code];
                                  const reasoning = p.reasoning[code] || [];
                                  return (
                                    <td key={p.id} colSpan={2} className="px-3 py-2 border-r border-gray-200">
                                      {score !== null && score !== undefined ? (
                                        <div className="flex gap-3">
                                          <div className="flex-none w-14">
                                            <MiniScoreBadge code="" value={score} />
                                          </div>
                                          {reasoning.length > 0 && (
                                            <ul className="text-xs text-gray-700 list-disc pl-4 space-y-0.5">
                                              {reasoning.map((line, li) => (
                                                <li key={li}>{line}</li>
                                              ))}
                                            </ul>
                                          )}
                                        </div>
                                      ) : null}
                                    </td>
                                  );
                                })}
                              </tr>
                              {/* Per-code comment row */}
                              {openComments.has(code) && (
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
                                      placeholder={`Summary of the ${code} assessment across every proband...`}
                                      value={codeComments[code] || ""}
                                      onChange={(e) =>
                                        setCodeComments((prev) => ({ ...prev, [code]: e.target.value }))
                                      }
                                    />
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}

                        {/* Case Information (collapsible curated data) */}
                        <SectionDividerRow
                          colSpan={totalCols}
                          label="Case Information"
                          collapsible
                          open={showCaseInfo}
                          onToggle={() => setShowCaseInfo(!showCaseInfo)}
                        />
                        {showCaseInfo && (
                          <>
                            {CASE_INFO_ROWS.map((row) => (
                              <tr key={row.label} className="border-b border-gray-100">
                                <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-200 font-medium text-gray-700 whitespace-nowrap">
                                  {row.label}
                                </td>
                                <td className="px-3 py-2 text-right border-r border-gray-200 bg-amber-50/40"></td>
                                {savedProbands.map((p) => (
                                  <td key={p.id} colSpan={2} className="px-3 py-2 border-r border-gray-200 text-gray-700 whitespace-pre-line">
                                    {row.get(p)}
                                  </td>
                                ))}
                              </tr>
                            ))}

                            {/* Phenotype consistency sub-section */}
                            <SectionDividerRow colSpan={totalCols} label="Phenotype Consistency" />
                            {PHENOTYPE_ROWS.map((row) => (
                              <tr key={row.label} className="border-b border-gray-100">
                                <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-200 font-medium text-gray-700 whitespace-nowrap">
                                  {row.label}
                                </td>
                                <td className="px-3 py-2 text-right border-r border-gray-200 bg-amber-50/40"></td>
                                {savedProbands.map((p) => (
                                  <td key={p.id} colSpan={2} className="px-3 py-2 border-r border-gray-200 text-gray-700">
                                    {row.get(p)}
                                  </td>
                                ))}
                              </tr>
                            ))}

                            {/* Co-segregation sub-section */}
                            <SectionDividerRow colSpan={totalCols} label="Co-segregation" />
                            <tr className="border-b border-gray-100">
                              <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-200 font-medium text-gray-700 whitespace-nowrap">
                                Co-segregation of variant in relatives
                              </td>
                              <td className="px-3 py-2 text-right border-r border-gray-200 bg-amber-50/40"></td>
                              {savedProbands.map((p) => (
                                <td key={p.id} colSpan={2} className="px-3 py-2 border-r border-gray-200 text-gray-700"></td>
                              ))}
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-400 italic mt-2">
                    Case Information and Scored Cases shows one column per entry.
                  </p>
                </Disclosure>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proband Modal */}
      {showProbandModal && (
        <ProbandModal onClose={() => setShowProbandModal(false)} onSave={() => {}} />
      )}

      {/* Guidance Modal */}
      {showGuidance && (
        <GuidanceModal onClose={() => setShowGuidance(false)} links={guidanceLinks} />
      )}
    </>
  );
};

export default Clinical;
