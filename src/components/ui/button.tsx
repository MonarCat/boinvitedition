
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-royal-blue to-royal-blue-dark text-white shadow-lg hover:shadow-xl hover:from-royal-blue-light hover:to-royal-blue",
        destructive: "bg-gradient-to-r from-royal-red to-royal-red-dark text-white shadow-lg hover:shadow-xl hover:from-royal-red-light hover:to-royal-red",
        outline: "border-2 border-royal-blue text-royal-blue bg-white/90 backdrop-blur-sm hover:bg-royal-blue hover:text-white shadow-md hover:shadow-lg",
        secondary: "bg-gradient-to-r from-cream to-cream-dark text-royal-blue border border-royal-blue/20 shadow-md hover:shadow-lg hover:border-royal-blue/40",
        ghost: "text-royal-blue hover:bg-royal-blue/10 hover:text-royal-blue-dark",
        link: "text-royal-blue underline-offset-4 hover:underline hover:text-royal-blue-dark",
        royal: "bg-gradient-to-r from-royal-blue to-royal-blue-dark text-white shadow-xl hover:shadow-2xl hover:from-royal-blue-light hover:to-royal-blue border-2 border-royal-blue-light/20",
        cream: "bg-gradient-to-r from-cream-light to-cream text-royal-blue border-2 border-royal-blue/20 shadow-lg hover:shadow-xl hover:border-royal-blue/40",
        red: "bg-gradient-to-r from-royal-red to-royal-red-dark text-white shadow-lg hover:shadow-xl hover:from-royal-red-light hover:to-royal-red"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base font-bold",
        icon: "h-12 w-12 rounded-xl",
        xl: "h-16 rounded-2xl px-10 text-lg font-bold"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
