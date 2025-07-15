import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

const modernInputVariants = cva(
  "flex w-full rounded-lg border bg-surface px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border hover:border-primary/50 focus:border-primary",
        filled: "border-transparent bg-muted hover:bg-muted/80 focus:bg-surface focus:border-primary",
        outline: "border-2 border-border hover:border-primary/50 focus:border-primary bg-transparent",
        ghost: "border-transparent hover:border-border focus:border-primary bg-transparent",
      },
      inputSize: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3",
        lg: "h-12 px-4 text-base",
        xl: "h-14 px-5 text-lg",
      },
      state: {
        default: "",
        error: "border-error focus:border-error focus:ring-error/20",
        success: "border-success focus:border-success focus:ring-success/20",
        warning: "border-warning focus:border-warning focus:ring-warning/20",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
      state: "default",
    },
  }
)

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof modernInputVariants> {
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  helperText?: string
  label?: string
  error?: string
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({
    className,
    variant,
    inputSize,
    state,
    type,
    icon,
    iconPosition = "left",
    helperText,
    label,
    error,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const inputType = isPassword && showPassword ? "text" : type

    const finalState = error ? "error" : state

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            type={inputType}
            className={cn(
              modernInputVariants({ variant, inputSize, state: finalState }),
              icon && iconPosition === "left" && "pl-10",
              (icon && iconPosition === "right") || isPassword && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {(icon && iconPosition === "right") || isPassword ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="text-muted-foreground">{icon}</div>
              )}
            </div>
          ) : null}
        </div>

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <p
            className={cn(
              "text-xs",
              error ? "text-error" : "text-muted-foreground"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
ModernInput.displayName = "ModernInput"

export { ModernInput, modernInputVariants }