import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card";
import { Info } from "lucide-react"

export const AllInterpretations = () => {
  return (
    <Card className="bg-white shadow-md border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-bold flex items-center gap-2 text-3xl">
          All interpretations for this variant in ClinGen's Variant Curation Interfaces (VCIs)
          <Info className="h-6 w-6 text-blue-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xl">Classification</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xl">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xl">
                  Condition - Mode of inheritance
                </th>
                <th className="text-left p-3 font-semibold text-gray-700 text-xl">Source/Approved Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xl">Curator/Affiliation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-lg text-gray-600">--</td>
                <td className="py-3 px-4">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-lg font-medium">
                    IN PROGRESS
                  </span>
                </td>
                <td className="py-3 px-4 text-lg text-gray-600">Not provided</td>
                <td className="py-3 px-4 text-lg text-gray-600">v4 VCI / --</td>
                <td className="py-3 px-4 text-lg text-gray-600">Li Fraumeni VCEP</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-lg text-gray-600">Likely Benign</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-lg font-medium">
                      APPROVED
                    </span>
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                </td>
                <td className="py-3 px-4 text-lg text-gray-600">
                  Li-Fraumeni syndrome (MONDO:0018875)/ <em>Autosomal Dominant</em>
                </td>
                <td className="py-3 px-4 text-lg text-gray-600">v3 VCI / Mar 22, 2020</td>
                <td className="py-3 px-4 text-lg text-gray-600">Li Fraumeni VCEP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
