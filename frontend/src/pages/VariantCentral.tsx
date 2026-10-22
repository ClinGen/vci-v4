import VariantInfo from "../components/variant-info/VariantInfo";
import CurationInfo from "../components/curation-info/CurationInfo";
import TabContent from "../components/tabs/TabContent";
import { useTabContext } from "../contexts/useTabContext";
import { AlertTriangle } from "lucide-react";

const VariantCentral = () => {
  const { setActiveTab } = useTabContext();

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-gray-50">
      <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center flex-none z-30">
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <h1 className="font-serif text-lg font-bold text-gray-900 truncate">
            NM_000546.6(TP53):c.215C&gt;G
          </h1>
        </div>
        <span className="flex-none inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
          <AlertTriangle className="h-3.5 w-3.5 flex-none" /> This is an interactive mockup for specification purposes ONLY
        </span>
        <div className="flex-1 flex items-center justify-end gap-3">
          <button
            onClick={() => setActiveTab("summary")}
            className="flex items-center gap-2 rounded-full pl-3 pr-4 py-1.5 text-xs font-medium bg-gray-100 text-gray-500 transition-opacity hover:opacity-90"
            title="Go to Classification Summary"
          >
            <span className="font-serif font-semibold">Not yet determined</span>
            <span className="font-mono opacity-80">—</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto flex-none">
          <div className="p-4 border-b border-gray-200">
            <VariantInfo />
          </div>
          <div className="p-4">
            <CurationInfo />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-8">
          <TabContent />
        </div>
      </div>
    </div>
  );
}

export default VariantCentral;
