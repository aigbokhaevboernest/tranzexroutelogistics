import { Warehouse, Truck, PauseOctagon, PlaneLanding, Hand, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepDef = { key: string; label: string; icon: LucideIcon; color: string; optional?: boolean };

export const ALL_STEPS: StepDef[] = [
  { key: "Origin Warehouse", label: "Origin Warehouse", icon: Warehouse, color: "oklch(0.55 0.18 245)" },
  { key: "In-Transit", label: "In-Transit", icon: Truck, color: "oklch(0.55 0.21 27)" },
  { key: "On Hold", label: "On Hold", icon: PauseOctagon, color: "oklch(0.72 0.18 60)" },
  { key: "Arrived At Nearest Airport", label: "At Nearest Airport", icon: PlaneLanding, color: "oklch(0.72 0.13 210)", optional: true },
  { key: "Pick-Up", label: "Pick-Up", icon: Hand, color: "oklch(0.55 0.18 245)" },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2, color: "oklch(0.65 0.17 145)" },
];

const FAILED_STATUSES = ["FAILED", "Returned To Warehouse"];

function findActiveIdx(steps: StepDef[], status: string) {
  const norm = status.toLowerCase().trim();
  const idx = steps.findIndex((s) => s.key.toLowerCase() === norm);
  if (idx >= 0) return idx;
  if (norm.includes("origin")) return 0;
  if (norm.includes("transit")) return 1;
  if (norm.includes("hold")) return 2;
  if (norm.includes("airport")) return steps.findIndex((s) => s.key.includes("Airport"));
  if (norm.includes("pick")) return steps.findIndex((s) => s.key === "Pick-Up");
  if (norm.includes("deliver")) return steps.length - 1;
  return 0;
}

export default function Stepper({ status, showAirport }: { status: string; showAirport: boolean }) {
  const steps = ALL_STEPS.filter((s) => !s.optional || showAirport);
  const failed = FAILED_STATUSES.includes(status);
  const activeIdx = failed ? -1 : findActiveIdx(steps, status);

  return (
    <div className="bg-white border border-border rounded-md p-6">
      {/* Desktop */}
      <div className="hidden md:flex items-start justify-between gap-2">
        {steps.map((s, i) => {
          const past = i < activeIdx;
          const active = i === activeIdx;
          const gray = failed || i > activeIdx;
          const bg = gray ? "oklch(0.85 0 0)" : s.color;
          return (
            <div key={s.key} className="flex-1 flex flex-col items-center text-center relative">
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-white shadow",
                  active && "animate-glow-pulse"
                )}
                style={{ background: bg }}
              >
                <s.icon className="w-6 h-6" />
              </div>
              <div className="mt-2 text-xs font-bold text-navy uppercase">{s.label}</div>
              {i < steps.length - 1 && (
                <div
                  className="absolute top-7 left-1/2 w-full h-0.5"
                  style={{ background: past ? s.color : "oklch(0.85 0 0)" }}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Mobile vertical */}
      <div className="md:hidden flex flex-col gap-4">
        {steps.map((s, i) => {
          const active = i === activeIdx;
          const gray = failed || i > activeIdx;
          const bg = gray ? "oklch(0.85 0 0)" : s.color;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div
                className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", active && "animate-glow-pulse")}
                style={{ background: bg }}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-navy uppercase">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
