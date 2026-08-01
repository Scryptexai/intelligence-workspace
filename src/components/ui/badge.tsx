import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/helpers";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning",
        critical: "border-transparent bg-critical/15 text-critical",
        outline: "border-border text-foreground",
        muted: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
