import { cn } from "@/lib/utils/helpers";

/** Gauge busur 180° — visual confidence score. */
export function ConfidenceGauge({
  value,
  size = 150,
}: {
  value: number;
  size?: number;
}) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const c = Math.PI * r; // setengah lingkaran
  const filled = (Math.min(100, Math.max(0, value)) / 100) * c;

  const color =
    value >= 85 ? "#34d399" : value >= 65 ? "#fbbf24" : "#fb7185";

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        {/* track */}
        <path
          d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* value */}
        <path
          d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="font-mono text-[26px] font-bold tabular-nums text-foreground">
          {value}
          <span className="text-[13px] text-muted-foreground">%</span>
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Confidence
        </span>
      </div>
      <span
        className={cn(
          "mt-1 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold",
          value >= 85
            ? "bg-success/15 text-success"
            : value >= 65
              ? "bg-warning/15 text-warning"
              : "bg-critical/15 text-critical"
        )}
      >
        {value >= 85 ? "HIGH" : value >= 65 ? "MEDIUM" : "LOW"}
      </span>
    </div>
  );
}
