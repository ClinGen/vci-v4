import { useScoringContext } from "../../../../../contexts/ScoringContext";

const SplicingStep = () => {
  const {
    splicingAssessment,
    setSplicingAssessment,
    splicingPredictorTool,
    setSplicingPredictorTool,
    splicingPredictionScore,
    setSplicingPredictionScore,
    splicingAssessmentComment,
    setSplicingAssessmentComment,
    handleSplicingAssessmentChange,
  } = useScoringContext();

  return (
    <>
      <h3 className="text-lg font-medium mb-4">Splicing Assessment</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-medium mb-2">
            Splicing Assessment <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded-md p-2 bg-white"
            value={splicingAssessment}
            onChange={(e) => handleSplicingAssessmentChange(e.target.value)}
          >
            <option value="">Select an assessment</option>
            <option value="no_impact">No impact predicted</option>
            <option value="inconclusive">Inconclusive / Not enough information</option>
            <option value="not_assessed">Not assessed</option>
            <option value="impact_predicted">Impact predicted</option>
          </select>
        </div>

        {splicingAssessment === "impact_predicted" && (
          <>
            <div>
              <label className="block font-medium mb-2">
                Predictor Tool <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-md p-2 bg-white"
                value={splicingPredictorTool}
                onChange={(e) => setSplicingPredictorTool(e.target.value)}
              >
                <option value="">Select a tool</option>
                <option value="spliceai">SpliceAI</option>
                <option value="varseak">varSeak</option>
                <option value="nnplice">NNSplice</option>
                <option value="maxentscan">MaxEntScan</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Prediction Score <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2 bg-white"
                value={splicingPredictionScore}
                onChange={(e) => setSplicingPredictionScore(e.target.value)}
                placeholder="Enter prediction score"
              />
            </div>

            <div className="col-span-2 mt-2 bg-gray-100 border border-gray-200 p-3 rounded-md text-gray-600 text-sm">
              More details to be collected
            </div>
          </>
        )}
      </div>

      <div>
        <label className="block font-medium mb-2">Comments</label>
        <textarea
          className="w-full border rounded-md p-2 bg-white"
          value={splicingAssessmentComment}
          onChange={(e) => setSplicingAssessmentComment(e.target.value)}
          placeholder="Enter any comments about the splicing assessment"
        />
      </div>
    </>
  );
}

export default SplicingStep;
