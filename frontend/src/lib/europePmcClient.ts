// Client-side fetcher for Europe PMC's RESTful Web Service --
// https://www.ebi.ac.uk/europepmc/webservices/rest/search. Chosen over
// PubMed's own esearch/esummary because Europe PMC indexes full text
// (10M+ full-text articles, not just title/abstract/MeSH).

import { viaProxy } from "./apiProxyConfig";

const EUROPEPMC_BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest";

export class EuropePmcFetchError extends Error {
  override name = "EuropePmcFetchError";
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

// --- Response types ---

interface EuropePmcResultItem {
  pmid?: string;
  title?: string;
  authorString?: string;
  pubYear?: string;
  journalTitle?: string;
  source?: string;
}

interface EuropePmcSearchResponse {
  resultList?: {
    result?: EuropePmcResultItem[];
  };
}

// --- Output types ---

export interface EuropePmcCandidate {
  pmid: string;
  title: string | null;
  authors: string | null;
  year: string | null;
  journal: string | null;
  source: string | null;
}

export interface EuropePmcMetadata {
  title: string | null;
  authors: string | null;
  year: string | null;
  journal: string | null;
}

// --- Internal helpers ---

async function europePmcFetch(url: string): Promise<EuropePmcSearchResponse> {
  let response: Response;
  try {
    response = await fetch(viaProxy(url));
  } catch (err) {
    throw new EuropePmcFetchError("Couldn't reach Europe PMC -- this may be a network/CORS issue.", err);
  }
  if (!response.ok) {
    throw new EuropePmcFetchError(`Europe PMC returned an error (HTTP ${response.status}).`);
  }
  try {
    return await response.json();
  } catch (err) {
    throw new EuropePmcFetchError("Europe PMC's response wasn't valid JSON.", err);
  }
}

// Runs a query and returns a flat list of candidate papers. `query`
// should already be a fully-formed Europe PMC query string (built by
// the caller -- see literatureSearchRegistry.ts). pageSize capped at
// 25: this is meant to surface candidates for a curator to triage.
export async function fetchEuropePmcCandidates(
  query: string,
  options: { pageSize?: number } = {},
): Promise<EuropePmcCandidate[]> {
  const { pageSize = 25 } = options;
  if (!query) throw new EuropePmcFetchError("No query to search Europe PMC with.");
  const url = `${EUROPEPMC_BASE}/search?query=${encodeURIComponent(query)}&format=json&pageSize=${pageSize}&resultType=lite`;
  const body = await europePmcFetch(url);
  const results = body?.resultList?.result || [];
  return results
    .filter((r): r is EuropePmcResultItem & { pmid: string } => !!r.pmid)
    .map((r) => ({
      pmid: r.pmid,
      title: r.title || null,
      authors: r.authorString || null,
      year: r.pubYear || null,
      journal: r.journalTitle || null,
      source: r.source || null,
    }));
}

// Looks up real metadata (title/authors/year/journal) for a batch of
// already-known PMIDs -- used to backfill the ClinVar-citations search.
export async function fetchEuropePmcMetadataByPmids(
  pmids: string[],
): Promise<Record<string, EuropePmcMetadata>> {
  const unique = Array.from(new Set((pmids || []).filter(Boolean)));
  if (unique.length === 0) return {};
  const query = unique.map((pmid) => `(EXT_ID:${pmid} AND SRC:MED)`).join(" OR ");
  const url = `${EUROPEPMC_BASE}/search?query=${encodeURIComponent(query)}&format=json&pageSize=${unique.length}&resultType=lite`;
  const body = await europePmcFetch(url);
  const results = body?.resultList?.result || [];
  const byPmid: Record<string, EuropePmcMetadata> = {};
  results.forEach((r) => {
    if (!r.pmid) return;
    byPmid[r.pmid] = {
      title: r.title || null,
      authors: r.authorString || null,
      year: r.pubYear || null,
      journal: r.journalTitle || null,
    };
  });
  return byPmid;
}
