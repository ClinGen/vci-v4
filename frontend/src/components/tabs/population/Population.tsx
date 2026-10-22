import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/Table";
import { Badge } from "../../ui/Badge";
import { ScoreBadge, CodeStatusBadge, CodeStatusSelect } from "../../ui/ScoreBadge";
import { SaveEvidenceAndComplete } from "../../ui/MarkComplete";
import { LockedNotice } from "../../ui/LockedNotice";
import { CSpecGuidanceBanner } from "../../ui/CSpecGuidance";
import { ExtIcon, ExternalLinkIconSvg } from "../../ui/ExtIcon";
import { Disclosure } from "../../ui/Disclosure";
import { FieldRow } from "../../ui/Modal";
import ExternalDataSourcesPanel from "../../ExternalDataSourcesPanel";
import { RefreshCw, AlertTriangle } from "lucide-react";

/* ---------- hardcoded gnomAD data (same values from existing production) ---------- */

const GNOMAD_FAF = {
  exomeFilters: "Pass",
  genomeFilters: "Pass",
  exomeAc: 1046941,
  genomeAc: 95285,
  totalAc: 1142226,
  exomeAn: 1461558,
  genomeAn: 152024,
  totalAn: 1613582,
  exomeAf: "0.716318476584576",
  genomeAf: "0.626776035362837",
  totalAf: "0.707882214847031",
  exomeGrpmaxFaf: "0.74639068",
  genomeGrpmaxFaf: "0.739567990000004",
  totalGrpmaxFaf: "0.7462732",
  exomeHom: 380188,
  genomeHom: 31776,
  totalHom: 411964,
};

const ANCESTRY_ROWS = [
  { group: "African/African-American", ac: 28605, an: 74930, hom: 5495, af: "0.381756305885493" },
  { group: "Non-Finnish European", ac: 882123, an: 1179968, hom: 329809, af: "0.747582137820686" },
  { group: "Finnish", ac: 46913, an: 63994, hom: 17252, af: "0.733084351657967" },
  { group: "Ashkenazi Jewish", ac: 21300, an: 29604, hom: 7644, af: "0.719497365220916" },
  { group: "Admixed American", ac: 42617, an: 59976, hom: 15147, af: "0.710567560357476" },
  { group: "Remaining individuals", ac: 43349, an: 62476, hom: 15169, af: "0.693850438568410" },
  { group: "Amish", ac: 611, an: 912, hom: 207, af: "0.669956140350877" },
  { group: "Middle Eastern", ac: 3519, an: 5810, hom: 1103, af: "0.605679862303683" },
  { group: "East Asian", ac: 26984, an: 44862, hom: 8137, af: "0.601489107440596" },
  { group: "South Asian", ac: 46205, an: 91050, hom: 12001, af: "0.507468423942885" },
];

const SEX_ROWS = [
  { group: "XX", ac: 579412, an: 812224, hom: 210190, af: "0.713364786068867" },
  { group: "XY", ac: 562814, an: 801358, hom: 201774, af: "0.702325302798499" },
];

const Population = () => {
  /* scoring state */
  const [inheritanceSet, setInheritanceSet] = useState(false);
  const [isScoringActive, setIsScoringActive] = useState(false);
  const [popEvidenceSaved, setPopEvidenceSaved] = useState(false);
  const [sectionComplete, setSectionComplete] = useState(false);

  /* POP_FRQ state */
  const [popFrqStatus, setPopFrqStatus] = useState("score");
  const [daft, setDaft] = useState("");
  const [vbcFaf, setVbcFaf] = useState("");
  const [faSource, setFaSource] = useState("gnomAD v4 GroupMax Filtering AF");
  const [faQcStatus, setFaQcStatus] = useState("");
  const [faQcComment, setFaQcComment] = useState("");
  const [popFrqOverrideValue, setPopFrqOverrideValue] = useState("");
  const [popFrqRationale, setPopFrqRationale] = useState("");
  const [popFrqComment, setPopFrqComment] = useState("");

  /* POP_HMZ state */
  const [popHmzStatus, setPopHmzStatus] = useState("score");
  const [popHmzCount, setPopHmzCount] = useState("");
  const [popHmzSource, setPopHmzSource] = useState("gnomAD v4 total homozygote count");
  const [popHmzComment, setPopHmzComment] = useState("");

  const hasQualityFlag = faQcStatus === "flag";

  /* derived score placeholders (full scoring engine not yet wired) */
  const popFrqFinalValue: number | null = null;
  const popHmzValue: number | null = null;
  const popSubtotal: number | null = null;

  return (
    <div className="space-y-4">
      {/* Requery button */}
      <div className="flex items-start justify-between gap-3">
        <div />
        <Button
          variant="outline"
          className="shrink-0 flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Requery Population Databases
          <span className="hidden lg:inline text-xs text-gray-500">Last queried: September 4, 2025</span>
        </Button>
      </div>

      {/* ==================== SCORING CARD ==================== */}
      <Card tone="action">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Population Observations Evidence Collection and Scoring</CardTitle>
            <div className="flex items-center gap-3">
              {isScoringActive && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  POP subtotal
                  {popSubtotal !== null ? (
                    <ScoreBadge code="POP" value={popSubtotal} />
                  ) : (
                    <span className="text-xs font-mono px-2 py-0.5 rounded border bg-gray-50 text-gray-400 border-gray-200">
                      POP = NE
                    </span>
                  )}
                </span>
              )}
              {isScoringActive && (
                <SaveEvidenceAndComplete
                  complete={sectionComplete}
                  completeDisabledReason="Click Save Evidence before checking Tab Completed."
                  evidenceSaved={popEvidenceSaved}
                  onSaveEvidence={() => setPopEvidenceSaved(true)}
                  onToggleComplete={(checked) => setSectionComplete(checked)}
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!inheritanceSet ? (
            <LockedNotice onGoToParameters={() => setInheritanceSet(true)} />
          ) : !isScoringActive ? (
            <Button onClick={() => { setIsScoringActive(true); setPopEvidenceSaved(false); }}>
              Start Scoring
            </Button>
          ) : (
            <div>
              {/* Guidance banner */}
              <CSpecGuidanceBanner
                headerRight={
                  <a
                    href="https://docs.google.com/document/d/1XON2eq4HSM-guWlqitEnb8PghY0quNbA7_1WmmxvLj8/edit?tab=t.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    SVCv4 Supplement for Population Database Frequency <ExternalLinkIconSvg />
                  </a>
                }
                note={
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">POP_FRQ</p>
                      <p className="mb-1">Calculate Disease Allele Frequency Threshold (DAFT) following Supplement 3 guidance.</p>
                      <p className="text-gray-500">Scoring: compare FAF/DAFT ratio to bin thresholds for point values.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">POP_HMZ</p>
                      <p className="mb-1">
                        Scoring depends upon Mode of Inheritance and assumes age-matched penetrance of MDE is near
                        100% and affected individuals are not expected to be present in population databases.
                      </p>
                      <p className="text-gray-500">Capped at &minus;4.0 to 0 overall.</p>
                    </div>
                  </div>
                }
              />

              {/* ---------------- POP_FRQ ---------------- */}
              <div className={`py-3 border-b border-gray-200 ${popFrqStatus === "na" ? "bg-gray-50" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={`font-serif text-xs font-bold ${
                      popFrqStatus === "na" ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    POP_FRQ &mdash; Population Frequency
                  </h3>
                  <div className="flex items-center gap-2">
                    <CodeStatusSelect
                      status={popFrqStatus}
                      onChange={(v) => setPopFrqStatus(v)}
                    />
                    <CodeStatusBadge
                      code="POP_FRQ"
                      status={popFrqStatus}
                      rawValue={popFrqFinalValue}
                      ready={true}
                    />
                  </div>
                </div>

                <fieldset
                  disabled={popFrqStatus !== "score"}
                  className={`border-0 m-0 p-0 min-w-0 ${popFrqStatus !== "score" ? "opacity-60" : ""}`}
                >
                  <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                    <FieldRow
                      split
                      required
                      empty={!daft.trim()}
                      label="Disease Allele Frequency Threshold (DAFT)"
                    >
                      <input
                        type="number"
                        step="any"
                        className="w-40 border rounded-md p-1.5 text-xs font-mono"
                        value={daft}
                        onChange={(e) => setDaft(e.target.value)}
                      />
                    </FieldRow>

                    <FieldRow
                      split
                      required
                      empty={!vbcFaf.trim()}
                      label="VBC filtering allele frequency (FAF)"
                      info={
                        vbcFaf.trim() === "" ? (
                          <span className="text-gray-500">
                            Not yet populated -- fetch gnomAD data below, or enter manually.
                          </span>
                        ) : (
                          <span className="text-indigo-600">
                            Auto-populated from gnomAD's total GroupMax Filtering AF (below). Edit if a different
                            source applies.
                          </span>
                        )
                      }
                    >
                      <input
                        type="number"
                        step="any"
                        className="w-48 border rounded-md p-1.5 text-xs font-mono"
                        placeholder="e.g. 0.00034"
                        value={vbcFaf}
                        onChange={(e) => setVbcFaf(e.target.value)}
                      />
                    </FieldRow>

                    <FieldRow split label="Allele frequency source">
                      <input
                        className="w-56 border rounded-md p-1.5 text-xs"
                        value={faSource}
                        onChange={(e) => setFaSource(e.target.value)}
                      />
                    </FieldRow>

                    <FieldRow split label="FAF QC flags">
                      <div className="flex flex-col items-end gap-1.5">
                        <select
                          className="w-40 border rounded-md p-1.5 bg-white text-xs"
                          value={faQcStatus}
                          onChange={(e) => {
                            const v = e.target.value;
                            setFaQcStatus(v);
                            if (v !== "flag") setFaQcComment("");
                          }}
                        >
                          <option value="">Select...</option>
                          <option value="none">NONE</option>
                          <option value="flag">Flag</option>
                        </select>
                        {faQcStatus === "flag" && (
                          <div className="w-56">
                            <label className="text-xs text-gray-500 block mb-0.5 text-right">
                              Which flag(s)? <span className="text-red-500">*</span>
                            </label>
                            <input
                              className={`w-full border rounded-md p-1.5 text-xs ${
                                !faQcComment.trim() ? "bg-gray-100" : ""
                              }`}
                              placeholder="Required — e.g. lcr, segdup"
                              value={faQcComment}
                              onChange={(e) => setFaQcComment(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </FieldRow>

                    {hasQualityFlag && (
                      <div className="px-3 py-2.5 bg-amber-50">
                        <p className="flex items-start gap-1.5 text-amber-700 text-xs mb-2">
                          <AlertTriangle className="h-3.5 w-3.5 flex-none mt-0.5" />
                          Quality flag raised &mdash; automatic scoring is disabled. A manual value and rationale
                          are required before POP_FRQ can be scored.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-0.5">
                              POP_FRQ value <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. -3.0"
                              className={`w-full border rounded-md p-2 font-mono text-xs ${
                                popFrqOverrideValue.trim() === "" ? "bg-gray-100" : ""
                              }`}
                              value={popFrqOverrideValue}
                              onChange={(e) => setPopFrqOverrideValue(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-0.5">
                              Rationale <span className="text-red-500">*</span>
                            </label>
                            <input
                              placeholder="Required — why this value was chosen"
                              className={`w-full border rounded-md p-2 text-xs ${
                                !popFrqRationale.trim() ? "bg-gray-100" : ""
                              }`}
                              value={popFrqRationale}
                              onChange={(e) => setPopFrqRationale(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="px-3 py-2.5">
                      <label className="text-xs text-gray-700 block mb-1.5">Comment for Summary</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md p-2 text-xs"
                        rows={2}
                        placeholder="Summary text of POP_FRQ assessment"
                        value={popFrqComment}
                        onChange={(e) => setPopFrqComment(e.target.value)}
                      />
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* ---------------- POP_HMZ ---------------- */}
              <div className={`py-3 border-b border-gray-200 ${popHmzStatus === "na" ? "bg-gray-50" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={`font-serif text-xs font-bold ${
                      popHmzStatus === "na" ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    POP_HMZ &mdash; Homozygous / Hemizygous Occurrences
                  </h3>
                  <div className="flex items-center gap-2">
                    <CodeStatusSelect
                      status={popHmzStatus}
                      onChange={(v) => setPopHmzStatus(v)}
                    />
                    <CodeStatusBadge
                      code="POP_HMZ"
                      status={popHmzStatus}
                      rawValue={popHmzValue}
                      ready={true}
                    />
                  </div>
                </div>

                <fieldset
                  disabled={popHmzStatus !== "score"}
                  className={`border-0 m-0 p-0 min-w-0 ${popHmzStatus !== "score" ? "opacity-60" : ""}`}
                >
                  <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                    <FieldRow
                      split
                      label="Number of homozygotes/hemizygotes"
                      info={
                        popHmzCount.trim() === "" ? (
                          <span className="text-gray-500">
                            Not yet populated -- fetch gnomAD data below, or enter manually.
                          </span>
                        ) : (
                          <span className="text-indigo-600">
                            Auto-populated from gnomAD's total homozygote count (below). Edit if a different source
                            applies.
                          </span>
                        )
                      }
                    >
                      <input
                        type="number"
                        step="1"
                        className="w-40 border rounded-md p-1.5 text-xs font-mono"
                        value={popHmzCount}
                        onChange={(e) => setPopHmzCount(e.target.value)}
                      />
                    </FieldRow>

                    <FieldRow split label="Homozygote/hemizygote count source">
                      <input
                        className="w-56 border rounded-md p-1.5 text-xs"
                        value={popHmzSource}
                        onChange={(e) => setPopHmzSource(e.target.value)}
                      />
                    </FieldRow>

                    <div className="px-3 py-2.5">
                      <label className="text-xs text-gray-700 block mb-1.5">Comment for Summary</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md p-2 text-xs"
                        rows={2}
                        placeholder="Summary text of POP_HMZ assessment"
                        value={popHmzComment}
                        onChange={(e) => setPopHmzComment(e.target.value)}
                      />
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================== gnomAD GroupMax FAF TABLE ==================== */}
      <Card tone="reference">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>gnomAD v4 GroupMax Filtering Allele Frequency</CardTitle>
            <a
              href="https://gnomad.broadinstitute.org/variant/17-7676154-C-G?dataset=gnomad_r4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-xs font-medium flex items-center gap-1 flex-none"
            >
              Link to variant in gnomAD v4 <ExternalLinkIconSvg />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR className="border-b-2 border-gray-200">
                  <TH></TH>
                  <TH className="text-center">Exomes</TH>
                  <TH className="text-center">Genomes</TH>
                  <TH className="text-center">Total</TH>
                </TR>
              </THead>
              <TBody>
                <TR className="border-b border-gray-100">
                  <TD className="font-medium text-gray-700">Filters</TD>
                  <TD className="text-center">
                    <Badge className="bg-green-100 text-green-800">{GNOMAD_FAF.exomeFilters}</Badge>
                  </TD>
                  <TD className="text-center">
                    <Badge className="bg-green-100 text-green-800">{GNOMAD_FAF.genomeFilters}</Badge>
                  </TD>
                  <TD></TD>
                </TR>
                <TR className="border-b border-gray-100">
                  <TD className="font-medium text-gray-700">Allele Count</TD>
                  <TD className="text-center font-mono">{GNOMAD_FAF.exomeAc.toLocaleString()}</TD>
                  <TD className="text-center font-mono">{GNOMAD_FAF.genomeAc.toLocaleString()}</TD>
                  <TD className="text-center font-mono font-semibold">{GNOMAD_FAF.totalAc.toLocaleString()}</TD>
                </TR>
                <TR className="border-b border-gray-100">
                  <TD className="font-medium text-gray-700">Allele Number</TD>
                  <TD className="text-center font-mono">{GNOMAD_FAF.exomeAn.toLocaleString()}</TD>
                  <TD className="text-center font-mono">{GNOMAD_FAF.genomeAn.toLocaleString()}</TD>
                  <TD className="text-center font-mono font-semibold">{GNOMAD_FAF.totalAn.toLocaleString()}</TD>
                </TR>
                <TR className="border-b border-gray-100">
                  <TD className="font-medium text-gray-700">Allele Frequency</TD>
                  <TD className="text-center font-mono">{GNOMAD_FAF.exomeAf}</TD>
                  <TD className="text-center font-mono">{GNOMAD_FAF.genomeAf}</TD>
                  <TD className="text-center font-mono font-semibold">{GNOMAD_FAF.totalAf}</TD>
                </TR>
                <TR className="border-b border-gray-100">
                  <TD className="font-medium text-gray-700">
                    Grpmax Filtering AF <span className="text-gray-500">(95% CI)</span>
                  </TD>
                  <TD className="text-center font-mono">{GNOMAD_FAF.exomeGrpmaxFaf}</TD>
                  <TD className="text-center font-mono">{GNOMAD_FAF.genomeGrpmaxFaf}</TD>
                  <TD className="text-center font-mono font-semibold">{GNOMAD_FAF.totalGrpmaxFaf}</TD>
                </TR>
                <TR className="border-b border-gray-100">
                  <TD className="font-medium text-gray-700">Number of homozygotes</TD>
                  <TD className="text-center font-mono">{GNOMAD_FAF.exomeHom.toLocaleString()}</TD>
                  <TD className="text-center font-mono">{GNOMAD_FAF.genomeHom.toLocaleString()}</TD>
                  <TD className="text-center font-mono font-semibold">{GNOMAD_FAF.totalHom.toLocaleString()}</TD>
                </TR>
                <TR>
                  <TD className="font-medium text-gray-700">Flags</TD>
                  <TD className="text-center"><Badge className="bg-gray-100 text-gray-700">None</Badge></TD>
                  <TD></TD>
                  <TD></TD>
                </TR>
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ==================== gnomAD ANCESTRY BREAKDOWN ==================== */}
      <Disclosure
        title="gnomAD 17-7676154-C-G (GRCh38) Version: 4.1"
        description="Per-ancestry allele counts, numbers, homozygotes and frequency"
        defaultOpen={false}
      >
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR className="border-b-2 border-gray-200">
                <TH>Genetic Ancestry Group</TH>
                <TH className="text-center">Allele Count</TH>
                <TH className="text-center">Allele Number</TH>
                <TH className="text-center">Homozygotes</TH>
                <TH className="text-center">Allele Frequency</TH>
              </TR>
            </THead>
            <TBody>
              {ANCESTRY_ROWS.map((r) => (
                <TR key={r.group} className="border-b border-gray-100 hover:bg-gray-50">
                  <TD className="font-medium">{r.group}</TD>
                  <TD className="text-center font-mono">{r.ac.toLocaleString()}</TD>
                  <TD className="text-center font-mono">{r.an.toLocaleString()}</TD>
                  <TD className="text-center font-mono">{r.hom.toLocaleString()}</TD>
                  <TD className="text-center font-mono">{r.af}</TD>
                </TR>
              ))}
              {SEX_ROWS.map((r) => (
                <TR key={r.group} className="border-b border-gray-100 bg-gray-50">
                  <TD className="font-semibold">{r.group}</TD>
                  <TD className="text-center font-mono font-semibold">{r.ac.toLocaleString()}</TD>
                  <TD className="text-center font-mono font-semibold">{r.an.toLocaleString()}</TD>
                  <TD className="text-center font-mono font-semibold">{r.hom.toLocaleString()}</TD>
                  <TD className="text-center font-mono font-semibold">{r.af}</TD>
                </TR>
              ))}
              <TR className="border-t-2 border-gray-300 bg-blue-50">
                <TD className="font-bold text-blue-800">Total</TD>
                <TD className="text-center font-mono font-bold text-blue-800">
                  {GNOMAD_FAF.totalAc.toLocaleString()}
                </TD>
                <TD className="text-center font-mono font-bold text-blue-800">
                  {GNOMAD_FAF.totalAn.toLocaleString()}
                </TD>
                <TD className="text-center font-mono font-bold text-blue-800">
                  {GNOMAD_FAF.totalHom.toLocaleString()}
                </TD>
                <TD className="text-center font-mono font-bold text-blue-800">{GNOMAD_FAF.totalAf}</TD>
              </TR>
            </TBody>
          </Table>
        </div>
      </Disclosure>

      {/* ==================== EXTERNAL DATA SOURCES ==================== */}
      <ExternalDataSourcesPanel
        sources={[
          {
            key: "gnomad",
            label: "gnomAD",
            description:
              "Population allele frequency, ancestry breakdown, and homozygote count above -- also feeds the VBC FAF / POP_HMZ scoring inputs.",
            status: "idle",
            lastFetchedAt: null,
            onRetry: () => {},
            retryDisabled: true,
          },
        ]}
      />
    </div>
  );
};

export default Population;
