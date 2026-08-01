import Link from "next/link";
import { ArrowLeft, Compass, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Menangkap notFound() yang dilempar dari layout [slug] (slug proyek tidak
 * valid) — parent segment dari [slug], jadi di-render untuk level layout.
 */
export default function ProjectSegmentNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SearchX className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-foreground">Project not found</h1>
        <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
          Proyek yang Anda cari tidak ada di workspace ini. Periksa URL atau
          pilih proyek lain.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/" className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Semua proyek
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/project/arbitrum" className="gap-1.5">
            <Compass className="h-3.5 w-3.5" /> Buka Arbitrum
          </Link>
        </Button>
      </div>
    </div>
  );
}
