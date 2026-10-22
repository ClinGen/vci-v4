import { parseGenomicHgvs } from "./genomeBrowserLinks";

export function lovdLink(geneSymbol: string | null | undefined, genomicHgvs37: string | null | undefined): string | null {
  const parsed = parseGenomicHgvs(genomicHgvs37);
  if (!geneSymbol || !parsed) return null;
  return `https://databases.lovd.nl/shared/variants/in_gene?search_geneid=${encodeURIComponent(geneSymbol)}&search_VariantOnGenome/DNA=g.${parsed.position}&ncr`;
}

export function brcaExchangeLink(caid: string | null | undefined): string | null {
  if (!caid) return null;
  return `https://brcaexchange.org/variant/${caid}`;
}

export function litVarLink(rsid: string | null | undefined): string | null {
  if (!rsid) return null;
  const bare = rsid.replace(/^rs/i, "");
  return `https://www.ncbi.nlm.nih.gov/research/litvar2/docsum?variant=litvar@rs${bare}%23%23&query=rs${bare}`;
}
