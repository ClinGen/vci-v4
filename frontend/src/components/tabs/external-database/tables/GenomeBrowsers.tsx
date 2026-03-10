import { ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "../../../ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"

interface DatabaseRow {
  name: string
  grch38: string | null
  grch38Sub?: string | null
  grch37: string | null
  grch37Sub?: string | null
  otherId: string | null
  isLink?: boolean
}

const databases: DatabaseRow[] = [
  {
    name: "UCSC Genome Browser",
    grch38: "GRCh38/hg38",
    grch37: "GRCh37/hg19",
    otherId: null,
    isLink: true,
  },
  {
    name: "NCBI Variation Viewer",
    grch38: "GRCh38",
    grch37: "GRCh37",
    otherId: null,
    isLink: true,
  },
  {
    name: "Ensembl Genome Browser",
    grch38: "GRCh38",
    grch37: "GRCh37",
    otherId: null,
    isLink: true,
  },
  {
    name: "ClinGen Allele Registry",
    grch38: null,
    grch37: null,
    otherId: "CA000072",
    isLink: true,
  },
  {
    name: "Genome Aggregation Database (gnomAD)",
    grch38: "17-7676154-G-C",
    grch37: null,
    otherId: null,
    isLink: true,
  },
  {
    name: "dbSNP",
    grch38: null,
    grch37: null,
    otherId: "rs1042522",
    isLink: true,
  },
  {
    name: "Genomic context",
    grch38: "chr17:g.7676154G>C",
    grch38Sub: "NC_000017.11:g.7676154G>C",
    grch37: "chr17:g.7579472G>C",
    grch37Sub: "NC_000017.10:g.7579472G>C",
    otherId: null,
    isLink: false,
  },
]

function CellLink({ label }: { label: string }) {
  return (
    <a href="#" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-mono text-sm">
      {label}
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  )
}

export const GenomeBrowsers = () => {
  return (
    <Card className="bg-white shadow-md border border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-bold text-3xl">Genome Browsers and Variant Databases</CardTitle>
          <Button
            variant="outline"
            className="shrink-0 flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
          >
            <RefreshCw className="h-4 w-4" />
            Requery External Databases
            <span className="hidden lg:inline text-xs text-gray-500">Last queried: September 1, 2025</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Database
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">GRCh38</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">GRCh37</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Other ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {databases.map((db, index) => (
                  <tr
                    key={db.name}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} transition-colors hover:bg-blue-50 ${
                      db.isLink === false ? "border-t-2 border-gray-300" : ""
                    }`}
                  >
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {db.isLink !== false ? (
                        <a href="#" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium text-sm">
                          {db.name}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="font-medium text-sm text-gray-900">{db.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {db.grch38 ? (
                        db.isLink !== false ? (
                          <CellLink label={db.grch38} />
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-sm text-gray-900">{db.grch38}</span>
                            {db.grch38Sub && <span className="font-mono text-xs text-gray-500">{db.grch38Sub}</span>}
                          </div>
                        )
                      ) : (
                        <span className="text-gray-300">{"--"}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {db.grch37 ? (
                        db.isLink !== false ? (
                          <CellLink label={db.grch37} />
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-sm text-gray-900">{db.grch37}</span>
                            {db.grch37Sub && <span className="font-mono text-xs text-gray-500">{db.grch37Sub}</span>}
                          </div>
                        )
                      ) : (
                        <span className="text-gray-300">{"--"}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {db.otherId ? <CellLink label={db.otherId} /> : <span className="text-gray-300">{"--"}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
