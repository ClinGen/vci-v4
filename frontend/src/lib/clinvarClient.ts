// Client-side fetcher for ClinVar data via raw NCBI E-utilities.
//
// Three calls, matching the app's three different views into ClinVar:
//   - esummary (by Variation ID): the VCV-level aggregate for "Overall
//     ClinVar Interpretation"
//   - efetch (rettype=vcv, XML, by Variation ID): individual germline
//     ClinicalAssertion (SCV) elements
//   - esearch + esummary (by gene + codon): other variants at the same
//     codon, for the Informative Variants tab

import { viaProxy } from "./apiProxyConfig";

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export class ClinVarFetchError extends Error {
  override name = "ClinVarFetchError";
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

// --- Response types ---

interface ESearchResult {
  esearchresult?: {
    idlist?: string[];
  };
}

interface ClinVarClassification {
  description?: string;
  review_status?: string;
  last_evaluated?: string;
}

interface ClinVarDocSum {
  title?: string;
  germline_classification?: ClinVarClassification;
  clinical_significance?: ClinVarClassification;
  supporting_submissions?: {
    scv?: string[];
  };
  [key: string]: unknown;
}

interface ESummaryResult {
  result?: {
    uids?: string[];
    [uid: string]: ClinVarDocSum | string[] | undefined;
  };
}

// --- Output types ---

export interface ClinVarCodonVariant {
  variationId: string;
  title: string | null;
  classification: string | null;
  reviewStatus: string | null;
  url: string;
}

export interface ClinVarSummary {
  variationId: string;
  title: string | null;
  classification: string | null;
  reviewStatus: string | null;
  lastEvaluated: string | null;
  submissionCount: number | null;
  raw: ClinVarDocSum;
}

export interface ClinVarGermlineSubmission {
  classification: string;
  reviewStatus: string | null;
  lastEvaluated: string | null;
  assertionMethod: string | null;
  condition: string | null;
  conditionSource: string | null;
  modeOfInheritance: string | null;
  citedPmids: string[];
  submitter: string | null;
  accession: string | null;
}

// --- Internal helpers ---

async function eutilsFetch(url: string, options: { asXml?: boolean } = {}): Promise<unknown> {
  const { asXml = false } = options;
  let response: Response;
  try {
    response = await fetch(viaProxy(url), { headers: { Accept: asXml ? "application/xml" : "application/json" } });
  } catch (err) {
    throw new ClinVarFetchError(
      "Couldn't reach NCBI E-utilities -- this may be a network/CORS issue (E-utilities predate CORS-friendly API design, so this is a real possibility, not just a bad variant ID).",
      err,
    );
  }
  if (!response.ok) {
    throw new ClinVarFetchError(`NCBI E-utilities returned an error (HTTP ${response.status}).`);
  }
  return asXml ? response.text() : response.json();
}

// Other variants at the same codon -- for the Informative Variants tab's
// "Identified Variants in Codon" table.
export async function fetchClinVarByCodon(
  geneSymbol: string,
  proteinChange: string,
  excludeVariationId?: string,
): Promise<ClinVarCodonVariant[]> {
  const match = /^p\.([A-Za-z]{3})(\d+)/.exec((proteinChange || "").trim());
  if (!geneSymbol || !match) {
    throw new ClinVarFetchError("Need both a gene symbol and a protein change (e.g. p.Cys141Tyr) to search by codon.");
  }
  const [, aa3, position] = match;
  const term = `${geneSymbol}[gene] AND p.${aa3.toLowerCase()}${position}`;

  const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=clinvar&term=${encodeURIComponent(term)}&retmode=json&retmax=40`;
  const searchBody = (await eutilsFetch(searchUrl)) as ESearchResult;
  const ids = (searchBody?.esearchresult?.idlist || []).filter((id) => id !== excludeVariationId);
  if (ids.length === 0) return [];

  const summaryUrl = `${EUTILS_BASE}/esummary.fcgi?db=clinvar&id=${ids.join(",")}&retmode=json`;
  const summaryBody = (await eutilsFetch(summaryUrl)) as ESummaryResult;
  const uids = summaryBody?.result?.uids || [];

  return uids.map((uid) => {
    const docsum = summaryBody.result![uid] as ClinVarDocSum;
    const germline = docsum?.germline_classification || docsum?.clinical_significance || null;
    return {
      variationId: uid,
      title: docsum?.title || null,
      classification: germline?.description || null,
      reviewStatus: germline?.review_status || null,
      url: `https://www.ncbi.nlm.nih.gov/clinvar/variation/${uid}/`,
    };
  });
}

// Top-level VCV summary: classification, review status, last evaluated,
// submission count -- for the "Overall ClinVar Interpretation" card.
export async function fetchClinVarSummary(variationId: string): Promise<ClinVarSummary> {
  const id = (variationId || "").trim();
  if (!id) throw new ClinVarFetchError("No ClinVar Variation ID to look up.");

  const url = `${EUTILS_BASE}/esummary.fcgi?db=clinvar&id=${encodeURIComponent(id)}&retmode=json`;
  const body = (await eutilsFetch(url)) as ESummaryResult;

  const uid = body?.result?.uids?.[0];
  const docsum = uid ? (body.result![uid] as ClinVarDocSum) : null;
  if (!docsum) {
    throw new ClinVarFetchError(`Variation ID ${id} wasn't found in ClinVar.`);
  }

  const germline = docsum.germline_classification || docsum.clinical_significance || null;

  return {
    variationId: id,
    title: docsum.title || null,
    classification: germline?.description || null,
    reviewStatus: germline?.review_status || null,
    lastEvaluated: germline?.last_evaluated || null,
    submissionCount: docsum.supporting_submissions?.scv?.length ?? null,
    raw: docsum,
  };
}

// Pulls text out of a single child element by tag name, or null.
function childText(el: Element | null, tag: string): string | null {
  const child = el?.querySelector(tag);
  return child ? (child.textContent ?? "").trim() : null;
}

function parseAssertion(assertionEl: Element): ClinVarGermlineSubmission | null {
  const germlineClassification = childText(assertionEl, "Classification > GermlineClassification");
  if (!germlineClassification) return null;

  const classificationEl = assertionEl.querySelector("Classification");
  const reviewStatus = childText(classificationEl, "ReviewStatus");
  const dateLastEvaluated = classificationEl?.getAttribute("DateLastEvaluated") || null;

  const accessionEl = assertionEl.querySelector("ClinVarAccession");
  const accession = accessionEl?.getAttribute("Accession") || null;
  const version = accessionEl?.getAttribute("Version") || null;
  const submitterName = accessionEl?.getAttribute("SubmitterName") || null;

  const assertionMethodAttr = Array.from(assertionEl.querySelectorAll("AttributeSet")).find(
    (as) => as.querySelector("Attribute")?.getAttribute("Type") === "AssertionMethod",
  );
  const assertionMethod = assertionMethodAttr ? childText(assertionMethodAttr, "Attribute") : null;

  const moiAttr = Array.from(assertionEl.querySelectorAll("AttributeSet")).find(
    (as) => as.querySelector("Attribute")?.getAttribute("Type") === "ModeOfInheritance",
  );
  const modeOfInheritance = moiAttr ? childText(moiAttr, "Attribute") : null;

  const traitEl = assertionEl.querySelector("TraitSet Trait");
  const condition = traitEl ? childText(traitEl, "Name > ElementValue") : null;
  const conditionSourceEl = traitEl?.querySelector("XRef");
  const conditionSource = conditionSourceEl?.getAttribute("DB") || null;

  const citedPmids = Array.from(assertionEl.querySelectorAll("Citation ID"))
    .filter((idEl) => (idEl.getAttribute("Source") || "").toLowerCase() === "pubmed")
    .map((idEl) => (idEl.textContent ?? "").trim())
    .filter(Boolean);

  return {
    classification: germlineClassification,
    reviewStatus,
    lastEvaluated: dateLastEvaluated,
    assertionMethod,
    condition,
    conditionSource,
    modeOfInheritance,
    citedPmids,
    submitter: submitterName,
    accession: accession && version ? `${accession}.${version}` : accession,
  };
}

// Full VCV record, parsed down to individual germline ClinicalAssertion
// (SCV) elements -- for the "Germline Interpretations Submitted to
// ClinVar" table.
export async function fetchClinVarGermlineSubmissions(variationId: string): Promise<ClinVarGermlineSubmission[]> {
  const id = (variationId || "").trim();
  if (!id) throw new ClinVarFetchError("No ClinVar Variation ID to look up.");

  const url = `${EUTILS_BASE}/efetch.fcgi?db=clinvar&id=${encodeURIComponent(id)}&is_variationid&rettype=vcv&retmode=xml`;
  const xmlText = (await eutilsFetch(url, { asXml: true })) as string;

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xmlText, "application/xml");
    if (doc.querySelector("parsererror")) throw new Error("XML parse error");
  } catch (err) {
    throw new ClinVarFetchError("ClinVar's VCV response wasn't valid XML.", err);
  }

  const assertions = Array.from(doc.querySelectorAll("ClinicalAssertion"));
  if (assertions.length === 0) {
    throw new ClinVarFetchError(`Variation ID ${id} wasn't found in ClinVar, or has no submissions.`);
  }

  const submissions = assertions.map(parseAssertion).filter((s): s is ClinVarGermlineSubmission => s !== null);

  // Newest to oldest by last-evaluated date, undated last.
  submissions.sort((a, b) => {
    if (!a.lastEvaluated) return 1;
    if (!b.lastEvaluated) return -1;
    return new Date(b.lastEvaluated).getTime() - new Date(a.lastEvaluated).getTime();
  });

  return submissions;
}
