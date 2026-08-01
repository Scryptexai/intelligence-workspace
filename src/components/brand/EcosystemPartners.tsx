import { ECOSYSTEM_PARTNERS, type Partner } from "@/lib/brand";
import { BrandLogo } from "./BrandLogo";

function PartnerChip({ name, urls, slug, color, chip }: Partner) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3.5 py-1.5">
      <BrandLogo
        urls={urls}
        slug={slug}
        color={color}
        size={18}
        chip={chip}
        initials={name.slice(0, 2).toUpperCase()}
      />
      <span className="text-[11.5px] font-medium text-muted-foreground">{name}</span>
    </div>
  );
}

export function EcosystemPartners() {
  const doubled = [...ECOSYSTEM_PARTNERS, ...ECOSYSTEM_PARTNERS];
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card py-3">
      <div className="mb-2 flex items-center gap-2 px-4">
        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Ecosystem Partners
        </span>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-card to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-card to-transparent" />
        <div className="marquee-track">
          {doubled.map((p, i) => (
            <PartnerChip key={`${p.name}-${i}`} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}
