import { useState } from "react";
import { useScoringContext } from "../../../../contexts/ScoringContext";

const ScoringTable = () => {
  const {
    evidencePoints,
    modifiedImpactPoints,
    totalInformativePoints,
    splicingScore,
    splicingPredictorScore,
    splicingInformativeScore,
    scoringStep,
    selectedPredictor,
    customPredictorName,
    predictorScore,
    transcriptRelevance,
    informativeVariants,
    splicingAssessment,
    splicingPredictorTool,
    splicingPredictionScore,
    splicingAssessmentComment,
  } = useScoringContext()

  const [showScoringChoices, setShowScoringChoices] = useState(false);

  // Calculate MIS (sum of MIS_PRD and MIS_INM)
  const calculateMIS = () => {
    if (scoringStep < 2 || !selectedPredictor) {
      return null;
    }

    if (evidencePoints === "Not Met" && totalInformativePoints === 0) {
      return "Not Met";
    }

    if (evidencePoints === "Not Met") {
      return totalInformativePoints;
    }

    const prdValue = typeof modifiedImpactPoints === "string" ? 0 : modifiedImpactPoints;
    const inmValue = informativeVariants && informativeVariants.length > 0 ? totalInformativePoints : 0;

    return prdValue + inmValue;
  }

  const mis = calculateMIS();
  const showMisInm = scoringStep >= 4 && informativeVariants && informativeVariants.length > 0;

  return (
    <div className="mb-2">
      <div className="border border-gray-300 rounded-md bg-white">
        <div className="px-4 py-3">
          <h3 className="text-lg font-medium mb-3">Predicted Effect Scoring Summary</h3>

          <div className="flex items-center">
            {/* MIS section */}
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-bold mr-2">MIS =</span>
                <span className={`font-bold ${typeof mis === "number" && mis > 0 ? "text-red-600" : ""}`}>
                  {typeof mis === "number"
                    ? mis > 0
                      ? `+${mis.toFixed(1)}`
                      : mis.toFixed(1)
                    : mis === "Not Met"
                      ? "Not Met"
                      : "TBD"}
                </span>
              </div>

              <div className="text-sm mt-1">
                <span>MIS is calculated as: [MIS_PRD = </span>
                {scoringStep >= 2 && selectedPredictor ? (
                  <span
                    className={`${typeof modifiedImpactPoints === "number" && modifiedImpactPoints > 0 ? "text-red-600 font-bold" : ""}`}
                  >
                    {typeof modifiedImpactPoints === "number"
                      ? modifiedImpactPoints > 0
                        ? `+${modifiedImpactPoints.toFixed(1)}`
                        : modifiedImpactPoints.toFixed(1)
                      : modifiedImpactPoints === "Not Met"
                        ? "Not Met"
                        : "TBD"}
                  </span>
                ) : (
                  <span className="italic">TBD</span>
                )}
                <span> + MIS_INM = </span>
                <span className="italic">
                  {showMisInm ? (
                    totalInformativePoints > 0 ? (
                      <span className="text-red-600 font-bold">{`+${totalInformativePoints.toFixed(1)}`}</span>
                    ) : totalInformativePoints < 0 ? (
                      <span className="text-green-600 font-bold">{totalInformativePoints.toFixed(1)}</span>
                    ) : (
                      totalInformativePoints.toFixed(1)
                    )
                  ) : (
                    "TBD"
                  )}
                </span>
                <span>]</span>
              </div>
            </div>

            {/* Vertical divider */}
            <div className="h-12 border-r border-gray-300 mx-6"></div>

            {/* SPL section */}
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-bold mr-2">SPL =</span>
                <span>
                  {scoringStep >= 5 && splicingScore !== null && splicingScore !== "NA" ? (
                    typeof splicingScore === "number" ? (
                      splicingScore > 0 ? (
                        <span className="text-red-600 font-bold">{`+${splicingScore.toFixed(1)}`}</span>
                      ) : splicingScore < 0 ? (
                        <span className="text-green-600 font-bold">{splicingScore.toFixed(1)}</span>
                      ) : (
                        splicingScore.toFixed(1)
                      )
                    ) : (
                      splicingScore
                    )
                  ) : (
                    <span className="font-bold">TBD</span>
                  )}
                </span>
              </div>

              <div className="text-sm mt-1">
                <span>SPL is calculated as: [SPL_PRD = </span>
                <span className="italic">
                  {scoringStep >= 5 && splicingPredictorScore !== null ? (
                    typeof splicingPredictorScore === "number" ? (
                      splicingPredictorScore > 0 ? (
                        <span className="text-red-600 font-bold">{`+${splicingPredictorScore.toFixed(1)}`}</span>
                      ) : splicingPredictorScore < 0 ? (
                        <span className="text-green-600 font-bold">{splicingPredictorScore.toFixed(1)}</span>
                      ) : (
                        splicingPredictorScore.toFixed(1)
                      )
                    ) : (
                      splicingPredictorScore
                    )
                  ) : (
                    "TBD"
                  )}
                </span>
                <span> | SPL_INS = </span>
                <span className="italic">
                  {scoringStep >= 5 && splicingInformativeScore !== null ? (
                    typeof splicingInformativeScore === "number" ? (
                      splicingInformativeScore > 0 ? (
                        <span className="text-red-600 font-bold">{`+${splicingInformativeScore.toFixed(1)}`}</span>
                      ) : splicingInformativeScore < 0 ? (
                        <span className="text-green-600 font-bold">{splicingInformativeScore.toFixed(1)}</span>
                      ) : (
                        splicingInformativeScore.toFixed(1)
                      )
                    ) : (
                      splicingInformativeScore
                    )
                  ) : (
                    "TBD"
                  )}
                </span>
                <span>]</span>
              </div>
            </div>
          </div>

          {/* Show all scoring choices collapsible */}
          <div className="mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => setShowScoringChoices(!showScoringChoices)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              {showScoringChoices ? "Hide scoring choices" : "Show all scoring choices"}
              <svg
                className={`ml-1 h-4 w-4 transition-transform ${showScoringChoices ? "transform rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {showScoringChoices && (
              <div className="mt-2 text-sm">
                <div className="mb-3">
                  <h4 className="font-medium text-gray-700 mb-1">Variant Type</h4>
                  <div className="pl-3 space-y-1">
                    <div className="flex">
                      <span className="text-gray-600 w-40">Variant Type:</span>
                      <span className="font-medium">Missense</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoringTable;
