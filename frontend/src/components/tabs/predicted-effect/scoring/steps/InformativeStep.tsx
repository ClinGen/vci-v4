import { useState } from "react";
import { useScoringContext } from "../../../../../contexts/ScoringContext";
import { Button } from "../../../../ui/Button";
import { Info, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/Collapsible";

const classificationOptions = ["Pathogenic", "Likely Pathogenic", "VUS", "Likely Benign", "Benign"];

const informativeDetailsOptions = {
  pathogenic: [
    "Distinct nucleotide change, same amino acid change",
    "Distinct amino acid change, Grantham Difference of Informative Variant ≤ Variant being considered",
  ],
  benign: [
    "Distinct nucleotide change, same amino acid change",
    "Distinct amino acid change, Grantham Difference of Informative Variant ≥ Variant being considered",
  ],
};

const InformativeStep = () => {
  const {
    informativeVariants,
    newVariant,
    totalInformativePoints,
    handleVariantInputChange,
    handleAddVariant,
    handleRemoveVariant,
    calculateVariantPoints,
    getInformativeDetailsOptions,
  } = useScoringContext();

  const [showInformativeVariantTable, setShowInformativeVariantTable] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Informative Variants</h3>
        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
          View Grantham Score Chart
        </a>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-2 mb-3 rounded-md text-sm">
        <span className="font-medium">Grantham Score of Pro to Arg is 103</span>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Add variants informative for the monogenic disease and predicted effect of the variant being considered.
      </p>

      {informativeVariants.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-md mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y">
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">HGVS</th>
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Variant ID</th>
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Classification</th>
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Informative Details</th>
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Points</th>
                <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Actions</th>
              </tr>
            </thead>
            <tbody>
              {informativeVariants.map((variant, index) => (
                <tr key={index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <td className="p-3 font-mono">placeholder HGVS</td>
                  <td className="p-3 font-mono">{variant.variantId}</td>
                  <td className="p-3">{variant.classification}</td>
                  <td className="p-3">{variant.informativeDetails || "N/A"}</td>
                  <td className="p-3 text-center">{calculateVariantPoints(variant, informativeVariants)}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveVariant(index)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="p-3 text-right font-medium">
                  Total Informative Points:
                </td>
                <td className="p-3 font-bold text-center">
                  {totalInformativePoints > 0
                    ? `+${totalInformativePoints.toFixed(1)}`
                    : totalInformativePoints.toFixed(1)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="border-t border-gray-200 my-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-[0.8fr_0.8fr_1.4fr] gap-4 mb-4">
        <div>
          <label className="block font-medium mb-2">
            Variant ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border rounded-md p-2 bg-white"
            value={newVariant.variantId}
            onChange={(e) => handleVariantInputChange("variantId", e.target.value)}
            placeholder="Enter variant ID"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Classification <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded-md p-2 bg-white"
            value={newVariant.classification}
            onChange={(e) => handleVariantInputChange("classification", e.target.value)}
          >
            <option value="">Select classification</option>
            {classificationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">Informative Details</label>
          <div className="flex space-x-2">
            <select
              className="w-full border rounded-md p-2 bg-white"
              value={newVariant.informativeDetails}
              onChange={(e) => handleVariantInputChange("informativeDetails", e.target.value)}
              disabled={
                !["Pathogenic", "Likely Pathogenic", "Benign", "Likely Benign"].includes(newVariant.classification)
              }
            >
              <option value="">Select informative detail</option>
              {getInformativeDetailsOptions(newVariant.classification).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Button onClick={handleAddVariant}>Add</Button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Collapsible open={showInformativeVariantTable} onOpenChange={setShowInformativeVariantTable}>
          <CollapsibleTrigger className="flex items-center text-sm text-blue-600 hover:text-blue-800">
            <Info className="h-4 w-4 mr-1" />
            <span>
              {showInformativeVariantTable
                ? "Hide informative variant scoring table"
                : "Show informative variant scoring table"}
            </span>
            <ChevronDown
              className={`h-4 w-4 ml-1 transition-transform ${
                showInformativeVariantTable ? "transform rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="border rounded-md overflow-hidden">
              <div className="bg-blue-50 p-2 border-b text-sm font-medium">Scoring Rubric</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="p-3 border text-left">Informative Variant Details</th>
                      <th className="p-3 border text-left">Scoring Rubric</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-white">
                      <td className="p-3 border">
                        Informative Variant is Pathogenic or Likely Pathogenic AND
                        <br />
                        Distinct nucleotide change, same amino acid change
                      </td>
                      <td className="p-3 border">
                        4.0 points First Pathogenic variant
                        <br />
                        2.0 points All other Pathogenic/Likely Pathogenic variants
                      </td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="p-3 border">
                        Informative Variant is Pathogenic or Likely Pathogenic AND
                        <br />
                        Distinct amino acid change, Grantham Difference of Informative Variant ≤ Variant being
                        considered
                      </td>
                      <td className="p-3 border">
                        2.0 points First Pathogenic variant
                        <br />
                        1.0 points All other Pathogenic/Likely Pathogenic variants
                      </td>
                    </tr>
                    <tr className="border-b bg-white">
                      <td className="p-3 border">
                        Informative Variant is Benign or Likely Benign AND
                        <br />
                        Distinct amino acid change, Grantham Difference of Informative Variant ≥ Variant being
                        considered
                      </td>
                      <td className="p-3 border">
                        -2.0 points First Benign variant
                        <br />
                        -1.0 points All other Benign/Likely Benign variants
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border">
                        Informative Variant is Benign or Likely Benign AND
                        <br />
                        Distinct nucleotide change, same amino acid change
                      </td>
                      <td className="p-3 border">
                        -4.0 points First Benign variant
                        <br />
                        -2.0 points All other Benign/Likely Benign variants
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
}

export default InformativeStep;
