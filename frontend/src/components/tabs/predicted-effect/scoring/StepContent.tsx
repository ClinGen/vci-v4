import { useScoringContext } from "../../../../contexts/ScoringContext";
import VariantTypeStep from "./steps/VariantTypeStep";
import InitialImpactStep from "./steps/InitialImpactStep";
import ModifyImpactStep from "./steps/ModifyImpactStep";
import InformativeStep from "./steps/InformativeStep";
import SplicingStep from "./steps/SplicingStep";
import SummaryStep from "./steps/SummaryStep";

const StepContent = () => {
  const { scoringStep } = useScoringContext();

  switch (scoringStep) {
    case 1:
      return <VariantTypeStep />
    case 2:
      return <InitialImpactStep />
    case 3:
      return <ModifyImpactStep />
    case 4:
      return <InformativeStep />
    case 5:
      return <SplicingStep />
    case 6:
      return <SummaryStep />
    default:
      return <VariantTypeStep />
  }
}

export default StepContent;
