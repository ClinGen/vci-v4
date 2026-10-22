import { useState } from "react";
import { useTabContext } from "../../contexts/useTabContext";
import { StatusPill, MiniScoreBadge } from "../ui/StatusPill";
import { Check } from "lucide-react";

interface NavChild {
  id: string;
  label: string;
}

interface NavItem {
  id?: string;
  label: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { id: "general-information", label: "General Information" },
  {
    label: "Human Observational Data",
    children: [
      { id: "population", label: "Population Observations" },
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
  { id: "gene", label: "Gene Overview" },
  { id: "summary", label: "Classification Summary" },
  { id: "audit-trail", label: "Audit Trail" },
  { id: "literature-for-variant", label: "Literature" },
];

type SectionId = "general-information" | "population" | "clinical" | "predicted-effect" | "functional" | "informative-variants";

type SectionStatus = "not-started" | "in-progress" | "complete";

interface SectionScore {
  code: string;
  value: number;
}

const SCOREABLE_SECTIONS: SectionId[] = [
  "general-information", "population", "clinical",
  "predicted-effect", "functional", "informative-variants",
];

const CurationInfo = () => {
  const { activeTab, setActiveTab } = useTabContext();

  const [sectionComplete] = useState<Record<SectionId, boolean>>({
    "general-information": false,
    population: false,
    clinical: false,
    "predicted-effect": false,
    functional: false,
    "informative-variants": false,
  });

  const [publishedScores] = useState<Record<string, SectionScore | null>>({
    population: null,
    clinical: null,
    "predicted-effect": null,
    functional: null,
    "informative-variants": null,
  });

  const status: Record<SectionId, SectionStatus> = {
    "general-information": sectionComplete["general-information"] ? "complete" : "in-progress",
    population: sectionComplete.population ? "complete" : "not-started",
    clinical: sectionComplete.clinical ? "complete" : "not-started",
    "predicted-effect": sectionComplete["predicted-effect"] ? "complete" : "not-started",
    functional: sectionComplete.functional ? "complete" : "not-started",
    "informative-variants": sectionComplete["informative-variants"] ? "complete" : "not-started",
  };

  const renderTracker = (sectionId: string) => {
    if (!SCOREABLE_SECTIONS.includes(sectionId as SectionId)) return null;

    const score = publishedScores[sectionId];
    if (score) {
      return (
        <span className="flex items-center gap-1">
          <MiniScoreBadge code={score.code} value={score.value} />
          {sectionComplete[sectionId as SectionId] && (
            <Check className="h-3 w-3 text-green-600 flex-none" />
          )}
        </span>
      );
    }

    return <StatusPill status={status[sectionId as SectionId]} />;
  };

  return (
    <div>
      <h2 className="font-serif text-base font-bold text-gray-900 mb-3">Curation Information</h2>
      <div className="space-y-2">
        {navItems.map((item, idx) => (
          <div key={item.id || idx}>
            {item.children ? (
              <div className="mb-2">
                <div className="px-3 py-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {item.label}
                </div>
                <div className="pl-4 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setActiveTab(child.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        activeTab === child.id
                          ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{child.label}</span>
                        {renderTracker(child.id)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab(item.id!)}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{item.label}</span>
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 pt-3 border-t border-gray-200 text-center text-xs text-gray-500">
        © {new Date().getFullYear()}{" "}
        <a href="https://www.clinicalgenome.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          ClinGen
        </a>{" "}
        — All rights reserved
      </div>
    </div>
  );
}

export default CurationInfo;
