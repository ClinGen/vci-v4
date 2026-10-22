import { cn } from "../../lib/utils"

interface TableProps {
  className?: string
  children: React.ReactNode
}

export function Table({ className, children }: TableProps) {
  return <table className={cn("w-full text-xs border-collapse", className)}>{children}</table>;
}

export function THead({ className = "", children }: TableProps) {
  return <thead className={className}>{children}</thead>;
}

export function TBody({ className = "", children }: TableProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function TR({ className = "", children }: TableProps) {
  return <tr className={className}>{children}</tr>;
}

interface THProps {
  className?: string
  children?: React.ReactNode
}

export function TH({ className = "", children }: THProps) {
  return <th className={cn("text-left py-2 px-3 font-semibold text-gray-700", className)}>{children}</th>;
}

interface TDProps {
  className?: string
  colSpan?: number
  rowSpan?: number
  children?: React.ReactNode
}

export function TD({ className = "", colSpan, rowSpan, children }: TDProps) {
  return <td className={cn("py-2 px-3", className)} colSpan={colSpan} rowSpan={rowSpan}>{children}</td>;
}
