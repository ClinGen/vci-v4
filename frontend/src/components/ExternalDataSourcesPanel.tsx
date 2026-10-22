import { AlertTriangle, RefreshCw } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card"
import { Button } from "./ui/Button"

export interface ExternalDataSource {
  key: string
  label: string
  description?: string
  status: "idle" | "loading" | "error" | "success"
  error?: string
  lastFetchedAt?: number | null
  onRetry: () => void
  retryDisabled?: boolean
  manual?: boolean
}

function formatLastFetched(ts: number | null | undefined): string {
  if (!ts) return "Never";
  const seconds = Math.round((Date.now() - ts) / 1000);
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return new Date(ts).toLocaleString();
}

function SourceRow({ source }: { source: ExternalDataSource }) {
  const { label, description, status, error, lastFetchedAt, onRetry, retryDisabled, manual } = source;
  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        </div>
        <div className="flex items-center gap-3 flex-none">
          <span className="text-xs text-gray-500">
            {status === "loading" ? "Querying..." : `Last queried: ${formatLastFetched(lastFetchedAt)}`}
          </span>
          <Button size="sm" variant="outline" onClick={onRetry} disabled={status === "loading" || retryDisabled} className="gap-1.5">
            <RefreshCw className="h-3 w-3" />
            {status === "loading" ? "Querying..." : lastFetchedAt ? "Requery" : manual ? "Fetch" : "Query"}
          </Button>
        </div>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-600 mt-1.5 flex items-start gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 flex-none mt-0.5" /> {error}
        </p>
      )}
    </div>
  );
}

interface ExternalDataSourcesPanelProps {
  sources: ExternalDataSource[]
}

export default function ExternalDataSourcesPanel({ sources }: ExternalDataSourcesPanelProps) {
  return (
    <Card tone="muted">
      <CardHeader>
        <CardTitle>
          External Data Sources <span className="font-sans font-normal text-gray-500">-- This is a prototype only feature</span>
        </CardTitle>
        <CardDescription>When each source was last queried, and requery on demand.</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          {sources.map((s) => (
            <SourceRow key={s.key} source={s} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
