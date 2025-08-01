import { useScoringContext } from "../../../../../contexts/ScoringContext";
import { Button } from "../../../../ui/Button";
import { Info } from "lucide-react";

const SummaryStep = () => {
  const { predictedEffectExplanation, setPredictedEffectExplanation } = useScoringContext();

  return (
    <>
      <h3 className="text-lg font-medium mb-3">Predicted Effect Explanation</h3>
      <p className="text-sm text-gray-600 mb-4">Review the scoring and classification.</p>

      <div>
        <textarea
          className="w-full border rounded-md p-2 bg-white mb-2"
          placeholder="Enter explanation about the predicted effect"
          value={predictedEffectExplanation}
          onChange={(e) => setPredictedEffectExplanation(e.target.value)}
          rows={4}
        />
        <Button
          variant="outline"
          className="flex items-center text-sm bg-transparent"
          onClick={() => {
            setPredictedEffectExplanation(
              "NM_000546.6:c.215C>G(p.Pro72Arg) is a missense variant in the TP53 gene. It has a AlphaMissense in silico score of 0.89 and is present on most disease-specific or highly expressed transcripts, (MIS_PRD =  +0.5). One Likely Pathogenic informative variant has been identified (MIS_INM = +2.0). No impact on splicing is predicted.",
            )
          }}
        >
          <Info className="h-4 w-4 mr-1" />
          Auto-suggest explanation text
        </Button>
      </div>
    </>
  );
}

export default SummaryStep;
