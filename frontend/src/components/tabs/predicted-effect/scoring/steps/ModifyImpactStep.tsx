import { useScoringContext } from "../../../../../contexts/ScoringContext";

const ModifyImpactStep: React.FC = () => {
  const { transcriptRelevance, setTranscriptRelevance, evidencePoints } = useScoringContext();

  return (
    <>
      <h3 className="text-lg font-medium mb-2">Modify Impact</h3>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Exon/Transcript Relevance <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded-md p-1.5 bg-white"
            value={transcriptRelevance}
            onChange={(e) => setTranscriptRelevance(e.target.value)}
          >
            <option value="">Select relevance...</option>
            <option value="100">Residue present in all transcripts</option>
            <option value="50">Residue is present in most disease-specific or highly expressed transcripts</option>
            <option value="0">Residue is not expressed in clinically relevant transcripts</option>
          </select>

          {transcriptRelevance && (
            <p className="mt-1 text-xs text-gray-500 italic">
              {transcriptRelevance === "100" && "Apply 100% of initial impact score"}
              {transcriptRelevance === "50" && "Apply 50% of initial impact score"}
              {transcriptRelevance === "0" && "Apply 0% of initial impact score"}
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-md p-2 flex flex-col justify-center">
          <div className="text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Initial Points:</span>
              <span
                className={`font-bold ${evidencePoints > 0 ? "text-red-600" : evidencePoints < 0 ? "text-green-600" : "text-gray-600"}`}
              >
                {evidencePoints > 0 ? `+${evidencePoints}` : evidencePoints}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Modified Points: (MIS_PRD)</span>
              <span
                className={`font-bold ${
                  transcriptRelevance && evidencePoints
                    ? evidencePoints > 0
                      ? "text-red-600"
                      : evidencePoints < 0
                        ? "text-green-600"
                        : "text-gray-600"
                    : "text-gray-600"
                }`}
              >
                {transcriptRelevance && evidencePoints
                  ? (evidencePoints > 0 ? "+" : "") +
                    ((evidencePoints * Number.parseInt(transcriptRelevance)) / 100).toFixed(1)
                  : "TBD"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModifyImpactStep
