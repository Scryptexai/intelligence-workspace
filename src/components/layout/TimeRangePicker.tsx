"use client";

import { CalendarRange } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useGlobalFilters, rangeLabel, type TimeRange } from "@/lib/store/globalFilters";

const OPTIONS: TimeRange[] = ["all", "3y", "1y"];

export function TimeRangePicker() {
  const timeRange = useGlobalFilters((s) => s.timeRange);
  const setTimeRange = useGlobalFilters((s) => s.setTimeRange);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-[12px]"
          title="Global time range — filters Timeline, Knowledge and Metrics across all pages"
        >
          <CalendarRange className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">{rangeLabel(timeRange)}</span>
          <span className="sm:hidden">{timeRange === "all" ? "All" : timeRange}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Global time range</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((r) => (
          <DropdownMenuItem
            key={r}
            onClick={() => setTimeRange(r)}
            className="justify-between"
          >
            {rangeLabel(r)}
            {timeRange === r && <span className="text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
          Filters Timeline, Knowledge and Overview metrics across the workspace.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
