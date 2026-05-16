import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "text-destructive-foreground border-transparent bg-destructive hover:bg-destructive/80",
        outline: "text-foreground",
        admin: "border-green-500 bg-green-500/40 text-green-400 hover:bg-green-500/60",
        manager: "border-blue-500 bg-blue-500/40 text-blue-400 hover:bg-blue-500/60",
        finance: "border-yellow-500 bg-yellow-500/40 text-yellow-400 hover:bg-yellow-500/60",
        active: "border-green-500 bg-green-500/40 text-green-400 hover:bg-green-500/60",
        inactive: "border-gray-500 bg-gray-500/40 text-gray-400 hover:bg-gray-500/60",
        pending: "border-yellow-500 bg-yellow-500/40 text-yellow-400 hover:bg-yellow-500/60",
        completed: "border-blue-500 bg-blue-500/40 text-blue-400 hover:bg-blue-500/60",
        suspended: "border-red-500 bg-red-500/40 text-red-400 hover:bg-red-500/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
