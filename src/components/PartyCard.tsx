import { Phone, Mail, MapPin, Globe } from "lucide-react";

function Field({ icon: Icon, label, value, href }: { icon: any; label: string; value?: string; href?: string }) {
  if (!value) return null;
  const inner = (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <Icon className="w-4 h-4 mt-1 text-brand-red shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</div>
        <div className="text-navy text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:text-brand-red">
      {inner}
    </a>
  ) : (
    inner
  );
}

export default function PartyCard({
  title,
  name,
  phone,
  email,
  address,
  country,
}: {
  title: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  country?: string;
}) {
  return (
    <div>
      <div className="text-mono text-xs uppercase tracking-widest text-brand-red font-bold">{title}</div>
      <div className="mt-1 text-navy text-base font-semibold">{name || "—"}</div>
      <div className="mt-3">
        <Field icon={Phone} label="Phone" value={phone} href={phone ? `tel:${phone}` : undefined} />
        <Field icon={Mail} label="Email" value={email} href={email ? `mailto:${email}` : undefined} />
        <Field icon={MapPin} label="Address" value={address} />
        <Field icon={Globe} label="Country" value={country} />
      </div>
    </div>
  );
}
