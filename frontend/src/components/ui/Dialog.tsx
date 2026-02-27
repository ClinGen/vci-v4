import { createContext, forwardRef, useContext, useEffect, type HTMLAttributes, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface DialogContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => (
  <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
)

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, showCloseButton = true, onClick, ...props }, ref) => {
    const context = useContext(DialogContext)
    if (!context) {
      throw new Error("DialogContent must be used within Dialog")
    }

    const { open, onOpenChange } = context

    useEffect(() => {
      if (!open) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onOpenChange(false)
        }
      }

      window.addEventListener("keydown", handleEscape)
      return () => window.removeEventListener("keydown", handleEscape)
    }, [open, onOpenChange])

    if (!open || typeof document === "undefined") return null

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          onClick={() => onOpenChange(false)}
          aria-label="Close dialog"
        />
        <div
          ref={ref}
          className={cn("relative z-10 w-full max-w-2xl rounded-lg border bg-white p-6 shadow-xl", className)}
          onClick={(event) => {
            event.stopPropagation()
            onClick?.(event)
          }}
          {...props}
        >
          {showCloseButton && (
            <button
              type="button"
              className="absolute right-4 top-4 rounded-sm text-gray-500 transition-colors hover:text-gray-900"
              onClick={() => onOpenChange(false)}
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {children}
        </div>
      </div>,
      document.body,
    )
  },
)
DialogContent.displayName = "DialogContent"

const DialogHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-4 flex flex-col space-y-1.5", className)} {...props} />
))
DialogHeader.displayName = "DialogHeader"

const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-xl font-semibold text-gray-900", className)} {...props} />
  ),
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-gray-600", className)} {...props} />
  ),
)
DialogDescription.displayName = "DialogDescription"

const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-6 flex justify-end gap-2", className)} {...props} />
))
DialogFooter.displayName = "DialogFooter"

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
