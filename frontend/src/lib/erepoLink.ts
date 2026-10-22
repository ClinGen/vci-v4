export function erepoSearchLink(caid: string | null | undefined): string {
  if (!caid) return "https://erepo.clinicalgenome.org/evrepo/";
  return `https://erepo.clinicalgenome.org/evrepo/ui/classifications?matchMode=exact&caid=${encodeURIComponent(caid)}`;
}
