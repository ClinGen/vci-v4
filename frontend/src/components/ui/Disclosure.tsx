import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Card, CardContent, CardTitle, CardDescription } from "./Card"

interface DisclosureProps {
  title: string
  description?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function Disclosure({ title, description, defaultOpen = false, children }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card tone="reference">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 flex-none pl-4">
          {open ? "Hide" : "Show"} data
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
