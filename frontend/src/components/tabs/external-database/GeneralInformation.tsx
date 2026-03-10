import { AllInterpretations } from "./tables/AllInterpretations";
import { ClinvarClassification } from "./tables/ClinvarClassification";
import { GermlineClassifications } from "./tables/GermlineClassifications";
import { GenomeBrowsers } from "./tables/GenomeBrowsers";
import { OtherResources } from "./tables/OtherResources";

const GeneralInformation = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold tracking-tight">General Information</h3>
      <AllInterpretations />
      <ClinvarClassification />
      <GermlineClassifications />
      <OtherResources />
      <GenomeBrowsers />
    </div>
  );
}

export default GeneralInformation;
