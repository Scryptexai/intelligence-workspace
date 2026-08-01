"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Compass, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/helpers";

interface Step {
  sel: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    sel: "[data-metric='metric-cif']",
    title: "CIF Score",
    body: "Gabungan dari 6 dimensi berkualitas (Research, Consistency, Evidence, Coverage, Conflict, Knowledge) yang dibobot untuk menilai kematangan intelligence sebuah proyek.",
  },
  {
    sel: "[data-widget='knowledge']",
    title: "Knowledge Ledger",
    body: "Setiap knowledge dapat dilacak ke sumbernya — seperti Git blame. Klik card untuk melihat evidence trace, weight dan data lineage.",
  },
  {
    sel: "#project-tabs",
    title: "Analisis Per-Proyek",
    body: "Dari sini jelajahi Entity Graph, Live Timeline, Conflict Center (diff ala Git), QA Center, dan AI Copilot.",
  },
  {
    sel: "[data-widget='signals']",
    title: "Live Signals",
    body: "Event terbaru dari timeline. Gunakan Time Range di header untuk menyaring data di seluruh halaman.",
  },
];

export function OnboardingTour({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const storageKey = `iw-tour-${slug}`;

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) {
        const t = setTimeout(() => setOpen(true), 1400);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(STEPS[step]?.sel ?? "");
    if (!target) return;
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    document.querySelectorAll(".tour-highlight").forEach((el) => el.classList.remove("tour-highlight"));
    target.classList.add("tour-highlight");
    return () => {
      document.querySelectorAll(".tour-highlight").forEach((el) => el.classList.remove("tour-highlight"));
    };
  }, [step, open]);

  if (!open) return null;

  const s = STEPS[step];
  const finish = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] w-[340px] animate-fade-in rounded-xl border border-primary/40 bg-popover p-4 shadow-2xl shadow-primary/10">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground">{s.title}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Step {step + 1} / {STEPS.length}
            </div>
          </div>
        </div>
        <button
          onClick={finish}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">{s.body}</p>

      <div className="mt-3 flex items-center gap-1">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all",
              i === step ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <Button variant="ghost" size="sm" className="h-7 text-[11.5px] text-muted-foreground" onClick={finish}>
          Skip tour
        </Button>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={step === 0}
            onClick={() => setStep((s2) => Math.max(0, s2 - 1))}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            className="h-7 gap-1 text-[11.5px]"
            onClick={() => (step === STEPS.length - 1 ? finish() : setStep((s2) => s2 + 1))}
          >
            {step === STEPS.length - 1 ? "Done" : "Next"}
            {step < STEPS.length - 1 && <ChevronRight className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
