// Client-side fetcher for in silico predictor scores -- built against
// ClinGen's own Linked Data Hub (LDH), queried by CAID.
//
// Endpoint: https://ldh.genome.network/ldh/id/{CAID}
//
// The response's data.OpenCRAVAT[0].entContent block is a rich per-tool
// annotation object (OpenCRAVAT, aggregating dbNSFP and friends).

import { viaProxy } from "./apiProxyConfig";

const LDH_BASE = "https://ldh.genome.network/ldh";

export class LdhFetchError extends Error {
  override name = "LdhFetchError";
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

// --- Response types ---

interface RevelBlock {
  all?: Array<[string, number, number, string, string]>;
  [key: string]: unknown;
}

interface AlphaMissenseBlock {
  am_pathogenicity?: number;
  transcript_id?: string;
  [key: string]: unknown;
}

interface BayesDelBlock {
  bayesdel_addAF_score?: number;
  [key: string]: unknown;
}

interface ScoreBlock {
  score?: number;
  [key: string]: unknown;
}

interface PrimateAiBlock {
  primateai_score?: number;
  [key: string]: unknown;
}

interface VarityBlock {
  varity_r?: number;
  [key: string]: unknown;
}

interface CaddBlock {
  score?: string | number;
  [key: string]: unknown;
}

interface ClinvarLdhBlock {
  id?: number;
  clinvar_allele_id?: string | number;
  dbsnp_id?: string;
  sig?: string;
  rev_stat?: string;
  disease_names?: string;
}

interface OpenCravatContent {
  revel?: RevelBlock;
  alphamissense?: AlphaMissenseBlock;
  bayesdel?: BayesDelBlock;
  esm1b?: ScoreBlock;
  mutpred2?: ScoreBlock;
  varity_r?: VarityBlock;
  vest?: ScoreBlock;
  cadd?: CaddBlock;
  primateai?: PrimateAiBlock;
  sift?: ScoreBlock;
  mutationtaster?: ScoreBlock;
  provean?: ScoreBlock;
  clinvar?: ClinvarLdhBlock;
  base?: Record<string, { version?: string }>;
  annotator_version?: Record<string, { version?: string }>;
  [key: string]: unknown;
}

interface LdhResponse {
  data?: {
    OpenCRAVAT?: Array<{ entContent: OpenCravatContent }>;
  };
}

// --- Output types ---

export interface PredictorEntry {
  score: string;
  transcriptId: string | null;
  version: string | null;
}

export interface ClinvarFromLdh {
  variationId: string | null;
  alleleId: string | number | null;
  dbsnpId: string | null;
  significance: string | null;
  reviewStatus: string | null;
  diseaseNames: string | null;
}

export interface LdhPredictorResult {
  caid: string;
  predictors: Record<string, PredictorEntry>;
  clinvar: ClinvarFromLdh | null;
  raw: OpenCravatContent;
}

// REVEL's confirmed shape -- see file header. Returns { score,
// transcriptId }, transcriptId only set when unambiguous.
function extractRevel(block: RevelBlock | undefined): { score: number | null; transcriptId: string | null } {
  const rows = Array.isArray(block?.all) ? block!.all : [];
  if (rows.length === 0) return { score: null, transcriptId: null };
  return {
    score: rows[0][1],
    transcriptId: rows.length === 1 ? rows[0][0] : null,
  };
}

type ToolExtractor = (block: Record<string, unknown>) => { score: number | null | undefined; transcriptId: string | null };

// Maps { app tool name: [openCravatKey, extractor] }.
const TOOL_MAP: Array<[string, string, ToolExtractor]> = [
  ["REVEL", "revel", extractRevel as ToolExtractor],
  ["AlphaMissense", "alphamissense", (b) => ({ score: (b as AlphaMissenseBlock).am_pathogenicity ?? null, transcriptId: (b as AlphaMissenseBlock).transcript_id || null })],
  ["BayesDel", "bayesdel", (b) => ({ score: (b as BayesDelBlock).bayesdel_addAF_score ?? null, transcriptId: null })],
  ["ESM1b", "esm1b", (b) => ({ score: (b as ScoreBlock).score ?? null, transcriptId: null })],
  ["MutPred2", "mutpred2", (b) => ({ score: (b as ScoreBlock).score ?? null, transcriptId: null })],
  ["VARITY_R", "varity_r", (b) => ({ score: (b as VarityBlock).varity_r ?? null, transcriptId: null })],
  ["VEST4", "vest", (b) => ({ score: (b as ScoreBlock).score ?? null, transcriptId: null })],
  ["CADD", "cadd", (b) => ({ score: Number((b as CaddBlock).score), transcriptId: null })],
  ["PrimateAI-3D", "primateai", (b) => ({ score: (b as PrimateAiBlock).primateai_score ?? null, transcriptId: null })],
  ["SIFT", "sift", (b) => ({ score: (b as ScoreBlock).score ?? null, transcriptId: null })],
  ["Mutation Taster", "mutationtaster", (b) => ({ score: (b as ScoreBlock).score ?? null, transcriptId: null })],
  ["PROVEAN", "provean", (b) => ({ score: (b as ScoreBlock).score ?? null, transcriptId: null })],
];

// Best-effort lookup for a tool's { datasource, version } metadata.
function versionFor(openCravat: OpenCravatContent, key: string): string | null {
  return openCravat?.base?.[key]?.version || openCravat?.annotator_version?.[key]?.version || null;
}

// entContent.clinvar's own fields.
function extractClinvarFromLdh(clinvarBlock: ClinvarLdhBlock | undefined): ClinvarFromLdh | null {
  if (!clinvarBlock) return null;
  return {
    variationId: clinvarBlock.id != null ? String(clinvarBlock.id) : null,
    alleleId: clinvarBlock.clinvar_allele_id || null,
    dbsnpId: clinvarBlock.dbsnp_id || null,
    significance: clinvarBlock.sig || null,
    reviewStatus: clinvarBlock.rev_stat || null,
    diseaseNames: clinvarBlock.disease_names || null,
  };
}

export async function fetchInSilicoPredictors(caid: string): Promise<LdhPredictorResult> {
  const id = (caid || "").trim().toUpperCase();
  if (!id) throw new LdhFetchError("No CAID to look up.");

  const url = `${LDH_BASE}/id/${encodeURIComponent(id)}`;
  let response: Response;
  try {
    response = await fetch(viaProxy(url), { headers: { Accept: "application/json" } });
  } catch (err) {
    throw new LdhFetchError(
      "Couldn't reach the ClinGen Linked Data Hub -- this may be a network/CORS issue rather than a problem with the CAID.",
      err,
    );
  }
  if (!response.ok) {
    throw new LdhFetchError(`LDH returned an error (HTTP ${response.status}).`);
  }
  const body: LdhResponse = await response.json();

  const openCravat = body?.data?.OpenCRAVAT?.[0]?.entContent;
  if (!openCravat) {
    throw new LdhFetchError(`${id} has no OpenCRAVAT annotation in LDH yet.`);
  }

  const predictors: Record<string, PredictorEntry> = {};
  for (const [toolName, key, extractFn] of TOOL_MAP) {
    const block = (openCravat as Record<string, unknown>)[key] as Record<string, unknown> | undefined;
    if (!block) continue;
    const { score, transcriptId } = extractFn(block);
    if (score === null || score === undefined || Number.isNaN(score)) continue;
    predictors[toolName] = {
      score: typeof score === "number" ? score.toPrecision(3).replace(/\.?0+$/, "") : String(score),
      transcriptId: transcriptId || null,
      version: versionFor(openCravat, key),
    };
  }

  return {
    caid: id,
    predictors,
    clinvar: extractClinvarFromLdh(openCravat.clinvar),
    raw: openCravat,
  };
}
