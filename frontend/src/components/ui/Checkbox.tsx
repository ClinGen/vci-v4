import { Check } from "lucide-react"
import { forwardRef, useState, type ButtonHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface CheckboxProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked: controlledChecked, defaultChecked = false, onCheckedChange, onClick, disabled, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked)
    const checked = controlledChecked !== undefined ? controlledChecked : internalChecked

    const toggle = () => {
      if (disabled) return

      const nextChecked = !checked

      if (controlledChecked === undefined) {
        setInternalChecked(nextChecked)
      }

      onCheckedChange?.(nextChecked)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          checked && "border-blue-600 bg-blue-600",
          className,
        )}
        onClick={(event) => {
          toggle()
          onClick?.(event)
        }}
        {...props}
      >
        {checked ? <Check className="h-3 w-3" /> : null}
      </button>
    )
  },
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
