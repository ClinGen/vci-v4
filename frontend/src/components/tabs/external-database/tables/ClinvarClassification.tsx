import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card";
import { ExternalLink } from "lucide-react";

export const ClinvarClassification = () => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-bold text-3xl">Overall ClinVar Classification</CardTitle>
          <a href="#" className="text-blue-600 hover:text-blue-800 text-lg flex items-center gap-1 font-bold">
            See data in ClinVar
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 text-xl">
            <div>
              <span className="font-semibold text-gray-700 text-xl">Review status:</span>
              <span className="ml-2 text-lg text-gray-600">
                criteria provided, multiple submitters, no conflicts
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 text-xl">Aggregate Germline Classification:</span>
              <span className="ml-2 text-lg text-gray-600">Benign</span>
            </div>
          </div>
          <div className="space-y-4 text-xl">
            <div>
              <span className="font-semibold text-gray-700 text-xl">Last evaluated:</span>
              <span className="ml-2 text-lg text-gray-600">Apr 01, 2025</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 text-xl">Number of germline submissions:</span>
              <span className="ml-2 text-lg text-gray-600">31</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}