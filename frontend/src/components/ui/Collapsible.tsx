import { createContext, useContext, useState, type ReactNode, type ButtonHTMLAttributes, type MouseEvent } from "react"

interface CollapsibleContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = createContext<CollapsibleContextType | undefined>(undefined);

interface CollapsibleProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Collapsible = ({ open: controlledOpen, onOpenChange, children }: CollapsibleProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div>{children}</div>
    </CollapsibleContext.Provider>
  )
}

type CollapsibleTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

const CollapsibleTrigger = ({
  children,
  onClick,
  ...props
}: CollapsibleTriggerProps) => {
  const context = useContext(CollapsibleContext);
  if (!context) throw new Error("CollapsibleTrigger must be used within Collapsible");

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    context.onOpenChange(!context.open);
    onClick?.(e);
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

interface CollapsibleContentProps {
  children: ReactNode
  className?: string
}

const CollapsibleContent = ({ children, className }: CollapsibleContentProps) => {
  const context = useContext(CollapsibleContext);
  if (!context) throw new Error("CollapsibleContent must be used within Collapsible");

  if (!context.open) return null;

  return <div className={className}>{children}</div>;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
