import VariantInfo from "../components/variant-info/VariantInfo";
import CurationInfo from "../components/curation-info/CurationInfo";
import TabContent from "../components/tabs/TabContent";
import { AlertTriangle } from "lucide-react";

const VariantCentral = () => {
  return  (
    <div className="w-full p-2">
      <div className="bg-red-500 text-white p-2 mb-4 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        <span>This is an interactive mockup for specification purposes ONLY</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* Left Column - Variant Information and Classification Details */}
        <div className="bg-white p-6 rounded-md shadow-sm">
          <VariantInfo />

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          <CurationInfo />
        </div>

        {/* Right Column - Content Area */}
        <div className="space-y-6">
          <TabContent />
        </div>
      </div>
    </div>
  );
}

export default VariantCentral;
