export function cspecFieldHint(criteriaDoc: string | null | undefined) {
  if (!criteriaDoc || !criteriaDoc.trim()) return null;
  return <>Source: <span className="font-medium text-gray-700">{criteriaDoc}</span></>;
}
