import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modernCardVariants = cva(
  "rounded-xl border bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-md hover:shadow-lg border-card-border",
        elevated: "shadow-xl hover:shadow-2xl border-card-border bg-surface-elevated",
        glass: "glass border-white/20 backdrop-blur-md",
        outline: "border-2 border-border hover:border-primary/50 shadow-sm hover:shadow-md",
        gradient: "bg-gradient-primary text-white border-0 shadow-glow",
        interactive: "shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer border-card-border",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface ModernCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernCardVariants> {
  asChild?: boolean
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(modernCardVariants({ variant, padding, className }))}
      {...props}
    />
  )
)
ModernCard.displayName = "ModernCard"

const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
ModernCardHeader.displayName = "ModernCardHeader"

const ModernCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-poppins text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
ModernCardTitle.displayName = "ModernCardTitle"

const ModernCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
ModernCardDescription.displayName = "ModernCardDescription"

const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
ModernCardContent.displayName = "ModernCardContent"

const ModernCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))
ModernCardFooter.displayName = "ModernCardFooter"

export { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardFooter, 
  ModernCardTitle, 
  ModernCardDescription, 
  ModernCardContent,
  modernCardVariants
}