const NC_ACCESSION_TO_CHR: Record<string, string> = {
  NC_000001: "1", NC_000002: "2", NC_000003: "3", NC_000004: "4",
  NC_000005: "5", NC_000006: "6", NC_000007: "7", NC_000008: "8",
  NC_000009: "9", NC_000010: "10", NC_000011: "11", NC_000012: "12",
  NC_000013: "13", NC_000014: "14", NC_000015: "15", NC_000016: "16",
  NC_000017: "17", NC_000018: "18", NC_000019: "19", NC_000020: "20",
  NC_000021: "21", NC_000022: "22", NC_000023: "X", NC_000024: "Y",
};

export function parseGenomicHgvs(hgvs: string | null | undefined): { accession: string; position: number } | null {
  const match = /^(NC_\d+)\.\d+:g\.(\d+)/.exec((hgvs || "").trim());
  if (!match) return null;
  return { accession: match[1], position: parseInt(match[2], 10) };
}

function windowFor(hgvs: string | null | undefined) {
  const parsed = parseGenomicHgvs(hgvs);
  if (!parsed) return null;
  const chr = NC_ACCESSION_TO_CHR[parsed.accession];
  if (!chr) return null;
  return { chr, start: parsed.position - 30, end: parsed.position + 30 };
}

export function ucscLinkForGenomicHgvs(hgvs: string, build: string): string | null {
  const w = windowFor(hgvs);
  if (!w) return null;
  const db = build === "GRCh37" ? "hg19" : "hg38";
  return `https://genome.ucsc.edu/cgi-bin/hgTracks?db=${db}&position=chr${w.chr}%3A${w.start}-${w.end}`;
}

export function ensemblLinkForGenomicHgvs(hgvs: string, build: string): string | null {
  const w = windowFor(hgvs);
  if (!w) return null;
  const host = build === "GRCh37" ? "grch37.ensembl.org" : "uswest.ensembl.org";
  return `https://${host}/Homo_sapiens/Location/View?db=core;r=${w.chr}:${w.start}-${w.end}`;
}

export function ncbiVariationViewerLinkForGenomicHgvs(hgvs: string, build: string): string | null {
  const w = windowFor(hgvs);
  if (!w) return null;
  const assm = build === "GRCh37" ? "GCF_000001405.25" : "GCF_000001405.28";
  return `https://www.ncbi.nlm.nih.gov/variation/view/?chr=${w.chr}&assm=${assm}&from=${w.start}&to=${w.end}`;
}
