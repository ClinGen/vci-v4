// Client-side fetcher for gnomAD population frequency data -- built
// against gnomAD's public GraphQL API, the same one gnomAD's own web
// browser uses (no auth required, but IP-rate-limited).
//
// Endpoint: https://gnomad.broadinstitute.org/api
// Reference: https://github.com/broadinstitute/gnomad-browser/tree/main/graphql-api

const GNOMAD_API = "https://gnomad.broadinstitute.org/api";

export class GnomadFetchError extends Error {
  override name = "GnomadFetchError";
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

// GRCh38 RefSeq chromosome accessions -> plain chromosome name, needed to
// convert a genomic HGVS expression (as returned by the Allele Registry)
// into gnomAD's "chrom-pos-ref-alt" variant ID format.
const GRCH38_CHROM_BY_ACCESSION: Record<string, string> = {
  "NC_000001.11": "1", "NC_000002.12": "2", "NC_000003.12": "3", "NC_000004.12": "4",
  "NC_000005.10": "5", "NC_000006.12": "6", "NC_000007.14": "7", "NC_000008.11": "8",
  "NC_000009.12": "9", "NC_000010.11": "10", "NC_000011.10": "11", "NC_000012.12": "12",
  "NC_000013.11": "13", "NC_000014.9": "14", "NC_000015.10": "15", "NC_000016.10": "16",
  "NC_000017.11": "17", "NC_000018.10": "18", "NC_000019.10": "19", "NC_000020.11": "20",
  "NC_000021.9": "21", "NC_000022.11": "22", "NC_000023.11": "X", "NC_000024.10": "Y",
};

// Converts a simple substitution genomic HGVS (e.g.
// "NC_000017.11:g.7675190C>T") into gnomAD's variant ID format
// ("17-7675190-C-T"). Only handles single-nucleotide substitutions.
export function genomicHgvsToGnomadId(hgvs: string | null | undefined): string | null {
  const match = /^(NC_\d+\.\d+):g\.(\d+)([ACGT])>([ACGT])$/.exec((hgvs || "").trim());
  if (!match) return null;
  const [, accession, pos, ref, alt] = match;
  const chrom = GRCH38_CHROM_BY_ACCESSION[accession];
  if (!chrom) return null;
  return `${chrom}-${pos}-${ref}-${alt}`;
}

// --- GraphQL query ---

const QUERY = `
  query GnomadVariant($variantId: String!, $datasetId: DatasetId!) {
    variant(variantId: $variantId, dataset: $datasetId) {
      variant_id
      rsids
      exome {
        ac
        an
        homozygote_count
        faf95 { popmax }
        filters
        populations { id ac an homozygote_count }
      }
      genome {
        ac
        an
        homozygote_count
        faf95 { popmax }
        filters
        populations { id ac an homozygote_count }
      }
    }
  }
`;

// --- Response types ---

interface GnomadPopulation {
  id: string;
  ac: number;
  an: number;
  homozygote_count: number;
}

interface GnomadSequencingType {
  ac: number;
  an: number;
  homozygote_count: number;
  faf95: { popmax: number | null } | null;
  filters: string[];
  populations: GnomadPopulation[];
}

interface GnomadVariantResponse {
  data: {
    variant: {
      variant_id: string;
      rsids: string[];
      exome: GnomadSequencingType | null;
      genome: GnomadSequencingType | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
}

// --- Output types ---

export interface GnomadAncestryRow {
  group: string;
  ac: number;
  an: number;
  hom: number;
  af: string;
}

export interface GnomadVariantData {
  variantId: string;
  datasetId: string;
  rsids: string[];
  exomeFilters: string;
  genomeFilters: string;
  exomeAc: number | null;
  exomeAn: number | null;
  exomeAf: string | null;
  exomeHom: number | null;
  exomeGrpmaxFaf: string | null;
  genomeAc: number | null;
  genomeAn: number | null;
  genomeAf: string | null;
  genomeHom: number | null;
  genomeGrpmaxFaf: string | null;
  totalAc: number;
  totalAn: number;
  totalAf: string;
  totalHom: number;
  grpmaxFaf: string;
  ancestryRows: GnomadAncestryRow[];
  raw: GnomadVariantResponse["data"];
}

// Continental ancestry group ids gnomAD v4 reports, mapped to display labels.
const POPULATION_LABELS: Record<string, string> = {
  afr: "African/African-American",
  ami: "Amish",
  amr: "Admixed American",
  asj: "Ashkenazi Jewish",
  eas: "East Asian",
  fin: "European (Finnish)",
  mid: "Middle Eastern",
  nfe: "Non-Finnish European",
  remaining: "Remaining",
  sas: "South Asian",
};

function formatAf(ac: number, an: number): string {
  if (!an) return "0.000";
  const af = ac / an;
  if (af === 0) return "0.000";
  return af < 0.001 ? af.toFixed(9) : af.toFixed(6);
}

function buildAncestryRows(populationsById: Record<string, GnomadPopulation>): GnomadAncestryRow[] {
  return Object.values(populationsById)
    .filter((p) => POPULATION_LABELS[p.id])
    .map((p) => ({
      group: POPULATION_LABELS[p.id],
      ac: p.ac,
      an: p.an,
      hom: p.homozygote_count,
      af: formatAf(p.ac, p.an),
    }));
}

// Fetches gnomAD data for one variant (chrom-pos-ref-alt format) and
// normalizes it into the shape Population Observations already expects.
export async function fetchGnomadVariant(variantId: string, datasetId: string = "gnomad_r4"): Promise<GnomadVariantData> {
  if (!variantId) throw new GnomadFetchError("No gnomAD variant ID to look up (expected chrom-pos-ref-alt, e.g. 17-7675190-C-T).");

  let response: Response;
  try {
    response = await fetch(GNOMAD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { variantId, datasetId } }),
    });
  } catch (err) {
    throw new GnomadFetchError(
      "Couldn't reach the gnomAD API -- this may be a network/CORS issue rather than a problem with the variant.",
      err,
    );
  }
  if (!response.ok) {
    throw new GnomadFetchError(`gnomAD API returned an error (HTTP ${response.status}).`);
  }

  const body: GnomadVariantResponse = await response.json();
  if (body.errors?.length) {
    throw new GnomadFetchError(body.errors[0].message || "gnomAD API returned an error.");
  }
  const variant = body.data?.variant;
  if (!variant) {
    throw new GnomadFetchError(`${variantId} wasn't found in gnomAD ${datasetId}.`);
  }

  const exome = variant.exome;
  const genome = variant.genome;

  const sumHom = (populations: GnomadPopulation[] | undefined): number | null => {
    if (!populations || populations.length === 0) return null;
    return populations.reduce((sum, p) => sum + (p.homozygote_count || 0), 0);
  };

  const exomeHom = sumHom(exome?.populations) ?? exome?.homozygote_count ?? null;
  const genomeHom = sumHom(genome?.populations) ?? genome?.homozygote_count ?? null;
  const totalHom = (exomeHom || 0) + (genomeHom || 0);
  const totalAc = (exome?.ac || 0) + (genome?.ac || 0);
  const totalAn = (exome?.an || 0) + (genome?.an || 0);
  const grpmaxFafExome = exome?.faf95?.popmax || 0;
  const grpmaxFafGenome = genome?.faf95?.popmax || 0;
  const grpmaxFafTotal = Math.max(grpmaxFafExome, grpmaxFafGenome);

  // Merge exome + genome population-level counts into one combined row
  // per ancestry group.
  const combinedByGroup: Record<string, GnomadPopulation> = {};
  for (const p of [...(exome?.populations || []), ...(genome?.populations || [])]) {
    if (!POPULATION_LABELS[p.id]) continue;
    if (!combinedByGroup[p.id]) combinedByGroup[p.id] = { id: p.id, ac: 0, an: 0, homozygote_count: 0 };
    combinedByGroup[p.id].ac += p.ac;
    combinedByGroup[p.id].an += p.an;
    combinedByGroup[p.id].homozygote_count += p.homozygote_count;
  }

  return {
    variantId,
    datasetId,
    rsids: variant.rsids || [],
    exomeFilters: exome ? (exome.filters?.length ? exome.filters.join(", ") : "Pass") : "No variant",
    genomeFilters: genome ? (genome.filters?.length ? genome.filters.join(", ") : "Pass") : "No variant",
    exomeAc: exome?.ac ?? null,
    exomeAn: exome?.an ?? null,
    exomeAf: exome ? formatAf(exome.ac, exome.an) : null,
    exomeHom,
    exomeGrpmaxFaf: exome?.faf95?.popmax != null ? grpmaxFafExome.toExponential(3) : null,
    genomeAc: genome?.ac ?? null,
    genomeAn: genome?.an ?? null,
    genomeAf: genome ? formatAf(genome.ac, genome.an) : null,
    genomeHom,
    genomeGrpmaxFaf: genome?.faf95?.popmax != null ? grpmaxFafGenome.toExponential(3) : null,
    totalAc,
    totalAn,
    totalAf: formatAf(totalAc, totalAn),
    totalHom,
    grpmaxFaf: grpmaxFafTotal ? grpmaxFafTotal.toFixed(8) : "0",
    ancestryRows: buildAncestryRows(combinedByGroup),
    raw: body.data,
  };
}
