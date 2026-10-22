import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/Table";
import { ExtIcon } from "../../ui/ExtIcon";
import ExternalDataSourcesPanel from "../../ExternalDataSourcesPanel";
import { INHERITANCE_OPTIONS } from "../../../lib/referenceData";

// ---------------------------------------------------------------------------
// Hardcoded placeholder data (TP53 example variant)
// ---------------------------------------------------------------------------

const variantHgvs = "NM_000546.6(TP53):c.215C>G";
const displayCaid = "CA000072";
const displayClinvarId = "12351";
const geneSymbol = "TP53";

const clinvarSummary = {
  reviewStatus: "criteria provided, multiple submitters, no conflicts",
  classification: "Benign",
  lastEvaluated: "Apr 01, 2025",
  submissionCount: 31,
};

interface GermlineRow {
  classification: string;
  lastEvaluated: string;
  reviewStatus: string;
  assertionMethod?: string;
  condition: string;
  conditionSource?: string;
  modeOfInheritance?: string;
  submitter: string;
  accession: string;
}

const germlineInterpretations: GermlineRow[] = [
  {
    classification: "Benign",
    lastEvaluated: "Aug 18, 2017",
    reviewStatus: "criteria provided, single submitter",
    assertionMethod: "ACMG Guidelines, 2015",
    condition: "Li-Fraumeni syndrome 1",
    conditionSource: "OMIM",
    submitter: "IntelligenceCG",
    accession: "SCV000611723.1",
  },
  {
    classification: "Benign",
    lastEvaluated: "Dec 20, 2021",
    reviewStatus: "criteria provided, single submitter",
    assertionMethod: "ACMG Guidelines, 2015",
    condition: "",
    submitter: "Fulgent Genetics, Fulgent Genetics",
    accession: "SCV002804833.1",
  },
  {
    classification: "Benign",
    lastEvaluated: "Dec 20, 2021",
    reviewStatus: "criteria provided, single submitter",
    assertionMethod: "ACMG Guidelines, 2015",
    condition: "not provided",
    conditionSource: "MedGen",
    modeOfInheritance: "Autosomal dominant inheritance",
    submitter: "Breakthrough Genomics, Breakthrough Genomics",
    accession: "SCV005251488.1",
  },
  {
    classification: "Benign",
    lastEvaluated: "Oct 03, 2024",
    reviewStatus: "criteria provided, single submitter",
    assertionMethod: "ACMG Guidelines, 2015",
    condition: "Li-Fraumeni syndrome",
    conditionSource: "MONDO:0018875",
    modeOfInheritance: "Autosomal dominant inheritance",
    submitter: "All of Us Research Program, National Institutes of Health",
    accession: "SCV004823832.2",
  },
  {
    classification: "Benign",
    lastEvaluated: "Oct 01, 2009",
    reviewStatus: "no assertion criteria provided",
    condition: "TP53 POLYMORPHISM",
    conditionSource: "MedGen",
    submitter: "OMIM",
    accession: "SCV000033391.6",
  },
  {
    classification: "Benign",
    lastEvaluated: "Jul 13, 2012",
    reviewStatus: "no assertion criteria provided",
    condition: "not provided",
    conditionSource: "MedGen",
    submitter: "Biesecker Lab/Clinical Genomics Section, National Institutes of Health",
    accession: "SCV000043503.2",
  },
  {
    classification: "Benign",
    lastEvaluated: "Apr 01, 2025",
    reviewStatus: "criteria provided, single submitter",
    assertionMethod: "Myriad Autosomal Dominant, Autosomal Recessive and X-Linked Classification Criteria (2023)",
    condition: "Li-Fraumeni syndrome 1",
    conditionSource: "OMIM",
    submitter: "Myriad Genetics, Inc.",
    accession: "SCV006301172.1",
  },
];

// Submission summary tallies
const submissionSummaryPills: { label: string; count: number }[] = [
  { label: "Benign", count: 31 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GeneralInformation = () => {
  const [modeOfInheritance, setModeOfInheritance] = useState("");
  const [otherInheritanceText, setOtherInheritanceText] = useState("");
  const [diseaseTerm, setDiseaseTerm] = useState("");
  const [showAllInterpretations, setShowAllInterpretations] = useState(false);

  const defaultVisibleCount = 3;
  const visibleInterpretations = showAllInterpretations
    ? germlineInterpretations
    : germlineInterpretations.slice(0, defaultVisibleCount);

  return (
    <div className="space-y-4">
      {/* ----------------------------------------------------------------- */}
      {/* Classification Parameters                                         */}
      {/* ----------------------------------------------------------------- */}
      <Card tone="action">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Classification Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            <label className="text-xs font-semibold text-gray-700 block">
              Transcript (Community Standard Title)
            </label>
            <div className="w-full border rounded-md p-2 bg-gray-50 font-mono text-xs flex items-center gap-2 min-h-[34px]">
              <span>{variantHgvs}</span>
              <Badge className="bg-yellow-100 text-yellow-800 flex-none">MANE Select</Badge>
            </div>
            <p className="text-xs text-gray-500">
              This prototype only supports the Community Standard Title for this variant -- usually
              that will be on a MANE Select transcript.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                Mode of inheritance <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full border rounded-md p-2 bg-white text-sm ${
                  !modeOfInheritance ? "border-gray-300 bg-gray-100" : ""
                }`}
                value={modeOfInheritance}
                onChange={(e) => setModeOfInheritance(e.target.value)}
              >
                <option value="">Select mode of inheritance...</option>
                {INHERITANCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {modeOfInheritance === "Other" && (
                <input
                  className={`w-full border rounded-md p-2 mt-2 text-sm ${
                    otherInheritanceText.trim().length === 0
                      ? "border-gray-300 bg-gray-100"
                      : ""
                  }`}
                  placeholder="Specify mode of inheritance"
                  value={otherInheritanceText}
                  onChange={(e) => setOtherInheritanceText(e.target.value)}
                />
              )}
              <p className="text-xs text-gray-600">
                Required before <b>scoring</b> can start.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                Disease term (MONDO)
              </label>
              <input
                className="w-full border rounded-md p-2 text-sm"
                placeholder="Enter disease term"
                value={diseaseTerm}
                onChange={(e) => setDiseaseTerm(e.target.value)}
              />
              <p className="text-xs text-gray-600">Use free text for prototype.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Approved Interpretations                                          */}
      {/* ----------------------------------------------------------------- */}
      <Card tone="reference">
        <CardHeader>
          <CardTitle>
            Approved Interpretations for this variant by a ClinGen Expert Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600 mb-3">
            Not wired up as a live table yet -- search the ClinGen Evidence Repository directly for
            this variant.
          </p>
          <a
            href={`https://erepo.clinicalgenome.org/evrepo/?search=${displayCaid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-blue-600 font-medium text-xs hover:underline"
          >
            Search the Evidence Repository for {displayCaid} <ExtIcon />
          </a>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Overall ClinVar Interpretation                                    */}
      {/* ----------------------------------------------------------------- */}
      <Card tone="reference">
        <CardHeader>
          <CardTitle>Overall ClinVar Interpretation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end mb-3">
            <a
              href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${displayClinvarId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 font-medium text-xs"
            >
              View in ClinVar <ExtIcon />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-700">Review status:</span>{" "}
                <span className="text-gray-700">{clinvarSummary.reviewStatus}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Classification:</span>{" "}
                <span className="text-gray-700">{clinvarSummary.classification}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-700">Last evaluated:</span>{" "}
                <span className="text-gray-700">{clinvarSummary.lastEvaluated}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Submissions:</span>{" "}
                <span className="text-gray-700">{clinvarSummary.submissionCount}</span>
              </div>
            </div>
          </div>

          {submissionSummaryPills.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-700 mb-2">Submission summary</div>
              <div className="flex flex-wrap gap-2">
                {submissionSummaryPills.map(({ label, count }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-1"
                  >
                    <span>{label}</span>
                    <span className="font-mono font-semibold">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Germline Interpretations                                          */}
      {/* ----------------------------------------------------------------- */}
      <Card tone="reference">
        <CardHeader>
          <CardTitle>Germline Interpretations Submitted to ClinVar</CardTitle>
          <p className="text-xs text-gray-600 mt-1">
            {germlineInterpretations.length} total submissions for Variation ID{" "}
            <span className="font-mono">{displayClinvarId}</span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR className="border-b border-gray-200">
                  <TH>Classification (Last evaluated)</TH>
                  <TH>Review Status (Assertion method)</TH>
                  <TH>Condition(s) (Mode of Inheritance)</TH>
                  <TH>Submitter</TH>
                  <TH>Submission accession</TH>
                </TR>
              </THead>
              <TBody>
                {visibleInterpretations.map((r, i) => {
                  const isExpertPanel = (r.reviewStatus || "")
                    .toLowerCase()
                    .includes("reviewed by expert panel");
                  return (
                    <TR
                      key={r.accession}
                      className={`${
                        i < visibleInterpretations.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      } ${isExpertPanel ? "bg-amber-50" : ""}`}
                    >
                      <TD>
                        <div className="text-gray-700">{r.classification}</div>
                        {r.lastEvaluated && (
                          <div className="text-xs text-gray-600">({r.lastEvaluated})</div>
                        )}
                      </TD>
                      <TD className="text-gray-700">
                        <div className="flex items-center gap-1.5">
                          {r.reviewStatus}
                          {isExpertPanel && (
                            <Badge className="bg-amber-200 text-amber-900 flex-none">
                              Expert Panel
                            </Badge>
                          )}
                        </div>
                        {r.assertionMethod && (
                          <div className="text-xs text-blue-600 mt-0.5">{r.assertionMethod}</div>
                        )}
                      </TD>
                      <TD className="text-gray-700">
                        <div>
                          {r.condition || <span className="text-gray-400 italic">Not provided</span>}
                          {r.conditionSource && (
                            <span className="text-xs text-gray-500 ml-1">
                              [{r.conditionSource}]
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {r.modeOfInheritance || (
                            <span className="text-gray-400">{"–"}</span>
                          )}
                        </div>
                      </TD>
                      <TD className="text-blue-600">{r.submitter}</TD>
                      <TD className="text-gray-500 font-mono text-xs">{r.accession}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>

            <div className="mt-4 text-xs text-gray-700 text-center">
              Showing {visibleInterpretations.length} of {germlineInterpretations.length} total
              Germline Interpretations.{" "}
              {!showAllInterpretations &&
                germlineInterpretations.length > defaultVisibleCount && (
                  <button
                    className="text-blue-600 font-medium"
                    onClick={() => setShowAllInterpretations(true)}
                  >
                    Show all {germlineInterpretations.length} interpretations
                  </button>
                )}
              {showAllInterpretations &&
                germlineInterpretations.length > defaultVisibleCount && (
                  <button
                    className="text-blue-600 font-medium"
                    onClick={() => setShowAllInterpretations(false)}
                  >
                    Show fewer
                  </button>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Variant Evidence Resources                                        */}
      {/* ----------------------------------------------------------------- */}
      <Card tone="reference">
        <CardHeader>
          <CardTitle>Variant Evidence Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <a
                href={`https://reg.clinicalgenome.org/redmine/projects/registry/genboree_registry/by_caid?caid=${displayCaid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 font-medium text-xs"
              >
                ClinGen Allele Registry <ExtIcon />
              </a>
              <span className="font-mono text-blue-600 text-xs">{displayCaid}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <a
                href="https://www.ncbi.nlm.nih.gov/snp/rs1042522"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 font-medium text-xs"
              >
                dbSNP <ExtIcon />
              </a>
              <span className="font-mono text-blue-600 text-xs">rs1042522</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <a
                href="https://gnomad.broadinstitute.org/variant/17-7676154-G-C?dataset=gnomad_r4"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 font-medium text-xs"
              >
                gnomAD Browser v4.1 <ExtIcon />
              </a>
              <span className="font-mono text-blue-600 text-xs">chr17:g.7676154G&gt;C</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 font-medium text-xs"
              >
                Leiden Open Variation Database (LOVD) <ExtIcon />
              </a>
            </div>
            <div className="flex items-center justify-between py-2">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 font-medium text-xs"
              >
                BRCA Exchange <ExtIcon />
              </a>
              <span className="text-gray-500 text-xs italic">Not available for {geneSymbol}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* External Data Sources Panel                                       */}
      {/* ----------------------------------------------------------------- */}
      <ExternalDataSourcesPanel
        sources={[
          {
            key: "alleleRegistry",
            label: "ClinGen Allele Registry",
            description:
              "CAID, ClinVar ID, dbSNP rsID, GRCh38 coordinates -- the variant chosen on the entry screen.",
            status: "success",
            lastFetchedAt: Date.now() - 60_000,
            onRetry: () => {},
          },
          {
            key: "ldh",
            label: "ClinGen Linked Data Hub",
            description:
              "In silico predictor scores (Predicted Effect tab); also backfills ClinVar ID/dbSNP here when the Allele Registry doesn't have them.",
            status: "success",
            lastFetchedAt: Date.now() - 60_000,
            onRetry: () => {},
          },
          {
            key: "ensemblVep",
            label: "Ensembl VEP",
            description:
              "RefSeq/Ensembl transcript tables (Predicted Effect tab) -- also what the Transcript picker above uses.",
            status: "success",
            lastFetchedAt: Date.now() - 60_000,
            onRetry: () => {},
          },
          {
            key: "clinvar",
            label: "NCBI ClinVar (E-utilities)",
            description:
              "Classification, review status, and germline submissions.",
            status: "success",
            lastFetchedAt: Date.now() - 60_000,
            onRetry: () => {},
          },
        ]}
      />
    </div>
  );
};

export default GeneralInformation;
