import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/Table";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { RefreshCw } from "lucide-react";

const inSilicoPredictors = [
  { tool: "REVEL", score: "0.368", prediction: "Benign", scoreRange: "0 to 1 (higher = more likely damaging)", transcript: "NM_000546.6", maneSelect: true },
  { tool: "VEST4", score: "0.083", prediction: "Benign", scoreRange: "0 to 1 (higher = more likely damaging)", transcript: "ENST00000445888.6", maneSelect: true },
  { tool: "BayesDel", score: "-0.333827", prediction: "Benign", scoreRange: "-1.29334 to 0.75731 (higher = more likely damaging)", transcript: "Not known", maneSelect: false },
  { tool: "AlphaMissense", score: "0.89", prediction: "Tolerated", scoreRange: "0 to 1 (higher = more likely damaging)", transcript: "NM_000546.6", maneSelect: true },
  { tool: "ESM1b", score: "0.012", prediction: "Benign", scoreRange: "-24.358 to 6.937 (lower = more likely damaging)", transcript: "ENST00000445888.6", maneSelect: true },
  { tool: "MutPred2", score: "—", prediction: "—", scoreRange: "0 to 1 (higher = more likely damaging)", transcript: "—", maneSelect: false },
  { tool: "VARITY_R", score: "—", prediction: "—", scoreRange: "0 to 1 (higher = more likely damaging)", transcript: "—", maneSelect: false },
];

const otherPredictors = [
  { tool: "MutationTaster", score: "1.2", scoreRange: "0 to 1 (probability of the prediction being correct)" },
  { tool: "PROVEAN", score: "-2.41", scoreRange: "-14 to 14 (lower = more likely damaging)" },
  { tool: "CADD", score: "—", scoreRange: "-7.535 to 35.789 (higher = more likely damaging)" },
  { tool: "SIFT", score: "—", scoreRange: "0 to 1 (lower = more likely damaging)" },
];

const InSilicoPredictors = () => {
  return (
    <Card tone="reference">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>In Silico Predictors</CardTitle>
          <Button variant="outline" size="sm" className="gap-2 flex-none">
            <RefreshCw className="h-3.5 w-3.5" /> Requery Predictors
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">ClinGen-Recommended Predictors (7)</div>
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR className="bg-gray-50">
                    <TH>Tool</TH>
                    <TH className="text-center">Score</TH>
                    <TH className="text-center">Points</TH>
                    <TH>Score Range</TH>
                    <TH>Transcript</TH>
                  </TR>
                </THead>
                <TBody>
                  {inSilicoPredictors.map((p) => (
                    <TR key={p.tool} className="border-t">
                      <TD className="font-medium text-gray-800">{p.tool}</TD>
                      <TD className="text-center font-mono text-xs">{p.score}</TD>
                      <TD className="text-center font-mono text-xs text-gray-500">—</TD>
                      <TD className="text-xs text-gray-600">{p.scoreRange}</TD>
                      <TD>
                        <span className="font-mono text-xs">{p.transcript}</span>
                        {p.maneSelect && p.transcript !== "Not known" && p.transcript !== "—" && (
                          <Badge className="ml-1.5 bg-yellow-100 text-yellow-800">MANE Select</Badge>
                        )}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">Other Predictors</div>
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR className="bg-gray-50">
                    <TH>Tool</TH>
                    <TH className="text-center">Score</TH>
                    <TH>Score Range</TH>
                  </TR>
                </THead>
                <TBody>
                  {otherPredictors.map((p) => (
                    <TR key={p.tool} className="border-t">
                      <TD className="font-medium text-gray-800">{p.tool}</TD>
                      <TD className="text-center font-mono text-xs">{p.score}</TD>
                      <TD className="text-xs text-gray-600">{p.scoreRange}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Scores sourced from ClinGen LDH and dbNSFP. Point values are computed during scoring (Predicted Effect tab).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default InSilicoPredictors;
