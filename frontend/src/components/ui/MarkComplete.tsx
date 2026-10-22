import { Check } from "lucide-react"
import { Button } from "./Button"

interface MarkCompleteProps {
  done: boolean
  onClick: () => void
  onEdit: () => void
  disabled?: boolean
  disabledReason?: string
}

export function MarkComplete({ done, onClick, onEdit, disabled = false, disabledReason = "" }: MarkCompleteProps) {
  if (done) {
    return (
      <button
        onClick={onEdit}
        title="Click to reopen for editing"
        className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-3.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
      >
        <Check className="h-3.5 w-3.5" /> Section Completed
      </button>
    );
  }
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={`gap-1.5 ${disabled ? "" : "border-blue-300 text-blue-700 hover:bg-blue-50"}`}
    >
      <Check className="h-3.5 w-3.5" /> Mark Complete
    </Button>
  );
}

interface SaveEvidenceAndCompleteProps {
  complete: boolean
  completeDisabledReason?: string
  evidenceSaved: boolean
  onSaveEvidence: () => void
  onToggleComplete: (checked: boolean) => void
}

export function SaveEvidenceAndComplete({ complete, completeDisabledReason, evidenceSaved, onSaveEvidence, onToggleComplete }: SaveEvidenceAndCompleteProps) {
  return (
    <div className="flex items-center gap-3">
      <Button size="sm" onClick={onSaveEvidence} className="!bg-blue-800 hover:!bg-blue-900 !text-white !border-blue-800">Save Evidence</Button>
      <label
        className={`flex items-center gap-1.5 text-xs font-medium ${evidenceSaved ? "text-gray-700 cursor-pointer" : "text-gray-400"}`}
        title={!evidenceSaved ? completeDisabledReason : undefined}
      >
        <input
          type="checkbox"
          checked={complete}
          disabled={!evidenceSaved}
          onChange={(e) => onToggleComplete(e.target.checked)}
          className="rounded border-gray-300"
        />
        Tab Completed
      </label>
    </div>
  );
}
