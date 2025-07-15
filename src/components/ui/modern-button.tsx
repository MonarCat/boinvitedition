import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const modernButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-error text-error-foreground shadow-md hover:bg-error/90 hover:shadow-lg hover:-translate-y-0.5",
        outline:
          "border border-border bg-surface hover:bg-surface-hover hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-dark hover:shadow-md hover:-translate-y-0.5",
        ghost: 
          "hover:bg-surface-hover hover:text-accent-foreground transition-colors",
        link: 
          "text-primary underline-offset-4 hover:underline transition-colors",
        gradient:
          "bg-gradient-primary text-white shadow-md hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0",
        accent:
          "bg-accent text-accent-foreground shadow-md hover:bg-accent/90 hover:shadow-accent hover:-translate-y-0.5",
        success:
          "bg-success text-success-foreground shadow-md hover:bg-success/90 hover:shadow-lg hover:-translate-y-0.5",
        warning:
          "bg-warning text-warning-foreground shadow-md hover:bg-warning/90 hover:shadow-lg hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    icon,
    iconPosition = "left",
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(modernButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Background shimmer effect for gradient buttons */}
        {variant === "gradient" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        
        {/* Loading state */}
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        
        {/* Icon and content */}
        {!loading && (
          <>
            {icon && iconPosition === "left" && (
              <span className="inline-flex items-center">{icon}</span>
            )}
            
            {children}
            
            {icon && iconPosition === "right" && (
              <span className="inline-flex items-center">{icon}</span>
            )}
          </>
        )}
      </Comp>
    )
  }
)
ModernButton.displayName = "ModernButton"

export { ModernButton, modernButtonVariants }