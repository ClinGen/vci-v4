import { Check, Circle } from "lucide-react"
import { cn } from "../../lib/utils"

type Status = "not-started" | "in-progress" | "complete"

const STATUS_STYLES: Record<Status, { icon: typeof Circle | typeof Check; iconClass: string; label: string; pill: string }> = {
  "not-started": { icon: Circle, iconClass: "text-gray-400 fill-gray-300", label: "Not started", pill: "bg-gray-100 text-gray-700" },
  "in-progress": { icon: Circle, iconClass: "text-blue-500 fill-blue-400", label: "In progress", pill: "bg-blue-50 text-blue-700" },
  complete: { icon: Check, iconClass: "text-green-600", label: "Complete", pill: "bg-green-50 text-green-700" },
};

export function StatusPill({ status }: { status: Status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES["not-started"];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", s.pill)}>
      <Icon className={cn("h-3 w-3", s.iconClass)} />
      {s.label}
    </span>
  );
}

export function MiniScoreBadge({ code, value }: { code: string; value: number | string }) {
  const n = Number(value);
  const glyph = n > 0 ? "+" : n < 0 ? "−" : "";
  const tone = n > 0 ? "bg-gray-200 text-gray-800 border-gray-300" : "bg-white text-gray-800 border-gray-300";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold font-mono whitespace-nowrap border", tone)}>
      {code} {glyph}{Math.abs(n).toFixed(1)}
    </span>
  );
}
