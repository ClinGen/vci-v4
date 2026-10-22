/* ============================================================
   Pure scoring / derivation helpers -- SVCv4.0 evidence-code
   point calculations, kept UI-free so they're easy to unit-test
   and to check against the ClinGen supplementary materials.

   All of CLN_AFF, CLN_UAF, CLN_ALT, CLN_DNV, LOC_PHE, and LOC_SEG now
   have real point-value formulas (see caseScoreFor() below). LOC_SEG
   is captured per-proband (each affected proband's own family), then
   combined across every proband at the record level -- see the
   LOC_SEG block further down for why.
   ============================================================ */

// ---------------------------------------------------------------------------
// Shared interfaces
// ---------------------------------------------------------------------------

export interface ClnAffData {
  phenotypicSpecificity?: string;
  testingRelevance?: string;
  variantsOfInterest?: string;
  secondVariantCategory?: string;
  coOccurrenceLikelihood?: string;
  nonGeneticEtiology?: string;
}

export interface ClnDnvData {
  deNovoStatus?: string;
  parentalConfirmation?: string;
}

export interface ClnUafData {
  phenotypicPenetrance?: string;
  secondVariantCategory?: string;
}

export interface ClnAltData {
  severityCategory?: string;
  secondVariantGeneRelationship?: string;
}

export interface LocPheData {
  vbcEligible?: string;
  diagnosticYield?: string;
}

export interface LocSegEntry {
  id?: string;
  label?: string;
  optionValue?: string;
  penetranceNearComplete?: string;
  phaseEstablished?: string;
  nonSegregationConfirmed?: string;
}

export interface LocSegData {
  observations?: LocSegEntry[];
}

export interface Proband {
  scoringMode?: string;
  zygosity?: string;
  sex?: string;
  clnAff: ClnAffData;
  clnDnv: ClnDnvData;
  clnUaf?: ClnUafData;
  clnAlt?: ClnAltData;
  locPhe?: LocPheData;
  locSeg?: LocSegData;
  clnTableAtSave?: string;
}

export interface NonsenseDraft {
  nulNmd?: string;
  nulAltStart?: string;
  nulAltStartFunction?: string;
  nulProteinImpact?: string;
}

export interface CanonicalSpliceDraft {
  splAssessment?: string;
  splNmd?: string;
  splProteinImpact?: string;
  splNoFrameshiftProteinImpact?: string;
}

export interface FunctionalEvidenceEntry {
  id: string;
  kind?: string;
  manualPoints?: number | string | null;
  mechanismConsistent?: boolean;
  numBenignControls?: number | string;
  numPathogenicControls?: number | string;
  resultRange?: string;
  functionalReadout?: string;
  includeInScore?: boolean;
  pathway?: string;
}

export interface InformativeVariantEntry {
  pathway?: string;
  classification: string;
  aaCategory?: string;
}

export interface MissenseDualPathwayData {
  misAaPredictor?: string;
  misAaScore?: string;
  misAaExonRelevance?: string;
  fxnAaStatus?: string;
  fxnSplStatus?: string;
  functionalEvidence?: FunctionalEvidenceEntry[];
  informativeVariants?: InformativeVariantEntry[];
  misSplImpact?: string;
  misSplSubpath?: string;
  misSplExonRelevance?: string;
  misSplLofMechanism?: string;
  misSplAssay?: string;
  misSplSpaAssessment?: string;
  misSplUpperProteinImpact?: string;
  misSplLowerProteinImpact?: string;
}

// Result interfaces for scoring functions
export interface SplCombinedResult {
  spaDelta: number | null;
  combined: number | null;
  reconsider: boolean;
}

export interface SplCapsResult {
  fxnCap: [number, number];
  combinedCap: [number, number];
  finalCap: [number, number];
}

export interface MisAminoAcidTotalResult {
  initial: number | null;
  modified: number | null;
  fxn: number;
  predFxn: number | null;
  inf: number;
  total: number | null;
}

export interface MisSpliceLikelyTotalResult {
  initial: number | null;
  modified: number | null;
  withAssay: number | null;
  fxn: number;
  predFxn: number | null;
  inf: number;
  total: number | null;
}

export interface MisSpliceUncertainTotalResult {
  initial: number;
  modified: number;
  combined: SplCombinedResult;
  fxn: number;
  predFxn: number | null;
  inf: number;
  total: number | null;
  reconsider: boolean;
}

export interface MisSpliceTotalResult {
  initial?: number | null;
  modified?: number | null;
  withAssay?: number | null;
  combined?: SplCombinedResult;
  fxn?: number;
  predFxn?: number | null;
  inf?: number;
  total: number | null;
  reconsider?: boolean;
}

export interface OneSidedBenignInfResult {
  score: number;
  reconsider: boolean;
}

export interface FunctionalEvidenceContributionStatus {
  points: number;
  counted: boolean;
  reason: string;
}

export interface FunctionalEvidenceContributionsResult {
  total: number;
  statusByEntryId: Map<string, FunctionalEvidenceContributionStatus>;
}

export interface PopFrqBinGuidanceEntry {
  max: number;
  label: string;
  points: number;
}

export interface PopHmzInheritanceGuidanceEntry {
  inheritance: string;
  genotype: string;
  points: number;
  matches: (moi: string) => boolean;
}

export interface CaseRowMeta {
  group: string;
  desc: string;
}

export interface CellPlan {
  type: "active" | "mergeStart" | "mergeSkip" | "na";
  span?: number;
}

export type CaseRowCode = "CLN_UAF" | "CLN_ALT" | "CLN_AFF" | "CLN_DNV" | "CLN_CCS" | "LOC_PHE" | "LOC_SEG" | "LOC";

export interface LocSegRowOption {
  value: string;
  label: string;
  points?: number;
  unaffected?: boolean;
  nonSegregation?: boolean;
  confirmLabel?: string;
}

export interface LocPheYieldBin {
  value: string;
  points: number;
}

export interface LocPheEligibilityOption {
  value: string;
  label: string;
}

export interface SelectOption {
  value: string;
  label: string;
  points?: number;
  sameGeneOnly?: boolean;
}

export interface PredictorTable {
  direction: "ascending" | "descending";
  tiers: [number, number][];
}

export interface SplSpaReduceTier {
  label: string;
  fraction: number;
}

export interface SplSpaBlueTier {
  label: string;
  points: number;
}

export interface SplSpaVioletTier {
  label: string;
  points: number | null;
  reconsider?: boolean;
}

export interface MisSplAssayBoostTier {
  label: string;
  fraction: number;
}

export interface AnimalModelRow {
  phenotypicConsistency: string;
  inheritancePattern: string;
  proteinSimilarity: string;
  points: number;
}

export interface ClassificationTone {
  bg: string;
  text: string;
  divider: string;
}

// ---------------------------------------------------------------------------
// POP_FRQ — FAF/DAFT ratio bins
// ---------------------------------------------------------------------------

// Single source of truth for the POP_FRQ FAF/DAFT ratio bins -- used both
// for scoring (popFrqBinScore) and for the "Per Criteria Spec" guidance
// display in the Population Observations result card, so the two can't
// drift apart.
export const POP_FRQ_BIN_GUIDANCE: PopFrqBinGuidanceEntry[] = [
  { max: 1.5, label: "<1.5× DAFT", points: 0.0 },
  { max: 5, label: "1.5–5× DAFT", points: -1.0 },
  { max: 15, label: "5–15× DAFT", points: -3.0 },
  { max: Infinity, label: ">15× DAFT", points: -6.0 },
];

export function popFrqBinIndex(ratio: number): number {
  return POP_FRQ_BIN_GUIDANCE.findIndex((b) => ratio < b.max);
}

export function popFrqBinScore(ratio: number): number {
  const i = popFrqBinIndex(ratio);
  return POP_FRQ_BIN_GUIDANCE[i === -1 ? POP_FRQ_BIN_GUIDANCE.length - 1 : i].points;
}

export function popFrqBinLabel(ratio: number): string {
  if (ratio < 1.5) return "<1.5× DAFT";
  if (ratio < 5) return "1.5–5× DAFT";
  if (ratio < 15) return "5–15× DAFT";
  return ">15× DAFT";
}

// ---------------------------------------------------------------------------
// POP_HMZ — Homozygote/hemizygote scoring
// ---------------------------------------------------------------------------

// First homozygote/hemizygote counted contributes 0; each additional one
// is scored at a rate that depends on Mode of Inheritance (MDE penetrance
// assumptions differ by inheritance pattern), capped at -4 total --
// matching the POP_HMZ evidence-code cap shown on the Summary tab.
// Capping matters now more than it used to: this is driven directly by a
// curator-entered count that could be gnomAD-scale (hundreds of
// thousands), not just a short hand-curated occurrence list.
//
// Single source of truth for both the per-occurrence rate used in
// scoring and the "Per Criteria Spec" guidance table shown in the
// Population Observations guidance banner, so the two can't drift apart
// (same pattern as POP_FRQ_BIN_GUIDANCE above).
export const POP_HMZ_INHERITANCE_GUIDANCE: PopHmzInheritanceGuidanceEntry[] = [
  { inheritance: "Autosomal Dominant", genotype: "Homozygous", points: -1.0, matches: (moi: string) => (moi || "").startsWith("Autosomal dominant") },
  { inheritance: "Semidominant", genotype: "Homozygous", points: -0.5, matches: (moi: string) => (moi || "").startsWith("Semidominant") },
  { inheritance: "Autosomal Recessive", genotype: "Homozygous", points: -0.5, matches: (moi: string) => (moi || "").startsWith("Autosomal recessive") },
  { inheritance: "X-linked", genotype: "Homozygous or Hemizygous", points: -0.5, matches: (moi: string) => (moi || "").startsWith("X-linked") },
];

export function popHmzGuidanceIndex(moi: string): number {
  return POP_HMZ_INHERITANCE_GUIDANCE.findIndex((g) => g.matches(moi));
}

export function popHmzPerOccurrencePoints(moi: string): number {
  const i = popHmzGuidanceIndex(moi);
  return i === -1 ? -0.5 : POP_HMZ_INHERITANCE_GUIDANCE[i].points;
}

export function popHmzScoreFromCount(count: number | null | undefined, moi: string): number {
  if (!count || count <= 0) return 0;
  return Math.max(-4, popHmzPerOccurrencePoints(moi) * (count - 1));
}

/* ============================================================
   Scored Cases table helpers — case-comparison view.

   CLN_UAF/CLN_ALT/CLN_AFF/CLN_DNV/LOC_PHE/LOC_SEG all have real
   per-proband formulas now (see caseScoreFor() below). CLN_CCS is
   assumed structurally N/A per-proband (it's a case-control statistic,
   not an individual observation) rather than a "Not Met" mutually-
   exclusive state.
   ============================================================ */

export const CASE_ROW_ORDER: CaseRowCode[] = ["CLN_UAF", "CLN_ALT", "CLN_AFF", "CLN_DNV", "CLN_CCS", "LOC_PHE", "LOC_SEG", "LOC"];
export const CASE_ROW_META: Record<CaseRowCode, CaseRowMeta> = {
  CLN_UAF: { group: "CLN", desc: "Unaffected Observations" },
  CLN_ALT: { group: "CLN", desc: "Alternate Cause" },
  CLN_AFF: { group: "CLN", desc: "Affected Observations" },
  CLN_DNV: { group: "CLN", desc: "de novo Observations" },
  CLN_CCS: { group: "CLN", desc: "Case-Control Studies" },
  LOC_PHE: { group: "LOC", desc: "Specific Phenotype" },
  LOC_SEG: { group: "LOC", desc: "Segregations with Disease" },
  LOC: { group: "LOC", desc: "Combined Locus Evidence (LOC_PHE + LOC_SEG, capped at +4.0)" },
};

// Per-mode cell plan: which rows are active (own score+reasoning) vs.
// merged into a single "Not Met" block vs. structurally N/A.
export function caseRowPlan(mode: string): Record<CaseRowCode, CellPlan> {
  const plans: Record<string, Record<CaseRowCode, CellPlan>> = {
    affected: {
      CLN_UAF: { type: "mergeStart", span: 2 }, CLN_ALT: { type: "mergeSkip" },
      CLN_AFF: { type: "active" }, CLN_DNV: { type: "active" }, CLN_CCS: { type: "na" },
      LOC_PHE: { type: "active" }, LOC_SEG: { type: "active" }, LOC: { type: "na" },
    },
    unaffected: {
      CLN_UAF: { type: "active" }, CLN_ALT: { type: "mergeStart", span: 3 },
      CLN_AFF: { type: "mergeSkip" }, CLN_DNV: { type: "mergeSkip" }, CLN_CCS: { type: "na" },
      LOC_PHE: { type: "mergeStart", span: 2 }, LOC_SEG: { type: "mergeSkip" }, LOC: { type: "na" },
    },
    alternative: {
      CLN_UAF: { type: "mergeStart", span: 1 }, CLN_ALT: { type: "active" },
      CLN_AFF: { type: "mergeStart", span: 2 }, CLN_DNV: { type: "mergeSkip" }, CLN_CCS: { type: "na" },
      LOC_PHE: { type: "mergeStart", span: 2 }, LOC_SEG: { type: "mergeSkip" }, LOC: { type: "na" },
    },
  };
  return plans[mode] || plans.affected;
}

// CLN_CCS eligibility per Supplement 4: restricted to variants of
// moderate frequency where a true case enrichment can be assessed --
// at least 5 cases with the variant, in a cohort of at least 100
// unrelated cases. This is advisory (surfaced as a warning), not a hard
// gate, since professional judgement is explicitly allowed to override it.
export function clnCcsEligible(caseCount: number | string, cohortSize: number | string): boolean {
  const cases = Number(caseCount);
  const cohort = Number(cohortSize);
  return !isNaN(cases) && cases >= 5 && !isNaN(cohort) && cohort >= 100;
}

// Binary per Supplement 4: OR > 5.0 AND the 95% CI excludes 1.0 -> +4.0.
// Otherwise, a case-control analysis that was actually performed but
// didn't meet that bar scores 0.0 (not ND -- ND is reserved for "not
// attempted at all").
export function clnCcsScore(oddsRatio: string | number | undefined, ciExcludes1: string | undefined): number | null {
  if (oddsRatio === "" || oddsRatio === undefined || !ciExcludes1) return null;
  const or = Number(oddsRatio);
  if (isNaN(or)) return null;
  return or > 5.0 && ciExcludes1 === "yes" ? 4.0 : 0.0;
}

export function caseScoreFor(code: string, proband: Proband, modeOfInheritance: string): number | null {
  if (code === "CLN_UAF") return clnUafScore(modeOfInheritance, proband);
  if (code === "CLN_ALT") return clnAltScore(proband);
  if (code === "CLN_AFF") return clnAffScore(modeOfInheritance, proband);
  if (code === "CLN_DNV") return clnDnvScore(modeOfInheritance, proband);
  if (code === "LOC_PHE") return locPheScore(proband);
  if (code === "LOC_SEG") return locSegScore(modeOfInheritance, proband.locSeg);
  return null;
}

/* ============================================================
   CLN_UAF (Supplement 4, Table 5) -- Unaffected Observations.

   Points depend on (1) age-matched penetrance of the MDE and (2), for
   autosomal recessive/X-linked disorders only, the proband's own
   zygosity or second-variant trans classification. Table 5 groups
   Autosomal Dominant with Semidominant as a single "no second-variant
   question needed" column; Autosomal Recessive and X-linked (either
   dominant or recessive pattern) share the other three columns
   (homozygous/hemizygous, confirmed trans-with-P, confirmed
   trans-with-LP). Mitochondrial/Other/Undetermined aren't addressed by
   Supplement 4; treated like the dominant/semidominant column as the
   least assumption-laden fallback (matching clnAffScore's equivalent
   fallback for Table 1).
   ============================================================ */
const CLN_UAF_PENETRANCE_TABLE: Record<string, Record<string, number>> = {
  "Age-matched penetrance of MDE is near 100%": { dominant: -4.0, "homozygous-hemizygous": -4.0, "confirmed-trans-p": -4.0, "confirmed-trans-lp": -2.0 },
  "Age-matched penetrance of MDE is 80–100%": { dominant: -2.0, "homozygous-hemizygous": -2.0, "confirmed-trans-p": -2.0, "confirmed-trans-lp": -1.0 },
  "Age-matched penetrance of MDE is <80%": { dominant: 0.0, "homozygous-hemizygous": 0.0, "confirmed-trans-p": 0.0, "confirmed-trans-lp": 0.0 },
};

export const CLN_UAF_SECOND_VARIANT_OPTIONS: SelectOption[] = [
  { value: "homozygous-hemizygous", label: "VBC is homozygous or hemizygous" },
  { value: "confirmed-trans-p", label: "VBC confirmed in trans with a P variant" },
  { value: "confirmed-trans-lp", label: "VBC confirmed in trans with an LP variant" },
  { value: "no-second-variant", label: "No P/LP variant confirmed in trans, or phase unknown" },
];

export function clnUafMoiBucket(modeOfInheritance: string): "recessive" | "dominant" {
  const moi = modeOfInheritance || "";
  if (moi.startsWith("Autosomal recessive") || moi.startsWith("X-linked")) return "recessive";
  return "dominant"; // Autosomal dominant, Semidominant, and the MOIs Table 5 doesn't address
}

export function clnUafScore(modeOfInheritance: string, proband: Proband): number | null {
  const d = proband.clnUaf;
  if (!d || !d.phenotypicPenetrance) return null; // not yet selected
  // "If the penetrance estimates are unknown for the MDE, then no points should be applied."
  if (d.phenotypicPenetrance === "Penetrance not established / unknown") return 0.0;
  const row = CLN_UAF_PENETRANCE_TABLE[d.phenotypicPenetrance];
  if (!row) return null;
  const bucket = clnUafMoiBucket(modeOfInheritance);
  if (bucket === "dominant") return row.dominant;
  // Recessive/X-linked: needs the zygosity/second-variant category too.
  if (!d.secondVariantCategory) return null;
  // "If there is no P or LP variant confirmed in trans, or if phasing of
  // the variants is unknown, then no points should be added."
  if (d.secondVariantCategory === "no-second-variant") return 0.0;
  return row[d.secondVariantCategory] ?? null;
}

export function clnUafAggregate(probands: Proband[], modeOfInheritance: string): number | null {
  const values = probands
    .filter((p) => p.scoringMode === "unaffected")
    .map((p) => clnUafScore(modeOfInheritance, p))
    .filter((s): s is number => s !== null);
  return values.length ? values.reduce((a, b) => a + b, 0) : null;
}

/* ============================================================
   CLN_ALT (Supplement 4, Table 4) -- Alternative Causes of Disease.

   Points depend on phenotype severity relative to the MDE. The -1.0
   tier is explicitly restricted by the doc to cases where the
   alternative-cause P/LP variant is in the same gene as the VBC
   ("*only applicable for P/LP variant is the same gene as VBC*") --
   captured here via a separate gene-relationship field rather than
   folding that restriction silently into the severity option itself,
   so the UI can show *why* that option isn't available rather than
   just omitting it.
   ============================================================ */
export const CLN_ALT_GENE_RELATIONSHIP_OPTIONS: SelectOption[] = [
  { value: "same-gene", label: "Same gene as VBC" },
  { value: "different-gene", label: "Different gene associated with the phenotype" },
];

export const CLN_ALT_SEVERITY_OPTIONS: SelectOption[] = [
  { value: "more-severe-or-multiallele", label: "Phenotype is more severe than expected for the MDE, OR is the same severity as expected for >1 allele contributing to the presentation", points: 0.0 },
  { value: "not-more-severe", label: "Phenotype is NOT more severe than expected for the MDE (i.e., only one allele contributing to phenotype)", points: -0.5 },
  { value: "not-consistent-recessive", label: "Phenotype is NOT consistent with that expected for an established recessive disease entity, with age-matched penetrance >80%", points: -1.0, sameGeneOnly: true },
];

export function clnAltScore(proband: Proband): number | null {
  const d = proband.clnAlt;
  if (!d || !d.severityCategory) return null; // not yet selected
  const opt = CLN_ALT_SEVERITY_OPTIONS.find((o) => o.value === d.severityCategory);
  if (!opt) return null;
  // Guards against a stale saved value if the gene relationship is later
  // changed away from "same-gene" -- the -1.0 option is also hidden from
  // the picker itself (see ProbandModal.jsx), so this is a belt-and-suspenders check.
  if (opt.sameGeneOnly && d.secondVariantGeneRelationship !== "same-gene") return null;
  return opt.points ?? null;
}

export function clnAltAggregate(probands: Proband[]): number | null {
  const values = probands
    .filter((p) => p.scoringMode === "alternative")
    .map((p) => clnAltScore(p))
    .filter((s): s is number => s !== null);
  return values.length ? values.reduce((a, b) => a + b, 0) : null;
}

// Determines which CLN_AFF/CLN_UAF table applies to a given proband:
// "monoallelic" (Supplement 4 Table 1) or "biallelic" (Table 2). For
// semidominant and X-linked recessive inheritance this also depends on
// the individual proband's zygosity/sex, not just the MDE's mode of
// inheritance -- both already collected as general proband fields, so
// this is derived rather than asked as its own question.
export function clnTableFor(modeOfInheritance: string, proband: Proband): "monoallelic" | "biallelic" | null {
  const moi = modeOfInheritance || "";
  if (moi.startsWith("Autosomal dominant")) return "monoallelic";
  if (moi.startsWith("Autosomal recessive")) return "biallelic";
  if (moi.startsWith("Semidominant")) return proband.zygosity === "Heterozygous" ? "monoallelic" : "biallelic";
  if (moi.startsWith("X-linked dominant")) return "monoallelic";
  if (moi.startsWith("X-linked recessive")) return proband.sex === "Female" ? "biallelic" : "monoallelic";
  return null; // Mitochondrial / Other / Undetermined -- not addressed by Supplement 4
}

// Supplement 4, Table 2 (Biallelic Disorders): points per second-variant
// category, for each of the two co-occurrence-likelihood "clean" columns,
// plus the single "any problem" (testing/etiology/VUS) column. Categories
// where clean_low === clean_high don't actually need the likelihood
// question, since the answer wouldn't change the score.
interface BiallelicColumn {
  cleanLow: number;
  cleanHigh: number;
  middle: number;
}

const CLN_AFF_BIALLELIC_COLUMNS: Record<string, BiallelicColumn> = {
  "confirmed-trans-plp": { cleanLow: 3.0, cleanHigh: 2.0, middle: 1.0 },
  "assumed-trans-plp": { cleanLow: 1.5, cleanHigh: 1.0, middle: 0.75 },
  "confirmed-trans-vus": { cleanLow: 1.5, cleanHigh: 1.0, middle: 0.5 },
  "homozygous": { cleanLow: 1.0, cleanHigh: 1.0, middle: 0.5 },
  "no-second-variant": { cleanLow: 0.0, cleanHigh: 0.0, middle: 0.0 },
};

function clnAffClean(d: ClnAffData): boolean {
  return d.testingRelevance === "All relevant genes for MDE were tested"
    && d.nonGeneticEtiology === "Unlikely"
    && d.variantsOfInterest === "No additional variants of interest identified";
}

export function clnAffScore(modeOfInheritance: string, proband: Proband): number | null {
  const d = proband.clnAff;
  // Phenotype Consistency, Testing Relevance, and Variants of Interest all
  // default to blank now (no pre-selected "cleanest" answer), so an
  // unanswered required field should read as "Not Evaluated", not silently
  // fall through to a scored default.
  if (!d.phenotypicSpecificity || !d.testingRelevance || !d.variantsOfInterest) return null;
  if (d.phenotypicSpecificity === "Not consistent") return 0.0;
  if (d.variantsOfInterest === "Additional P/LP variant identified that explains phenotype") return 0.0;

  const table = clnTableFor(modeOfInheritance, proband);
  const clean = clnAffClean(d);

  if (table === "biallelic") {
    if (!d.secondVariantCategory) return null;
    const col = CLN_AFF_BIALLELIC_COLUMNS[d.secondVariantCategory];
    if (!col) return null;
    if (!clean) return col.middle;
    if (col.cleanLow === col.cleanHigh) return col.cleanLow;
    if (!d.coOccurrenceLikelihood) return null;
    return d.coOccurrenceLikelihood === "low" ? col.cleanLow : col.cleanHigh;
  }

  // monoallelic (Table 1), and the fallback for MOIs Supplement 4 doesn't
  // explicitly address (Mitochondrial / Other / Undetermined)
  const specific = d.phenotypicSpecificity === "Specific for MDE";
  if (clean) return specific ? 1.0 : 0.5;
  return specific ? 0.5 : 0.25;
}

// Supplement 4, Table 3: reuses the phenotype-consistency category already
// selected for this proband's CLN_AFF, rather than asking again. The
// "Specific" tier only exists for monoallelic disorders -- for biallelic
// disorders, Table 2 has no Specific/Consistent distinction, so a de novo
// biallelic proband always uses the Consistent-tier points here too.
export function clnDnvScore(modeOfInheritance: string, proband: Proband): number | null {
  if (!proband.clnAff.phenotypicSpecificity) return null; // borrowed field not yet selected
  if (proband.clnAff.phenotypicSpecificity === "Not consistent") return 0.0;
  if (!proband.clnDnv.deNovoStatus) return null; // not yet selected
  if (proband.clnDnv.deNovoStatus !== "Is de novo") return 0.0;
  const table = clnTableFor(modeOfInheritance, proband);
  const specific = table === "monoallelic" && proband.clnAff.phenotypicSpecificity === "Specific for MDE";
  const confirmed = proband.clnDnv.parentalConfirmation === "Confirmed";
  if (specific) return confirmed ? 7.0 : 2.0;
  return confirmed ? 4.0 : 1.0;
}

// Same Table 3 formula as clnDnvScore, but for the Case-Control Study
// screen, which has no per-proband record to read zygosity/sex from.
// Semidominant and X-linked recessive both need that per-individual data
// to know whether Table 1 (monoallelic) or Table 2 (biallelic) applies
// (see clnTableFor), so those two MOIs can't be resolved at the
// cohort level -- return null and let the UI prompt for an individual
// proband entry instead.
export function clnCcsDnvScore(modeOfInheritance: string, phenotypicSpecificity: string | undefined, deNovoStatus: string | undefined, parentalConfirmation: string | undefined): number | null {
  if (!phenotypicSpecificity || !deNovoStatus) return null;
  if (phenotypicSpecificity === "Not consistent") return 0.0;
  if (deNovoStatus !== "Is de novo") return 0.0;

  const moi = modeOfInheritance || "";
  if (moi.startsWith("Semidominant") || moi.startsWith("X-linked recessive")) return null;

  const table = moi.startsWith("Autosomal dominant") || moi.startsWith("X-linked dominant") ? "monoallelic" : moi.startsWith("Autosomal recessive") ? "biallelic" : null;
  const specific = table === "monoallelic" && phenotypicSpecificity === "Specific for MDE";
  const confirmed = parentalConfirmation === "Confirmed";
  if (specific) return confirmed ? 7.0 : 2.0;
  return confirmed ? 4.0 : 1.0;
}

// Reasoning bullets for the Case-Control Study's own CLN_CCS cell, in the
// same style as caseReasoningFor's per-proband bullets.
export function clnCcsReasoning({ oddsRatio, ciExcludes1, isEligible }: { oddsRatio?: string; ciExcludes1?: string; isEligible?: boolean }): string[] {
  const b: string[] = [];
  if (!isEligible) b.push("Case-control eligibility criteria not met (Supplement 4 recommends ≥ 5 cases in a cohort of ≥ 100).");
  if (oddsRatio) b.push(`Odds ratio ${oddsRatio}, 95% CI ${ciExcludes1 === "yes" ? "excludes" : ciExcludes1 === "no" ? "does not exclude" : "not assessed against"} 1.0.`);
  if (!b.length) b.push("No case-control data entered yet.");
  return b;
}

// Reasoning bullets for the Case-Control Study's cohort-level CLN_DNV cell.
export function clnCcsDnvReasoning({ phenotypicSpecificity, deNovoStatus, parentalConfirmation }: { phenotypicSpecificity?: string; deNovoStatus?: string; parentalConfirmation?: string }): string[] {
  const b: string[] = [];
  if (!phenotypicSpecificity || !deNovoStatus) {
    b.push("Phenotype Consistency and/or de novo status not yet selected.");
  } else if (deNovoStatus !== "Is de novo") {
    b.push(`de novo status: ${deNovoStatus}.`);
  } else {
    b.push(`Phenotype Consistency: ${phenotypicSpecificity}; de novo with ${(parentalConfirmation || "unspecified").toLowerCase()} parental relationships.`);
  }
  return b;
}

// CLN_DNV is meant to be summed across every qualifying de novo
// observation (Supplement 4, Table 3), whether that observation came from
// an individually-counted proband or from a de novo case identified within
// a case-control cohort. Returns null only when there is nothing scored
// yet from either source, so the Aggregate column can still show "—".
export function clnDnvAggregate(probands: Proband[], modeOfInheritance: string, ccsDnvValue: number | null | undefined): number | null {
  const values = probands
    .filter((p) => p.scoringMode === "affected")
    .map((p) => clnDnvScore(modeOfInheritance, p))
    .filter((s): s is number => s !== null);
  if (ccsDnvValue !== null && ccsDnvValue !== undefined) values.push(ccsDnvValue);
  return values.length ? values.reduce((a, b) => a + b, 0) : null;
}

// Aggregate CLN_AFF the same way as CLN_DNV: sum every affected proband's
// own scored value. (Previously this Aggregate cell always showed "Not
// Evaluated" even when individual probands had real CLN_AFF scores --
// this was a real inconsistency, not an intentional design choice.)
// Whether a saved proband's CLN_AFF needs re-review because the Mode of
// Inheritance changed since it was last saved, in a way that flips which
// Supplement 4 table applies to this specific proband (monoallelic <->
// biallelic). Semidominant and X-linked recessive resolve per-proband
// (zygosity/sex), so an MOI change can flip some saved probands and
// leave others untouched -- this is checked per proband rather than
// assuming a blanket MOI-category change affects everyone equally.
// A proband with no clnTableAtSave stamp (older data, or never scored)
// is treated as not needing review, since there's nothing to compare
// against.
export function needsMoiReview(proband: Proband, modeOfInheritance: string): boolean {
  if (!proband.clnTableAtSave) return false;
  return clnTableFor(modeOfInheritance, proband) !== proband.clnTableAtSave;
}

export function clnAffAggregate(probands: Proband[], modeOfInheritance: string): number | null {
  const values = probands
    .filter((p) => p.scoringMode === "affected" && !needsMoiReview(p, modeOfInheritance))
    .map((p) => clnAffScore(modeOfInheritance, p))
    .filter((s): s is number => s !== null);
  return values.length ? values.reduce((a, b) => a + b, 0) : null;
}

/* ============================================================
   LOC_PHE (Supplement 5) — Specific Phenotype evidence.

   The diagnostic-yield -> points ladder matches Figure 1's own
   "Phenotype Specificity Points" table exactly: <33% -> 0.0,
   33-50% -> +1.0, 51-67% -> +2.0, 68-81% -> +3.0, >=82% -> +4.0. (An
   earlier version of this ladder used 50-65%/65-82% for the middle two
   bins, guessed from body-text worked examples before the figure's own
   table was checked directly -- the figure is authoritative.)

   This is a single source of truth for both the dropdown (ProbandModal)
   and the score lookup, so the two can't drift apart.
   ============================================================ */
export const LOC_PHE_YIELD_BINS: LocPheYieldBin[] = [
  { value: "<33%", points: 0.0 },
  { value: "33–50%", points: 1.0 },
  { value: "51–67%", points: 2.0 },
  { value: "68–81%", points: 3.0 },
  { value: "≥82%", points: 4.0 },
];

// LOC_PHE_ELIGIBILITY_OPTIONS: per Supplement 5 S12 ("In many cases, these
// criteria and caveats will not be met, and in such cases, the LOC_PHE_0.0
// points should be awarded or LOC_PHE_ND if no data are available"), there
// are three distinct outcomes -- yield data exists and is usable, yield data
// exists but doesn't meet the criteria (testing methodology mismatch,
// phenotype not robustly defined, etc. -> 0.0), or no yield/specificity data
// exists at all for this phenotype/disorder (-> ND). These are collapsed
// into a single boolean ("Yes"/"No") in the mockup's initial data model, so
// this is a fix, not just an addition.
export const LOC_PHE_ELIGIBILITY_OPTIONS: LocPheEligibilityOption[] = [
  { value: "yes", label: "Yes — robust yield/specificity data meets criteria for this VBC" },
  { value: "no-not-met", label: "No — data exists but criteria not met (methodology mismatch, phenotype not robustly defined, etc.)" },
  { value: "no-data", label: "No data available (ND)" },
];

// Per-proband LOC_PHE value. NOTE: this does not yet implement the
// ultra-rare-disorder phenotype-semantic-similarity path (up to +2.0,
// S11) -- that would need its own eligibility question and isn't
// covered by any field collected today. The non-segregation zero-out
// (S19-20) IS implemented, but as an override applied on top of this
// value at the point LOC_PHE is aggregated (see locPheAfterSegregation
// below), since it depends on segregation data gathered across every
// proband's own family, not just this one proband's LOC_PHE answer.
export function locPheScore(proband: Proband): number | null {
  const d = proband.locPhe;
  if (!d || !d.vbcEligible) return null; // not yet selected
  if (d.vbcEligible === "no-data") return null; // LOC_PHE_ND
  if (d.vbcEligible !== "yes") return 0.0; // criteria not met -> LOC_PHE_0.0
  const bin = LOC_PHE_YIELD_BINS.find((b) => b.value === d.diagnosticYield);
  return bin ? bin.points : null;
}

// Per Supplement 5 S18 ("This concept of crediting evidence on a locus
// (rather than variant) basis...") and S13 ("application of the diagnostic
// yield / phenotype specificity concept should be based on the single
// proband with the most specific phenotypic information"): unlike CLN_AFF,
// LOC_PHE is NOT summed across probands. Only the single most-informative
// affected proband's value counts toward the variant/locus.
export function locPheAggregate(probands: Proband[]): number | null {
  const scores = probands
    .filter((p) => p.scoringMode === "affected")
    .map((p) => locPheScore(p))
    .filter((s): s is number => s !== null);
  return scores.length ? Math.max(...scores) : null;
}

// A confirmed non-segregation (see locSegAggregate's -4.0 branch below)
// zeroes out LOC_PHE at this locus per Supplement 5's own flow diagram
// ("Zero out LOC_PHE points at this locus and re-evaluate LOC_PHE for
// variants at other loci, excluding this locus"). The "re-evaluate at
// other loci" half isn't something this single-variant record can act
// on -- there's no second locus/gene being curated here -- so this only
// implements the half that's actually representable: this variant's own
// LOC_PHE contribution goes to 0.0 once a real non-segregation is on
// record. locSegAggregateValue is whatever locSegAggregate() returned,
// so this can check for the -4.0 sentinel specifically.
export function locPheAfterSegregation(locPheValue: number | null, locSegAggregateValue: number | null): number | null {
  return locSegAggregateValue === -4.0 ? 0.0 : locPheValue;
}

/* ============================================================
   LOC_SEG (Supplement 5, Figure 2) — Co-Segregation.

   Segregation observations are captured per-proband -- each affected
   proband's own family is where its informative relatives live, so
   this lives right alongside that proband's LOC_PHE answer
   (proband.locSeg.observations), not as a separate record-level list.
   The variant's overall LOC_SEG value (locSegAggregate below) is
   still computed once, across every affected proband's entries
   together, since Figure 2's +4.0 cap applies to the locus as a
   whole, not to each family separately.

   Each entry has the shape:
     { id, label, optionValue, penetranceNearComplete, phaseEstablished, nonSegregationConfirmed }
   `optionValue` picks a row from locSegRowOptionsFor(modeOfInheritance),
   which merges the inheritance-specific co-segregation rows from Figure
   2's own table with two MOI-independent non-segregation rows (see
   LOC_SEG_NONSEGREGATION_OPTIONS) representing the figure's "Unaff w/
   variant (penetrance must be high)" / "Aff w/o variant (phenocopy
   must be low)" exit path. Modeling non-segregation as one specific
   *kind of entry*, rather than a separate global yes/no toggle, means
   a family can have several ordinary co-segregating relatives and
   (rarely) one non-segregating one, which is what real pedigrees
   actually look like.

   No separate eligibility gate is modeled here (Figure 2's own "is
   there locus heterogeneity, and is the phenocopy rate very low/
   zero?" precondition) -- that's a property of the gene/locus as a
   whole, not of any individual proband's family, so a per-proband
   question would be both repetitive and liable to get contradictory
   answers across probands for what's really one fact. For this first
   pass it's called out as a short assumption note in the UI instead
   of a blocking question or a new gene-level curation step; revisit
   with real gene-level state once enough gene-level evidence types
   exist to justify it (see HANDOFF.md).
   ============================================================ */
export function locSegMoiBucket(modeOfInheritance: string): "dominant" | "recessive" | "semidominant" | "xlinked" | null {
  const moi = modeOfInheritance || "";
  if (moi.startsWith("Autosomal dominant")) return "dominant";
  if (moi.startsWith("Autosomal recessive")) return "recessive";
  if (moi.startsWith("Semidominant")) return "semidominant";
  if (moi.startsWith("X-linked")) return "xlinked";
  return null; // Mitochondrial / Other / Undetermined -- Figure 2 gives no guidance at all for these
}

// One row option per informative-relative category Figure 2 actually
// shows, grouped by inheritance bucket. `unaffected: true` marks the
// rows subject to the figure's own asterisked caveat ("Count unaffected
// co-segregations ... only if age-matched penetrance of MDE is near
// 100% and phase has been established") -- enforced in locSegEntryPoints
// below, not just documented here.
export const LOC_SEG_ROW_OPTIONS: Record<string, LocSegRowOption[]> = {
  dominant: [
    { value: "ad-affected-het", label: "Affected relative, heterozygous", points: 1.0, unaffected: false },
    { value: "ad-unaffected-wt", label: "Unaffected relative, wild-type", points: 1.0, unaffected: true },
  ],
  recessive: [
    { value: "ar-affected-homo-comphet", label: "Affected relative, homozygous or compound heterozygous", points: 2.0, unaffected: false },
    { value: "ar-unaffected-het-or-wt", label: "Unaffected relative, heterozygous or wild-type", points: 0.4, unaffected: true },
  ],
  semidominant: [
    { value: "sd-severe-homo-comphet", label: "Severely affected relative, homozygous or compound heterozygous", points: 2.0, unaffected: false },
    { value: "sd-affected-het", label: "Affected relative, heterozygous", points: 1.0, unaffected: false },
    { value: "sd-unaffected-wt", label: "Unaffected relative, wild-type", points: 1.0, unaffected: true },
  ],
  xlinked: [
    { value: "xl-severe-male-hemi", label: "Severely affected male relative, hemizygous", points: 1.0, unaffected: false },
    { value: "xl-severe-female-homo-comphet", label: "Severely affected female relative, homozygous or compound heterozygous", points: 1.0, unaffected: false },
    { value: "xl-affected-female-het", label: "Affected female relative, heterozygous", points: 1.0, unaffected: false },
    { value: "xl-unaffected-male-wt", label: "Unaffected male relative, wild-type", points: 1.0, unaffected: true },
  ],
};

// MOI-independent: Figure 2's non-segregation exit path applies the
// same way regardless of inheritance pattern (only the AR carve-out in
// locSegEntryPoints below changes how it's scored, not whether it's
// offered -- still worth letting the curator document it even when it
// won't count, for transparency).
const LOC_SEG_NONSEGREGATION_OPTIONS: LocSegRowOption[] = [
  { value: "nonseg-unaffected-with-vbc", label: "Non-segregation: unaffected relative WITH the VBC", nonSegregation: true, confirmLabel: "Age-matched penetrance for this MDE confirmed high?" },
  { value: "nonseg-affected-without-vbc", label: "Non-segregation: affected relative WITHOUT the VBC", nonSegregation: true, confirmLabel: "Phenocopy rate for this MDE confirmed low?" },
];

export function locSegRowOptionsFor(modeOfInheritance: string): LocSegRowOption[] {
  const bucket = locSegMoiBucket(modeOfInheritance);
  return bucket ? [...LOC_SEG_ROW_OPTIONS[bucket], ...LOC_SEG_NONSEGREGATION_OPTIONS] : [];
}

// Resolves a LOC_SEG entry's option label without needing to know which
// MOI bucket it came from -- every bucket's option values use a unique
// prefix (ad-/ar-/sd-/xl-/nonseg-), so a flattened search across all of
// them is safe. Used by the phenopacket card (LiteratureSection.jsx),
// which shows a proband's segregation observations independent of
// whatever the record's current Mode of Inheritance happens to be.
export function locSegOptionLabel(optionValue: string): string {
  const all: LocSegRowOption[] = [
    ...LOC_SEG_ROW_OPTIONS.dominant, ...LOC_SEG_ROW_OPTIONS.recessive,
    ...LOC_SEG_ROW_OPTIONS.semidominant, ...LOC_SEG_ROW_OPTIONS.xlinked,
    ...LOC_SEG_NONSEGREGATION_OPTIONS,
  ];
  const opt = all.find((o) => o.value === optionValue);
  return opt ? opt.label : optionValue;
}

// Points contributed by one entry.
//  - Ordinary "unaffected" co-segregation rows: 0 unless both the
//    penetrance and phase caveats are confirmed "yes" (rather than
//    silently dropping the entry, which would hide from the curator
//    that it was entered but didn't count).
//  - Non-segregation rows: Supplement 5's explicit carve-out means
//    these never count as benign evidence for autosomal recessive
//    MDEs, so always 0 there. Elsewhere, an unconfirmed caveat means
//    the observation is inconclusive (0), and a confirmed one returns
//    the -4.0 sentinel -- handled specially by locSegScore/
//    locSegAggregate below, not summed in directly here.
export function locSegEntryPoints(entry: LocSegEntry, modeOfInheritance: string): number {
  const rows = locSegRowOptionsFor(modeOfInheritance);
  const opt = rows.find((o) => o.value === entry.optionValue);
  if (!opt) return 0;
  if (opt.nonSegregation) {
    if (locSegMoiBucket(modeOfInheritance) === "recessive") return 0;
    if (entry.nonSegregationConfirmed !== "yes") return 0;
    return -4.0;
  }
  if (opt.unaffected && (entry.penetranceNearComplete !== "yes" || entry.phaseEstablished !== "yes")) return 0;
  return opt.points ?? 0;
}

function locSegHasConfirmedNonSegregation(entries: LocSegEntry[], modeOfInheritance: string): boolean {
  if (locSegMoiBucket(modeOfInheritance) === "recessive") return false; // AR carve-out: never counts
  const rows = locSegRowOptionsFor(modeOfInheritance);
  return (entries || []).some((e) => {
    const opt = rows.find((o) => o.value === e.optionValue);
    return !!opt && !!opt.nonSegregation && e.nonSegregationConfirmed === "yes";
  });
}

// This proband's own raw contribution -- intentionally NOT capped at
// +4.0 here (that combining/capping happens once, across every
// proband's entries together, in locSegAggregate below), the same way
// CLN_AFF sums each proband's own score uncapped and only the combined
// total gets bounded. Shown in this proband's own modal/table cell as
// a transparent per-family subtotal, not the final locus-level value.
export function locSegScore(modeOfInheritance: string, locSeg: LocSegData | undefined): number | null {
  if (!locSeg || !locSeg.observations || locSeg.observations.length === 0) return null;
  const bucket = locSegMoiBucket(modeOfInheritance);
  if (!bucket) return null; // Figure 2 doesn't address this MOI at all
  if (locSegHasConfirmedNonSegregation(locSeg.observations, modeOfInheritance)) return -4.0;
  return locSeg.observations.reduce((total, entry) => total + locSegEntryPoints(entry, modeOfInheritance), 0);
}

// The record-level LOC_SEG value: every affected proband's segregation
// entries, pooled together, then capped once at +4.0 -- matching
// Figure 2's "LOC_SEG_0.0 to +4.0" cap applying to the locus as a
// whole. A single confirmed non-segregation anywhere in the pool
// overrides the entire figure to -4.0 (discarding any positive
// co-segregation sum), matching Figure 2's structure: non-segregation
// is a distinct terminal outcome, not something summed together with
// co-segregating evidence.
export function locSegAggregate(probands: Proband[], modeOfInheritance: string): number | null {
  const bucket = locSegMoiBucket(modeOfInheritance);
  if (!bucket) return null;
  const allEntries = probands
    .filter((p) => p.scoringMode === "affected")
    .flatMap((p) => (p.locSeg && p.locSeg.observations) || []);
  if (allEntries.length === 0) return null;
  if (locSegHasConfirmedNonSegregation(allEntries, modeOfInheritance)) return -4.0;
  const sum = allEntries.reduce((total, entry) => total + locSegEntryPoints(entry, modeOfInheritance), 0);
  return Math.max(0, Math.min(4.0, sum));
}

// Reasoning bullets for one proband's own LOC_SEG cell in the Scored
// Cases table, in the same style as caseReasoningFor's other bullets.
export function locSegReasoning(modeOfInheritance: string, proband: Proband): string[] {
  const locSeg = proband.locSeg;
  if (!locSeg || !locSeg.observations || locSeg.observations.length === 0) {
    return ["No segregation observations entered for this proband's family."];
  }
  const bucket = locSegMoiBucket(modeOfInheritance);
  if (!bucket) return ["Figure 2 doesn't give a segregation heuristic for the current Mode of Inheritance."];
  const rows = locSegRowOptionsFor(modeOfInheritance);
  return locSeg.observations.map((entry) => {
    const opt = rows.find((o) => o.value === entry.optionValue);
    const label = entry.label ? `${entry.label}: ` : "";
    if (!opt) return `${label}option not recognized.`;
    if (opt.nonSegregation) {
      if (bucket === "recessive") return `${label}${opt.label} — not counted as benign evidence for autosomal recessive MDEs (Supplement 5).`;
      if (entry.nonSegregationConfirmed !== "yes") return `${label}${opt.label} — caveat not confirmed, inconclusive (contributes +0.0).`;
      return `${label}${opt.label} — scores LOC_SEG_−4.0 for this locus; LOC_PHE is also zeroed out.`;
    }
    const points = locSegEntryPoints(entry, modeOfInheritance);
    const caveatFailed = opt.unaffected && points === 0;
    return `${label}${opt.label} (${points >= 0 ? "+" : ""}${points.toFixed(1)})${caveatFailed ? " — penetrance/phasing caveat not confirmed, excluded from total" : ""}.`;
  });
}

/* ============================================================
   LOC (combined) — Supplement 5's "General Information" section:
   "The points are then added from the phenotype specificity criterion
   and the co-segregations. They are then capped and coded as
   LOC_PHE_0.0 to LOC_PHE_+4.0 evidence and LOC_SEG_0.0 to
   LOC_SEG_+4.0. They are combined in the LOC_0.0 to LOC_+4.0 code and
   capped."

   LOC_PHE and LOC_SEG each still keep their own individually-capped
   value (locPheAggregate/locSegAggregate above). This is the separate,
   third combined figure the doc describes: summed, then re-capped at
   +4.0 total, since two positive-but-individually-valid values (e.g.
   LOC_PHE_+3.0 and LOC_SEG_+3.0) would otherwise double-count the same
   "implicates this locus" evidence. Floors at 0.0 in the general case,
   but passes a non-segregation's -4.0 straight through uncapped-low --
   that value is documented as its own distinct exit path (LOC_PHE
   zeroed, LOC_SEG_-4.0) rather than something meant to combine
   arithmetically with a positive LOC_PHE value through the normal
   sum-and-cap formula. Returns null only when neither code has a value
   yet, so this reads as "Not Evaluated" until then rather than a
   misleading 0.0.
   ============================================================ */
export function locCombinedScore(locPheValue: number | null, locSegValue: number | null): number | null {
  if (locSegValue === -4.0) return -4.0; // non-segregation overrides the normal sum/cap
  if (locPheValue === null && locSegValue === null) return null;
  const sum = (locPheValue || 0) + (locSegValue || 0);
  return Math.max(0, Math.min(4.0, sum));
}

const CLN_AFF_SECOND_VARIANT_LABELS: Record<string, string> = {
  "confirmed-trans-plp": "VBC confirmed in trans with a P/LP variant",
  "assumed-trans-plp": "VBC assumed in trans with a P/LP variant",
  "confirmed-trans-vus": "VBC confirmed in trans with a VUS",
  "homozygous": "Homozygous VBC",
  "no-second-variant": "No 2nd variant, or 2nd variant in cis, or unknown phase",
};

export function caseReasoningFor(code: string, p: Proband, modeOfInheritance: string): string[] {
  const b = ((): string[] => {
    switch (code) {
      case "CLN_AFF": {
        if (!p.clnAff.phenotypicSpecificity || !p.clnAff.testingRelevance || !p.clnAff.variantsOfInterest) {
          return ["Phenotype Consistency, Testing Relevance, and Variants of Interest have not all been selected yet."];
        }
        const b: string[] = [];
        const spec = p.clnAff.phenotypicSpecificity === "Specific for MDE" ? "Phenotype specific for MDE" : p.clnAff.phenotypicSpecificity === "Consistent with MDE" ? "Phenotype consistent with MDE" : "Phenotype not consistent with MDE";
        const testing = p.clnAff.testingRelevance === "All relevant genes for MDE were tested" ? "all relevant genes for MDE tested" : "not all relevant genes tested / high number of unexplained cases";
        const variant =
          p.clnAff.variantsOfInterest === "No additional variants of interest identified" ? "no additional variant of interest"
          : p.clnAff.variantsOfInterest === "Additional plausible VUS identified" ? "an additional plausible VUS identified"
          : "an additional P/LP variant identified that explains the phenotype";
        b.push(`${spec} and ${testing}, with ${variant}.`);
        if (p.clnAff.nonGeneticEtiology) b.push(`Non-Genetic Etiology Assessment: ${p.clnAff.nonGeneticEtiology}.`);
        if (p.clnAff.secondVariantCategory) {
          const col = CLN_AFF_SECOND_VARIANT_LABELS[p.clnAff.secondVariantCategory] || p.clnAff.secondVariantCategory;
          b.push(`Biallelic table: ${col}${p.clnAff.coOccurrenceLikelihood ? `, co-occurrence likelihood ${p.clnAff.coOccurrenceLikelihood === "low" ? "< 0.0001" : "0.0001–0.01"}` : ""}.`);
        }
        return b;
      }
      case "CLN_DNV": {
        if (!p.clnAff.phenotypicSpecificity) return ["Phenotype Consistency has not been selected in CLN_AFF yet."];
        if (p.clnDnv.deNovoStatus !== "Is de novo") return [`de novo status: ${p.clnDnv.deNovoStatus}.`];
        const spec = p.clnAff.phenotypicSpecificity === "Specific for MDE" ? "specific" : "consistent";
        return [`Using ${spec} phenotype category from CLN_AFF; de novo with ${(p.clnDnv.parentalConfirmation || "").toLowerCase()} parental relationships.`];
      }
      case "LOC_PHE": {
        if (p.locPhe!.vbcEligible === "no-data") return ["No robust diagnostic yield / phenotype specificity data available for this disorder (LOC_PHE_ND)."];
        if (p.locPhe!.vbcEligible !== "yes") return ["Yield/specificity data exists but doesn't meet the criteria for this VBC (methodology mismatch, phenotype not robustly defined, etc.) — LOC_PHE_0.0."];
        return [
          `Diagnostic yield ${p.locPhe!.diagnosticYield} for this phenotype/testing methodology.`,
          "Locus-level evidence (Supplement 5): the Aggregate column applies only the single most-informative affected proband's value (max, not summed).",
        ];
      }
      case "LOC_SEG":
        return locSegReasoning(modeOfInheritance, p);
      case "CLN_UAF": {
        if (!p.clnUaf!.phenotypicPenetrance) return ["Phenotypic penetrance has not been selected yet."];
        const b: string[] = [`Phenotypic penetrance: ${p.clnUaf!.phenotypicPenetrance}.`];
        const bucket = clnUafMoiBucket(modeOfInheritance);
        if (bucket === "recessive" && p.clnUaf!.phenotypicPenetrance !== "Penetrance not established / unknown") {
          const opt = CLN_UAF_SECOND_VARIANT_OPTIONS.find((o) => o.value === p.clnUaf!.secondVariantCategory);
          b.push(opt ? `Recessive/X-linked table: ${opt.label}.` : "Recessive or X-linked disorder — zygosity/second-variant status not yet selected.");
        }
        return b;
      }
      case "CLN_ALT": {
        if (!p.clnAlt!.severityCategory) return ["Phenotype severity has not been selected yet."];
        const opt = CLN_ALT_SEVERITY_OPTIONS.find((o) => o.value === p.clnAlt!.severityCategory);
        const b: string[] = [opt ? opt.label : p.clnAlt!.severityCategory!];
        const gOpt = CLN_ALT_GENE_RELATIONSHIP_OPTIONS.find((o) => o.value === p.clnAlt!.secondVariantGeneRelationship);
        if (gOpt) b.push(`Alternative-cause variant: ${gOpt.label.toLowerCase()}.`);
        if (opt && opt.sameGeneOnly && p.clnAlt!.secondVariantGeneRelationship !== "same-gene") {
          b.push("This −1.0 tier only applies when the alternative-cause variant is in the same gene as the VBC.");
        }
        return b;
      }
      default:
        return [];
    }
  })();

  return b;
}

/* ============================================================
   Predicted Effect scoring helpers — grounded in the live
   327-predicted-effect mockup (Missense/Nonsense/Canonical Splice
   branches actually stepped through) plus Supplements 6, 8, 19, 20.
   ============================================================ */

// Initial Evidence Points for missense's in silico predictor step, per the
// uploaded Supplement 6 chart. Each predictor maps its raw score to a
// -4.0..+4.0 point tier; ESM1b runs in the opposite direction (a more
// negative raw score is more pathogenic) so it's flagged "descending" and
// the lookup below negates both the input and the tier boundaries rather
// than duplicating the lookup logic. Some predictors don't reach every
// tier (e.g. AlphaMissense/BayesDel/MutPred2/VEST4 have no -4.0 value,
// ESM1b has no +4.0 value) -- that's from the source chart, not an
// oversight.
//
// NOTE: these are a direct transcription from an uploaded chart image;
// the exact decimal boundaries (especially MutPred2's and VARITY_R's
// middle tiers, where the source table's cell-wrapping made a couple of
// values ambiguous to read) are worth double-checking against the
// original Supplement 6 table if precision matters for a real
// classification.
export const MIS_PREDICTOR_THRESHOLDS: Record<string, PredictorTable> = {
  AlphaMissense: { direction: "ascending", tiers: [
    [0.070, -3.0], [0.099, -2.0], [0.169, -1.0], [0.791, 0.0], [0.905, 1.0], [0.971, 2.0], [0.989, 3.0], [Infinity, 4.0],
  ] },
  BayesDel: { direction: "ascending", tiers: [
    [-0.520, -3.0], [-0.360, -2.0], [-0.180, -1.0], [0.129, 0.0], [0.269, 1.0], [0.409, 2.0], [0.499, 3.0], [Infinity, 4.0],
  ] },
  // Descending: tier boundaries and the input score are both negated at
  // lookup time (see misPredictorScore), so they're stored here already
  // in "negated raw score" terms -- e.g. the -4.0 tier is raw score >=
  // 8.8, stored as boundary -8.8 in negated space.
  ESM1b: { direction: "descending", tiers: [
    [-8.8, -4.0], [3.1, -3.0], [6.3, -2.0], [10.6, -1.0], [12.1, 0.0], [13.9, 1.0], [23.9, 2.0], [Infinity, 3.0],
  ] },
  MutPred2: { direction: "ascending", tiers: [
    [0.010, -3.0], [0.031, -2.0], [0.197, -1.0], [0.391, 0.0], [0.736, 1.0], [0.828, 2.0], [0.931, 3.0], [Infinity, 4.0],
  ] },
  REVEL: { direction: "ascending", tiers: [
    [0.016, -4.0], [0.052, -3.0], [0.183, -2.0], [0.290, -1.0], [0.643, 0.0], [0.772, 1.0], [0.878, 2.0], [0.931, 3.0], [Infinity, 4.0],
  ] },
  VARITY_R: { direction: "ascending", tiers: [
    [0.036, -4.0], [0.063, -3.0], [0.116, -2.0], [0.251, -1.0], [0.674, 0.0], [0.841, 1.0], [0.914, 2.0], [0.964, 3.0], [Infinity, 4.0],
  ] },
  VEST4: { direction: "ascending", tiers: [
    [0.077, -3.0], [0.302, -2.0], [0.449, -1.0], [0.763, 0.0], [0.860, 1.0], [0.908, 2.0], [0.964, 3.0], [Infinity, 4.0],
  ] },
};
export function misPredictorScore(predictor: string, scoreStr: string): number | null {
  const n = parseFloat(scoreStr);
  const table = MIS_PREDICTOR_THRESHOLDS[predictor];
  if (isNaN(n) || !table) return null;
  const effectiveScore = table.direction === "descending" ? -n : n;
  for (const [upperBound, pts] of table.tiers) {
    if (effectiveScore <= upperBound) return pts;
  }
  return null;
}

export const EXON_RELEVANCE_MULTIPLIER: Record<string, number> = { all: 1.0, most: 0.5, none: 0.0 };
export const EXON_RELEVANCE_LABEL: Record<string, string> = {
  all: "Residue present in all transcripts (100%)",
  most: "Residue present in most disease-specific/highly expressed transcripts (50%)",
  none: "Residue not expressed in clinically relevant transcripts (0%)",
};

// Modify Impact only ever applies to positive initial scores (per the
// mockup's own summary note: "Only positive initial impact scores are
// considered for modification"). This is canonical-splice's single-axis
// version; nonsense uses the 2-axis Molecular Mechanism matrix below.
export function modifiedScore(initial: number | null, exonRelevance: string): number | null {
  if (initial === null) return null;
  if (initial <= 0) return initial;
  const mult = EXON_RELEVANCE_MULTIPLIER[exonRelevance];
  if (mult === undefined) return null;
  return initial * mult;
}

// The "Molecular Mechanism and Exon Relevance Matrix" -- shared,
// identical table used by nonsense (Supplement 8) and by canonical
// splice's three "likely" sub-paths (Supplement 11, Figures 2/6/10) to
// scale a positive initial PRD score by (a) how many clinically-relevant
// transcripts contain the affected exon(s) ("All"/"Most"/"Few") and (b)
// how well-established the loss-of-function mechanism is for this
// gene/MDE. Only applies to positive initial scores -- zero/negative
// scores are carried forward unmodified, same rule as modifiedScore
// above. Was named with a NUL_ prefix when only nonsense used it;
// renamed once Canonical Splice's own three "likely" sub-paths were
// confirmed (via their own figures) to use the exact same table.
export const LOF_MECHANISM_LABEL: Record<string, string> = {
  established: "Established",
  likely: "Likely",
  suspected: "Suspected",
  uncertain: "Uncertain or not LoF",
};
export const EXON_RELEVANCE_MATRIX_LABEL: Record<string, string> = {
  all: "All",
  most: "Most",
  few: "Few",
};
export const MOLECULAR_MECHANISM_MATRIX: Record<string, Record<string, number>> = {
  all: { established: 1.0, likely: 0.5, suspected: 0.25, uncertain: 0.0 },
  most: { established: 0.5, likely: 0.25, suspected: 0.0, uncertain: 0.0 },
  few: { established: 0.0, likely: 0.0, suspected: 0.0, uncertain: 0.0 },
};
export function molecularMechanismFraction(exonRelevance: string, lofMechanism: string): number | undefined {
  const row = MOLECULAR_MECHANISM_MATRIX[exonRelevance];
  return row ? row[lofMechanism] : undefined;
}
export function molecularMechanismModifiedScore(initial: number | null, exonRelevance: string, lofMechanism: string): number | null {
  if (initial === null) return null;
  if (initial <= 0) return initial;
  const mult = molecularMechanismFraction(exonRelevance, lofMechanism);
  if (mult === undefined) return null;
  return initial * mult;
}

// Three sub-paths feed the Molecular Mechanism matrix above:
//  1. NMD predicted, no known alternate start codon -> fixed +6.0 (NUL_PRD)
//  2. NMD predicted, putative alternate start codon with evidence ->
//     5-tier "Initial Points Awarded" scale, evaluated top to bottom,
//     first criterion that applies (CDS_PRD)
//  3. NMD not predicted -> 4-tier protein-impact scale (CDS_PRD)
export function nulInitialScore(draft: NonsenseDraft): number | null {
  if (draft.nulNmd === "predicted") {
    if (draft.nulAltStart === "none" || draft.nulAltStart === "") return draft.nulAltStart === "none" ? 6.0 : null;
    if (draft.nulAltStart === "predicted-rescue") {
      const map: Record<string, number> = { "retains-function": -1.0, ">50": 6.0, ">25": 4.0, ">10": 2.0, "<10": 0.0 };
      return map[draft.nulAltStartFunction!] ?? null;
    }
    return null;
  }
  if (draft.nulNmd === "not-predicted") {
    const map: Record<string, number> = { ">50": 6.0, ">25": 4.0, ">10": 2.0, "<10": 0.0 };
    return map[draft.nulProteinImpact!] ?? null;
  }
  return null;
}
export function nulInitialCode(draft: NonsenseDraft): "NUL_PRD" | "CDS_PRD" {
  return draft.nulNmd === "predicted" && draft.nulAltStart === "none" ? "NUL_PRD" : "CDS_PRD";
}

// Which code family applies downstream (FXN/INF/parent) for a nonsense
// VBC -- true only for the "NMD predicted, no rescue start codon"
// (yellow) sub-path. Both the rescue-codon (orange) and non-NMD
// (violet) sub-paths use the CDS_ family instead, per Supplement 8's
// point-table figures for those two branches (Figures 5-8), which
// consistently use CDS_FXN/CDS_INF/CDS_ -- unlike the orange path's
// own body text, whose one mention of "parent code NUL_" for that
// section appears to be a copy/paste holdover from the yellow path's
// wording rather than the actual intent.
export function nulIsNullFamily(draft: NonsenseDraft): boolean {
  return nulInitialCode(draft) === "NUL_PRD";
}
export function nulFxnCode(draft: NonsenseDraft): "NUL_FXN" | "CDS_FXN" {
  return nulIsNullFamily(draft) ? "NUL_FXN" : "CDS_FXN";
}
export function nulInfCode(draft: NonsenseDraft): "NUL_INF" | "CDS_INF" {
  return nulIsNullFamily(draft) ? "NUL_INF" : "CDS_INF";
}
export function nulParentCode(draft: NonsenseDraft): "NUL" | "CDS" {
  return nulIsNullFamily(draft) ? "NUL" : "CDS";
}

// Canonical Splice's top-level "Splicing Change Assessment" -- per
// Supplement 11 (and identically-worded in Supplement 6 for missense's
// own version of this same decision), this is deliberately NOT a
// numeric lookup table the way REVEL/AlphaMissense/etc. are for the
// Amino Acid Effect pathway: the doc only says to base it on "an in
// silico splicing predictor program" (SpliceAI, Pangolin, or similar)
// without prescribing a score cutoff, leaving where to draw the line to
// the analyst's own reading of that tool's output. Uses real U+2212
// minus/em-dash characters typed directly rather than \u escapes, since
// escape sequences don't decode in plain JSX text (only inside actual
// JS string literals) -- see the PredictedEffectSection.jsx history for
// why that distinction matters here.
export const SPL_ASSESSMENT_LABEL: Record<string, string> = {
  likely: "Splicing change likely — an in silico splice predictor (e.g. SpliceAI, Pangolin) indicates the GT/AG dinucleotide change is predicted to disrupt normal splicing",
  uncertain: "Splicing change uncertain — predictor score doesn't clearly support or rule out a splicing effect (+0.0)",
  unlikely: "Splicing change unlikely — predictor indicates the variant is unlikely to disrupt normal splicing, e.g. a nearby cryptic or alternate splice site may compensate (−1.0)",
};

// Canonical Splice (Supplement 11) predictive evidence. Three "likely"
// sub-paths feed the Molecular Mechanism matrix above (same rule as
// nonsense: only when positive); "uncertain" and "unlikely" are fixed
// values that skip the matrix entirely.
export function splInitialScore(draft: CanonicalSpliceDraft): number | null {
  if (draft.splAssessment === "uncertain") return 0.0;
  if (draft.splAssessment === "unlikely") return -1.0;
  if (draft.splAssessment === "likely") {
    if (draft.splNmd === "predicted") return 6.0;
    if (draft.splNmd === "not-predicted-frameshift") {
      const map: Record<string, number> = { ">50": 6.0, ">25": 4.0, ">10": 2.0, "<10": 0.0 };
      return map[draft.splProteinImpact!] ?? null;
    }
    // "No frameshift, NMD not predicted" (orange-lower, Figure 10) --
    // same 4-tier %-of-protein scale as the other "likely" sub-paths,
    // plus a rescue-codon floor and two extra tiers at the low end for
    // an optional in-silico protein-deletion tool's own damaging/benign
    // call (distinct from the splice predictor used earlier in this
    // path). Exact point values (particularly the +1.0/-0.5 in-silico
    // adjustments) are taken from the figure rather than the body text,
    // which states a slightly different +0.5 bonus for the same cell --
    // worth reconciling with whoever owns the source doc, but the
    // figure is treated as authoritative here since it's the actual
    // scoring table.
    if (draft.splNmd === "not-predicted-no-frameshift") {
      const map: Record<string, number> = {
        rescue: -1.0,
        ">50": 6.0,
        ">25": 4.0,
        ">10": 2.0,
        "<=10-damaging": 1.0,
        "<=10-indeterminate": 0.0,
        "<=10-benign": -0.5,
      };
      return map[draft.splNoFrameshiftProteinImpact!] ?? null;
    }
  }
  return null;
}

// SPL_SPA_ (Splicing Assay Evidence) tier tables per Supplement 11's
// figures -- the mechanic differs by sub-path, not just the values:
// "reduce" tiers scale down the already matrix-modified SPL_PRD_ value
// (the three "likely" sub-paths, Figures 3/7); "independent" tiers are
// absolute points added on top of SPL_PRD_ instead, since SPL_PRD_ is
// always a small fixed value on those two paths rather than a range
// (blue/Figure 12, violet/Figure 16).
export const SPL_SPA_REDUCE_TIERS: Record<string, SplSpaReduceTier> = {
  "near-complete": { label: "Near complete or complete presence of aberrant product", fraction: 0.0 },
  substantial: { label: "Substantial presence of aberrant product", fraction: 0.25 },
  incomplete: { label: "Incomplete or no presence of aberrant product", fraction: 1.0 },
};
export const SPL_SPA_BLUE_TIERS: Record<string, SplSpaBlueTier> = {
  "clear-disruptive": { label: "Clear evidence of a disruptive splice effect", points: 2.0 },
  "some-disruptive": { label: "Some evidence of a disruptive splice effect", points: 1.0 },
  unconvincing: { label: "Unconvincing evidence of a splice effect", points: 0.0 },
  "some-no-effect": { label: "Some evidence of no splice effect", points: -1.0 },
  "convincing-no-effect": { label: "Convincing evidence of no splice effect", points: -2.0 },
};
// Violet's "near-complete" tier isn't really a score at all per the
// figure -- it means the splice assay contradicts the "unlikely"
// in-silico call, so the doc says to reconsider which path applies
// rather than award points. Modeled with points: null plus a
// `reconsider` flag rather than a number, so the UI can show that
// distinctly instead of silently treating it as 0.
export const SPL_SPA_VIOLET_TIERS: Record<string, SplSpaVioletTier> = {
  "near-complete": { label: "Near complete or complete presence of aberrant product", points: null, reconsider: true },
  "low-level": { label: "Low-level presence of aberrant product", points: 0.0 },
  "incomplete-or-no": { label: "Incomplete or no presence of aberrant product", points: -2.0 },
};

// Which SPA tier table + combination mechanic applies for a given
// "Splicing Change Assessment" value (likely/uncertain/unlikely) --
// shared by Canonical Splice (Supplement 11) and Missense's Splice
// Effect pathway (Supplement 6), since both use identical SPA tier
// values and mechanics for all three assessments; only the initial PRD
// values and the surrounding caps (see splCaps/misSplCaps below) differ
// between the two documents. Takes the assessment value directly
// rather than a whole draft object so it works for either caller's
// field names.
export function splSpaMode(assessment: string): "reduce" | "independent-blue" | "independent-violet" | null {
  if (assessment === "likely") return "reduce";
  if (assessment === "uncertain") return "independent-blue";
  if (assessment === "unlikely") return "independent-violet";
  return null;
}

// Combines the (matrix-modified, where applicable) PRD value with SPA,
// per the shared mechanic above. Returns null for spaDelta/combined when
// no SPA assessment has been entered yet (PRD alone still stands), and
// sets `reconsider` for violet's contradictory-evidence tier rather than
// returning a number for it.
export function splCombinedPrdSpa(modifiedPrd: number | null, assessment: string, spaAssessment: string | undefined): SplCombinedResult {
  const notEntered: SplCombinedResult = { spaDelta: null, combined: modifiedPrd, reconsider: false };
  const mode = splSpaMode(assessment);
  if (mode === null || modifiedPrd === null || !spaAssessment) return notEntered;
  if (mode === "reduce") {
    const tier = SPL_SPA_REDUCE_TIERS[spaAssessment];
    if (!tier) return notEntered;
    const spaDelta = -(modifiedPrd * tier.fraction);
    return { spaDelta, combined: Math.max(0, Math.min(6, modifiedPrd + spaDelta)), reconsider: false };
  }
  if (mode === "independent-blue") {
    const tier = SPL_SPA_BLUE_TIERS[spaAssessment];
    if (!tier) return notEntered;
    return { spaDelta: tier.points, combined: Math.max(-2, Math.min(2, modifiedPrd + tier.points)), reconsider: false };
  }
  if (mode === "independent-violet") {
    const tier = SPL_SPA_VIOLET_TIERS[spaAssessment];
    if (!tier) return notEntered;
    if (tier.reconsider) return { spaDelta: null, combined: modifiedPrd, reconsider: true };
    return { spaDelta: tier.points!, combined: Math.max(-3, Math.min(0, modifiedPrd + tier.points!)), reconsider: false };
  }
  return notEntered;
}

// The combined-with-FXN cap and final parent-code cap both depend on
// which of the three sub-path groups is active -- "likely" (yellow/
// orange x2) and "uncertain" (blue) each have their own combined cap
// (+9 vs +8), and "unlikely" (violet) is the only one where FXN_ itself
// is one-sided (capped 0 at the top, not +8) because the doc caps its
// upper end there "because of the previously noted issue of evidence
// discordance" -- everything past this point on that path can only
// ever reduce the score, never raise it.
export function splCaps(assessment: string): SplCapsResult {
  if (assessment === "uncertain") return { fxnCap: [-8, 8], combinedCap: [-8, 8], finalCap: [-8, 8] };
  if (assessment === "unlikely") return { fxnCap: [-8, 0], combinedCap: [-8, 0], finalCap: [-8, 0] };
  return { fxnCap: [-8, 8], combinedCap: [-8, 9], finalCap: [-8, 10] }; // "likely" (yellow/orange x2)
}

// Missense's own version of the caps above -- same SPA mechanic and
// tier values (see splCombinedPrdSpa), but confirmed via Supplement 6's
// own figures to use different final/combined caps than Canonical
// Splice's equivalent for "uncertain": -8/+10 final (matching yellow/
// orange's shared final cap), not -8/+8. "Unlikely" matches Canonical
// Splice's one-sided treatment (FXN, combined, and final all capped at
// 0 on the upper end) -- Figure 15's "+10.0" on violet's own final-cap
// box is really just the SPL_ code family's generic declared range,
// never actually reachable once the FXN/combined steps have already
// restricted the value to <=0.
export function misSplCaps(misSplImpact: string): SplCapsResult {
  if (misSplImpact === "unlikely") return { fxnCap: [-8, 0], combinedCap: [-8, 0], finalCap: [-8, 0] };
  return { fxnCap: [-8, 8], combinedCap: [-8, 9], finalCap: [-8, 10] }; // "uncertain"
}


// Comparison / Informative Variants — implemented per Supplement 19's
// text (escalating +1/-1 per additional distinct P/LP or B/LB variant),
// which differs from the mockup's flat "All Likely +1/-1" wording; see
// note to the user about this discrepancy. Capped at -8/+8, matching
// every other INF-family code in the app (MIS_INF/CDS_INF/NUL_INF/
// SPL_INF all share this same cap per their own point-table figures).
export function comparisonScore(variants: InformativeVariantEntry[]): number {
  const p = variants.filter((v) => v.classification === "Pathogenic");
  const lp = variants.filter((v) => v.classification === "Likely Pathogenic");
  const b = variants.filter((v) => v.classification === "Benign");
  const lb = variants.filter((v) => v.classification === "Likely Benign");
  let posScore = 0;
  if (p.length > 0) posScore = 2.0 + (p.length - 1) * 1.0 + lp.length * 1.0;
  else if (lp.length > 0) posScore = 1.0 + (lp.length - 1) * 1.0;
  let negScore = 0;
  if (b.length > 0) negScore = -2.0 + (b.length - 1) * -1.0 + lb.length * -1.0;
  else if (lb.length > 0) negScore = -1.0 + (lb.length - 1) * -1.0;
  return Math.max(-8, Math.min(8, posScore + negScore));
}

/* ============================================================
   Missense (Supplement 6) — dual pathway. Every missense VBC
   requires BOTH the Missense Effect pathway (MIS_) and one
   Splice Effect sub-path (SPL_) to be evaluated concurrently;
   the higher-scoring pathway is then applied (ties go to MIS_).

   Fidelity note: all five Splice Effect sub-paths now use real point
   values and caps from Supplement 6 -- yellow, both orange paths,
   uncertain (blue), and unlikely (violet). See misSpliceYellowTotal/
   misSpliceOrangeUpperTotal/misSpliceOrangeLowerTotal/
   misSpliceUncertainOrUnlikelyTotal below.
   ============================================================ */

// Generic tiered informative-variant formula shared by every evidence
// code that counts P/LP or B/LB observations: the first "major" class
// hit scores the most, the first "minor" class hit scores half as much,
// and every additional hit (major or minor) adds the smallest increment.
export function tieredVariantScore(majorCount: number, minorCount: number, firstMajor: number, firstMinor: number, additional: number): number {
  let score = 0;
  if (majorCount > 0) score = firstMajor + (majorCount - 1) * additional + minorCount * additional;
  else if (minorCount > 0) score = firstMinor + (minorCount - 1) * additional;
  return score;
}

// Counts informativeVariants entries matching a pathway + classification
// (and, for the Missense Effect pathway, an aaCategory) -- the single source of
// truth every per-category tally below derives from, so the UI only ever
// has to store one flat list of actual variant records.
function countInfVariants(list: InformativeVariantEntry[] | undefined, pathway: string, classification: string, aaCategory?: string): number {
  return (list || []).filter((v) =>
    v.pathway === pathway &&
    v.classification === classification &&
    (aaCategory === undefined || v.aaCategory === aaCategory)
  ).length;
}

// Whether any informative variant in the list matches a given pathway +
// set of classifications + set of aaCategory values -- used below to
// derive presence/absence conditions (motif suppression) directly from
// the actual entries, rather than a separately-maintained flag that
// could drift out of sync with them (see misInformativeVariantsScore).
function hasAnyInfVariant(list: InformativeVariantEntry[] | undefined, pathway: string, classifications: string[], aaCategories: string[]): boolean {
  return (list || []).some((v) => v.pathway === pathway && classifications.includes(v.classification) && aaCategories.includes(v.aaCategory || ""));
}

// MIS_INF_: four categories per Supplement 6 (same-AA P/LP, distinct-AA
// Grantham<= P/LP, distinct-AA Grantham>= B/LB, same-AA B/LB), all
// summed together if applicable, plus an optional one-time motif bonus.
// Categories are derived from each variant's classification (P/LP vs
// B/LB determines direction) plus its aaCategory (same-codon vs
// distinct-AA determines which of the two Grantham-relationship
// categories applies).
export function misInformativeVariantsScore(d: MissenseDualPathwayData): number {
  const list = d.informativeVariants || [];
  const cat1 = tieredVariantScore(
    countInfVariants(list, "aa", "Pathogenic", "same-codon"),
    countInfVariants(list, "aa", "Likely Pathogenic", "same-codon"),
    4, 2, 2
  );
  const cat2 = tieredVariantScore(
    countInfVariants(list, "aa", "Pathogenic", "distinct-aa"),
    countInfVariants(list, "aa", "Likely Pathogenic", "distinct-aa"),
    2, 1, 1
  );
  const cat3 = -tieredVariantScore(
    countInfVariants(list, "aa", "Benign", "distinct-aa"),
    countInfVariants(list, "aa", "Likely Benign", "distinct-aa"),
    2, 1, 1
  );
  const cat4 = -tieredVariantScore(
    countInfVariants(list, "aa", "Benign", "same-codon"),
    countInfVariants(list, "aa", "Likely Benign", "same-codon"),
    4, 2, 2
  );
  // The motif bonus is a fallback for category 2 specifically -- per
  // Supplement 6, it's only awarded when there's no other real P/LP
  // informative variant already counted (cat1 or cat2 -- awarding both
  // would double-count the same underlying signal the motif reasoning
  // stands in for), and it's suppressed entirely if any benign/likely
  // benign informative variant exists "for this codon" (cat3 or cat4;
  // every MIS_INF_ category is inherently same-codon-as-VBC already,
  // so there's no separate codon check needed here). Presence of a
  // motif entry itself is also derived fresh from the list rather than
  // a maintained flag, since a flag toggled per add/remove can't
  // correctly track "at least one still exists" once more than one
  // motif entry has ever been added and one of them removed.
  const hasMotifEntry = (list || []).some((v) => v.pathway === "aa" && v.aaCategory === "motif");
  const hasOtherPLP = hasAnyInfVariant(list, "aa", ["Pathogenic", "Likely Pathogenic"], ["same-codon", "distinct-aa"]);
  const hasAnyBenign = hasAnyInfVariant(list, "aa", ["Benign", "Likely Benign"], ["same-codon", "distinct-aa"]);
  const motif = hasMotifEntry && !hasOtherPLP && !hasAnyBenign ? 2 : 0;
  return Math.max(-8, Math.min(8, cat1 + cat2 + cat3 + cat4 + motif));
}

// MIS_ total: predictor score -> exon relevance -> functional -> capped
// at -8/+6, then informative variants added and capped at -8/+9.
export function misAminoAcidTotal(d: MissenseDualPathwayData): MisAminoAcidTotalResult {
  const initial = misPredictorScore(d.misAaPredictor!, d.misAaScore!);
  const modified = modifiedScore(initial, d.misAaExonRelevance!);
  // "nd"/"na" (fxnAaStatus) means this code contributes nothing to the
  // total, same as if no functional evidence had been entered at all --
  // a curator-asserted status should never be silently overridden by
  // whatever raw entries happen to exist.
  const fxn = d.fxnAaStatus === "score" ? functionalEvidenceTotal(d.functionalEvidence, "aa") : 0;
  const predFxn = modified === null ? null : Math.max(-8, Math.min(6, modified + fxn));
  const inf = misInformativeVariantsScore(d);
  const total = predFxn === null ? null : Math.max(-8, Math.min(9, predFxn + inf));
  return { initial, modified, fxn, predFxn, inf, total };
}

// Missense's "boost" SPA tiers for the three "likely" sub-paths --
// distinct from Canonical Splice's "reduce" mechanic (same shape as
// SPL_SPA_REDUCE_TIERS, but the multiplier ADDS a bonus to the
// matrix-modified PRD value instead of subtracting one). Keys match
// what misSpliceLikelyTotal already reads via d.misSplAssay.
export const MIS_SPL_ASSAY_BOOST_TIERS: Record<string, MisSplAssayBoostTier> = {
  full: { label: "Near complete or complete presence of aberrant product", fraction: 1.0 },
  partial: { label: "Substantial presence of aberrant product", fraction: 0.5 },
  none: { label: "Incomplete or no presence of aberrant product (may need to reconsider Initial Evidence Points)", fraction: 0.0 },
};

// SPL_ total for the two "likely, NMD predicted or not" sub-paths that
// share every mechanic except their initial evidence lookup: yellow
// (fixed +3.0) and both orange paths (a 7-tier %-of-protein scale,
// identical between orange-upper and orange-lower per Supplement 6's
// own figures -- unlike Supplement 11's canonical-splice equivalent,
// where only the lower orange path gets the richer scale). Exon
// relevance uses the full Molecular Mechanism x Exon Relevance matrix
// (shared with nonsense/canonical splice) -- previously this used the
// simpler single-axis modifiedScore, missing the LoF Mechanism axis
// entirely.
function misSpliceLikelyTotal(initial: number | null, d: MissenseDualPathwayData): MisSpliceLikelyTotalResult {
  const modified = molecularMechanismModifiedScore(initial, d.misSplExonRelevance!, d.misSplLofMechanism!);
  const assayMult: Record<string, number> = { none: 0, partial: 0.5, full: 1 };
  const assayMultValue = assayMult[d.misSplAssay!];
  const withAssay = modified === null ? null : Math.max(0, Math.min(6, modified + (assayMultValue !== undefined ? modified * assayMultValue : 0)));
  // "nd"/"na" (fxnSplStatus) means this code contributes nothing to the
  // total -- see the matching note in misAminoAcidTotal above.
  const fxn = d.fxnSplStatus === "score" ? functionalEvidenceTotal(d.functionalEvidence, "splice") : 0;
  const predFxn = withAssay === null ? null : Math.max(-8, Math.min(9, withAssay + fxn));
  const inf = Math.max(-8, Math.min(8,
    tieredVariantScore(
      countInfVariants(d.informativeVariants, "splice", "Pathogenic"),
      countInfVariants(d.informativeVariants, "splice", "Likely Pathogenic"),
      2, 1, 1
    ) - tieredVariantScore(
      countInfVariants(d.informativeVariants, "splice", "Benign"),
      countInfVariants(d.informativeVariants, "splice", "Likely Benign"),
      2, 1, 1
    )
  ));
  // Confirmed -8.0/+10.0 directly from Supplement 6's own "orange" and
  // "violet" cap-box figures ("Cap and Code as SPL_-8.0 to +10.0"),
  // which also applies to yellow per the doc's shared final-cap
  // language across all three "likely" sub-paths -- this corrects the
  // cap this function used before (-8/+8), which came from an earlier,
  // less certain reading of the body text rather than the figures.
  const total = predFxn === null ? null : Math.max(-8, Math.min(10, predFxn + inf));
  return { initial, modified, withAssay, fxn, predFxn, inf, total };
}

// Yellow (frameshift + NMD predicted): fixed +3.0 initial.
export function misSpliceYellowTotal(d: MissenseDualPathwayData): MisSpliceLikelyTotalResult {
  return misSpliceLikelyTotal(3.0, d);
}

// Orange-upper (frameshift, NMD not predicted): a plain 5-tier
// %-of-protein scale plus a rescue-codon floor -- confirmed via
// Supplement 6's own dedicated figure for this path. No in-silico
// inframe-tool tiers here; those only apply to orange-lower, below.
// (An earlier pass had mistakenly given upper-orange the same 7-tier
// scale as lower-orange, based on a low-resolution composite image that
// turned out to be misleading -- this dedicated figure is the correct,
// authoritative source and doesn't have those two extra tiers.)
const MIS_SPL_ORANGE_UPPER_PROTEIN_IMPACT: Record<string, number> = {
  rescue: -1.0,
  ">50": 3.0,
  ">25": 2.0,
  ">10": 1.0,
  "<10": 0.0,
};
export function misSpliceOrangeUpperTotal(d: MissenseDualPathwayData): MisSpliceLikelyTotalResult {
  return misSpliceLikelyTotal(MIS_SPL_ORANGE_UPPER_PROTEIN_IMPACT[d.misSplUpperProteinImpact!] ?? null, d);
}

// Orange-lower (no frameshift, NMD not predicted): the richer 7-tier
// scale -- same rescue floor and %-of-protein tiers as orange-upper,
// plus two extra tiers at the low end for an optional in-silico
// inframe-impact tool's damaging/benign call. Confirmed via Supplement
// 6's own dedicated figure for this path.
const MIS_SPL_ORANGE_LOWER_PROTEIN_IMPACT: Record<string, number> = {
  rescue: -1.0,
  ">50": 3.0,
  ">25": 2.0,
  ">10": 1.0,
  "<=10-damaging": 0.5,
  "<=10-indeterminate": 0.0,
  "<=10-benign": -0.5,
};
export function misSpliceOrangeLowerTotal(d: MissenseDualPathwayData): MisSpliceLikelyTotalResult {
  return misSpliceLikelyTotal(MIS_SPL_ORANGE_LOWER_PROTEIN_IMPACT[d.misSplLowerProteinImpact!] ?? null, d);
}

// Violet's (and Canonical Splice's own violet's) Informative Variants
// only count Benign/Likely Benign evidence -- per the doc, a
// Pathogenic/Likely Pathogenic informative variant found here means the
// analyst should reconsider which path applies, not score it. Capped at
// -8.0 to 0.0. Exported since Canonical Splice's own violet path has
// this identical documented behavior but doesn't implement it yet
// either (still uses the generic bidirectional comparisonScore) --
// flagged as a follow-up rather than changed in this pass, since it
// wasn't part of what was asked here.
export function oneSidedBenignInfScore(list: InformativeVariantEntry[], pathway: string): OneSidedBenignInfResult {
  const hasPathogenicSide = countInfVariants(list, pathway, "Pathogenic") > 0 || countInfVariants(list, pathway, "Likely Pathogenic") > 0;
  if (hasPathogenicSide) return { score: 0, reconsider: true };
  const score = -tieredVariantScore(
    countInfVariants(list, pathway, "Benign"),
    countInfVariants(list, pathway, "Likely Benign"),
    2, 1, 1
  );
  return { score: Math.max(-8, score), reconsider: false };
}

// "Uncertain" (blue, fixed 0.0) and "unlikely" (violet, fixed -1.0) --
// Molecular Mechanism/Exon Relevance are not considered on either path
// (matches the shared modifiedScore-family rule: only positive initial
// scores go through the matrix, and these are never positive). Both
// share the same independent SPA mechanic and point values as Canonical
// Splice's identically-colored paths (splCombinedPrdSpa), confirmed via
// Supplement 6's own SPA figures for each -- only the surrounding caps
// differ from Canonical Splice's version (misSplCaps vs splCaps).
// Violet's Informative Variants are one-sided (see
// oneSidedBenignInfScore); uncertain's are the standard bidirectional
// calculation, same as yellow/orange's.
export function misSpliceUncertainOrUnlikelyTotal(d: MissenseDualPathwayData): MisSpliceUncertainTotalResult {
  const initial = d.misSplImpact === "unlikely" ? -1.0 : 0.0;
  const caps = misSplCaps(d.misSplImpact!);
  const combined = splCombinedPrdSpa(initial, d.misSplImpact!, d.misSplSpaAssessment);
  const fxnRaw = d.fxnSplStatus === "score" ? functionalEvidenceTotal(d.functionalEvidence, "splice") : 0;
  const fxn = Math.max(caps.fxnCap[0], Math.min(caps.fxnCap[1], fxnRaw));
  const predFxn = combined.combined === null ? null : Math.max(caps.combinedCap[0], Math.min(caps.combinedCap[1], combined.combined + fxn));
  let inf: number;
  let infReconsider: boolean;
  if (d.misSplImpact === "unlikely") {
    const result = oneSidedBenignInfScore(d.informativeVariants || [], "splice");
    inf = result.score;
    infReconsider = result.reconsider;
  } else {
    inf = Math.max(-8, Math.min(8,
      tieredVariantScore(
        countInfVariants(d.informativeVariants, "splice", "Pathogenic"),
        countInfVariants(d.informativeVariants, "splice", "Likely Pathogenic"),
        2, 1, 1
      ) - tieredVariantScore(
        countInfVariants(d.informativeVariants, "splice", "Benign"),
        countInfVariants(d.informativeVariants, "splice", "Likely Benign"),
        2, 1, 1
      )
    ));
    infReconsider = false;
  }
  const total = predFxn === null ? null : Math.max(caps.finalCap[0], Math.min(caps.finalCap[1], predFxn + inf));
  // `modified` included for shape-parity with misSpliceYellowTotal/
  // misSpliceOrangeUpperTotal/misSpliceOrangeLowerTotal (all of which
  // return one) -- the Splice Effect card's header badge reads
  // `.modified` regardless of which sub-path produced the result, and
  // this function was the one missing it, so that badge always fell
  // through to "NE" on the Uncertain/Unlikely paths even once a real
  // score exists. Trivially equal to `initial` here since the matrix
  // never applies to either of these two fixed values.
  return { initial, modified: initial, combined, fxn, predFxn, inf, total, reconsider: combined.reconsider || infReconsider };
}

export function misSpliceTotal(d: MissenseDualPathwayData): MisSpliceTotalResult {
  if (d.misSplImpact === "likely" && d.misSplSubpath === "yellow") return misSpliceYellowTotal(d);
  if (d.misSplImpact === "likely" && d.misSplSubpath === "upper-orange") return misSpliceOrangeUpperTotal(d);
  if (d.misSplImpact === "likely" && d.misSplSubpath === "lower-orange") return misSpliceOrangeLowerTotal(d);
  if (d.misSplImpact === "uncertain" || d.misSplImpact === "unlikely") return misSpliceUncertainOrUnlikelyTotal(d);
  return { total: null };
}

// Per Supplement 6: if the splice pathway's total is negative (or not
// yet computed), the Missense Effect pathway applies. If positive, the
// higher of the two applies; ties go to the Missense Effect pathway.
export function misResolveParentCode(misTotal: number | null, splTotal: number | null): "MIS" | "SPL" | null {
  if (misTotal === null && splTotal === null) return null;
  if (splTotal !== null && splTotal > 0 && (misTotal === null || splTotal > misTotal)) return "SPL";
  return "MIS";
}

// ============================================================
// Functional Evidence (Supplement 20) -- OddsPath lookup tables + the
// evidence-list scoring that replaced the old single-manual-field model.
//
// Table 1 (pathogenicity): row = # benign control variants (0-10),
// column = # pathogenic control variants (0-10). Used when the VBC's
// assay result falls in the experiment's PATHOGENIC control range.
// Table 2 (benignity): same axes, used when the VBC's result falls in
// the BENIGN control range. Values are kept exactly as signed in the
// source table (already negative) so a lookup returns the final point
// value with no extra sign-flip step to get wrong.
// ============================================================
export const ODDS_PATH_PATHOGENIC_TABLE: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3],
  [0, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3],
];

export const ODDS_PATH_BENIGN_TABLE: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, -1, -1, -1, -1, -2, -2, -2],
  [0, 0, 0, -1, -1, -1, -2, -2, -2, -2, -2],
  [0, 0, -1, -1, -1, -2, -2, -2, -2, -2, -2],
  [0, 0, -1, -1, -1, -2, -2, -2, -2, -2, -2],
  [0, 0, -1, -1, -1, -2, -2, -2, -2, -2, -3],
  [0, 0, -1, -1, -1, -2, -2, -2, -2, -2, -3],
  [0, 0, -1, -1, -2, -2, -2, -2, -2, -2, -3],
  [0, 0, -1, -1, -2, -2, -2, -2, -2, -2, -3],
  [0, 0, -1, -1, -2, -2, -2, -2, -2, -3, -3],
  [0, 0, -1, -1, -2, -2, -2, -2, -2, -3, -3],
];

export function oddsPathPoints(numBenignControls: number | string, numPathogenicControls: number | string, resultRange: string | undefined): number | null {
  if (numBenignControls === "" || numPathogenicControls === "" || !resultRange) return null;
  const b = Number(numBenignControls);
  const p = Number(numPathogenicControls);
  if (Number.isNaN(b) || Number.isNaN(p)) return null;
  const bi = Math.max(0, Math.min(10, Math.round(b)));
  const pi = Math.max(0, Math.min(10, Math.round(p)));
  const table = resultRange === "pathogenic" ? ODDS_PATH_PATHOGENIC_TABLE : ODDS_PATH_BENIGN_TABLE;
  return table[bi][pi];
}

// TABLE_3_ANIMAL_MODEL: reference only (Supplement 20, Table 3) -- model
// organism evidence is entered as a manual point value per the curator's
// request to keep that flow simple, so this isn't looked up automatically.
// Shown as a reference table in the Functional Evidence modal instead.
export const TABLE_3_ANIMAL_MODEL: AnimalModelRow[] = [
  { phenotypicConsistency: "High replication of human phenotype", inheritancePattern: "Same as human MDE", proteinSimilarity: "High", points: 4.0 },
  { phenotypicConsistency: "High replication of human phenotype", inheritancePattern: "Different from human MDE", proteinSimilarity: "High", points: 3.0 },
  { phenotypicConsistency: "Key features replicated", inheritancePattern: "Same as human MDE", proteinSimilarity: "High", points: 2.0 },
  { phenotypicConsistency: "Key features replicated", inheritancePattern: "Difference from human MDE", proteinSimilarity: "High", points: 1.0 },
  { phenotypicConsistency: "Similar phenotype", inheritancePattern: "Same as human MDE", proteinSimilarity: "High", points: 1.0 },
  { phenotypicConsistency: "No phenotypic consistency OR protein-level similarity not high", inheritancePattern: "—", proteinSimilarity: "—", points: 0.0 },
];

// A single functional evidence entry's point value. MAVE/literature
// entries derive from the OddsPath tables above; model-organism entries
// use the manual point value the curator entered (per request, kept
// simple -- no Table 3 auto-lookup).
export function functionalEvidencePoints(entry: FunctionalEvidenceEntry | null | undefined): number | null {
  if (!entry) return null;
  if (entry.kind === "model-organism") {
    return entry.manualPoints !== "" && entry.manualPoints !== undefined && entry.manualPoints !== null ? Number(entry.manualPoints) : null;
  }
  // Per Supplement 20's flow diagram, an assay judged inconsistent with
  // the gene/MDE's molecular mechanism scores 0.0 regardless of what
  // the OddsPath calculation below would otherwise produce -- a
  // distinct decision point from "no data" (ND) or "no controls used"
  // (also 0.0, but reached via the lookup tables' own [0][0] cell
  // rather than this override). Model organism entries don't have this
  // field at all -- Table 3's own criteria already account for
  // mechanism/inheritance-pattern fit.
  if (entry.mechanismConsistent === false) return 0;
  if (entry.mechanismConsistent !== true) return null;
  return oddsPathPoints(entry.numBenignControls!, entry.numPathogenicControls!, entry.resultRange);
}

// Whether any evidence entries exist for a pathway at all (independent of
// whether they're complete enough to have a point value yet) -- this is
// what distinguishes "ND / no evidence entered" from "evidence entered,
// nets to zero points".
export function hasFunctionalEvidence(functionalEvidence: FunctionalEvidenceEntry[] | undefined, pathway?: string): boolean {
  return (functionalEvidence || []).some((e) => (pathway ? e.pathway === pathway : true));
}

// Combines multiple functional evidence entries for a pathway per
// Supplement 20's "General considerations for functional assays",
// rather than a flat sum of everything entered:
//  - Same functional readout, same direction (both pathogenic-leaning or
//    both benign-leaning) -> only the strongest (largest-magnitude)
//    entry counts; summing two assays of the same readout pointing the
//    same way would double-count one biological signal.
//  - Same readout, opposite directions -> summed, so a stronger,
//    better-characterized assay can outweigh a weaker conflicting one.
//  - Distinct/separable readouts -> the doc says to score only the one
//    most directly relevant to the disease mechanism, which isn't
//    something this tool can judge on its own. Defaults to summing
//    across distinct readouts (each contributes independently) unless
//    the curator explicitly excludes an entry via `includeInScore`,
//    which is the intended lever for applying that judgment call.
// Entries with a blank readout are never auto-grouped with each other
// (or with anything else) -- grouping only applies when two or more
// entries share the same trimmed, case-insensitive non-blank readout
// text, so leaving the field blank never silently drops evidence.
// Returns `total` (capped -8/+8, same as every FXN code) and
// `statusByEntryId`, a Map from entry id to { points, counted, reason }
// so the UI can show why an entry did or didn't count.
export function functionalEvidenceContributions(functionalEvidence: FunctionalEvidenceEntry[] | undefined, pathway?: string): FunctionalEvidenceContributionsResult {
  const entries = (functionalEvidence || []).filter((e) => (pathway ? e.pathway === pathway : true));
  const withPoints = entries
    .map((entry) => ({ entry, points: functionalEvidencePoints(entry) }))
    .filter((item): item is { entry: FunctionalEvidenceEntry; points: number } => item.points !== null);

  const statusByEntryId = new Map<string, FunctionalEvidenceContributionStatus>();
  const eligible: { entry: FunctionalEvidenceEntry; points: number }[] = [];
  for (const { entry, points } of withPoints) {
    if (entry.includeInScore === false) {
      statusByEntryId.set(entry.id, { points, counted: false, reason: "excluded" });
    } else {
      eligible.push({ entry, points });
    }
  }

  const groups = new Map<string, { entry: FunctionalEvidenceEntry; points: number }[]>();
  let blankIndex = 0;
  for (const item of eligible) {
    const readout = (item.entry.functionalReadout || "").trim().toLowerCase();
    const key = readout ? `r:${readout}` : `blank:${blankIndex++}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  let total = 0;
  for (const group of groups.values()) {
    if (group.length === 1) {
      const { entry, points } = group[0];
      statusByEntryId.set(entry.id, { points, counted: true, reason: "single" });
      total += points;
      continue;
    }
    const hasPositive = group.some((g) => g.points > 0);
    const hasNegative = group.some((g) => g.points < 0);
    if (hasPositive && hasNegative) {
      for (const { entry, points } of group) {
        statusByEntryId.set(entry.id, { points, counted: true, reason: "conflicting-summed" });
        total += points;
      }
    } else {
      const strongest = group.reduce((a, b) => (Math.abs(b.points) > Math.abs(a.points) ? b : a));
      for (const { entry, points } of group) {
        const counted = entry.id === strongest.entry.id;
        statusByEntryId.set(entry.id, { points, counted, reason: counted ? "strongest" : "superseded" });
      }
      total += strongest.points;
    }
  }

  return { total: Math.max(-8, Math.min(8, total)), statusByEntryId };
}

// Convenience wrapper for callers that only need the number, not the
// per-entry breakdown -- same signature/behavior as before this was
// split out, so no call site needed to change.
export function functionalEvidenceTotal(functionalEvidence: FunctionalEvidenceEntry[] | undefined, pathway?: string): number {
  return functionalEvidenceContributions(functionalEvidence, pathway).total;
}

// Points -> classification, per the framework's sub-classification chart:
// <=-4 Benign, -3..-1 Likely Benign, 0..5 Uncertain Significance (Low/Mid/High
// sub-tiers within that range aren't reported yet, by request), 6..9 Likely
// Pathogenic, >=10 Pathogenic. Written as < comparisons rather than exact
// integer buckets so it degrades sensibly for the fractional totals this app
// actually produces (e.g. a +0.5 CLN code) rather than leaving gaps between
// the integer thresholds. Shared by the Summary page and the persistent
// header pill so the two can't drift out of sync.
export function classificationFor(total: number): string {
  if (total <= -4) return "Benign";
  if (total < 0) return "Likely Benign";
  if (total < 6) return "Uncertain Significance";
  if (total < 10) return "Likely Pathogenic";
  return "Pathogenic";
}

// Shared color tones per classification, used by both the Summary page's
// banner and the persistent header pill.
export const CLASSIFICATION_TONES: Record<string, ClassificationTone> = {
  Benign: { bg: "bg-blue-200", text: "text-blue-900", divider: "border-blue-900/15" },
  "Likely Benign": { bg: "bg-blue-100", text: "text-blue-800", divider: "border-blue-800/15" },
  "Uncertain Significance": { bg: "bg-amber-100", text: "text-amber-900", divider: "border-amber-900/15" },
  "Likely Pathogenic": { bg: "bg-red-200", text: "text-red-900", divider: "border-red-900/15" },
  Pathogenic: { bg: "bg-red-700", text: "text-white", divider: "border-white/20" },
};
