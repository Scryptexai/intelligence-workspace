import { projectGradient } from "@/lib/brand";

export function ProjectLogo({
  symbol,
  slug,
  size = 44,
  radius = 12,
  className,
}: {
  symbol: string;
  slug: string;
  size?: number;
  radius?: number;
  className?: string;
}) {
  const g = projectGradient(slug);
  const id = `pg-${slug}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={`${symbol} logo`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={g.from} />
          <stop offset="100%" stopColor={g.to} />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx={radius}
        fill={`url(#${id})`}
        stroke="rgba(255,255,255,0.18)"
      />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="19"
        fontWeight="800"
        fill="#fff"
      >
        {symbol.slice(0, 3)}
      </text>
      <circle cx="40" cy="8" r="2.5" fill="#fff" opacity="0.55" />
    </svg>
  );
}
