function spliceAiVariantString(
  transcriptHgvs: string | null | undefined,
  geneSymbol: string | null | undefined,
  proteinChange: string | null | undefined,
  clinvarPreferredName: string | null | undefined,
): string | null {
  if (clinvarPreferredName) return clinvarPreferredName;
  if (!transcriptHgvs) return null;
  const colonIdx = transcriptHgvs.indexOf(":");
  if (colonIdx === -1) return null;
  const transcript = transcriptHgvs.slice(0, colonIdx);
  const change = transcriptHgvs.slice(colonIdx + 1);
  const withGene = geneSymbol ? `${transcript}(${geneSymbol}):${change}` : `${transcript}:${change}`;
  return proteinChange ? `${withGene} (${proteinChange})` : withGene;
}

export function spliceAiLookupLink(
  transcriptHgvs: string | null | undefined,
  geneSymbol: string | null | undefined,
  proteinChange: string | null | undefined,
  clinvarPreferredName: string | null | undefined,
): string | null {
  const variantString = spliceAiVariantString(transcriptHgvs, geneSymbol, proteinChange, clinvarPreferredName);
  if (!variantString) return null;
  return `https://spliceailookup.broadinstitute.org/#variant=${encodeURIComponent(variantString)}&hg=38&bc=basic&distance=500&mask=0&ra=0`;
}
