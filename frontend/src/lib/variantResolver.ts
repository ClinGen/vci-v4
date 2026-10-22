// Client-side resolver for turning a ClinGen canonical allele ID (CAID,
// e.g. "CA000174") into the cross-referenced IDs the rest of the app
// needs -- built against the ClinGen Allele Registry's public, no-auth
// "/allele/{CAID}" endpoint.
//
// Reference: https://reg.clinicalgenome.org/doc/AlleleRegistry_1.01.xx_api_v1.pdf

import { viaProxy } from "./apiProxyConfig";

const ALLELE_REGISTRY_BASE = "https://reg.clinicalgenome.org";
const CAID_PATTERN = /^CA[0-9]+$/i;

export class VariantResolverError extends Error {
  override name = "VariantResolverError";
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

// --- Allele Registry response shape (partial) ---

interface AlleleRegistryExternalRecord {
  variationId?: number;
  preferredName?: string | string[];
  rs?: number;
}

interface AlleleRegistryGenomicAllele {
  referenceGenome?: string;
  hgvs?: string[];
}

interface AlleleRegistryResponse {
  "@id"?: string;
  externalRecords?: Record<string, AlleleRegistryExternalRecord[]>;
  genomicAlleles?: AlleleRegistryGenomicAllele[];
  communityStandardTitle?: string[];
  [key: string]: unknown;
}

// --- Extracted result ---

export interface ResolvedVariant {
  caid: string;
  arUrl: string;
  clinvarId: string | null;
  clinvarUrl: string | null;
  clinvarPreferredName: string | null;
  communityStandardTitle: string | null;
  geneSymbol: string | null;
  proteinChange: string | null;
  rsid: string | null;
  dbsnpUrl: string | null;
  genomicHgvsByBuild: Record<string, string>;
  raw: AlleleRegistryResponse;
}

// externalRecords is keyed by source name (ClinVar, dbSNP, gnomAD, ...),
// each an array of records whose shape varies by source -- this pulls out
// just the handful of fields the rest of the app currently needs.
function extractExternalRecords(externalRecords: Record<string, AlleleRegistryExternalRecord[]> = {}): {
  clinvarId: string | null;
  clinvarPreferredName: string | null;
  rsid: string | null;
} {
  const clinvar = externalRecords.ClinVar?.[0];
  const dbsnp = externalRecords.dbSNP?.[0];
  return {
    clinvarId: clinvar?.variationId ? String(clinvar.variationId) : null,
    clinvarPreferredName: Array.isArray(clinvar?.preferredName)
      ? clinvar.preferredName[0] || null
      : clinvar?.preferredName || null,
    rsid: dbsnp?.rs ? `rs${dbsnp.rs}` : null,
  };
}

// Finds the genomic HGVS per reference assembly from the Registry's
// "genomicAlleles" list -- one entry per build the allele has been
// mapped to (GRCh38, GRCh37, ...).
function extractGenomicHgvs(genomicAlleles: AlleleRegistryGenomicAllele[] = []): Record<string, string> {
  const byBuild: Record<string, string> = {};
  for (const g of genomicAlleles) {
    const build = g.referenceGenome;
    const hgvs = g.hgvs?.[0];
    if (build && hgvs) byBuild[build] = hgvs;
  }
  return byBuild;
}

// Pulls the gene symbol out of a ClinVar-style preferred name, e.g.
// "NM_000546.6(TP53):c.422G>A (p.Cys141Tyr)" -> "TP53".
export function extractGeneSymbol(clinvarPreferredName: string | null | undefined): string | null {
  const match = /\(([A-Za-z0-9_-]+)\):/.exec(clinvarPreferredName || "");
  return match ? match[1] : null;
}

// Pulls the protein change out of the same ClinVar-style preferred name,
// e.g. "NM_000546.6(TP53):c.422G>A (p.Cys141Tyr)" -> "p.Cys141Tyr".
export function extractProteinChange(clinvarPreferredName: string | null | undefined): string | null {
  const match = /\((p\.[A-Za-z0-9*]+)\)\s*$/.exec((clinvarPreferredName || "").trim());
  return match ? match[1] : null;
}

// Resolves a ClinGen canonical allele ID (CAID) to its cross-references.
// Throws VariantResolverError on anything that isn't a clean success.
export async function resolveVariantByCaid(caidInput: string): Promise<ResolvedVariant> {
  const caid = (caidInput || "").trim().toUpperCase();
  if (!caid) throw new VariantResolverError("Enter a ClinGen Allele Registry CAID to look up (e.g. CA000174).");
  if (!CAID_PATTERN.test(caid)) {
    throw new VariantResolverError(`"${caidInput}" doesn't look like a CAID -- expected a format like CA000174.`);
  }

  const url = `${ALLELE_REGISTRY_BASE}/allele/${caid}`;
  let response: Response;
  try {
    response = await fetch(viaProxy(url), { headers: { Accept: "application/json" } });
  } catch (err) {
    throw new VariantResolverError(
      "Couldn't reach the ClinGen Allele Registry -- this may be a network/CORS issue rather than a problem with the CAID.",
      err,
    );
  }
  if (response.status === 404) {
    throw new VariantResolverError(`${caid} wasn't found in the ClinGen Allele Registry.`);
  }
  if (!response.ok) {
    throw new VariantResolverError(`Allele Registry returned an error (HTTP ${response.status}).`);
  }

  let data: AlleleRegistryResponse;
  try {
    data = await response.json();
  } catch (err) {
    throw new VariantResolverError("Allele Registry response wasn't valid JSON.", err);
  }

  const { clinvarId, clinvarPreferredName, rsid } = extractExternalRecords(data.externalRecords);
  const genomicHgvsByBuild = extractGenomicHgvs(data.genomicAlleles);
  const communityStandardTitle = data.communityStandardTitle?.[0] || null;

  return {
    caid,
    arUrl: `${ALLELE_REGISTRY_BASE}/redmine/projects/registry/genboree_registry/by_caid?caid=${caid}`,
    clinvarId,
    clinvarUrl: clinvarId ? `https://www.ncbi.nlm.nih.gov/clinvar/variation/${clinvarId}/` : null,
    clinvarPreferredName,
    communityStandardTitle,
    geneSymbol: extractGeneSymbol(clinvarPreferredName || communityStandardTitle),
    proteinChange: extractProteinChange(clinvarPreferredName),
    rsid,
    dbsnpUrl: rsid ? `https://www.ncbi.nlm.nih.gov/snp/${rsid}` : null,
    genomicHgvsByBuild,
    raw: data,
  };
}
