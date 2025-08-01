import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/Card";

const Literature = () => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="font-bold">Literature</CardTitle>
        <CardDescription>Published literature related to this variant</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-8 text-gray-500">No content available</div>
      </CardContent>
    </Card>
  );
}

export default Literature;
