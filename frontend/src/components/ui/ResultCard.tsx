import { cn } from "../../lib/utils"

interface ResultCardProps {
  tone?: "neutral" | "computed" | "warning"
  guidance?: React.ReactNode
  children: React.ReactNode
}

const toneClasses = {
  neutral: "border-gray-200 bg-gray-50",
  computed: "border-blue-200 bg-blue-50/50",
  warning: "border-amber-300 bg-amber-50",
};

export function ResultCard({ tone = "neutral", guidance, children }: ResultCardProps) {
  return (
    <div className={cn("border rounded-md p-2.5", toneClasses[tone] || toneClasses.neutral)}>
      {guidance && (
        <div className="mb-2 pb-2 border-b border-gray-200">
          <div className="text-[10px] font-mono uppercase tracking-wide text-gray-400 mb-1">Per Criteria Spec</div>
          <div className="text-xs text-gray-700">{guidance}</div>
        </div>
      )}
      <div className="text-xs text-gray-700">{children}</div>
    </div>
  );
}
