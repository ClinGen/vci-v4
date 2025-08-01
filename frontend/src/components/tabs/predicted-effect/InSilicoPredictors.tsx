import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/Card";
import { ExternalLink } from "lucide-react";

const inSilicoPredictors = [
  {
    tool: "REVEL",
    score: "0.368",
    prediction: "Benign",
    scoreRange: "0-1 (higher = more path)",
    transcript: "NM_000546.6",
    maneSelect: true,
  },
  {
    tool: "VEST4",
    score: "0.083",
    prediction: "Benign",
    scoreRange: "0-1 (higher = more path)",
    transcript: "ENST00000445888.6",
    maneSelect: true,
  },
  {
    tool: "BayesDel",
    score: "-0.333827",
    prediction: "Benign",
    scoreRange: "1.29334-0.75731 (higher = more path)",
    transcript: "Not known",
    maneSelect: false,
  },
  {
    tool: "AlphaMissense",
    score: "0.89",
    prediction: "Tolerated",
    scoreRange: "0-1 (≥0.05: tolerated)",
    transcript: "NM_000546.6",
    maneSelect: true,
  },
  {
    tool: "ESM1b",
    score: "0.012",
    prediction: "Benign",
    scoreRange: "0-1 (≥0.15: benign)",
    transcript: "ENST00000445888.6",
    maneSelect: true,
  },
  {
    tool: "MutationTaster",
    score: "1.2",
    prediction: "Below threshold",
    scoreRange: "1-99 (≥20: damaging)",
    transcript: "Not known",
    maneSelect: false,
  },
  {
    tool: "PROVEAN",
    score: "-2.41",
    prediction: "Not conserved",
    scoreRange: "-12.3-6.17 (≥2: conserved)",
    transcript: "NM_000546.6",
    maneSelect: true,
  },
];

const InSilicoPredictors = () => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="font-bold">In silico predictors</CardTitle>
        <CardDescription>Computational predictions of variant effect</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-orange-50 border border-orange-200 p-3 mb-4 text-orange-800 text-sm">
          This section for demonstration only, specific display to be further specified
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y">
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Tool</th>
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Score</th>
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Prediction</th>
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Score Range</th>
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Transcript</th>
              </tr>
            </thead>
            <tbody>
              {inSilicoPredictors.map((predictor, index) => (
                <tr key={index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <td className="p-3">
                    <a href="#" className="text-blue-600 hover:underline flex items-center">
                      {predictor.tool}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </td>
                  <td className="p-3 font-mono">{predictor.score}</td>
                  <td className="p-3">{predictor.prediction}</td>
                  <td className="p-3">{predictor.scoreRange}</td>
                  <td className="p-3">
                    {predictor.transcript}
                    {predictor.maneSelect && predictor.transcript !== "Not known" && (
                      <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                        MANE Select
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default InSilicoPredictors;
