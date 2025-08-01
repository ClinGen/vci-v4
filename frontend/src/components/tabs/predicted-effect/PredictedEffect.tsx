import InSilicoPredictors from "./InSilicoPredictors";
import SpliceSitePredictors from "./SpliceSitePredictors";
import ClinVarVariants from "./ClinVarVariants";
import TranscriptInfo from "./TranscriptInfo";
import ScoringModal from "./scoring/ScoringModal";

const PredictedEffect = () => {
  return (
    <div className="space-y-6">
      <ScoringModal />
      <InSilicoPredictors />
      <SpliceSitePredictors />
      <ClinVarVariants />
      <TranscriptInfo />
    </div>
  );
}

export default PredictedEffect;
