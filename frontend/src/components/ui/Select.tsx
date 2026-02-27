import { Check, ChevronDown } from "lucide-react"
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import { cn } from "../../lib/utils"

interface SelectContextType {
  disabled: boolean
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
  registerItem: (value: string, label: string) => void
  unregisterItem: (value: string) => void
  getItemLabel: (value: string) => string | undefined
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  children: ReactNode
}

const Select = ({ value, defaultValue = "", onValueChange, disabled = false, className, children }: SelectProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [itemLabels, setItemLabels] = useState<Record<string, string>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedValue = value !== undefined ? value : internalValue

  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue)
      }
      onValueChange?.(nextValue)
      setOpen(false)
    },
    [onValueChange, value],
  )

  const registerItem = useCallback((itemValue: string, label: string) => {
    setItemLabels((current) => {
      if (current[itemValue] === label) {
        return current
      }

      return {
        ...current,
        [itemValue]: label,
      }
    })
  }, [])

  const unregisterItem = useCallback((itemValue: string) => {
    setItemLabels((current) => {
      if (!(itemValue in current)) {
        return current
      }

      const next = { ...current }
      delete next[itemValue]
      return next
    })
  }, [])

  const getItemLabel = useCallback(
    (itemValue: string) => {
      return itemLabels[itemValue]
    },
    [itemLabels],
  )

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  const contextValue = useMemo<SelectContextType>(
    () => ({
      disabled,
      open,
      setOpen,
      value: selectedValue,
      onValueChange: handleValueChange,
      registerItem,
      unregisterItem,
      getItemLabel,
    }),
    [disabled, getItemLabel, handleValueChange, open, registerItem, selectedValue, unregisterItem],
  )

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, onClick, ...props }, ref) => {
    const context = useContext(SelectContext)
    if (!context) {
      throw new Error("SelectTrigger must be used within Select")
    }

    const { disabled, open, setOpen } = context
    const isDisabled = disabled || props.disabled

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={isDisabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onClick={(event) => {
          if (!isDisabled) {
            setOpen(!open)
          }
          onClick?.(event)
        }}
        {...props}
      >
        {children}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
      </button>
    )
  },
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(({ className, placeholder, ...props }, ref) => {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error("SelectValue must be used within Select")
  }

  const { value, getItemLabel } = context
  const itemLabel = value ? getItemLabel(value) : undefined

  return (
    <span ref={ref} className={cn("truncate text-left", className)} {...props}>
      {itemLabel || value || placeholder}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error("SelectContent must be used within Select")
  }

  if (!context.open) return null

  return (
    <div
      ref={ref}
      role="listbox"
      className={cn(
        "absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-md",
        className,
      )}
      {...props}
    >
      <div className="max-h-60 overflow-y-auto p-1">{children}</div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

interface SelectItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const SelectItem = forwardRef<HTMLButtonElement, SelectItemProps>(({ className, children, value, onClick, ...props }, ref) => {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error("SelectItem must be used within Select")
  }

  const { onValueChange, registerItem, unregisterItem, value: selectedValue } = context

  const label = useMemo(() => {
    if (typeof children === "string" || typeof children === "number") {
      return String(children)
    }
    return value
  }, [children, value])

  useEffect(() => {
    registerItem(value, label)

    return () => {
      unregisterItem(value)
    }
  }, [label, registerItem, unregisterItem, value])

  const isSelected = selectedValue === value

  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={isSelected}
      className={cn(
        "relative flex w-full items-center rounded-sm py-1.5 pl-8 pr-2 text-left text-sm text-gray-900 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500",
        className,
      )}
      onClick={(event) => {
        onValueChange(value)
        onClick?.(event)
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected ? <Check className="h-4 w-4" /> : null}
      </span>
      <span className="truncate">{children}</span>
    </button>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
