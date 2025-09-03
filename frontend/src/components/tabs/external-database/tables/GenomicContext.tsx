import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card";

export const GenomicContext = () => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="font-bold text-3xl">Variant Genomic Context</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg text-gray-800">
          GRCh37: NC_000023.10:g.152958830C&gt;T, GRCh38: NC_000023.11:g.153693375C&gt;T
        </div>
      </CardContent>
    </Card>
  );
}