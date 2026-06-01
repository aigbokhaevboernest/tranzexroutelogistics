export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="block w-1 h-5 bg-brand-red rounded-sm" />
      <h3 className="text-display text-lg md:text-xl font-semibold uppercase tracking-wide text-navy">{children}</h3>
    </div>
  );
}
