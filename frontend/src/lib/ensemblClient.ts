// Client-side fetcher for transcript-level consequences (RefSeq and
// Ensembl) -- built against Ensembl's public VEP REST endpoint, which
// takes a genomic HGVS expression and returns every overlapping
// transcript's exon/intron, coding change, protein change, and
// molecular consequence in one call.
//
// Endpoint: https://rest.ensembl.org/vep/human/hgvs/:hgvs
// Docs: https://rest.ensembl.org/documentation/info/vep_hgvs_get

import { viaProxy } from "./apiProxyConfig";

const ENSEMBL_VEP_BASE = "https://rest.ensembl.org/vep/human/hgvs";

export class EnsemblFetchError extends Error {
  override name = "EnsemblFetchError";
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

// --- VEP response types ---

interface VepTranscriptConsequence {
  transcript_id?: string;
  gene_symbol?: string;
  hgvsc?: string;
  hgvsp?: string;
  exon?: string;
  intron?: string;
  consequence_terms?: string[];
  canonical?: number;
  mane_select?: boolean | string;
  mane_plus_clinical?: boolean | string;
  flags?: string[];
}

interface VepResult {
  transcript_consequences?: VepTranscriptConsequence[];
  most_severe_consequence?: string;
}

// --- Output types ---

export interface TranscriptRow {
  change: string;
  transcriptId: string;
  exon: string;
  intron: string;
  protein: string;
  consequence: string;
  mane: boolean;
  manePlusClinical: boolean;
}

export interface TranscriptTableResult {
  ensemblTranscripts: TranscriptRow[];
  refSeqTranscripts: TranscriptRow[];
  geneSymbol: string | null;
  mostSevereConsequence: string | null;
}

async function fetchVep(hgvs: string): Promise<VepResult> {
  const url = `${ENSEMBL_VEP_BASE}/${encodeURIComponent(hgvs)}?content-type=application/json&merged=true&canonical=true&ccds=true&xref_refseq=true&tsl=true&mane=1&hgvs=1`;
  let response: Response;
  try {
    response = await fetch(viaProxy(url), { headers: { Accept: "application/json" } });
  } catch (err) {
    throw new EnsemblFetchError(
      "Couldn't reach the Ensembl VEP API -- this may be a network/CORS issue rather than a problem with the variant.",
      err,
    );
  }
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error ? ` (${body.error})` : "";
    } catch {
      /* response body wasn't JSON -- fall through with no extra detail */
    }
    throw new EnsemblFetchError(`Ensembl VEP returned an error (HTTP ${response.status})${detail}.`);
  }
  const data: VepResult[] = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new EnsemblFetchError("Ensembl VEP didn't return any consequences for this HGVS expression.");
  }
  return data[0];
}

// Whether VEP flagged this transcript_consequence as MANE Select.
function isManeSelect(tc: VepTranscriptConsequence): boolean {
  if (tc.mane_select) return true;
  if (Array.isArray(tc.flags) && tc.flags.includes("mane_select")) return true;
  return false;
}

function isManePlusClinical(tc: VepTranscriptConsequence): boolean {
  if (tc.mane_plus_clinical) return true;
  if (Array.isArray(tc.flags) && tc.flags.includes("mane_plus_clinical")) return true;
  return false;
}

function normalizeConsequence(
  tc: VepTranscriptConsequence,
  geneSymbolFallback: string | null | undefined,
  hasExplicitMane: boolean,
): TranscriptRow | null {
  const gene = tc.gene_symbol || geneSymbolFallback || "";
  const change = tc.hgvsc ? `${tc.hgvsc}${gene ? ` (${gene})` : ""}` : null;
  if (!change) return null;
  return {
    change,
    transcriptId: tc.transcript_id || "",
    exon: tc.exon || "",
    intron: tc.intron || "",
    protein: tc.hgvsp || "",
    consequence: (tc.consequence_terms || []).join(", "),
    mane: hasExplicitMane ? isManeSelect(tc) : tc.canonical === 1,
    manePlusClinical: isManePlusClinical(tc),
  };
}

// Splits one VEP result's transcript_consequences into RefSeq vs Ensembl
// rows by transcript ID prefix.
function splitByTranscriptSource(
  vepResult: VepResult,
  geneSymbolFallback: string | null | undefined,
): { refSeq: TranscriptRow[]; ensembl: TranscriptRow[] } {
  const consequences = vepResult?.transcript_consequences || [];
  const refSeq: TranscriptRow[] = [];
  const ensembl: TranscriptRow[] = [];
  const hasExplicitMane = consequences.some((tc) => isManeSelect(tc));

  for (const tc of consequences) {
    const row = normalizeConsequence(tc, geneSymbolFallback, hasExplicitMane);
    if (!row) continue;
    const id = tc.transcript_id || "";
    if (/^(NM_|NR_|XM_|XR_)/.test(id)) {
      refSeq.push(row);
    } else {
      ensembl.push(row);
    }
  }
  return { refSeq, ensembl };
}

// Fetches transcript consequences for one genomic HGVS expression (e.g.
// "NC_000017.11:g.7675190C>T") and splits the result into RefSeq and
// Ensembl transcript tables.
export async function fetchTranscriptTables(
  genomicHgvs: string | null | undefined,
  geneSymbolFallback?: string | null,
): Promise<TranscriptTableResult> {
  const trimmed = (genomicHgvs || "").trim();
  if (!trimmed) throw new EnsemblFetchError("No genomic HGVS to look up transcripts for.");

  const vepResult = await fetchVep(trimmed);
  const { refSeq, ensembl } = splitByTranscriptSource(vepResult, geneSymbolFallback);
  const geneSymbol =
    (vepResult?.transcript_consequences || []).find((tc) => tc.gene_symbol)?.gene_symbol || null;

  return {
    ensemblTranscripts: ensembl,
    refSeqTranscripts: refSeq,
    geneSymbol,
    mostSevereConsequence: vepResult?.most_severe_consequence || null,
  };
}
