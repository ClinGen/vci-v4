interface TooltipProps {
  children: React.ReactNode
  content: string
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <span className="relative group inline-flex">
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-normal normal-case tracking-normal rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 whitespace-nowrap z-50 shadow-lg pointer-events-none">
        {content}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
}
