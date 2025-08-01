import { useState } from "react";
import { useScoringContext } from "../../../../../contexts/ScoringContext";
import { Edit, Info, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/Collapsible";

const InitialImpactStep = () => {
  const {
    selectedPredictor,
    setSelectedPredictor,
    predictorScore,
    setPredictorScore,
    evidencePoints,
    showScoreInput,
    setShowScoreInput,
    customPredictorName,
    setCustomPredictorName,
    manualImpactPoints,
    setManualImpactPoints,
    handlePredictorChange,
    handleScoreChange,
    formatRangeDisplay,
    initialEvidencePoints,
  } = useScoringContext();

  const [showReferenceTable, setShowReferenceTable] = useState(false);

  return (
    <>
      <h3 className="text-lg font-medium mb-3">
        Initial Impact <span className="text-red-500">*</span>
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Select an in silico predictor and enter or confirm the score to calculate initial evidence points.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block font-medium mb-2">
            In Silico Predictor <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded-md p-2 bg-white"
            value={selectedPredictor}
            onChange={(e) => handlePredictorChange(e.target.value)}
          >
            <option value="">Select a predictor</option>
            <option value="REVEL">REVEL</option>
            <option value="BayesDel">BayesDel</option>
            <option value="AlphaMissense">AlphaMissense</option>
            <option value="ESM1b">ESM1b</option>
            <option value="MutPred2">MutPred2</option>
            <option value="VARITY_R">VARITY_R</option>
            <option value="VEST4">VEST4</option>
            <option value="Other">Other</option>
            <option value="None">None</option>
          </select>
        </div>

        {selectedPredictor === "Other" && (
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">
              Custom Predictor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border rounded-md p-2 bg-white"
              value={customPredictorName}
              onChange={(e) => setCustomPredictorName(e.target.value)}
              placeholder="Enter predictor name"
            />
          </div>
        )}

        {selectedPredictor && selectedPredictor !== "None" && selectedPredictor !== "Other" && (
          <div>
            <label className="block font-medium mb-2">
              In Silico Predictor Score <span className="text-red-500">*</span>
            </label>
            {showScoreInput ? (
              <input
                type="text"
                className="w-full border rounded-md p-2 bg-white"
                value={predictorScore}
                onChange={handleScoreChange}
                placeholder={`Enter ${selectedPredictor} score`}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <div className="border rounded-md p-2 bg-white flex-1">
                  {predictorScore} <span className="text-gray-500">(pre-filled from available data)</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800" onClick={() => setShowScoreInput(true)}>
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {selectedPredictor === "Other" && (
          <div>
            <label className="block font-medium mb-2">
              In Silico Predictor Score <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border rounded-md p-2 bg-white"
              value={predictorScore}
              onChange={handleScoreChange}
              placeholder="Enter score"
            />
          </div>
        )}

        {selectedPredictor && selectedPredictor !== "Other" && (
          <div>
            <label className="block font-medium mb-2">Initial Impact Points</label>
            <div className="flex items-center h-10 p-2 bg-white border rounded-md">
              <span
                className={`font-bold ${
                  evidencePoints === "Not Met"
                    ? "text-gray-600"
                    : evidencePoints > 0
                      ? "text-red-600"
                      : evidencePoints < 0
                        ? "text-green-600"
                        : "text-gray-600"
                }`}
              >
                {evidencePoints === "Not Met" ? "Not Met" : evidencePoints > 0 ? `+${evidencePoints}` : evidencePoints}
              </span>
            </div>
          </div>
        )}
      </div>

      {selectedPredictor === "Other" && (
        <div>
          <label className="block font-medium mb-2">
            Manual Initial Impact Points <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded-md p-2 bg-white"
            value={manualImpactPoints}
            onChange={(e) => {
              const points = Number(e.target.value)
              setManualImpactPoints(points)
              // setEvidencePoints(points) - this would be handled in context
            }}
          >
            <option value="-4">-4.0</option>
            <option value="-3">-3.0</option>
            <option value="-2">-2.0</option>
            <option value="-1">-1.0</option>
            <option value="0">0.0</option>
            <option value="1">+1.0</option>
            <option value="2">+2.0</option>
            <option value="3">+3.0</option>
            <option value="4">+4.0</option>
          </select>
        </div>
      )}

      {/* Reference table */}
      {selectedPredictor && selectedPredictor !== "None" && (
        <div className="mt-4">
          <Collapsible open={showReferenceTable} onOpenChange={setShowReferenceTable}>
            <div className="flex justify-between items-center">
              <CollapsibleTrigger className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <Info className="h-4 w-4 mr-1" />
                <span>Show evidence points reference table</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-3">
              <div className="border rounded-md overflow-hidden">
                <div className="bg-yellow-50 p-2 border-b text-sm font-medium">Initial Evidence Points Reference</div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-yellow-50">
                        <th className="p-2 border text-left">{selectedPredictor}</th>
                        <th className="p-2 border text-center">-4.0</th>
                        <th className="p-2 border text-center">-3.0</th>
                        <th className="p-2 border text-center">-2.0</th>
                        <th className="p-2 border text-center">-1.0</th>
                        <th className="p-2 border text-center">0.0</th>
                        <th className="p-2 border text-center">+1.0</th>
                        <th className="p-2 border text-center">+2.0</th>
                        <th className="p-2 border text-center">+3.0</th>
                        <th className="p-2 border text-center">+4.0</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border font-medium">Score Range</td>
                        {[-4.0, -3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0].map((point) => {
                          const entry = initialEvidencePoints[selectedPredictor]?.find((e) => e.points === point)
                          const displayRange = entry ? formatRangeDisplay(entry.range, selectedPredictor) : ""
                          const isActive = point === evidencePoints

                          return (
                            <td key={point} className={`p-2 border text-center ${isActive ? "bg-blue-100" : ""}`}>
                              {displayRange}
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </>
  );
}

export default InitialImpactStep;
