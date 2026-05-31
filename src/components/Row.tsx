export default function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-2 border-b border-border text-sm">
      <div className="text-muted-foreground uppercase text-xs font-bold tracking-wider">{label}</div>
      <div className="text-navy font-medium break-words">{value || "—"}</div>
    </div>
  );
}
