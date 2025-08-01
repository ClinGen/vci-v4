import { Check } from "lucide-react";
import { useTabContext } from "../../contexts/useTabContext";

const navItems = [
  { id: "external-databases", label: "External Databases" },
  {
    id: "population",
    label: "Population",
    status: "complete",
    details: [
      { label: "POP_FRQ", value: "" },
      { label: "POP_HMZ", value: "" },
    ],
  },
  { id: "clinical", label: "Clinical" },
  { id: "predicted-effect", label: "Predicted Effect" },
  { id: "functional", label: "Functional" },
  { id: "gene", label: "Gene" },
  { id: "summary", label: "Summary" },
  { id: "audit-trail", label: "Audit Trail" },
  {
    id: "literature-for-variant",
    label: "Literature",
    details: [
      { label: "Sources", value: " (15)" },
      { label: "Meets VCEP criteria", value: " (3)" },
    ],
  },
];

const CurationInfo = () => {
  const { activeTab, setActiveTab } = useTabContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 tracking-tight">Curation Information</h2>

      {/* Navigation Links */}
      <div className="space-y-4">
        {navItems.map((item) => (
          <div key={item.id} className="space-y-1">
            <button
              onClick={() => setActiveTab(item.id)}
              className={`text-left w-full font-medium text-lg hover:text-blue-600 transition-colors ${activeTab === item.id ? "text-blue-600 font-bold" : ""
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {item.label}
                  {activeTab === item.id && <span className="ml-2">|</span>}
                </div>
                {item.status === "complete" && <Check className="h-6 w-6 text-green-500 stroke-[3]" />}
              </div>
            </button>

            {/* Show details if they exist and this is the active tab or population tab or literature tab */}
            {item.details &&
              (item.id === activeTab || item.id === "population" || item.id === "literature-for-variant") && (
                <div className="pl-4 space-y-1">
                  {item.details.map((detail, idx) => (
                    <div key={idx} className="text-sm">
                      {detail.label}
                      {detail.value}
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CurationInfo;