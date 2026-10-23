import { Info, Check } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./Button"
import { Modal } from "./Modal"
import { ExtIcon } from "./ExtIcon"
import type { GuidanceLink } from "../../lib/referenceData"

export function CSpecTag() {
  return <span className="text-indigo-600 font-mono normal-case tracking-normal text-xs ml-1">from Criteria Spec</span>;
}

interface CSpecMatchBadgeProps {
  criteriaDoc: string | null | undefined
}

export function CSpecMatchBadge({ criteriaDoc }: CSpecMatchBadgeProps) {
  if (!criteriaDoc || !criteriaDoc.trim()) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
      <Info className="h-3.5 w-3.5" /> CSpec version guidance not yet available
    </span>
  );
}

interface CSpecGuidanceBannerProps {
  headerRight?: React.ReactNode
  links?: GuidanceLink[]
  note?: React.ReactNode
}

export function CSpecGuidanceBanner({ headerRight, links, note }: CSpecGuidanceBannerProps) {
  const hasLinks = links && links.length > 0;
  return (
    <div className="rounded-md mb-4 overflow-hidden border-l-4 border shadow-sm border-l-gray-300 border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between px-3 py-2.5 gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <Info className="h-3.5 w-3.5" /> Guidance
        </span>
        {headerRight && <div className="flex-none">{headerRight}</div>}
      </div>
      {note && (
        <div className="px-3 py-2 text-xs text-gray-600 border-t border-gray-200">
          {note}
        </div>
      )}
      {hasLinks && (
        <div className="px-3 pb-2.5 pt-2 border-t border-gray-200 flex flex-col gap-1.5">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
            >
              {link.text} <ExtIcon />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface GuidanceModalProps {
  onClose: () => void
  links?: GuidanceLink[]
}

export function GuidanceModal({ onClose, links }: GuidanceModalProps) {
  const hasLinks = links && links.length > 0;
  return (
    <Modal title="Guidance" onClose={onClose}>
      {hasLinks ? (
        <div className="flex flex-col gap-1.5">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
            >
              {link.text} <ExtIcon />
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Guidance forthcoming.</p>
      )}
    </Modal>
  );
}

interface GuidanceButtonProps {
  onClick: () => void
  links?: GuidanceLink[]
}

export function GuidanceButton({ onClick, links }: GuidanceButtonProps) {
  const hasLinks = links && links.length > 0;
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      className={cn("gap-1.5", hasLinks ? "text-blue-600 border-blue-200 hover:bg-blue-50" : "text-gray-500")}
    >
      <Info className="h-3.5 w-3.5" /> Guidance
    </Button>
  );
}

export function GuidanceBlock({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function GuidanceHighlight({ active, children }: { active: boolean; children: React.ReactNode }) {
  if (!active) return <>{children}</>;
  return (
    <span className="inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded bg-white border border-current/25 shadow-sm">
      <Check className="h-3 w-3 flex-none" />
      {children}
    </span>
  );
}
