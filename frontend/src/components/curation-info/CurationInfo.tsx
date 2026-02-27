import { useState } from "react";
import { Check } from "lucide-react";
import { useTabContext } from "../../contexts/useTabContext";

// const navItems = [
//   { id: "general-information", label: "General Information" },
//   {
//     id: "population",
//     label: "Population",
//     status: "complete",
//     details: [
//       { label: "POP_FRQ", value: "" },
//       { label: "POP_HMZ", value: "" },
//     ],
//   },
//   { id: "clinical", label: "Clinical" },
//   { id: "predicted-effect", label: "Predicted Effect" },
//   { id: "functional", label: "Functional" },
//   { id: "gene", label: "Gene" },
//   { id: "summary", label: "Summary" },
//   { id: "audit-trail", label: "Audit Trail" },
//   {
//     id: "literature-for-variant",
//     label: "Literature",
//     details: [
//       { label: "Sources", value: " (15)" },
//       { label: "Meets VCEP criteria", value: " (3)" },
//     ],
//   },
// ];
const navItems = [
  { id: "general-information", label: "General Information" },
  {
    label: "Human Observational Data",
    children: [
      {
        id: "population",
        label: "Population Observations",
        badge: "POP_FRQ 0.0",
      },
      { id: "clinical", label: "Clinical and Locus" },
    ],
  },
  {
    label: "Predictive and Functional Data",
    children: [
      { id: "predicted-effect", label: "Predicted Effect" },
      { id: "functional", label: "Functional Data" },
      { id: "informative-variants", label: "Informative Variants" },
    ],
  },
  { id: "gene", label: "Gene" },
  { id: "summary", label: "Summary" },
  { id: "audit-trail", label: "Audit Trail" },
  {
    id: "literature-for-variant",
    label: "Literature",
  },
];

const CurationInfo = () => {
  const { activeTab, setActiveTab } = useTabContext();
  const [isOpen, setIsOpen] = useState(false);
  const [classificationStarted, setClassificationStarted] = useState(false);
  const [isPredictedEffectScoringActive, setIsPredictedEffectScoringActive] = useState(false);

  const handleStartClassification = () => {
    setClassificationStarted(true)
    setActiveTab("predicted-effect")
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 tracking-tight">Curation Information</h2>

      {/* Navigation Links */}
      <div className="space-y-4">
        {/* {navItems.map((item, index) => (
          <div key={item.id || index} className="space-y-1">
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
            {/* {item.details &&
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
          </div> */}
        {/* ))} */}
        {navItems.map((item, index) => (
          <div key={item.id || index}>
            {item.children ? (
              <div className="mb-2">
                <div className="px-3 py-2 text-sm font-bold text-gray-900 uppercase tracking-wider">
                  {item.label}
                </div>
                <div className="pl-4 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setActiveTab(child.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${activeTab === child.id
                          ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{child.label}</span>
                        <div className="flex items-center gap-2">
                          {child.badge && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-300 rounded text-xs font-semibold whitespace-nowrap">
                              {child.badge}
                            </span>
                          )}
                          {child.id === "predicted-effect" && isPredictedEffectScoringActive && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-300 rounded text-xs font-semibold whitespace-nowrap">
                              NUL_PRD +1.5
                            </span>
                          )}
                          {child.status === "complete" && false && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${activeTab === item.id
                      ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.status === "complete" && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                </button>
                {item.details &&
                  (item.id === activeTab || item.id === "population" || item.id === "literature-for-variant") && (
                    <div className="pl-4 space-y-1">
                      {item.details.map((detail, idx) => (
                        <div key={idx} className="text-base">
                          {detail.label}
                          {detail.value}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CurationInfo;