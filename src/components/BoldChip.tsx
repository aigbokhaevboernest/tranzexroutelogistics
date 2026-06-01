import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export default function BoldChip({
  label,
  value,
  color = "var(--border)",
  valueClass,
  valueStyle,
}: {
  label: string;
  value: React.ReactNode;
  color?: string;
  valueClass?: string;
  valueStyle?: CSSProperties;
}) {
  return (
    <div className="bg-white border rounded-md px-3 py-2" style={{ borderColor: color }}>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{label}</div>
      <div className={cn("mt-0.5 text-navy text-sm font-bold leading-tight truncate", valueClass)} style={valueStyle}>{value}</div>
    </div>
  );
}
