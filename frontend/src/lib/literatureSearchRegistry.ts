// A flat list of literature searches the Literature tab can offer,
// rather than bespoke one-off JSX per search -- adding a new search
// means adding one entry here, not new UI.
//
// Two kinds:
//   "link"  -- just opens a URL in a new tab
//   "live"  -- actually fetches results and returns an array of candidates
//   "manual" -- manual PMID entry

import { googleScholarSearchUrl, googleScholarResidueSearchUrl, europePmcQueryString } from "./literatureSearch";
import { litVarLink } from "./otherEvidenceLinks";
import { fetchEuropePmcCandidates, fetchEuropePmcMetadataByPmids } from "./europePmcClient";
import type { EuropePmcCandidate } from "./europePmcClient";

export interface LiteratureSearchContext {
  geneSymbol: string | null;
  terms: string[];
  proteinChange: string | null;
  rsid: string | null;
  clinvarCitedPmids?: string[];
}

interface CandidateHit {
  pmid: string;
  title: string | null;
  authors: string | null;
  year: string | null;
  journal: string | null;
}

interface LiteratureSearchBase {
  id: string;
  label: string;
  description?: string;
  platform: string;
  badgeClass?: string;
  waitingLabel?: string;
}

interface LinkSearch extends LiteratureSearchBase {
  kind: "link";
  buildUrl: (ctx: LiteratureSearchContext) => string | null;
}

interface LiveSearch extends LiteratureSearchBase {
  kind: "live";
  linkUrl?: (ctx: LiteratureSearchContext) => string | null;
  runQuery: (ctx: LiteratureSearchContext) => Promise<CandidateHit[]>;
}

interface ManualSearch extends LiteratureSearchBase {
  kind: "manual";
}

export type LiteratureSearch = LinkSearch | LiveSearch | ManualSearch;

export const LITERATURE_SEARCHES: LiteratureSearch[] = [
  {
    id: "scholar-variant",
    label: "Search for this variant in Google Scholar",
    kind: "link",
    platform: "Google Scholar",
    buildUrl: (ctx) => googleScholarSearchUrl(ctx.geneSymbol, ctx.terms),
  },
  {
    id: "scholar-residue",
    label: "Search for other variants at this residue in Google Scholar",
    kind: "link",
    platform: "Google Scholar",
    buildUrl: (ctx) => googleScholarResidueSearchUrl(ctx.geneSymbol, ctx.proteinChange),
  },
  {
    id: "litvar",
    label: "Search for this variant in LitVar2",
    description:
      "NCBI's own literature-variant database -- indexes mentions of specific variants across PubMed/PMC by dbSNP rsID rather than free-text notation matching, so it can catch mentions phrased differently than any of the notations above.",
    kind: "link",
    platform: "LitVar2",
    waitingLabel: "waiting on a dbSNP rsID to build a search",
    buildUrl: (ctx) => litVarLink(ctx.rsid),
  },
  {
    id: "europepmc-fulltext",
    label: "Search full text (Europe PMC)",
    description:
      "Also checks paper bodies and supplementary tables, not just titles/abstracts -- catches mentions PubMed's own index would miss.",
    kind: "live",
    platform: "Europe PMC",
    badgeClass: "bg-blue-100 text-blue-700",
    linkUrl: (ctx) => {
      const q = europePmcQueryString(ctx.geneSymbol, ctx.terms);
      return q ? `https://europepmc.org/search?query=${encodeURIComponent(q)}` : null;
    },
    runQuery: async (ctx): Promise<CandidateHit[]> => {
      const q = europePmcQueryString(ctx.geneSymbol, ctx.terms);
      if (!q) return [];
      const results: EuropePmcCandidate[] = await fetchEuropePmcCandidates(q);
      return results;
    },
  },
  {
    id: "clinvar-citations",
    label: "Citations from ClinVar submissions",
    description:
      "PMIDs ClinVar submitters cited as supporting evidence for this exact variant -- already-vetted for relevance, but citing a PMID is optional metadata, so a submitter can have real supporting literature without any showing up here.",
    kind: "live",
    platform: "ClinVar",
    badgeClass: "bg-green-100 text-green-700",
    runQuery: async (ctx): Promise<CandidateHit[]> => {
      const pmids = ctx.clinvarCitedPmids || [];
      if (pmids.length === 0) return [];
      const metadata = await fetchEuropePmcMetadataByPmids(pmids);
      return pmids.map((pmid) => ({
        pmid,
        ...(metadata[pmid] || { title: null, authors: null, year: null, journal: null }),
      }));
    },
  },
  {
    id: "manual-entry",
    label: "Add PMIDs manually",
    description:
      "Comma-separated PMIDs -- for papers a curator finds by hand (e.g. scanning another paper's own references) that none of the searches above turned up. Cross-referenced against every other search's results the same way a live search's hits are, so a PMID entered here that a later search also finds shows both tags rather than a duplicate row.",
    kind: "manual",
    platform: "Manual Entry",
    badgeClass: "bg-red-100 text-red-700",
  },
];
