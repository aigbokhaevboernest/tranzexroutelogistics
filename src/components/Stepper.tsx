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

function normalize(status: string) {
  return (status || "").toLowerCase().trim();
}

function findActiveIdx(steps: StepDef[], status: string) {
  const norm = normalize(status);
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

export function getStepColor(status: string): string {
  if (FAILED_STATUSES.includes(status)) return "oklch(0.55 0.21 27)";
  const norm = normalize(status);
  const found = ALL_STEPS.find((s) => s.key.toLowerCase() === norm);
  if (found) return found.color;
  if (norm.includes("origin")) return ALL_STEPS[0].color;
  if (norm.includes("transit")) return ALL_STEPS[1].color;
  if (norm.includes("hold")) return ALL_STEPS[2].color;
  if (norm.includes("airport")) return ALL_STEPS[3].color;
  if (norm.includes("pick")) return ALL_STEPS[4].color;
  if (norm.includes("deliver")) return ALL_STEPS[5].color;
  return "oklch(0.45 0.02 260)";
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
                  "w-14 h-14 rounded-full flex items-center justify-center text-white relative z-10",
                  active && "animate-glow-pulse"
                )}
                style={{ background: bg, color: s.color }}
              >
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <div className="mt-2 text-xs font-bold text-navy uppercase">{s.label}</div>
              {active && (
                <div className="text-[10px] font-semibold mt-0.5" style={{ color: s.color }}>
                  Current step
                </div>
              )}
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
      <div className="md:hidden flex flex-col">
        {steps.map((s, i) => {
          const past = i < activeIdx;
          const active = i === activeIdx;
          const gray = failed || i > activeIdx;
          const bg = gray ? "oklch(0.85 0 0)" : s.color;
          const isLast = i === steps.length - 1;
          return (
            <div key={s.key} className="flex items-stretch gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0",
                    active && "animate-glow-pulse"
                  )}
                  style={{ background: bg, color: s.color }}
                >
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                {!isLast && (
                  <div
                    className="w-1 flex-1 my-1 rounded-full"
                    style={{
                      minHeight: 36,
                      background: past || (active && !failed) ? s.color : "oklch(0.85 0 0)",
                    }}
                  />
                )}
              </div>
              <div className={cn("pt-3", !isLast && "pb-6")}>
                <div className="text-sm font-bold text-navy uppercase">{s.label}</div>
                {active && (
                  <div className="text-xs font-semibold mt-0.5" style={{ color: s.color }}>
                    Current step
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
