import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "reference" | "action" | "muted"
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, tone = "reference", ...props }, ref) => {
  const toneClasses =
    tone === "action"
      ? "border border-gray-200 border-l-4 border-l-blue-500 bg-white"
      : tone === "muted"
      ? "border border-gray-300 bg-gray-200"
      : "border border-gray-200 bg-white";
  return (
    <div ref={ref} className={cn("rounded-lg shadow-sm", toneClasses, className)} {...props} />
  )
})
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1 p-4", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-serif text-sm font-semibold leading-none tracking-tight text-gray-900", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-gray-600", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0 text-xs", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-4 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
