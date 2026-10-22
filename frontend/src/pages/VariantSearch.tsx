import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, Search } from "lucide-react"
import { Button } from "../components/ui/Button"

const SUGGESTED_CAID = "CA015944"

const SUGGESTED_VARIANTS = [
  { caid: SUGGESTED_CAID, label: "missense" },
  { caid: "CA10601258", label: "splicing" },
  { caid: "CA415078874", label: "nonsense" },
]

interface ResolvedVariant {
  caid: string
  communityStandardTitle?: string
  geneSymbol?: string
}

export default function VariantSearch() {
  const navigate = useNavigate()
  const [caidInput, setCaidInput] = useState(SUGGESTED_CAID)
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle")
  const [error, setError] = useState("")
  const [resolved, setResolved] = useState<ResolvedVariant | null>(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

  const handleLookup = async () => {
    if (!caidInput.trim()) return
    setStatus("loading")
    setError("")
    try {
      const res = await fetch(`${API_BASE_URL}/variant-lookup?id=${caidInput.trim()}`)
      if (res.status === 404) {
        setStatus("error")
        setError("Variant not found in the registry.")
        return
      }
      if (!res.ok) throw new Error("Network error")
      const data = await res.json()
      setResolved({
        caid: caidInput.trim().toUpperCase(),
        communityStandardTitle: data.communityStandardTitle || data.hgvs || data.name,
        geneSymbol: data.geneSymbol || data.gene,
      })
      setStatus("success")
    } catch (err: unknown) {
      setStatus("error")
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const continueWith = () => {
    navigate("/classification")
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="font-serif text-xl font-bold text-gray-900">Enter your variant</h1>
          <p className="text-xs text-gray-600 mt-1.5">
            Look up a{" "}
            <a href="https://reg.clinicalgenome.org/redmine/projects/registry/genboree_registry/landing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              ClinGen Allele Registry
            </a>{" "}
            CAID to start a new curation record.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            <a href="https://reg.clinicalgenome.org/redmine/projects/registry/genboree_registry/landing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              ClinGen Allele Registry
            </a>{" "}
            CAID
          </label>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <input
                className="w-full border rounded-md p-2.5 font-mono text-xs"
                list="caid-suggestions"
                placeholder={`e.g. ${SUGGESTED_CAID}`}
                value={caidInput}
                onChange={(e) => { setCaidInput(e.target.value); setStatus("idle"); setError(""); setResolved(null) }}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                autoFocus
              />
              <datalist id="caid-suggestions">
                {SUGGESTED_VARIANTS.map((v) => <option key={v.caid} value={v.caid} label={v.label} />)}
              </datalist>
            </div>
            <Button onClick={handleLookup} disabled={status === "loading" || !caidInput.trim()} className="gap-2 flex-none">
              <Search className="h-4 w-4" /> {status === "loading" ? "Looking up..." : "Look up"}
            </Button>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            <span>Suggested:</span>
            {SUGGESTED_VARIANTS.map((v) => (
              <button
                key={v.caid}
                type="button"
                onClick={() => { setCaidInput(v.caid); setStatus("idle"); setError(""); setResolved(null) }}
                className="inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {v.caid} <span className="font-sans text-blue-500">({v.label})</span>
              </button>
            ))}
          </div>

          {status === "error" && (
            <div className="mt-3 border border-red-200 bg-red-50 rounded-md p-3">
              <p className="text-xs text-red-700 flex items-start gap-1.5">
                <AlertTriangle className="h-4 w-4 flex-none mt-0.5" /> {error}
              </p>
              <div className="mt-2.5 flex gap-2">
                <Button size="sm" variant="outline" onClick={handleLookup}>Try again</Button>
                <Button size="sm" variant="outline" onClick={continueWith}>Continue without resolving</Button>
              </div>
            </div>
          )}

          {status === "success" && resolved && (
            <div className="mt-3 border border-green-200 bg-green-50 rounded-md p-3">
              <p className="text-xs text-green-800 font-medium">Resolved {resolved.caid}</p>
              <dl className="text-xs text-gray-700 mt-1.5 space-y-0.5">
                {resolved.communityStandardTitle && <div><dt className="inline font-medium">Variant: </dt><dd className="inline font-mono">{resolved.communityStandardTitle}</dd></div>}
                {resolved.geneSymbol && <div><dt className="inline font-medium">Gene: </dt><dd className="inline">{resolved.geneSymbol}</dd></div>}
              </dl>
              <div className="mt-2.5">
                <Button size="sm" onClick={continueWith}>Continue to record →</Button>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Looks up the ClinGen Allele Registry to resolve variant identifiers.</p>
            {status !== "success" && (
              <button type="button" className="text-xs text-gray-500 hover:text-gray-700 underline flex-none" onClick={continueWith}>
                Skip lookup, continue anyway
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
