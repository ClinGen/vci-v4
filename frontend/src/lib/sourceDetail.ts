export function sourceKind(source: string | undefined | null): "pmid" | "lab" | "database" | "other" | null {
  if (source === "PMID") return "pmid";
  if (source === "Clinical Lab" || source === "Clinic" || source === "Research Lab") return "lab";
  if ((source || "").startsWith("Database")) return "database";
  if (source === "Other") return "other";
  return null;
}

export function isSourceDetailComplete(
  source: string,
  detail: { pmid?: string; labName?: string; databaseName?: string; otherDescription?: string } | null,
): boolean {
  const kind = sourceKind(source);
  if (!detail) return kind === null;
  if (kind === "pmid") return !!detail.pmid;
  if (kind === "lab") return !!detail.labName?.trim();
  if (kind === "database") return !!detail.databaseName?.trim();
  if (kind === "other") return !!detail.otherDescription?.trim();
  return true;
}

const MOCK_SURNAMES = ["Zacher", "Alvarez", "Kim", "Petrov", "Nakamura", "Singh", "Fischer", "Okafor", "Chen", "Rossi"];

export function mockAuthorYearFor(pmid: string | number) {
  const digits = (pmid || "").toString();
  const n = digits.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return {
    surname: MOCK_SURNAMES[n % MOCK_SURNAMES.length],
    initial: String.fromCharCode(65 + (n % 26)),
    year: 2012 + (n % 14),
  };
}

export function dataSourceCitation(
  source: string,
  detail: { pmid?: string; labName?: string; databaseName?: string; otherDescription?: string } | null,
): string | null {
  const kind = sourceKind(source);
  if (!detail) return null;
  if (kind === "pmid" && detail.pmid) {
    const { surname, initial, year } = mockAuthorYearFor(detail.pmid);
    return `${surname} ${initial}, ${year}, ID:${detail.pmid}`;
  }
  if (kind === "lab" && detail.labName?.trim()) return `${source}: ${detail.labName.trim()}`;
  if (kind === "database" && detail.databaseName?.trim()) return `Database: ${detail.databaseName.trim()}`;
  if (kind === "other" && detail.otherDescription?.trim()) return `Other: ${detail.otherDescription.trim()}`;
  return null;
}

export function curationSourceLabel(criteriaDoc: string | null | undefined, curatedAtMs: number | null | undefined): string | null {
  const match = /ClinGen (.+?) Specifications/.exec(criteriaDoc || "");
  const vcep = match ? match[1] : null;
  const datePart = curatedAtMs
    ? new Date(curatedAtMs).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  if (!vcep && !datePart) return null;
  return `VCI${vcep ? ` (${vcep})` : ""}${datePart ? ` ${datePart}` : ""}`;
}
