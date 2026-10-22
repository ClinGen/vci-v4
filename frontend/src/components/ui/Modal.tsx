import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface ModalProps {
  title: string
  onClose: () => void
  headerRight?: React.ReactNode
  navItems?: { id: string; label: string }[]
  children: React.ReactNode
}

export function Modal({ title, onClose, headerRight, navItems, children }: ModalProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-8 px-5" onClick={onClose}>
      <div className="bg-blue-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-600 flex-none">
          <h2 className="font-serif text-sm font-bold text-white">{title}</h2>
          <div className="flex items-center gap-3">
            {headerRight}
            <button onClick={onClose} className="text-blue-200 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        {navItems && navItems.length > 0 && (
          <div className="flex-none bg-gray-50 border-b border-gray-200 px-3 py-1.5 flex gap-1.5 overflow-x-auto">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="px-2.5 py-1 rounded-full border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 whitespace-nowrap flex-none"
              >
                {n.label}
              </button>
            ))}
          </div>
        )}
        <div className="overflow-y-auto p-4 text-xs">{children}</div>
      </div>
    </div>
  );
}

interface FieldRowProps {
  label: string
  required?: boolean
  dense?: boolean
  split?: boolean
  info?: React.ReactNode
  empty?: boolean
  children: React.ReactNode
}

export function FieldRow({ label, required, dense, split, info, empty, children }: FieldRowProps) {
  const highlight = required && empty;
  if (split) {
    return (
      <div className={cn("flex items-start justify-between gap-3 py-2 px-3 border-l-2", required ? "border-blue-300" : "border-transparent", highlight && "bg-gray-100")}>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
          {info && <div className="text-xs text-gray-600 mt-1">{info}</div>}
        </div>
        <div className="flex-none text-xs">{children}</div>
      </div>
    );
  }
  return (
    <div className={cn("grid items-start px-3 border-l-2", dense ? "grid-cols-[170px_1fr] gap-2 py-1.5" : "grid-cols-[230px_1fr] gap-2 py-2", required ? "border-blue-300" : "border-transparent", highlight && "bg-gray-100")}>
      <label className={cn("text-xs font-medium text-gray-700", dense ? "pt-1" : "pt-1.5")}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="text-xs">{children}</div>
    </div>
  );
}

interface ModalSectionProps {
  id: string
  title: string
  badge?: React.ReactNode
  note?: string
  composer?: boolean
  children: React.ReactNode
}

export function ModalSection({ id, title, badge, note, composer, children }: ModalSectionProps) {
  return (
    <section id={id} className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="font-serif text-xs font-bold text-gray-900">{title}</h3>
        {badge}
      </div>
      {note && <p className="text-xs text-gray-400 mb-1.5">{note}</p>}
      <div className={cn("border border-blue-200 rounded-md divide-y divide-blue-100 bg-white", composer && "border-dashed")}>
        {children}
      </div>
    </section>
  );
}
