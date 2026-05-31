export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="block w-1.5 h-6 bg-brand-red" />
      <h3 className="text-display text-2xl font-extrabold uppercase text-navy">{children}</h3>
    </div>
  );
}
