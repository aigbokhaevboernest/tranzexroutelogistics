import { Phone, Mail, MapPin } from "lucide-react";

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
    <div className="bg-white border border-border rounded-md p-6">
      <div className="text-mono text-xs uppercase tracking-widest text-brand-red font-bold">{title}</div>
      <div className="mt-2 text-navy text-xl font-extrabold text-display uppercase">{name || "—"}</div>
      <div className="mt-3 space-y-2 text-sm text-navy">
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-brand-red">
            <Phone className="w-4 h-4" /> {phone}
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-brand-red break-all">
            <Mail className="w-4 h-4" /> {email}
          </a>
        )}
        {address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {address}
          </div>
        )}
        {country && <div className="text-muted-foreground text-xs">{country}</div>}
      </div>
    </div>
  );
}
