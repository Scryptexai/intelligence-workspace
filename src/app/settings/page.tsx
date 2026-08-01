"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Command,
  Keyboard,
  Moon,
  Palette,
  Settings,
  Sun,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/helpers";

const SHORTCUTS = [
  { keys: ["⌘", "K"], label: "Open global search" },
  { keys: ["⌘", "1"], label: "Knowledge page" },
  { keys: ["⌘", "2"], label: "Entity graph" },
  { keys: ["⌘", "3"], label: "Live timeline" },
  { keys: ["⌘", "4"], label: "Conflict center" },
  { keys: ["⌘", "5"], label: "QA center" },
  { keys: ["Esc"], label: "Close dialogs" },
];

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-6">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Workspace preferences, appearance and keyboard shortcuts."
      />

      {/* appearance */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Palette className="h-3.5 w-3.5" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 p-4 pt-2">
          {[
            { key: "dark", label: "Dark", desc: "Terminal-grade", icon: Moon },
            { key: "light", label: "Light", desc: "Daylight", icon: Sun },
          ].map((opt) => {
            const active = mounted && theme === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setTheme(opt.key)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:border-primary/40"
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
                  <opt.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-foreground">
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
                </div>
                {active && <Badge variant="success" className="ml-auto">active</Badge>}
              </button>
            );
          })}
          <div className="col-span-2 flex items-center gap-2 rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-[11.5px] text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Dark mode is the default profile for intelligence work. Current:
            <span className="font-mono font-semibold text-foreground">
              {mounted ? resolvedTheme : "dark"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* shortcuts */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Keyboard className="h-3.5 w-3.5" /> Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {SHORTCUTS.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50"
              >
                <span className="text-[12.5px] text-muted-foreground">{s.label}</span>
                <span className="flex items-center gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="flex h-6 min-w-6 items-center justify-center rounded border border-border bg-card px-1.5 font-mono text-[10.5px] text-foreground shadow-sm"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-[11.5px] text-muted-foreground">
            <Command className="h-3.5 w-3.5 text-primary" />
            Project shortcuts (⌘1–5) operate on the currently open project.
          </div>
        </CardContent>
      </Card>

      {/* about */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Zap className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-foreground">
                Intelligence Workspace
              </div>
              <div className="text-[11.5px] text-muted-foreground">
                Crypto Intelligence Framework (CIF) · v1.0
              </div>
            </div>
            <Badge variant="muted" className="ml-auto">mock data</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            Toggle theme
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
