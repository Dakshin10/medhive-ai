import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "primary" | "secondary" | "ghost" | "glass"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, variant = "primary", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap text-label-md rounded-2xl font-bold transition-all duration-200 active:scale-95 cursor-pointer disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" && "px-6 py-3 bg-primary-container text-white hover:bg-primary shadow-lg shadow-primary-container/20",
          variant === "secondary" && "px-6 py-3 bg-secondary-container/20 text-primary hover:bg-secondary-container/30 border border-secondary-container/40",
          variant === "ghost" && "hover:bg-surface-container text-on-surface-variant transition-colors rounded-full p-2",
          variant === "glass" && "px-6 py-3 bg-white/60 backdrop-blur-md border border-outline-variant text-on-surface hover:bg-white",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
