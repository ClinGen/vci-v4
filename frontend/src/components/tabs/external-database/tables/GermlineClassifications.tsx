import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card";
import { ExternalLink } from "lucide-react";

export const GermlineClassifications = () => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-bold text-3xl">Germline Classifications Submitted to ClinVar</CardTitle>
          <a href="#" className="text-blue-600 hover:text-blue-800 text-lg flex items-center gap-1 font-bold">
            See data in ClinVar
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xl">
                  Classification (Last evaluated)
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xl">
                  Review Status (Assertion method)
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xl">
                  Condition(s) (Mode of inheritance)
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xl">Submitter</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xl">
                  Submission accession
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">Benign</div>
                  <div className="text-base text-gray-500">(Aug 18, 2017)</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">criteria provided, single submitter</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      ACMG Guidelines, 2015
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">Li-Fraumeni syndrome 1</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      [OMIM]
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                    IntelligenceCG
                  </a>
                </td>
                <td className="py-3 px-4 text-lg">SCV000611723.1</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">Benign</div>
                  <div className="text-base text-gray-500">(Dec 20, 2021)</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">criteria provided, single submitter</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      ACMG Guidelines, 2015
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                    Fulgent Genetics, Fulgent Genetics
                  </a>
                </td>
                <td className="py-3 px-4 text-lg">SCV002804833.1</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">Benign</div>
                  <div className="text-base text-gray-500">(Dec 20, 2021)</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">criteria provided, single submitter</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      ACMG Guidelines, 2015
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">not provided (Autosomal dominant inheritance)</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      [MedGen]
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                    Breakthrough Genomics, Breakthrough Genomics
                  </a>
                </td>
                <td className="py-3 px-4 text-lg">SCV005251488.1</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">Benign</div>
                  <div className="text-base text-gray-500">(Oct 03, 2024)</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">criteria provided, single submitter</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      ACMG Guidelines, 2015
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">
                    Li-Fraumeni syndrome (Autosomal dominant inheritance)
                  </div>
                  <div>[MONDO: MONDO:0018875]</div>
                </td>
                <td className="py-3 px-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                    All of Us Research Program, National Institutes of Health
                  </a>
                </td>
                <td className="py-3 px-4 text-lg">SCV004823832.2</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">Benign</div>
                  <div className="text-base text-gray-500">(Oct 01, 2009)</div>
                </td>
                <td className="py-3 px-4">no assertion criteria provided</td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">TP53 POLYMORPHISM</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      [MedGen]
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                    OMIM
                  </a>
                </td>
                <td className="py-3 px-4 text-lg">SCV000033391.6</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">Benign</div>
                  <div className="text-base text-gray-500">(Jul 13, 2012)</div>
                </td>
                <td className="py-3 px-4">no assertion criteria provided</td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">not provided</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      [MedGen]
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                    Biesecker Lab/Clinical Genomics Section, National Institutes of Health
                  </a>
                </td>
                <td className="py-3 px-4 text-lg">SCV000043503.2</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">Benign</div>
                  <div className="text-base text-gray-500">(Apr 01, 2025)</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">criteria provided, single submitter</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      Myriad Autosomal Dominant, Autosomal Recessive and X-Linked Classification Criteria (2023)
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-lg text-gray-600">Li-Fraumeni syndrome 1</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      [OMIM]
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                    Myriad Genetics, Inc.
                  </a>
                </td>
                <td className="py-3 px-4 text-lg">SCV006301172.1</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-lg text-gray-600 text-center">
          Showing 7 of 31 total Germline Classifications.
          <button className="text-blue-600 hover:text-blue-800 ml-1 text-lg font-medium">
            View all classifications
          </button>
        </div>
      </CardContent>
    </Card>
  );
}