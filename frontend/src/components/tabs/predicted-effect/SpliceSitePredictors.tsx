import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { ExternalLink } from "lucide-react";

const SpliceSitePredictors = () => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="font-bold">Splice Site Predictors</CardTitle>
        <CardDescription>Tools for analyzing potential splice site effects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex items-center justify-start h-auto py-3 px-4 bg-transparent">
            <ExternalLink className="h-4 w-4 mr-2" />
            Analyze using SpliceAI
          </Button>
          <Button variant="outline" className="flex items-center justify-start h-auto py-3 px-4 bg-transparent">
            <ExternalLink className="h-4 w-4 mr-2" />
            Analyze using varSeak
          </Button>
          <Button variant="outline" className="flex items-center justify-start h-auto py-3 px-4 bg-transparent">
            <ExternalLink className="h-4 w-4 mr-2" />
            Analyze using NNSplice
          </Button>
          <Button variant="outline" className="flex items-center justify-start h-auto py-3 px-4 bg-transparent">
            <ExternalLink className="h-4 w-4 mr-2" />
            Analyze using MaxEntScan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SpliceSitePredictors;
