// Builds search queries for this variant, adapting a published
// literature-search-string methodology (gene symbol AND several OR'd
// alternate notations of the same change -- coding, protein, genomic
// position) rather than searching on just one HGVS string.

const AA_3_TO_1: Record<string, string> = {
  Ala: "A", Arg: "R", Asn: "N", Asp: "D", Cys: "C", Gln: "Q", Glu: "E",
  Gly: "G", His: "H", Ile: "I", Leu: "L", Lys: "K", Met: "M", Phe: "F",
  Pro: "P", Ser: "S", Thr: "T", Trp: "W", Tyr: "Y", Val: "V",
};

interface ParsedProteinChange {
  kind: "sub" | "nonsense" | "fs";
  ref3: string;
  pos: string;
  alt3?: string;
  fsPos?: string;
}

// Parses a protein HGVS change into its components, handling
// substitution ("p.Cys141Tyr"), nonsense ("p.Arg335Ter"), and frameshift
// ("p.Thr343MetfsTer7"). Returns null for anything else.
function parseProteinChange(p: string | null | undefined): ParsedProteinChange | null {
  if (!p) return null;
  const trimmed = p.trim();
  let m = /^p\.([A-Za-z]{3})(\d+)([A-Za-z]{3})fs(?:Ter|\*)(\d+)$/.exec(trimmed);
  if (m) return { kind: "fs", ref3: m[1], pos: m[2], alt3: m[3], fsPos: m[4] };
  m = /^p\.([A-Za-z]{3})(\d+)(?:Ter|\*)$/.exec(trimmed);
  if (m) return { kind: "nonsense", ref3: m[1], pos: m[2] };
  m = /^p\.([A-Za-z]{3})(\d+)([A-Za-z]{3})$/.exec(trimmed);
  if (m) return { kind: "sub", ref3: m[1], pos: m[2], alt3: m[3] };
  return null;
}

export interface VariantSearchTermsInput {
  codingChange?: string | null;
  proteinChange?: string | null;
  rsid?: string | null;
  genomicPosition?: string | number | null;
}

// Every notation variant this app can confidently derive for the
// current variant.
export function buildVariantSearchTerms({ codingChange, proteinChange, rsid, genomicPosition }: VariantSearchTermsInput): string[] {
  const terms = new Set<string>();

  if (codingChange) {
    const bare = codingChange.replace(/^.*:c\./, "").replace(/^c\./, "");
    terms.add(bare);
    const spaced = bare.replace(/^(-?\d+(?:[+-]\d+)?)([A-Za-z]+>[A-Za-z]+)$/, "$1 $2");
    if (spaced !== bare) terms.add(spaced);
  }

  const parsed = parseProteinChange(proteinChange);
  if (parsed) {
    const ref1 = AA_3_TO_1[parsed.ref3];
    if (parsed.kind === "sub") {
      const alt1 = parsed.alt3 ? AA_3_TO_1[parsed.alt3] : undefined;
      terms.add(`${parsed.ref3}${parsed.pos}${parsed.alt3}`);
      if (ref1 && alt1) terms.add(`${ref1}${parsed.pos}${alt1}`);
    } else if (parsed.kind === "nonsense") {
      terms.add(`${parsed.ref3}${parsed.pos}Ter`);
      if (ref1) terms.add(`${ref1}${parsed.pos}X`);
      terms.add(`${parsed.ref3}${parsed.pos}STOP`);
    } else if (parsed.kind === "fs") {
      terms.add(`${parsed.ref3}${parsed.pos}${parsed.alt3}fsTer${parsed.fsPos}`);
      const alt1 = parsed.alt3 ? AA_3_TO_1[parsed.alt3] : undefined;
      if (ref1 && alt1) terms.add(`${ref1}${parsed.pos}${alt1}fsX${parsed.fsPos}`);
    }
  } else if (proteinChange) {
    terms.add(proteinChange.replace(/^p\./, ""));
  }

  if (rsid) terms.add(rsid.replace(/^rs/i, ""));
  if (genomicPosition) terms.add(String(genomicPosition));

  return Array.from(terms);
}

export function googleScholarSearchUrl(geneSymbol: string | null | undefined, terms: string[]): string | null {
  if (!geneSymbol || !terms || terms.length === 0) return null;
  const orClause = terms.map((t) => `"${t}"`).join(" OR ");
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(`${geneSymbol} AND (${orClause})`)}`;
}

// PubMed search URL using title/abstract field restriction.
export function pubmedSearchUrl(geneSymbol: string | null | undefined, terms: string[]): string | null {
  if (!geneSymbol || !terms || terms.length === 0) return null;
  const orClause = terms.map((t) => `"${t}"`).join(" OR ");
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(`${geneSymbol}[tiab] AND (${orClause})`)}`;
}

export function pubmedResidueSearchUrl(geneSymbol: string | null | undefined, proteinChange: string | null | undefined): string | null {
  const parsed = parseProteinChange(proteinChange);
  if (!geneSymbol || !parsed) return null;
  const ref1 = AA_3_TO_1[parsed.ref3];
  const terms = [`${parsed.ref3}${parsed.pos}*`];
  if (ref1) terms.push(`${ref1}${parsed.pos}*`);
  return pubmedSearchUrl(geneSymbol, terms);
}

// Europe PMC full-text query string. Returns the query *string* rather
// than a URL, since both the live search and the "open in a new tab"
// link need the same string.
export function europePmcQueryString(geneSymbol: string | null | undefined, terms: string[]): string | null {
  if (!geneSymbol || !terms || terms.length === 0) return null;
  const orClause = terms.map((t) => `"${t}"`).join(" OR ");
  return `${geneSymbol} AND (${orClause})`;
}

// Broader search: any variant at the same residue, regardless of the
// resulting amino acid.
export function googleScholarResidueSearchUrl(geneSymbol: string | null | undefined, proteinChange: string | null | undefined): string | null {
  const parsed = parseProteinChange(proteinChange);
  if (!geneSymbol || !parsed) return null;
  const ref1 = AA_3_TO_1[parsed.ref3];
  const terms = [`${parsed.ref3}${parsed.pos}*`];
  if (ref1) terms.push(`${ref1}${parsed.pos}*`);
  return googleScholarSearchUrl(geneSymbol, terms);
}
