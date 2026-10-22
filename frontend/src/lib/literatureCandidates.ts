// Pure helpers for the Literature tab's candidate-papers list --
// record-level (one list per variant, not per source/search), deduped
// by PMID since the same paper can turn up via more than one search.

// --- Types ---

export type CandidateReviewStatus =
  | "unreviewed"
  | "relevant"
  | "not-relevant"
  | "already-captured"
  | "reference-publication";

export interface CandidateHit {
  pmid: string;
  title: string | null;
  authors: string | null;
  year: string | null;
  journal: string | null;
}

export interface CandidatePaper {
  pmid: string;
  title: string | null;
  authors: string | null;
  year: string | null;
  journal: string | null;
  foundVia: string[];
  reviewStatus: CandidateReviewStatus;
  reviewedBy: string | null;
  reviewedAtMs: number | null;
  note: string;
}

interface ProbandEntry {
  source?: string;
  sourceDetail?: {
    pmid?: string;
  };
}

interface LiteratureOnlyEntry {
  data?: {
    sourceDetail?: {
      pmid?: string;
    };
  };
}

export interface CollectKnownPmidsInput {
  savedProbands?: ProbandEntry[];
  clnCcsSaved?: boolean;
  clnCcsSourcePmid?: string;
  literatureOnlyEntries?: LiteratureOnlyEntry[];
}

// Every PMID already on record anywhere in this variant's own curated
// evidence -- so a fresh search result that's already been curated can
// be flagged instead of presented as new.
export function collectKnownPmids({ savedProbands, clnCcsSaved, clnCcsSourcePmid, literatureOnlyEntries }: CollectKnownPmidsInput): Set<string> {
  const pmids = new Set<string>();
  (savedProbands || []).forEach((p) => {
    if (p.source === "literature" && p.sourceDetail?.pmid) pmids.add(String(p.sourceDetail.pmid).trim());
  });
  if (clnCcsSaved && clnCcsSourcePmid) pmids.add(String(clnCcsSourcePmid).trim());
  (literatureOnlyEntries || []).forEach((e) => {
    const pmid = e.data?.sourceDetail?.pmid;
    if (pmid) pmids.add(String(pmid).trim());
  });
  return pmids;
}

// --- Reference-publication suppression list -- GLOBAL, not per-variant.
const REFERENCE_PUBLICATIONS_STORAGE_KEY = "vci-reference-publication-pmids";

export function loadReferencePublicationPmids(): Set<string> {
  try {
    const raw = localStorage.getItem(REFERENCE_PUBLICATIONS_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) as string[] : []);
  } catch {
    return new Set();
  }
}

export function saveReferencePublicationPmids(pmidSet: Set<string>): void {
  try {
    localStorage.setItem(REFERENCE_PUBLICATIONS_STORAGE_KEY, JSON.stringify(Array.from(pmidSet)));
  } catch {
    // Storage unavailable -- the list just won't persist across a reload.
  }
}

// Merges a fresh batch of search hits into the existing candidate list.
export function mergeCandidates(
  existing: CandidatePaper[],
  hits: CandidateHit[],
  searchId: string,
  knownPmids: Set<string>,
  referencePublicationPmids?: Set<string>,
): CandidatePaper[] {
  const byPmid = new Map<string, CandidatePaper>(existing.map((c) => [c.pmid, c]));
  hits.forEach((hit) => {
    const already = byPmid.get(hit.pmid);
    if (already) {
      if (!already.foundVia.includes(searchId)) already.foundVia = [...already.foundVia, searchId];
      byPmid.set(hit.pmid, {
        ...already,
        title: hit.title ?? already.title,
        authors: hit.authors ?? already.authors,
        year: hit.year ?? already.year,
        journal: hit.journal ?? already.journal,
      });
    } else {
      byPmid.set(hit.pmid, {
        pmid: hit.pmid,
        title: hit.title,
        authors: hit.authors,
        year: hit.year,
        journal: hit.journal,
        foundVia: [searchId],
        reviewStatus: referencePublicationPmids?.has(hit.pmid)
          ? "reference-publication"
          : knownPmids.has(hit.pmid)
            ? "already-captured"
            : "unreviewed",
        reviewedBy: null,
        reviewedAtMs: null,
        note: "",
      });
    }
  });
  return Array.from(byPmid.values());
}

export function setCandidateReview(
  candidates: CandidatePaper[],
  pmid: string,
  updates: { reviewStatus: CandidateReviewStatus; reviewedBy?: string | null; note?: string },
): CandidatePaper[] {
  return candidates.map((c) =>
    c.pmid === pmid
      ? {
          ...c,
          reviewStatus: updates.reviewStatus,
          reviewedBy: updates.reviewedBy ?? c.reviewedBy,
          reviewedAtMs: Date.now(),
          note: updates.note ?? c.note,
        }
      : c,
  );
}

export interface CandidateReviewOption {
  value: CandidateReviewStatus;
  label: string;
}

export const CANDIDATE_REVIEW_OPTIONS: CandidateReviewOption[] = [
  { value: "unreviewed", label: "Unreviewed" },
  { value: "relevant", label: "Relevant" },
  { value: "not-relevant", label: "Not relevant" },
  { value: "already-captured", label: "Already captured" },
  { value: "reference-publication", label: "Reference publication — do not show" },
];
