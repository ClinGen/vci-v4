import { Button } from "../../../ui/Button";
import { useScoringContext } from "../../../../contexts/ScoringContext";

const StepNavigation = () => {
  const { scoringStep, setScoringStep, evidencePoints, handleNextStep, handlePreviousStep } = useScoringContext();

  return (
    <div className="flex justify-between">
      <Button variant="secondary" onClick={handlePreviousStep} disabled={scoringStep === 1}>
        Previous
      </Button>
      {scoringStep < 6 ? (
        <Button onClick={handleNextStep}>Next</Button>
      ) : (
        <Button variant="primary">Save Classification</Button>
      )}
    </div>
  );
}

export default StepNavigation;
