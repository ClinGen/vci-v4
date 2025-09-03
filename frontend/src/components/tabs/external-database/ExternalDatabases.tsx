import { AllInterpretations } from "./tables/AllInterpretations";
import { ClinvarClassification } from "./tables/ClinvarClassification";
import { GermlineClassifications } from "./tables/GermlineClassifications";
import { GenomeBrowsers } from "./tables/GenomeBrowsers";
import { OtherResources } from "./tables/OtherResources";
import { GenomicContext } from "./tables/GenomicContext";
import { Button } from "../../ui/Button";

const ExternalDatabases = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold tracking-tight">External Databases</h3>
      <AllInterpretations />
      <ClinvarClassification />
      <GermlineClassifications />
      <GenomeBrowsers />
      <OtherResources />
      <GenomicContext />

      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent text-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Requery External Databases
          <span className="text-base text-gray-500 ml-2">Last queried: September 1, 2025</span>
        </Button>
      </div>
    </div>
  );
}

export default ExternalDatabases;
