import { Lock } from "lucide-react"
import { Button } from "./Button"

interface LockedNoticeProps {
  onGoToParameters: () => void
}

export function LockedNotice({ onGoToParameters }: LockedNoticeProps) {
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-gray-700 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-gray-500 flex-none" />
        Mode of inheritance must be set in Classification Parameters before scoring can start here.
      </div>
      <Button variant="outline" size="sm" onClick={onGoToParameters} className="flex-none">
        Go to Classification Parameters
      </Button>
    </div>
  );
}
