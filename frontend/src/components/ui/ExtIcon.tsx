import { ExternalLink } from "lucide-react"
import { cn } from "../../lib/utils"

export function ExtIcon({ className = "w-3 h-3" }: { className?: string }) {
  return <ExternalLink className={className} />;
}

export function InfoDot({ title }: { title: string }) {
  return (
    <span
      title={title}
      className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-none cursor-help"
    >
      i
    </span>
  );
}

export function ExternalLinkIconSvg({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

export function EmptyState({ text = "No content available", className }: { text?: string; className?: string }) {
  return <div className={cn("flex items-center justify-center p-6 text-gray-600", className)}>{text}</div>;
}
