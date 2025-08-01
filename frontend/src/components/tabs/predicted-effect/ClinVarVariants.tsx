import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { ExternalLink } from "lucide-react";

const clinvarVariants = [
  {
    id: "12345",
    variant: "c.215C>T",
    proteinChange: "p.Pro72Ser",
    classification: "Uncertain Significance",
    reviewStatus: "1 star",
    source: "ClinVar",
  },
  {
    id: "67890",
    variant: "c.215C>A",
    proteinChange: "p.Pro72Thr",
    classification: "Uncertain Significance",
    reviewStatus: "1 star",
    source: "ClinVar",
  },
  {
    id: "54321",
    variant: "c.214C>T",
    proteinChange: "p.Pro72Leu",
    classification: "Likely Pathogenic",
    reviewStatus: "2 stars",
    source: "ClinVar",
  },
  {
    id: "CA5343",
    variant: "c.214C>G",
    proteinChange: "p.Pro72Ala",
    classification: "Uncertain Significance",
    reviewStatus: "Approved",
    source: "TP53 VCEP",
  },
];

const ClinVarVariants = () => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="font-bold">Identified Variants in Codon</CardTitle>
        <CardDescription>
          Other variants at the same codon position identified in ClinVar or ClinGen's VCI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y">
              <th className="text-left p-3 text-gray-600 font-bold tracking-tight">ID</th>
              <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Coding Change</th>
              <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Protein Change</th>
              <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Classification</th>
              <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Review Status</th>
              <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Source</th>
              <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Link</th>
            </tr>
          </thead>
          <tbody>
            {clinvarVariants.map((variant, index) => (
              <tr key={index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="p-3">{variant.id}</td>
                <td className="p-3 font-mono">{variant.variant}</td>
                <td className="p-3">{variant.proteinChange}</td>
                <td className="p-3">{variant.classification}</td>
                <td className="p-3">{variant.reviewStatus}</td>
                <td className="p-3">{variant.source}</td>
                <td className="p-3">
                  <Button variant="outline" size="sm" className="flex items-center bg-transparent">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {variant.source === "TP53 VCEP" ? "VCI v4" : "ClinVar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default ClinVarVariants;
