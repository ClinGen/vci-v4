import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { FieldRow } from "../../ui/Modal";
import { ScoreBadge, ResultBadge } from "../../ui/ScoreBadge";
import { SaveEvidenceAndComplete } from "../../ui/MarkComplete";
import { LockedNotice } from "../../ui/LockedNotice";
import { CSpecGuidanceBanner } from "../../ui/CSpecGuidance";
import { Disclosure } from "../../ui/Disclosure";
import { MolecularMechanismMatrixField } from "../../ui/MolecularMechanismMatrixField";
import { ExtIcon } from "../../ui/ExtIcon";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/Table";
import ExternalDataSourcesPanel from "../../ExternalDataSourcesPanel";
import InSilicoPredictors from "./InSilicoPredictors";
import TranscriptInfo from "./TranscriptInfo";
import {
  PE_VARIANT_TYPE_LABEL,
  MIS_SPLICE_PREDICTOR_OPTIONS,
  GUIDANCE_DOC_LINKS,
} from "../../../lib/referenceData";
import { ucscLinkForGenomicHgvs } from "../../../lib/genomeBrowserLinks";
import { spliceAiLookupLink } from "../../../lib/spliceAiLink";

/* ------------------------------------------------------------------ */
/*  Scoring constants (from prototype scoring.js -- will move to       */
/*  lib/scoring.ts once the full engine is migrated)                   */
/* ------------------------------------------------------------------ */

const MIS_PREDICTOR_THRESHOLDS: Record<string, { direction: string; tiers: [number, number][] }> = {
  AlphaMissense: { direction: "ascending", tiers: [[0.070, -3.0], [0.099, -2.0], [0.169, -1.0], [0.791, 0.0], [0.905, 1.0], [0.971, 2.0], [0.989, 3.0], [Infinity, 4.0]] },
  BayesDel: { direction: "ascending", tiers: [[-0.520, -3.0], [-0.360, -2.0], [-0.180, -1.0], [0.129, 0.0], [0.269, 1.0], [0.409, 2.0], [0.499, 3.0], [Infinity, 4.0]] },
  ESM1b: { direction: "descending", tiers: [[-8.8, -4.0], [3.1, -3.0], [6.3, -2.0], [10.6, -1.0], [12.1, 0.0], [13.9, 1.0], [23.9, 2.0], [Infinity, 3.0]] },
  MutPred2: { direction: "ascending", tiers: [[0.010, -3.0], [0.031, -2.0], [0.197, -1.0], [0.391, 0.0], [0.736, 1.0], [0.828, 2.0], [0.931, 3.0], [Infinity, 4.0]] },
  REVEL: { direction: "ascending", tiers: [[0.016, -4.0], [0.052, -3.0], [0.183, -2.0], [0.290, -1.0], [0.643, 0.0], [0.772, 1.0], [0.878, 2.0], [0.931, 3.0], [Infinity, 4.0]] },
  VARITY_R: { direction: "ascending", tiers: [[0.036, -4.0], [0.063, -3.0], [0.116, -2.0], [0.251, -1.0], [0.674, 0.0], [0.841, 1.0], [0.914, 2.0], [0.964, 3.0], [Infinity, 4.0]] },
  VEST4: { direction: "ascending", tiers: [[0.077, -3.0], [0.302, -2.0], [0.449, -1.0], [0.763, 0.0], [0.860, 1.0], [0.908, 2.0], [0.964, 3.0], [Infinity, 4.0]] },
};

function misPredictorScore(predictor: string, scoreStr: string): number | null {
  const n = parseFloat(scoreStr);
  const table = MIS_PREDICTOR_THRESHOLDS[predictor];
  if (isNaN(n) || !table) return null;
  const effectiveScore = table.direction === "descending" ? -n : n;
  for (const [upperBound, pts] of table.tiers) {
    if (effectiveScore <= upperBound) return pts;
  }
  return null;
}

const EXON_RELEVANCE_LABEL: Record<string, string> = {
  all: "Residue present in all transcripts (100%)",
  most: "Residue present in most disease-specific/highly expressed transcripts (50%)",
  none: "Residue not expressed in clinically relevant transcripts (0%)",
};

const LOF_MECHANISM_LABEL: Record<string, string> = {
  established: "Established",
  likely: "Likely",
  suspected: "Suspected",
  uncertain: "Uncertain or not LoF",
};

const EXON_RELEVANCE_MATRIX_LABEL: Record<string, string> = {
  all: "All",
  most: "Most",
  few: "Few",
};

const MOLECULAR_MECHANISM_MATRIX: Record<string, Record<string, number>> = {
  all: { established: 1.0, likely: 0.5, suspected: 0.25, uncertain: 0.0 },
  most: { established: 0.5, likely: 0.25, suspected: 0.0, uncertain: 0.0 },
  few: { established: 0.0, likely: 0.0, suspected: 0.0, uncertain: 0.0 },
};

function molecularMechanismFraction(exonRelevance: string, lofMechanism: string): number | undefined {
  const row = MOLECULAR_MECHANISM_MATRIX[exonRelevance];
  return row ? row[lofMechanism] : undefined;
}

const SPL_ASSESSMENT_LABEL: Record<string, string> = {
  likely: "Splicing change likely -- an in silico splice predictor (e.g. SpliceAI, Pangolin) indicates the GT/AG dinucleotide change is predicted to disrupt normal splicing",
  uncertain: "Splicing change uncertain -- predictor score doesn't clearly support or rule out a splicing effect (+0.0)",
  unlikely: "Splicing change unlikely -- predictor indicates the variant is unlikely to disrupt normal splicing, e.g. a nearby cryptic or alternate splice site may compensate (−1.0)",
};

const SPL_SPA_REDUCE_TIERS: Record<string, { label: string; fraction: number }> = {
  "near-complete": { label: "Near complete or complete presence of aberrant product", fraction: 0.0 },
  substantial: { label: "Substantial presence of aberrant product", fraction: 0.25 },
  incomplete: { label: "Incomplete or no presence of aberrant product", fraction: 1.0 },
};

const SPL_SPA_BLUE_TIERS: Record<string, { label: string; points: number }> = {
  "clear-disruptive": { label: "Clear evidence of a disruptive splice effect", points: 2.0 },
  "some-disruptive": { label: "Some evidence of a disruptive splice effect", points: 1.0 },
  unconvincing: { label: "Unconvincing evidence of a splice effect", points: 0.0 },
  "some-no-effect": { label: "Some evidence of no splice effect", points: -1.0 },
  "convincing-no-effect": { label: "Convincing evidence of no splice effect", points: -2.0 },
};

const SPL_SPA_VIOLET_TIERS: Record<string, { label: string; points: number | null; reconsider?: boolean }> = {
  "near-complete": { label: "Near complete or complete presence of aberrant product", points: null, reconsider: true },
  "low-level": { label: "Low-level presence of aberrant product", points: 0.0 },
  "incomplete-or-no": { label: "Incomplete or no presence of aberrant product", points: -2.0 },
};

const MIS_SPL_ASSAY_BOOST_TIERS: Record<string, { label: string; fraction: number }> = {
  full: { label: "Near complete or complete presence of aberrant product", fraction: 1.0 },
  partial: { label: "Substantial presence of aberrant product", fraction: 0.5 },
  none: { label: "Incomplete or no presence of aberrant product (may need to reconsider Initial Evidence Points)", fraction: 0.0 },
};

function splSpaMode(assessment: string): string | null {
  if (assessment === "likely") return "reduce";
  if (assessment === "uncertain") return "independent-blue";
  if (assessment === "unlikely") return "independent-violet";
  return null;
}

/* ------------------------------------------------------------------ */
/*  Local scoring helpers                                              */
/* ------------------------------------------------------------------ */

function nulInitialScore(draft: PeDraft): number | null {
  if (draft.nulNmd === "predicted") {
    if (draft.nulAltStart === "none") return 6.0;
    if (draft.nulAltStart === "") return null;
    if (draft.nulAltStart === "predicted-rescue") {
      const map: Record<string, number> = { "retains-function": -1.0, ">50": 6.0, ">25": 4.0, ">10": 2.0, "<10": 0.0 };
      return map[draft.nulAltStartFunction] ?? null;
    }
    return null;
  }
  if (draft.nulNmd === "not-predicted") {
    const map: Record<string, number> = { ">50": 6.0, ">25": 4.0, ">10": 2.0, "<10": 0.0 };
    return map[draft.nulProteinImpact] ?? null;
  }
  return null;
}

function nulInitialCode(draft: PeDraft): string {
  return draft.nulNmd === "predicted" && draft.nulAltStart === "none" ? "NUL_PRD" : "CDS_PRD";
}

function splInitialScore(draft: PeDraft): number | null {
  if (draft.splAssessment === "uncertain") return 0.0;
  if (draft.splAssessment === "unlikely") return -1.0;
  if (draft.splAssessment === "likely") {
    if (draft.splNmd === "predicted") return 6.0;
    if (draft.splNmd === "not-predicted-frameshift") {
      const map: Record<string, number> = { ">50": 6.0, ">25": 4.0, ">10": 2.0, "<10": 0.0 };
      return map[draft.splProteinImpact] ?? null;
    }
    if (draft.splNmd === "not-predicted-no-frameshift") {
      const map: Record<string, number> = { rescue: -1.0, ">50": 6.0, ">25": 4.0, ">10": 2.0, "<=10-damaging": 1.0, "<=10-indeterminate": 0.0, "<=10-benign": -0.5 };
      return map[draft.splNoFrameshiftProteinImpact] ?? null;
    }
  }
  return null;
}

function molecularMechanismModifiedScore(initial: number | null, exonRelevance: string, lofMechanism: string): number | null {
  if (initial === null) return null;
  if (initial <= 0) return initial;
  const mult = molecularMechanismFraction(exonRelevance, lofMechanism);
  if (mult === undefined) return null;
  return initial * mult;
}

/* ------------------------------------------------------------------ */
/*  Draft state shape                                                  */
/* ------------------------------------------------------------------ */

interface PeDraft {
  variantType: string;
  // Nonsense
  nulNmd: string;
  nulAltStart: string;
  nulAltStartFunction: string;
  nulProteinImpact: string;
  nulLofMechanism: string;
  nulExonRelevance: string;
  // Canonical splice
  splPredictor: string;
  splPredictorVersion: string;
  splScore: string;
  splAssessment: string;
  splNmd: string;
  splProteinImpact: string;
  splNoFrameshiftProteinImpact: string;
  splLofMechanism: string;
  splExonRelevance: string;
  splSpaAssessment: string;
  // Missense - amino acid pathway
  misAaPredictor: string;
  misAaPredictorVersion: string;
  misAaScore: string;
  misAaExonRelevance: string;
  // Missense - splice pathway
  misSplPredictor: string;
  misSplPredictorVersion: string;
  misSplScore: string;
  misSplImpact: string;
  misSplSubpath: string;
  misSplUpperProteinImpact: string;
  misSplLowerProteinImpact: string;
  misSplExonRelevance: string;
  misSplLofMechanism: string;
  misSplAssay: string;
  misSplSpaAssessment: string;
  // Comment
  prdComment: string;
}

function emptyPeDraft(): PeDraft {
  return {
    variantType: "",
    nulNmd: "", nulAltStart: "", nulAltStartFunction: "", nulProteinImpact: "",
    nulLofMechanism: "", nulExonRelevance: "",
    splPredictor: "", splPredictorVersion: "", splScore: "",
    splAssessment: "", splNmd: "", splProteinImpact: "", splNoFrameshiftProteinImpact: "",
    splLofMechanism: "", splExonRelevance: "", splSpaAssessment: "",
    misAaPredictor: "REVEL", misAaPredictorVersion: "", misAaScore: "",
    misAaExonRelevance: "",
    misSplPredictor: "SpliceAI", misSplPredictorVersion: "", misSplScore: "",
    misSplImpact: "", misSplSubpath: "",
    misSplUpperProteinImpact: "", misSplLowerProteinImpact: "",
    misSplExonRelevance: "", misSplLofMechanism: "", misSplAssay: "", misSplSpaAssessment: "",
    prdComment: "",
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const PredictedEffect = () => {
  // Local scoring state
  const [isScoringActive, setIsScoringActive] = useState(false);
  const [peDraft, setPeDraft] = useState<PeDraft>(emptyPeDraft());
  const [pendingVariantType, setPendingVariantType] = useState<string | null>(null);
  const [evidenceSaved, setEvidenceSaved] = useState(false);
  const [sectionComplete, setSectionComplete] = useState(false);

  // TODO: These will come from shared variant context once state management is wired up.
  // For now, default inheritanceSet to true so scoring is accessible.
  const inheritanceSet = true;

  const updatePe = (key: keyof PeDraft, value: string) => setPeDraft({ ...peDraft, [key]: value });

  /* ---- Derived scoring values ---- */

  // Nonsense / canonical-splice initial score
  const peInitialScore =
    peDraft.variantType === "nonsense" ? nulInitialScore(peDraft) :
    peDraft.variantType === "canonical-splice" ? splInitialScore(peDraft) :
    null;
  const peInitialCode =
    peDraft.variantType === "nonsense" ? nulInitialCode(peDraft) :
    peDraft.variantType === "canonical-splice" ? "SPL_PRD" :
    "";

  // Molecular mechanism modified score
  const peModScore =
    peDraft.variantType === "nonsense"
      ? molecularMechanismModifiedScore(peInitialScore, peDraft.nulExonRelevance, peDraft.nulLofMechanism)
      : peDraft.variantType === "canonical-splice"
      ? molecularMechanismModifiedScore(peInitialScore, peDraft.splExonRelevance, peDraft.splLofMechanism)
      : null;
  const peModScoreDisplay = peModScore;

  const peReadyToShowScore = peDraft.variantType !== "" && peInitialScore !== null;

  // Missense amino acid pathway
  const misAaInitial = peDraft.misAaPredictor && peDraft.misAaScore
    ? misPredictorScore(peDraft.misAaPredictor, peDraft.misAaScore)
    : null;
  const misAaResult = {
    initial: misAaInitial,
    modified: misAaInitial !== null && misAaInitial > 0 && peDraft.misAaExonRelevance
      ? misAaInitial * ({ all: 1.0, most: 0.5, none: 0.0 }[peDraft.misAaExonRelevance] ?? 1.0)
      : misAaInitial,
  };
  const misAaModifiedDisplay = misAaResult.modified;

  // Missense splice pathway
  const misSplInitial = (() => {
    if (peDraft.misSplImpact === "uncertain") return 0.0;
    if (peDraft.misSplImpact === "unlikely") return -1.0;
    if (peDraft.misSplImpact === "likely") {
      if (peDraft.misSplSubpath === "yellow") return 3.0;
      if (peDraft.misSplSubpath === "upper-orange") {
        const map: Record<string, number> = { rescue: -1.0, ">50": 3.0, ">25": 2.0, ">10": 1.0, "<=10-damaging": 0.5, "<=10-indeterminate": 0.0, "<=10-benign": -0.5 };
        return map[peDraft.misSplUpperProteinImpact] ?? null;
      }
      if (peDraft.misSplSubpath === "lower-orange") {
        const map: Record<string, number> = { rescue: -1.0, ">50": 3.0, ">25": 2.0, ">10": 1.0, "<=10-damaging": 0.5, "<=10-indeterminate": 0.0, "<=10-benign": -0.5 };
        return map[peDraft.misSplLowerProteinImpact] ?? null;
      }
    }
    return null;
  })();

  const misSplModified = misSplInitial !== null && misSplInitial > 0
    ? molecularMechanismModifiedScore(misSplInitial, peDraft.misSplExonRelevance, peDraft.misSplLofMechanism)
    : misSplInitial;
  const misSplWithAssay = (() => {
    if (misSplModified === null || !peDraft.misSplAssay || peDraft.misSplAssay === "nd") return null;
    const tier = MIS_SPL_ASSAY_BOOST_TIERS[peDraft.misSplAssay];
    if (!tier) return null;
    return Math.max(0, Math.min(6, misSplModified + misSplModified * tier.fraction));
  })();
  const misSplResult = {
    initial: misSplInitial,
    modified: misSplModified,
    withAssay: misSplWithAssay,
    reconsider: false,
  };
  const misSplModifiedDisplay = misSplModified;

  // Canonical splice SPA combined
  const peSplCombined = (() => {
    if (peDraft.variantType !== "canonical-splice" || peModScore === null || !peDraft.splSpaAssessment) return null;
    if (peDraft.splSpaAssessment === "nd") return { combined: peModScore, spaDelta: 0, reconsider: false };
    const mode = splSpaMode(peDraft.splAssessment);
    if (mode === "reduce") {
      const tier = SPL_SPA_REDUCE_TIERS[peDraft.splSpaAssessment];
      if (!tier) return null;
      const reduced = peModScore * tier.fraction;
      return { combined: reduced, spaDelta: reduced - peModScore, reconsider: false };
    }
    if (mode === "independent-blue") {
      const tier = SPL_SPA_BLUE_TIERS[peDraft.splSpaAssessment];
      if (!tier) return null;
      return { combined: peModScore + tier.points, spaDelta: tier.points, reconsider: false };
    }
    if (mode === "independent-violet") {
      const tier = SPL_SPA_VIOLET_TIERS[peDraft.splSpaAssessment];
      if (!tier) return null;
      if (tier.reconsider) return { combined: null, spaDelta: null, reconsider: true };
      return { combined: peModScore + (tier.points ?? 0), spaDelta: tier.points, reconsider: false };
    }
    return null;
  })();

  // Placeholder for UCSC/SpliceAI links (will come from variant context)
  const displayGenomic38 = "";
  const displayGenomic37 = "";
  const ucscHg38 = ucscLinkForGenomicHgvs(displayGenomic38, "GRCh38");
  const ucscHg19 = ucscLinkForGenomicHgvs(displayGenomic37, "GRCh37");
  const spliceAiHref = spliceAiLookupLink(null, null, null, null);

  const guidanceLinks = peDraft.variantType
    ? (GUIDANCE_DOC_LINKS.predictedEffect as Record<string, { text: string; url: string }[]>)?.[peDraft.variantType]
    : undefined;

  return (
    <div className="space-y-4">
      {/* ==================== Scoring Card ==================== */}
      <Card tone="action" className="!bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Predicted Effect Scoring</CardTitle>
            <div className="flex items-center gap-3">
              {isScoringActive && peDraft.variantType && (
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
            <LockedNotice onGoToParameters={() => {/* navigate to general-information tab */}} />
          ) : !isScoringActive ? (
            <Button onClick={() => { setPeDraft(emptyPeDraft()); setIsScoringActive(true); setEvidenceSaved(false); }}>Start Scoring</Button>
          ) : (
            <div>
              {peDraft.variantType && guidanceLinks && (
                <CSpecGuidanceBanner links={guidanceLinks} />
              )}

              {/* ---- Variant Type ---- */}
              <div className="py-4 border-b border-gray-200">
                <h3 className="font-serif text-xs font-bold text-gray-900 mb-3">Variant Type</h3>
                <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                  <FieldRow label="Variant Type" required empty={!peDraft.variantType}>
                    <select
                      className="w-full border rounded-md p-2 bg-white text-xs"
                      value={peDraft.variantType}
                      onChange={(e) => {
                        const vt = e.target.value;
                        if (peDraft.variantType && vt !== peDraft.variantType) {
                          setPendingVariantType(vt);
                        } else {
                          setPeDraft({ ...emptyPeDraft(), variantType: vt });
                        }
                      }}
                    >
                      <option value="">Select variant type</option>
                      <option value="missense">Missense</option>
                      <option value="nonsense">Nonsense</option>
                      <option value="canonical-splice">Canonical Splice (GT donor/AG acceptor)</option>
                    </select>
                  </FieldRow>
                </div>
                {pendingVariantType !== null && (
                  <div className="mt-3 border-2 border-amber-300 bg-amber-50 rounded-md p-3">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 flex-none mt-0.5" />
                      Switching from {PE_VARIANT_TYPE_LABEL[peDraft.variantType]} to {PE_VARIANT_TYPE_LABEL[pendingVariantType]} will clear Initial Impact, Modify Impact, Functional Evidence, and Informative Variants data entered for this variant. This cannot be undone.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="bg-amber-700 hover:bg-amber-600 text-white"
                        onClick={() => {
                          const vt = pendingVariantType;
                          setPeDraft({ ...emptyPeDraft(), variantType: vt });
                          setEvidenceSaved(false);
                          setPendingVariantType(null);
                        }}
                      >
                        Confirm switch &amp; clear downstream data
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setPendingVariantType(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* ---- Initial Impact (nonsense) ---- */}
              {peDraft.variantType === "nonsense" && (
                <div className="py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-xs font-bold text-gray-900">Initial Impact -- {PE_VARIANT_TYPE_LABEL[peDraft.variantType]}</h3>
                    {peReadyToShowScore && peInitialScore !== null
                      ? <ScoreBadge code={`${peInitialCode}_IE`} value={peInitialScore} size="sm" />
                      : <ResultBadge code={peInitialCode ? `${peInitialCode}_IE` : "PRD_IE"} />}
                  </div>
                  <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                    <FieldRow label="NMD Prediction" required empty={!peDraft.nulNmd}>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-start gap-2 text-xs">
                          <input type="radio" className="mt-1" checked={peDraft.nulNmd === "predicted"} onChange={() => setPeDraft({ ...peDraft, nulNmd: "predicted", nulAltStart: "", nulAltStartFunction: "", nulProteinImpact: "" })} />
                          NMD is predicted: introduced PTC is &gt;50nt upstream of the last exon-exon boundary
                        </label>
                        <label className="flex items-start gap-2 text-xs">
                          <input type="radio" className="mt-1" checked={peDraft.nulNmd === "not-predicted"} onChange={() => setPeDraft({ ...peDraft, nulNmd: "not-predicted", nulAltStart: "", nulAltStartFunction: "", nulProteinImpact: "" })} />
                          NMD is not predicted: PTC in last/only exon, gene doesn't undergo NMD, or VBC within 50nt of the last exon-exon boundary
                        </label>
                      </div>
                    </FieldRow>
                    {peDraft.nulNmd === "predicted" && (
                      <FieldRow label="Alternative Start Codon">
                        <div className="flex flex-col gap-2">
                          <label className="flex items-start gap-2 text-xs">
                            <input type="radio" className="mt-1" checked={peDraft.nulAltStart === "none"} onChange={() => updatePe("nulAltStart", "none")} />
                            No known alternate functional start codon 3' of VBC -- <b className="ml-1">+6.0, NUL_PRD</b>
                          </label>
                          <label className="flex items-start gap-2 text-xs">
                            <input type="radio" className="mt-1" checked={peDraft.nulAltStart === "predicted-rescue"} onChange={() => updatePe("nulAltStart", "predicted-rescue")} />
                            Putative alternative start codon 3' of VBC with functional or genetic evidence -- evaluate its protein impact (code becomes CDS_PRD)
                          </label>
                        </div>
                      </FieldRow>
                    )}
                    {peDraft.nulAltStart === "predicted-rescue" && (
                      <FieldRow label="Initial Evidence Points">
                        <select className="w-full border rounded-md p-2 bg-white text-xs" value={peDraft.nulAltStartFunction} onChange={(e) => updatePe("nulAltStartFunction", e.target.value)}>
                          <option value="">Select...</option>
                          <option value="retains-function">Functional data shows shorter protein using the alternative inframe start retains function vs. full-length transcript ({"−"}1.0)</option>
                          <option value=">50">Removes/alters &gt;50% of protein OR use of alternative start removes/alters an entire critical functional domain implicated in the Molecular Mechanism (+6.0)</option>
                          <option value=">25">Removes/alters &gt;25% of protein OR use of alternative start removes/alters a portion of a critical functional domain implicated in the Molecular Mechanism (+4.0)</option>
                          <option value=">10">Removes/alters &gt;10% of protein OR use of alternative start removes/alters a region with some evidence in the Molecular Mechanism (+2.0)</option>
                          <option value="<10">Removes/alters &lt;10% of protein OR use of alternative start impacts a region with unknown/no known function in the Molecular Mechanism (0.0)</option>
                        </select>
                      </FieldRow>
                    )}
                    {peDraft.nulNmd === "not-predicted" && (
                      <FieldRow label="Initial Evidence Points">
                        <select className="w-full border rounded-md p-2 bg-white text-xs" value={peDraft.nulProteinImpact} onChange={(e) => updatePe("nulProteinImpact", e.target.value)}>
                          <option value="">Select...</option>
                          <option value=">50">Removes/alters &gt;50% of protein OR removes/alters entire critical functional domain implicated in the Molecular Mechanism (+6.0)</option>
                          <option value=">25">Removes/alters &gt;25% of protein OR removes/alters a portion of a critical functional domain implicated in the Molecular Mechanism (+4.0)</option>
                          <option value=">10">Removes/alters &gt;10% of protein OR removes/alters a region with some evidence in the Molecular Mechanism (+2.0)</option>
                          <option value="<10">Removes/alters &lt;10% of protein OR role of region in protein function is unknown (0.0)</option>
                        </select>
                      </FieldRow>
                    )}
                  </div>
                </div>
              )}

              {/* ---- Initial Impact (canonical-splice) ---- */}
              {peDraft.variantType === "canonical-splice" && (
                <div className="py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-xs font-bold text-gray-900">Initial Impact -- {PE_VARIANT_TYPE_LABEL[peDraft.variantType]}</h3>
                    {peReadyToShowScore && peInitialScore !== null
                      ? <ScoreBadge code="SPL_PRD_IE" value={peInitialScore} size="sm" />
                      : <ResultBadge code="SPL_PRD_IE" />}
                  </div>
                  <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                    <div className="flex flex-col gap-1.5 py-1.5 px-3 border-l-2 border-blue-300">
                      <label className="text-xs font-medium text-gray-700">In silico splice predictor</label>
                      <div className="flex gap-1.5">
                        <select className="flex-1 min-w-0 border rounded p-1 text-xs bg-white" value={peDraft.splPredictor} onChange={(e) => updatePe("splPredictor", e.target.value)}>
                          <option value="">Select...</option>
                          {MIS_SPLICE_PREDICTOR_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input placeholder="version" className="w-14 flex-none border rounded p-1 text-xs" value={peDraft.splPredictorVersion} onChange={(e) => updatePe("splPredictorVersion", e.target.value)} />
                        <input type="number" step="any" placeholder="score" className="w-16 flex-none border rounded p-1 text-xs font-mono" value={peDraft.splScore} onChange={(e) => updatePe("splScore", e.target.value)} />
                      </div>
                    </div>
                    <FieldRow label="Splicing Change Assessment" required empty={!peDraft.splAssessment}>
                      <select
                        className="w-full border rounded-md p-2 bg-white text-xs"
                        value={peDraft.splAssessment}
                        onChange={(e) => setPeDraft({ ...peDraft, splAssessment: e.target.value, splNmd: "", splProteinImpact: "", splNoFrameshiftProteinImpact: "", splLofMechanism: "", splExonRelevance: "", splSpaAssessment: "" })}
                      >
                        <option value="">Select...</option>
                        {Object.entries(SPL_ASSESSMENT_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                      </select>
                    </FieldRow>
                    {peDraft.splAssessment === "likely" && (
                      <FieldRow label="NMD Impact">
                        <select className="w-full border rounded-md p-2 bg-white text-xs" value={peDraft.splNmd} onChange={(e) => setPeDraft({ ...peDraft, splNmd: e.target.value, splProteinImpact: "", splNoFrameshiftProteinImpact: "", splLofMechanism: "", splExonRelevance: "", splSpaAssessment: "" })}>
                          <option value="">Select...</option>
                          <option value="predicted">NMD predicted (+6.0)</option>
                          <option value="not-predicted-frameshift">NMD not predicted, disrupts reading frame -- evaluate protein impact</option>
                          <option value="not-predicted-no-frameshift">NMD not predicted, no reading-frame impact -- evaluate protein impact</option>
                        </select>
                      </FieldRow>
                    )}
                    {peDraft.splNmd === "not-predicted-frameshift" && (
                      <FieldRow label="Protein Impact">
                        <select className="w-full border rounded-md p-2 bg-white text-xs" value={peDraft.splProteinImpact} onChange={(e) => updatePe("splProteinImpact", e.target.value)}>
                          <option value="">Select...</option>
                          <option value=">50">Removes/alters &gt;50% of protein (+6.0)</option>
                          <option value=">25">Removes/alters &gt;25% of protein (+4.0)</option>
                          <option value=">10">Removes/alters &gt;10% of protein (+2.0)</option>
                          <option value="<10">Removes/alters &lt;10% of protein (+0.0)</option>
                        </select>
                      </FieldRow>
                    )}
                    {peDraft.splNmd === "not-predicted-no-frameshift" && (
                      <FieldRow label="Protein Impact">
                        <select className="w-full border rounded-md p-2 bg-white text-xs" value={peDraft.splNoFrameshiftProteinImpact} onChange={(e) => updatePe("splNoFrameshiftProteinImpact", e.target.value)}>
                          <option value="">Select...</option>
                          <option value="rescue">Alternative start codon known to rescue 5' introduced PTC ({"−"}1.0)</option>
                          <option value=">50">Removes/alters &gt;50% of protein OR removes/alters entire critical functional domain implicated in the Molecular Mechanism (+6.0)</option>
                          <option value=">25">Removes/alters &gt;25% of protein OR removes/alters a portion of a critical functional domain implicated in the Molecular Mechanism (+4.0)</option>
                          <option value=">10">Removes/alters &gt;10% of protein OR removes/alters a region with some evidence in the Molecular Mechanism (+2.0)</option>
                          <option value="<=10-damaging">Removes/alters {"≤"}10% of protein AND an in silico protein-deletion tool suggests a damaging impact (+1.0)</option>
                          <option value="<=10-indeterminate">Removes/alters {"≤"}10% of protein AND no in silico protein-deletion tool score is available or is indeterminate (0.0)</option>
                          <option value="<=10-benign">Removes/alters {"≤"}10% of protein AND an in silico protein-deletion tool suggests a benign impact ({"−"}0.5)</option>
                        </select>
                      </FieldRow>
                    )}
                  </div>
                </div>
              )}

              {/* ---- Molecular Mechanism and Exon Relevance (nonsense / canonical-splice) ---- */}
              {peDraft.variantType && peDraft.variantType !== "missense" && peInitialScore !== null && (
                <div className="py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-xs font-bold text-gray-900">Molecular Mechanism and Exon Relevance</h3>
                    {peModScoreDisplay !== null
                      ? <ScoreBadge code={peInitialCode} value={peModScoreDisplay} />
                      : <ResultBadge code={peInitialCode || "PRD"} />}
                  </div>
                  {peInitialScore > 0 && (
                    <MolecularMechanismMatrixField
                      lofMechanism={peDraft.variantType === "nonsense" ? peDraft.nulLofMechanism : peDraft.splLofMechanism}
                      exonRelevance={peDraft.variantType === "nonsense" ? peDraft.nulExonRelevance : peDraft.splExonRelevance}
                      onLofMechanismChange={(v) => updatePe(peDraft.variantType === "nonsense" ? "nulLofMechanism" : "splLofMechanism", v)}
                      onExonRelevanceChange={(v) => updatePe(peDraft.variantType === "nonsense" ? "nulExonRelevance" : "splExonRelevance", v)}
                      lofMechanismLabel={LOF_MECHANISM_LABEL}
                      exonRelevanceLabel={EXON_RELEVANCE_MATRIX_LABEL}
                      initialScore={peInitialScore}
                      modifiedScore={peModScore}
                      fraction={molecularMechanismFraction(
                        peDraft.variantType === "nonsense" ? peDraft.nulExonRelevance : peDraft.splExonRelevance,
                        peDraft.variantType === "nonsense" ? peDraft.nulLofMechanism : peDraft.splLofMechanism,
                      )}
                      matrixFractionFn={molecularMechanismFraction}
                    />
                  )}
                </div>
              )}

              {/* ---- Splicing Assay Evidence (canonical-splice only) ---- */}
              {peDraft.variantType === "canonical-splice" && peModScore !== null && (
                <div className="py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-xs font-bold text-gray-900">Splicing Assay Evidence</h3>
                    {peReadyToShowScore && peSplCombined && peSplCombined.combined !== null && peDraft.splSpaAssessment
                      ? <ScoreBadge code="SPL_PRD_/SPA_" value={peSplCombined.combined} size="sm" />
                      : <ResultBadge code="SPL_SPA" />}
                  </div>
                  <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                    <FieldRow label="Splice Assay Result">
                      <div className="flex flex-col gap-2">
                        <label className="flex items-start gap-2 text-xs">
                          <input type="radio" className="mt-1" checked={peDraft.splSpaAssessment === "nd"} onChange={() => updatePe("splSpaAssessment", "nd")} />
                          No splicing data available -- <b className="ml-1">SPL_SPA_ND</b>
                        </label>
                        {splSpaMode(peDraft.splAssessment) === "reduce" && Object.entries(SPL_SPA_REDUCE_TIERS).map(([key, tier]) => (
                          <label key={key} className="flex items-start gap-2 text-xs">
                            <input type="radio" className="mt-1" checked={peDraft.splSpaAssessment === key} onChange={() => updatePe("splSpaAssessment", key)} />
                            {tier.label} -- reduces the prediction above by <b className="ml-1">{Math.round(tier.fraction * 100)}%</b>
                          </label>
                        ))}
                        {splSpaMode(peDraft.splAssessment) === "independent-blue" && Object.entries(SPL_SPA_BLUE_TIERS).map(([key, tier]) => (
                          <label key={key} className="flex items-start gap-2 text-xs">
                            <input type="radio" className="mt-1" checked={peDraft.splSpaAssessment === key} onChange={() => updatePe("splSpaAssessment", key)} />
                            {tier.label} -- <b className="ml-1">{tier.points > 0 ? `+${tier.points.toFixed(1)}` : tier.points < 0 ? `−${Math.abs(tier.points).toFixed(1)}` : "0.0"}</b>
                          </label>
                        ))}
                        {splSpaMode(peDraft.splAssessment) === "independent-violet" && Object.entries(SPL_SPA_VIOLET_TIERS).map(([key, tier]) => (
                          <label key={key} className="flex items-start gap-2 text-xs">
                            <input type="radio" className="mt-1" checked={peDraft.splSpaAssessment === key} onChange={() => updatePe("splSpaAssessment", key)} />
                            {tier.reconsider ? (
                              <>{tier.label} -- <b className="ml-1 text-amber-700">reconsider path</b></>
                            ) : (
                              <>{tier.label} -- <b className="ml-1">{(tier.points ?? 0) < 0 ? `−${Math.abs(tier.points ?? 0).toFixed(1)}` : `${(tier.points ?? 0).toFixed(1)}`}</b></>
                            )}
                          </label>
                        ))}
                      </div>
                    </FieldRow>
                  </div>
                  {peSplCombined && peSplCombined.reconsider && (
                    <div className="mt-3 border-2 border-amber-300 bg-amber-50 rounded-md p-3 text-xs text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 flex-none mt-0.5" />
                      The splice assay contradicts the "unlikely" in silico prediction -- re-evaluate which path of the flow diagram applies to this VBC.
                    </div>
                  )}
                  {peSplCombined && !peSplCombined.reconsider && peSplCombined.spaDelta !== null && (
                    <div className="mt-2 text-xs text-indigo-600">
                      SPL_SPA_ {peSplCombined.spaDelta >= 0 ? `+${peSplCombined.spaDelta.toFixed(2)}` : `−${Math.abs(peSplCombined.spaDelta).toFixed(2)}`}
                      {" "}(combined: {peModScore.toFixed(1)} {peSplCombined.spaDelta >= 0 ? "+" : "−"} {Math.abs(peSplCombined.spaDelta).toFixed(2)} = {peSplCombined.combined !== null ? peSplCombined.combined.toFixed(1) : "--"})
                    </div>
                  )}
                </div>
              )}

              {/* ---- Missense: dual pathway ---- */}
              {peDraft.variantType === "missense" && (
                <div className="py-4">
                  <h3 className="font-serif text-xs font-bold text-gray-900 mb-3">Initial Impact -- Dual Pathway</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Missense Effect pathway */}
                    <div className="border border-blue-200 rounded-md bg-white">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-blue-100 bg-white">
                        <span className="text-xs font-semibold text-gray-800">Missense Effect</span>
                        {misAaModifiedDisplay !== null && misAaModifiedDisplay !== undefined
                          ? <ScoreBadge code="MIS_PRD_" value={misAaModifiedDisplay} />
                          : <ResultBadge code="MIS_PRD_" />}
                      </div>
                      <div className="p-3">
                        <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                          <div className="flex flex-col gap-1.5 py-1.5 px-3 border-l-2 border-blue-300">
                            <label className="text-xs font-medium text-gray-700">In silico predictor</label>
                            <div className="flex gap-1.5">
                              <select
                                className="flex-1 min-w-0 border rounded p-1 text-xs bg-white"
                                value={peDraft.misAaPredictor}
                                onChange={(e) => setPeDraft({ ...peDraft, misAaPredictor: e.target.value, misAaPredictorVersion: "", misAaScore: "" })}
                              >
                                <option value="">Select...</option>
                                {Object.keys(MIS_PREDICTOR_THRESHOLDS).map((p) => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <input placeholder="version" className="w-14 flex-none border rounded p-1 text-xs" value={peDraft.misAaPredictorVersion} onChange={(e) => updatePe("misAaPredictorVersion", e.target.value)} />
                              <input type="number" step="any" placeholder="score" className="w-16 flex-none border rounded p-1 text-xs font-mono" value={peDraft.misAaScore} onChange={(e) => updatePe("misAaScore", e.target.value)} />
                            </div>
                          </div>
                          {misAaResult.initial !== null && (
                            <FieldRow dense label="Initial Evidence Points">
                              <ScoreBadge code="MIS_PRD_IE" value={misAaResult.initial} size="sm" />
                            </FieldRow>
                          )}
                          {misAaResult.initial !== null && misAaResult.initial > 0 && (
                            <FieldRow dense label="Exon relevance">
                              <select className="w-full border rounded p-1 bg-white text-xs" value={peDraft.misAaExonRelevance} onChange={(e) => updatePe("misAaExonRelevance", e.target.value)}>
                                <option value="">Select...</option>
                                {Object.entries(EXON_RELEVANCE_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                              </select>
                            </FieldRow>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Splice Effect pathway */}
                    <div className="border border-blue-200 rounded-md bg-white">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-blue-100 bg-white">
                        <span className="text-xs font-semibold text-gray-800">Splice Effect</span>
                        {misSplModifiedDisplay !== null && misSplModifiedDisplay !== undefined
                          ? <ScoreBadge code="SPL_PRD_" value={misSplModifiedDisplay} />
                          : <ResultBadge code="SPL_PRD_" />}
                      </div>
                      <div className="p-3 space-y-3">
                        <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                          <div className="flex flex-col gap-1.5 py-1.5 px-3 border-l-2 border-blue-300">
                            <label className="text-xs font-medium text-gray-700">In silico predictor</label>
                            <div className="flex gap-1.5">
                              <select className="flex-1 min-w-0 border rounded p-1 text-xs bg-white" value={peDraft.misSplPredictor} onChange={(e) => updatePe("misSplPredictor", e.target.value)}>
                                {MIS_SPLICE_PREDICTOR_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                              </select>
                              <input placeholder="version" className="w-14 flex-none border rounded p-1 text-xs" value={peDraft.misSplPredictorVersion} onChange={(e) => updatePe("misSplPredictorVersion", e.target.value)} />
                              <input type="number" step="any" placeholder="score" className="w-16 flex-none border rounded p-1 text-xs font-mono" value={peDraft.misSplScore} onChange={(e) => updatePe("misSplScore", e.target.value)} />
                            </div>
                          </div>
                          <FieldRow dense label="Predicted splice impact">
                            <select
                              className="border rounded p-1 text-xs bg-white"
                              value={peDraft.misSplImpact}
                              onChange={(e) => setPeDraft({ ...peDraft, misSplImpact: e.target.value, misSplSubpath: "", misSplUpperProteinImpact: "", misSplLowerProteinImpact: "", misSplExonRelevance: "", misSplLofMechanism: "", misSplAssay: "", misSplSpaAssessment: "" })}
                            >
                              <option value="">Select...</option>
                              <option value="likely">Likely</option>
                              <option value="uncertain">Uncertain</option>
                              <option value="unlikely">Unlikely</option>
                            </select>
                          </FieldRow>
                          {peDraft.misSplImpact === "likely" && (
                            <FieldRow dense label="Sub-path">
                              <select className="border rounded p-1 text-xs bg-white w-full" value={peDraft.misSplSubpath} onChange={(e) => setPeDraft({ ...peDraft, misSplSubpath: e.target.value, misSplUpperProteinImpact: "", misSplLowerProteinImpact: "", misSplExonRelevance: "", misSplLofMechanism: "", misSplAssay: "" })}>
                                <option value="">Select...</option>
                                <option value="yellow">Frameshift + NMD predicted (yellow)</option>
                                <option value="upper-orange">Frameshift, NMD not predicted (orange)</option>
                                <option value="lower-orange">No frameshift, NMD not predicted (orange)</option>
                              </select>
                            </FieldRow>
                          )}
                        </div>

                        {peDraft.misSplImpact === "likely" && peDraft.misSplSubpath === "yellow" && misSplResult.initial !== null && (
                          <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                            <FieldRow dense label="Initial Evidence Points">
                              <div className="flex items-center gap-2">
                                <ScoreBadge code="SPL_PRD_IE" value={misSplResult.initial} size="sm" />
                                <span className="text-xs text-gray-600">NMD via splice predicted</span>
                              </div>
                            </FieldRow>
                          </div>
                        )}

                        {peDraft.misSplImpact === "likely" && (peDraft.misSplSubpath === "upper-orange" || peDraft.misSplSubpath === "lower-orange") && (
                          <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                            <FieldRow dense label="Initial Evidence Points">
                              <select
                                className="w-full border rounded p-1 bg-white text-xs"
                                value={peDraft.misSplSubpath === "upper-orange" ? peDraft.misSplUpperProteinImpact : peDraft.misSplLowerProteinImpact}
                                onChange={(e) => updatePe(peDraft.misSplSubpath === "upper-orange" ? "misSplUpperProteinImpact" : "misSplLowerProteinImpact", e.target.value)}
                              >
                                <option value="">Select...</option>
                                <option value="rescue">Alternative start codon known to rescue 5' introduced PTC ({"−"}1.0)</option>
                                <option value=">50">Removes/alters &gt;50% of protein OR removes/alters entire critical functional domain implicated in the Molecular Mechanism (+3.0)</option>
                                <option value=">25">Removes/alters &gt;25% of protein OR removes/alters a portion of a critical functional domain implicated in the Molecular Mechanism (+2.0)</option>
                                <option value=">10">Removes/alters &gt;10% of protein OR removes/alters a region with some evidence in the Molecular Mechanism (+1.0)</option>
                                <option value="<=10-damaging">Removes/alters {"≤"}10% of protein AND an in silico inframe predictive tool suggests a damaging impact (+0.5)</option>
                                <option value="<=10-indeterminate">Removes/alters {"≤"}10% of protein AND no in silico inframe predictive tool score is available or is indeterminate (0.0)</option>
                                <option value="<=10-benign">Removes/alters {"≤"}10% of protein AND an in silico inframe predictive tool suggests a benign impact ({"−"}0.5)</option>
                              </select>
                            </FieldRow>
                          </div>
                        )}

                        {/* Molecular Mechanism matrix for missense splice "likely" path */}
                        {peDraft.misSplImpact === "likely" && peDraft.misSplSubpath && misSplResult.initial !== null && misSplResult.initial > 0 && (
                          <MolecularMechanismMatrixField
                            lofMechanism={peDraft.misSplLofMechanism}
                            exonRelevance={peDraft.misSplExonRelevance}
                            onLofMechanismChange={(v) => updatePe("misSplLofMechanism", v)}
                            onExonRelevanceChange={(v) => updatePe("misSplExonRelevance", v)}
                            lofMechanismLabel={LOF_MECHANISM_LABEL}
                            exonRelevanceLabel={EXON_RELEVANCE_MATRIX_LABEL}
                            initialScore={misSplResult.initial}
                            modifiedScore={misSplResult.modified}
                            fraction={molecularMechanismFraction(peDraft.misSplExonRelevance, peDraft.misSplLofMechanism)}
                            matrixFractionFn={molecularMechanismFraction}
                          />
                        )}

                        {/* Splicing Assay for missense splice "likely" path */}
                        {peDraft.misSplImpact === "likely" && peDraft.misSplSubpath && misSplResult.modified !== null && (
                          <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                            <FieldRow label="Splice Assay Result">
                              <div className="flex flex-col gap-2">
                                <div className="flex justify-end -mt-1 mb-1">
                                  {peDraft.misSplAssay && peDraft.misSplAssay !== "nd" && misSplResult.withAssay !== null
                                    ? <ScoreBadge code="SPL_SPA_" value={misSplResult.withAssay - (misSplResult.modified ?? 0)} size="sm" />
                                    : <ResultBadge code="SPL_SPA_" />}
                                </div>
                                <label className="flex items-start gap-2 text-xs">
                                  <input type="radio" className="mt-1" checked={peDraft.misSplAssay === "nd"} onChange={() => updatePe("misSplAssay", "nd")} />
                                  No splicing data available -- <b className="ml-1">SPL_SPA_ND</b>
                                </label>
                                {Object.entries(MIS_SPL_ASSAY_BOOST_TIERS).map(([key, tier]) => (
                                  <label key={key} className="flex items-start gap-2 text-xs">
                                    <input type="radio" className="mt-1" checked={peDraft.misSplAssay === key} onChange={() => updatePe("misSplAssay", key)} />
                                    {tier.label} -- boosts the prediction above by <b className="ml-1">{Math.round(tier.fraction * 100)}%</b>
                                  </label>
                                ))}
                              </div>
                            </FieldRow>
                            {peDraft.misSplAssay && peDraft.misSplAssay !== "nd" && misSplResult.withAssay !== null && misSplResult.modified !== null && (
                              <div className="px-3 py-2 text-xs text-indigo-600">
                                {(() => {
                                  const delta = misSplResult.withAssay - misSplResult.modified;
                                  const deltaStr = delta >= 0 ? `+${delta.toFixed(2)}` : `−${Math.abs(delta).toFixed(2)}`;
                                  const opStr = delta >= 0 ? "+" : "−";
                                  return (
                                    <>SPL_SPA_ {deltaStr} (combined: {misSplResult.modified.toFixed(1)} {opStr} {Math.abs(delta).toFixed(2)} = {misSplResult.withAssay.toFixed(1)})</>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Uncertain / Unlikely splice paths */}
                        {(peDraft.misSplImpact === "uncertain" || peDraft.misSplImpact === "unlikely") && misSplResult.initial !== null && (
                          <>
                            <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                              <FieldRow dense label="Initial Evidence Points">
                                <ScoreBadge code="SPL_PRD_IE" value={misSplResult.initial} size="sm" />
                              </FieldRow>
                            </div>
                            <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
                              <FieldRow label="Splice Assay Result">
                                <div className="flex flex-col gap-2">
                                  <label className="flex items-start gap-2 text-xs">
                                    <input type="radio" className="mt-1" checked={peDraft.misSplSpaAssessment === "nd"} onChange={() => updatePe("misSplSpaAssessment", "nd")} />
                                    No splicing data available -- <b className="ml-1">SPL_SPA_ND</b>
                                  </label>
                                  {splSpaMode(peDraft.misSplImpact) === "independent-blue" && Object.entries(SPL_SPA_BLUE_TIERS).map(([key, tier]) => (
                                    <label key={key} className="flex items-start gap-2 text-xs">
                                      <input type="radio" className="mt-1" checked={peDraft.misSplSpaAssessment === key} onChange={() => updatePe("misSplSpaAssessment", key)} />
                                      {tier.label} -- <b className="ml-1">{tier.points > 0 ? `+${tier.points.toFixed(1)}` : tier.points < 0 ? `−${Math.abs(tier.points).toFixed(1)}` : "0.0"}</b>
                                    </label>
                                  ))}
                                  {splSpaMode(peDraft.misSplImpact) === "independent-violet" && Object.entries(SPL_SPA_VIOLET_TIERS).map(([key, tier]) => (
                                    <label key={key} className="flex items-start gap-2 text-xs">
                                      <input type="radio" className="mt-1" checked={peDraft.misSplSpaAssessment === key} onChange={() => updatePe("misSplSpaAssessment", key)} />
                                      {tier.reconsider ? (
                                        <>{tier.label} -- <b className="ml-1 text-amber-700">reconsider path</b></>
                                      ) : (
                                        <>{tier.label} -- <b className="ml-1">{(tier.points ?? 0) < 0 ? `−${Math.abs(tier.points ?? 0).toFixed(1)}` : `${(tier.points ?? 0).toFixed(1)}`}</b></>
                                      )}
                                    </label>
                                  ))}
                                </div>
                              </FieldRow>
                            </div>
                            {misSplResult.reconsider && (
                              <div className="border-2 border-amber-300 bg-amber-50 rounded-md p-3 text-xs text-amber-800 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 flex-none mt-0.5" />
                                {peDraft.misSplImpact === "unlikely"
                                  ? 'The splice assay contradicts the "unlikely" prediction -- re-evaluate which path applies to this VBC.'
                                  : "A pathogenic/likely pathogenic informative variant was found on a path where none should score -- re-evaluate which path applies to this VBC."}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- PRD Comment ---- */}
              {peDraft.variantType && (
                <div className="py-4">
                  <label className="text-xs text-gray-700 block mb-1.5">Comment on Prediction (PRD)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 text-xs"
                    rows={2}
                    placeholder="Summarize the predicted-effect assessment"
                    value={peDraft.prdComment}
                    onChange={(e) => updatePe("prdComment", e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================== Evidence Disclosure ==================== */}
      <Disclosure title="Predicted Effect Evidence" description="Predicted impact of this variant" defaultOpen={true}>
        <div className="space-y-5">
          {/* Transcript Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-gray-900">Transcript Information</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">View in UCSC:</span>
                {ucscHg38
                  ? <a href={ucscHg38} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"><ExtIcon className="h-3.5 w-3.5" /> GRCh38/hg38</a>
                  : <span className="text-gray-400 italic">GRCh38 -- no coordinates yet</span>}
                <span className="text-gray-400">/</span>
                {ucscHg19
                  ? <a href={ucscHg19} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"><ExtIcon className="h-3.5 w-3.5" /> GRCh37/hg19</a>
                  : <span className="text-gray-400 italic">GRCh37 -- no coordinates yet</span>}
              </div>
            </div>
            <TranscriptInfo />
          </div>

          {/* In silico predictors */}
          <div className="space-y-3">
            <InSilicoPredictors />
          </div>

          {/* Splice predictors table */}
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <span className="font-serif text-sm font-bold text-gray-900">
                  Predictors for Splicing Assessment <span className="font-sans font-normal text-gray-600">(2)</span>
                </span>
                <div className="text-xs text-gray-500 mt-0.5">
                  External tools -- run there, then record the resulting predictor/score above. SpliceAI and
                  Pangolin are both run by the same site (spliceailookup.broadinstitute.org, non-commercial/
                  academic use per its GPLv3 + CC BY NC 4.0 license), so both links land on one page with both
                  models' scores.
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <THead className="bg-gray-50">
                    <TR>
                      <TH className="text-center">Tool</TH>
                      <TH className="text-center">Analyze</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {[
                      { tool: "SpliceAI", href: spliceAiHref },
                      { tool: "Pangolin", href: spliceAiHref },
                    ].map((row) => (
                      <TR key={row.tool} className="hover:bg-gray-50">
                        <TD className="text-center font-medium text-gray-800">{row.tool}</TD>
                        <TD className="text-center">
                          <a href={row.href || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 text-blue-600 font-medium hover:text-blue-800">
                            Launch <ExtIcon className="h-3.5 w-3.5" />
                          </a>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </Disclosure>

      {/* ==================== External Data Sources ==================== */}
      <ExternalDataSourcesPanel
        sources={[
          {
            key: "ensemblVep",
            label: "Ensembl VEP",
            description: "RefSeq/Ensembl transcript tables above.",
            status: "idle",
            lastFetchedAt: null,
            onRetry: () => {},
            retryDisabled: true,
          },
          {
            key: "ldh",
            label: "ClinGen Linked Data Hub",
            description: "In silico predictor scores above; also backfills the ClinVar ID/dbSNP shown on General Information when the Allele Registry doesn't have them.",
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

export default PredictedEffect;
