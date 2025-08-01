import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/Card";

const Gene = () => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="font-bold">Gene and Disease Information</CardTitle>
        <CardDescription>Information about the gene and related diseases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-8 text-gray-500">No content available</div>
      </CardContent>
    </Card>
  );
}

export default Gene;
