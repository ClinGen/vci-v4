import { useScoringContext } from "../../../../contexts/ScoringContext";
import { useTabContext } from "../../../../contexts/useTabContext";
import ScoringTable from "./ScoringTable";
import StepContent from "./StepContent";
import StepNavigation from "./StepNavigation";

const stepNames = ["Variant Type", "Initial Impact", "Modify Impact", "Informative", "Splicing Assessment", "Summary"];

const ScoringModal = () => {
  const { activeTab } = useTabContext();
  const { scoringStep } = useScoringContext();

  if (activeTab !== "predicted-effect") return null;

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg mb-6">
      <div className="p-3 border-b border-blue-100 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Predicted Effect Scoring</h3>
        </div>
      </div>

      <div className="p-4">
        {/* Simplified step indicator */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1 px-1">
            {stepNames.map((name, index) => (
              <span key={index} className={`${scoringStep === index + 1 ? "font-medium text-blue-600" : "font-light"}`}>
                {name}
              </span>
            ))}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
              style={{ width: `${(scoringStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Score Summary */}
        {scoringStep >= 2 && (
          <div className="mb-3">
            <ScoringTable />
          </div>
        )}

        {/* Step Content */}
        <div className="border rounded-md bg-white p-4 mb-4">
          <StepContent />
        </div>

        {/* Navigation Buttons */}
        <StepNavigation />
      </div>
    </div>
  );
}

export default ScoringModal;
