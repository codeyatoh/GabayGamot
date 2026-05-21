import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border font-medium transition-colors",
  {
    variants: {
      variant: {
        outline:
          "border-[#3f3f46] bg-transparent text-[#d4d4d8]",
        "info-light":
          "border-blue-400/20 bg-blue-500/10 text-blue-300",
        "warning-light":
          "border-amber-400/20 bg-amber-500/10 text-amber-300",
        "success-light":
          "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
        "destructive-light":
          "border-rose-400/20 bg-rose-500/10 text-rose-300",
      },
      size: {
        xs: "px-1.5 py-0.5 text-[10px]",
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
