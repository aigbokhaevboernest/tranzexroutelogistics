import {
  Warehouse,
  Truck,
  PauseOctagon,
  PlaneLanding,
  Plane,
  PlaneTakeoff,
  Ship,
  Anchor,
  Hand,
  CheckCircle2,
  XCircle,
  Undo2,
  Building2,
  Sailboat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TransportMode = "land" | "air" | "sea";

export type StepDef = {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
};

const C_BLUE = "oklch(0.55 0.18 245)";
const C_RED = "oklch(0.55 0.21 27)";
const C_AMBER = "oklch(0.72 0.18 60)";
const C_SKY = "oklch(0.72 0.13 210)";
const C_GREEN = "oklch(0.65 0.17 145)";
const C_TEAL = "oklch(0.65 0.13 200)";

export const LAND_STEPS: StepDef[] = [
  { key: "Origin Warehouse", label: "Origin Warehouse", icon: Warehouse, color: C_BLUE },
  { key: "In-Transit", label: "In-Transit", icon: Truck, color: C_RED },
  { key: "On Hold", label: "On Hold", icon: PauseOctagon, color: C_AMBER },
  { key: "Arrived At Depot", label: "Arrived At Depot", icon: Building2, color: C_SKY },
  { key: "Pick-Up", label: "Pick-Up", icon: Hand, color: C_BLUE },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2, color: C_GREEN },
];

export const AIR_STEPS: StepDef[] = [
  { key: "Origin Airport", label: "Origin Airport", icon: PlaneTakeoff, color: C_BLUE },
  { key: "Departed", label: "Departed", icon: Plane, color: C_RED },
  { key: "In Flight", label: "In Flight", icon: Plane, color: C_RED },
  { key: "On Hold", label: "On Hold", icon: PauseOctagon, color: C_AMBER },
  { key: "Arrived At Nearest Airport", label: "Arrived At Airport", icon: PlaneLanding, color: C_SKY },
  { key: "Pick-up", label: "Pick-Up", icon: Hand, color: C_BLUE },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2, color: C_GREEN },
];

export const SEA_STEPS: StepDef[] = [
  { key: "Origin Port", label: "Origin Port", icon: Anchor, color: C_BLUE },
  { key: "Departed Port", label: "Departed Port", icon: Ship, color: C_RED },
  { key: "At Sea", label: "At Sea", icon: Sailboat, color: C_TEAL },
  { key: "On Hold", label: "On Hold", icon: PauseOctagon, color: C_AMBER },
  { key: "Arrived At Destination Port", label: "Arrived At Port", icon: Anchor, color: C_SKY },
  { key: "pick-up", label: "Pick-Up", icon: Hand, color: C_BLUE },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2, color: C_GREEN },
];

// Short status-progress descriptions shown under the active step, keyed by
// step key (lowercased). Falls back to the step label if no entry exists.
const STEP_DESCRIPTIONS: Record<string, string> = {
  "origin warehouse": "Shipment confirmed and received for dispatch",
  "origin airport": "Shipment confirmed and received for dispatch",
  "origin port": "Shipment confirmed and received for dispatch",
  "in-transit": "Moving toward destination",
  "at sea": "Moving toward destination",
  "departed": "Left the airport",
  "departed port": "Left the port",
  "in flight": "Airborne and flying toward its next destination",
  "arrived at depot": "Arrived and being processed for final delivery",
  "arrived at nearest airport": "Arrived and being processed for final delivery",
  "arrived at destination port": "Arrived and being processed for final delivery",
  "pick-up": "Out for pickup and final delivery",
  "delivered": "Delivery completed",
  "on hold": "Shipment on hold — action required",
};

function getDescription(key: string): string {
  return STEP_DESCRIPTIONS[key.toLowerCase()] || "";
}

const FAILED_STATUSES = ["FAILED", "Failed", "Returned To Warehouse", "Returned To Origin"];

export function getSteps(mode?: string | null): StepDef[] {
  const m = (mode || "land").toLowerCase();
  if (m === "air") return AIR_STEPS;
  if (m === "sea") return SEA_STEPS;
  return LAND_STEPS;
}

function normalize(status: string) {
  return (status || "").toLowerCase().trim();
}

// The list of steps actually shown on the frontend. "On Hold" is only ever
// included when the shipment's real status is On Hold (set from admin) —
// it must never appear as a normal step in the sequence otherwise, in any
// mode, on desktop or mobile.
export function getVisibleSteps(mode?: string | null, status?: string): StepDef[] {
  const steps = getSteps(mode);
  if (normalize(status || "") === "on hold") return steps;
  return steps.filter((s) => s.key.toLowerCase() !== "on hold");
}

function findActiveIdx(steps: StepDef[], status: string) {
  const norm = normalize(status);
  const idx = steps.findIndex((s) => s.key.toLowerCase() === norm);
  if (idx >= 0) return idx;
  if (norm.includes("origin")) return 0;
  if (norm.includes("depart")) return steps.findIndex((s) => s.key.toLowerCase().includes("depart"));
  if (norm.includes("flight") || norm.includes("sea") || norm.includes("transit")) {
    const i = steps.findIndex((s) => /flight|sea|transit/i.test(s.key));
    if (i >= 0) return i;
  }
  if (norm.includes("hold")) return steps.findIndex((s) => s.key.toLowerCase() === "on hold");
  if (norm.includes("depot") || norm.includes("airport") || norm.includes("port")) {
    const i = steps.findIndex((s) => /depot|airport|port/i.test(s.key) && !/origin/i.test(s.key));
    if (i >= 0) return i;
  }
  if (norm.includes("pick")) return steps.findIndex((s) => /pick/i.test(s.key));
  if (norm.includes("deliver")) return steps.length - 1;
  return 0;
}

export function getStepColor(status: string, mode?: string): string {
  if (FAILED_STATUSES.includes(status)) return C_RED;
  const steps = getSteps(mode);
  const norm = normalize(status);
  const found = steps.find((s) => s.key.toLowerCase() === norm);
  if (found) return found.color;
  if (norm.includes("origin")) return steps[0].color;
  if (norm.includes("hold")) return C_AMBER;
  if (norm.includes("deliver")) return C_GREEN;
  if (norm.includes("transit") || norm.includes("flight") || norm.includes("sea")) return C_RED;
  if (norm.includes("depot") || norm.includes("airport") || norm.includes("port")) return C_SKY;
  if (norm.includes("pick")) return C_BLUE;
  return "oklch(0.45 0.02 260)";
}

export function getCurrentStopIndex(status: string, mode?: string) {
  const steps = getVisibleSteps(mode, status);
  if (FAILED_STATUSES.includes(status)) return 0;
  return Math.max(0, findActiveIdx(steps, status));
}

export default function Stepper({
  status,
  transportMode,
}: {
  status: string;
  transportMode?: string;
  // legacy prop, ignored
  showAirport?: boolean;
}) {
  const steps = getVisibleSteps(transportMode, status);
  const failed = FAILED_STATUSES.includes(status);
  const activeIdx = failed ? -1 : findActiveIdx(steps, status);

  return (
    <div className="bg-white border border-border rounded-md p-6">
      <div className="mb-6">
        <div className="text-display text-lg md:text-xl font-extrabold uppercase tracking-wide text-navy">
          Delivery Progress
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">Your shipment journey</div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-start justify-between gap-2">
        {steps.map((s, i) => {
          const past = i < activeIdx;
          const active = i === activeIdx;
          const gray = failed || i > activeIdx;
          const bg = gray ? "oklch(0.85 0 0)" : s.color;
          const desc = getDescription(s.key);
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
              {active && desc && (
                <div className="text-[10px] font-semibold mt-0.5 max-w-[9rem]" style={{ color: s.color }}>
                  {desc}
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
          const desc = getDescription(s.key);
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
                {active && desc && (
                  <div className="text-xs font-semibold mt-0.5" style={{ color: s.color }}>
                    {desc}
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
