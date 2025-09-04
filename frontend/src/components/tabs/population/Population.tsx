import { Button } from "../../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";

const Population = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold tracking-tight">Population</h3>
      <Card className="bg-white shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-blue-700">
            gnomAD v4 GroupMax Filtering Allele Frequency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700"></th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-lg">Exomes</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-lg">Genomes</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Filters</td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      Pass
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      Pass
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center"></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Allele Count</td>
                  <td className="py-3 px-4 text-center font-mono">1046941</td>
                  <td className="py-3 px-4 text-center font-mono">95285</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">1142226</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Allele Number</td>
                  <td className="py-3 px-4 text-center font-mono">1461558</td>
                  <td className="py-3 px-4 text-center font-mono">152024</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">1613582</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Allele Frequency</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.716318476584576</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.626776035362837</td>
                  <td className="py-3 px-4 text-center font-mono text-sm font-semibold">0.707882214847031</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      Grpmax Filtering AF
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        i
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">(95% confidence)</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.74639068</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.739567990000004</td>
                  <td className="py-3 px-4 text-center font-mono text-sm font-semibold">0.7462732</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Grpmax Filtering AF Group</td>
                  <td className="py-3 px-4 text-center">Non-Finnish European</td>
                  <td className="py-3 px-4 text-center">Non-Finnish European</td>
                  <td className="py-3 px-4 text-center font-semibold">Non-Finnish European</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Number of homozygotes</td>
                  <td className="py-3 px-4 text-center font-mono">380188</td>
                  <td className="py-3 px-4 text-center font-mono">31776</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">411964</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
              ClinGen guidance for using gnomAD v4 data
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader className="pb-4 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-blue-800">
                gnomAD 17-7676154-C-G (GRCh38) Version: 4.1
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="exomes" checked readOnly className="rounded" />
                  <label htmlFor="exomes" className="text-sm font-medium">
                    Exomes
                  </label>
                  <span className="text-xs">Filter:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Pass</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="genomes" checked readOnly className="rounded" />
                  <label htmlFor="genomes" className="text-sm font-medium">
                    Genomes
                  </label>
                  <span className="text-xs">Filter:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Pass</span>
                </div>
              </div>
            </div>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
              See data in gnomAD
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Genetic Ancestry Group
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      Allele Count
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      Allele Number
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      Number of Homozygotes
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      Allele Frequency
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 15l5-5 5 5" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      <span className="font-medium">African/African-American</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">28605</td>
                  <td className="py-3 px-4 text-center font-mono">74930</td>
                  <td className="py-3 px-4 text-center font-mono">5495</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.381756305885493</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      <span className="font-medium">Non-Finnish European</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">882123</td>
                  <td className="py-3 px-4 text-center font-mono">1179968</td>
                  <td className="py-3 px-4 text-center font-mono">329809</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.747582137820686</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      <span className="font-medium">Finnish</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">46913</td>
                  <td className="py-3 px-4 text-center font-mono">63994</td>
                  <td className="py-3 px-4 text-center font-mono">17252</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.733084351657967</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      <span className="font-medium">Ashkenazi Jewish</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">21300</td>
                  <td className="py-3 px-4 text-center font-mono">29604</td>
                  <td className="py-3 px-4 text-center font-mono">7644</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.719497365220916</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      <span className="font-medium">Admixed American</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">42617</td>
                  <td className="py-3 px-4 text-center font-mono">59976</td>
                  <td className="py-3 px-4 text-center font-mono">15147</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.710567560357476</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      <span className="font-medium">Remaining individuals</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">43349</td>
                  <td className="py-3 px-4 text-center font-mono">62476</td>
                  <td className="py-3 px-4 text-center font-mono">15169</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.693850438568410</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      <span className="font-medium">Amish</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">611</td>
                  <td className="py-3 px-4 text-center font-mono">912</td>
                  <td className="py-3 px-4 text-center font-mono">207</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.669956140350877</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      <span className="font-medium">Middle Eastern</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">3519</td>
                  <td className="py-3 px-4 text-center font-mono">5810</td>
                  <td className="py-3 px-4 text-center font-mono">1103</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.605679862303683</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      <span className="font-medium">East Asian</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">26984</td>
                  <td className="py-3 px-4 text-center font-mono">44862</td>
                  <td className="py-3 px-4 text-center font-mono">8137</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.601489107440596</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      <span className="font-medium">South Asian</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">46205</td>
                  <td className="py-3 px-4 text-center font-mono">91050</td>
                  <td className="py-3 px-4 text-center font-mono">12001</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">0.507468423942885</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50 bg-gray-50">
                  <td className="py-3 px-4 font-semibold">XX</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">579412</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">812224</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">210190</td>
                  <td className="py-3 px-4 text-center font-mono text-sm font-semibold">0.713364786068867</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50 bg-gray-50">
                  <td className="py-3 px-4 font-semibold">XY</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">562814</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">801358</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">201774</td>
                  <td className="py-3 px-4 text-center font-mono text-sm font-semibold">0.702325302798499</td>
                </tr>
                <tr className="border-t-2 border-gray-300 bg-blue-50">
                  <td className="py-3 px-4 font-bold text-blue-800">Total</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-blue-800">1142226</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-blue-800">1613582</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-blue-800">411964</td>
                  <td className="py-3 px-4 text-center font-mono text-sm font-bold text-blue-800">
                    0.707882214847031
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
          Requery gnomAD
          <span className="text-base text-gray-500 ml-2">Last queried: September 4, 2025</span>
        </Button>
      </div>
    </div>
  );
}

export default Population;
