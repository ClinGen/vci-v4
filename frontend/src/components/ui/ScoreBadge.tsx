import { useState } from "react"
import { cn } from "../../lib/utils"

export function formatSignedScore(value: number | string): string {
  const n = Number(value);
  if (n > 0) return `+${n.toFixed(1)}`;
  if (n < 0) return `−${Math.abs(n).toFixed(1)}`;
  return "0.0";
}

interface ScoreBadgeProps {
  code: string
  value: number | string
  size?: "default" | "sm"
}

export function ScoreBadge({ code, value, size = "default" }: ScoreBadgeProps) {
  const [hover, setHover] = useState(false);
  const n = Number(value);
  const isPos = n > 0;
  const isNeg = n < 0;
  const glyph = isPos ? "+" : isNeg ? "−" : "0";
  const magnitude = Math.abs(n).toFixed(1);

  const tone = isPos
    ? { border: "border-gray-300", bg: "bg-gray-200", text: "text-gray-800", glyphColor: "text-gray-700" }
    : { border: "border-gray-300", bg: "bg-white", text: "text-gray-800", glyphColor: "text-gray-700" };

  const sizeClasses = size === "sm" ? "gap-1 border px-2 py-0.5 text-xs" : "gap-1.5 border-2 px-3 py-1.5 text-xs";

  const tooltipText = isPos
    ? "Positive — pathogenic-direction evidence"
    : isNeg
    ? "Negative — benign-direction evidence"
    : "Zero — no net contribution to classification";

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        className={cn("inline-flex items-center rounded-lg font-semibold cursor-default", sizeClasses, tone.border, tone.bg, tone.text)}
      >
        {code}
        <span className={cn("font-mono font-bold", tone.glyphColor)}>{glyph}</span>
        <span className="font-mono">{magnitude}</span>
      </span>
      {hover && (
        <span className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2.5 py-1.5 shadow-lg">
          {tooltipText}
          <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900"></span>
        </span>
      )}
    </span>
  );
}

export function ResultBadge({ code, value = "Not Evaluated" }: { code: string; value?: string }) {
  const isEvaluated = value !== "Not Evaluated";
  return (
    <span
      className={cn(
        "text-xs font-mono px-2 py-0.5 rounded border",
        isEvaluated ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-gray-50 text-gray-400 border-gray-200",
      )}
    >
      {code} = {value}
    </span>
  );
}

interface CodeStatusBadgeProps {
  code: string
  status: string
  rawValue: number | null
  ready: boolean
}

export function CodeStatusBadge({ code, status, rawValue, ready }: CodeStatusBadgeProps) {
  if (status === "na" || status === "nd") {
    const label = status === "na" ? "NA" : "ND";
    const toneClasses = status === "na"
      ? "bg-gray-100 text-gray-400 border-gray-300 line-through"
      : "bg-amber-50 text-amber-700 border-amber-200";
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("text-xs font-mono px-2 py-0.5 rounded border", toneClasses)}>{code} = {label}</span>
        {rawValue !== null && ready && (
          <span className="text-[10px] text-gray-400 italic whitespace-nowrap">
            (computed: {formatSignedScore(rawValue)})
          </span>
        )}
      </span>
    );
  }
  if (rawValue !== null && ready) {
    return <ScoreBadge code={code} value={rawValue} />;
  }
  return <span className="text-xs font-mono px-2 py-0.5 rounded border bg-gray-50 text-gray-400 border-gray-200">{code} = NE</span>;
}

interface CodeStatusSelectProps {
  status: string
  onChange: (value: string) => void
  includeNA?: boolean
}

export function CodeStatusSelect({ status, onChange, includeNA = true }: CodeStatusSelectProps) {
  return (
    <select
      className="border rounded-md p-1 text-xs bg-white"
      value={status}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="score">Score this code</option>
      <option value="nd">No Data (ND)</option>
      {includeNA && <option value="na">Not Applicable (NA)</option>}
    </select>
  );
}
