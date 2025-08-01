import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/Card";

const Population = () => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="font-bold">Population</CardTitle>
        <CardDescription>Population frequency and observational data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-8 text-gray-500">No content available</div>
      </CardContent>
    </Card>
  );
}

export default Population;
