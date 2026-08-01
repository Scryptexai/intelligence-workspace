import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/helpers";

export function PageHeader({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-start justify-between gap-3",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
