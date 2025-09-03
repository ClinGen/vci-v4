import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card";

export const GenomeBrowsers = () => {
  return (
    <Card className="bg-white shadow-md border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="font-bold text-3xl">Genome Browsers and Variant Databases</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-lg font-medium flex items-center gap-1"
              >
                UCSC Genome Browser
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
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-lg font-medium flex items-center gap-1"
              >
                GRCh38/hg38
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <span className="text-gray-400">/</span>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-lg font-medium flex items-center gap-1"
              >
                GRCh37/hg19
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
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-lg font-medium flex items-center gap-1"
              >
                NCBI Variation Viewer
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
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-lg font-medium flex items-center gap-1"
              >
                GRCh38
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <span className="text-gray-400 text-lg">/</span>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-lg font-medium flex items-center gap-1"
              >
                GRCh37
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
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-lg font-medium flex items-center gap-1"
              >
                Ensembl Genome Browser
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
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-lg font-medium flex items-center gap-1"
              >
                GRCh38
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <span className="text-gray-400">/</span>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-lg font-medium flex items-center gap-1"
              >
                GRCh37
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
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                ClinGen Allele Registry
              </a>
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>
          <div className="text-right">
            <a
              href="#"
              className="font-mono text-lg text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              CA000072
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                Genome Aggregation Database (gnomAD)
              </a>
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>
          <div className="text-right">
            <a
              href="#"
              className="font-mono text-lg text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              17-7676154-G-C (GRCh38)
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <a href="#" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                dbSNP
              </a>
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>
          <div className="text-right">
            <a
              href="#"
              className="font-mono text-lg text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              rs1042522
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}