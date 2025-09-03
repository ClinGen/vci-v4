import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card";

export const OtherResources = () => {
  return (
    <Card className="bg-white shadow-md border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="font-bold text-3xl">Other Evidence Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-0 text-lg font-semibold text-gray-900">Resource</th>
                <th className="text-right py-3 px-0 text-lg font-semibold text-gray-900">
                  Link to variant in resource
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-0 text-lg text-gray-900">Leiden Open Variation Database (LOVD)</td>
                <td className="py-4 px-0 text-right">
                  <a
                    href="#"
                    className="text-lg text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                  >
                    Global Variome shared LOVD
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
                  </a>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-0 text-lg text-gray-900">
                  Clinical Interpretation of Variants in Cancer (CIViC)
                </td>
                <td className="py-4 px-0 text-right">
                  <div className="inline-flex items-center gap-2">
                    <a
                      href="#"
                      className="text-lg text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                    >
                      Clinical Interpretations of Variants in Cancer (CIViC)
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
                    </a>
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-0 text-lg text-gray-900">BRCA Exchange</td>
                <td className="py-4 px-0 text-right">
                  <span className="text-lg text-gray-600">
                    Link to BRCA Exchange is not available for this variant.
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-0 text-lg text-gray-900">LitVar</td>
                <td className="py-4 px-0 text-right">
                  <a
                    href="#"
                    className="text-lg text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                  >
                    LitVar publications available for this variant (2108 found)
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
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}