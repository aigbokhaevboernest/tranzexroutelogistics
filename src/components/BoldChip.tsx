import { cn } from "@/lib/utils";

export default function BoldChip({
  label,
  value,
  color = "var(--border)",
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  color?: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white border-2 rounded-md p-4" style={{ borderColor: color }}>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">{label}</div>
      <div className={cn("mt-1 text-navy text-lg font-extrabold", valueClass)}>{value}</div>
    </div>
  );
}
