import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/helpers";

/** Surface standar CIF: panel kaca tipis untuk artefak intelijen. */
export function CifCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.06] bg-white/[0.03] shadow-[0_12px_30px_-24px_rgba(0,0,0,.9)] backdrop-blur-[2px] transition-[border-color,box-shadow,transform] duration-200 hover:border-cif-accent/40 hover:shadow-[0_0_30px_-10px_rgba(139,92,246,.45)]",
        className
      )}
      {...props}
    />
  );
}
