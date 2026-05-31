import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  Copy,
  Printer,
  CheckCircle2,
  Undo2,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import BoldChip from "@/components/BoldChip";
import Row from "@/components/Row";
import PartyCard from "@/components/PartyCard";
import Stepper from "@/components/Stepper";
import Countdown from "@/components/Countdown";
import MapInfoBar from "@/components/MapInfoBar";
import LeafletMap from "@/components/LeafletMap";
import PaymentModal from "@/components/PaymentModal";
import PrintInvoice from "@/components/PrintInvoice";
import trackingHero from "@/assets/tracking-hero.jpg";
import packageImg from "@/assets/package.jpg";

const COMPANY = {
  name: "Tranzex Route Logistics",
  address: "1428 Harbor View Avenue, Manila, Philippines 1000",
  email: "support@tranzexroute.com",
  phone: "+63 (2) 8123 4567",
};

export default function TrackingPage() {
  useDocumentMeta(
    "Track Your Shipment — Tranzex Route Logistics",
    "Real-time shipment tracking with live map and instant status updates."
  );
  const [params] = useSearchParams();
  const initial = params.get("n") || "";
  const [query, setQuery] = useState(initial);
  const [submitted, setSubmitted] = useState(initial);
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissBanner, setDismissBanner] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = query.trim();
    if (!n) return;
    setSubmitted(n);
    setDismissBanner(false);
    window.history.replaceState(null, "", "/tracking?n=" + encodeURIComponent(n));
  };

  useEffect(() => {
    if (!submitted) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchOne = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", submitted.trim())
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setShipment(null);
      } else if (!data) {
        setError("No shipment found for this tracking number");
        setShipment(null);
      } else {
        setShipment(data);
      }
      setLoading(false);
    };
    fetchOne();

    const channel = supabase
      .channel("shipment-" + submitted)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "shipments", filter: "tracking_number=eq." + submitted },
        (payload) => {
          setShipment(payload.new);
          toast.success("Tracking updated just now");
        }
      )
      .subscribe();

    interval = setInterval(fetchOne, 30000);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    };
  }, [submitted]);

  const s = shipment;
  const onHold = s?.status === "On Hold";
  const failed = s?.status === "FAILED" || s?.status === "Returned To Warehouse";
  const delivered = s?.status === "Delivered";

  const origin =
    s?.origin_lat != null && s?.origin_lng != null
      ? { lat: Number(s.origin_lat), lng: Number(s.origin_lng), label: s.origin_label || "Origin" }
      : null;
  const current =
    s?.current_stop_lat != null && s?.current_stop_lng != null
      ? { lat: Number(s.current_stop_lat), lng: Number(s.current_stop_lng), label: s.current_stop_label || s.current_location || "Current" }
      : null;
  const destination =
    s?.destination_lat != null && s?.destination_lng != null
      ? { lat: Number(s.destination_lat), lng: Number(s.destination_lng), label: s.destination_label || "Destination" }
      : null;

  return (
    <>
      <Navbar />
      <main className="bg-secondary min-h-screen pb-24">
        {/* Hero */}
        <section className="relative h-[420px] flex items-end overflow-hidden print:hidden">
          <img src={trackingHero} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 hero-grain" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 w-full pb-12 text-white">
            <h1 className="text-display text-5xl md:text-7xl font-black uppercase">Track Your Shipment</h1>
            <p className="mt-2 text-white/80">Real-time shipment tracking with live map and instant status updates.</p>
            <form onSubmit={onSubmit} className="mt-6 flex items-stretch max-w-2xl rounded-md overflow-hidden bg-white shadow-2xl">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter tracking number, e.g. TRK123456"
                className="flex-1 px-5 py-4 text-navy text-mono text-sm outline-none"
              />
              <button type="submit" className="bg-brand-red text-white font-bold px-6 flex items-center gap-2">
                <Search className="w-4 h-4" /> TRACK
              </button>
            </form>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 -mt-8 relative space-y-6">
          {!submitted && (
            <div className="bg-white rounded-md p-8 text-center text-muted-foreground border border-border">
              Enter a tracking number above to begin.
            </div>
          )}

          {loading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-24 bg-white rounded-md border border-border" />
              <div className="h-48 bg-white rounded-md border border-border" />
              <div className="h-32 bg-white rounded-md border border-border" />
            </div>
          )}

          {!loading && error && submitted && (
            <div className="bg-white border border-border rounded-md p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-brand-red mx-auto" />
              <div className="mt-3 text-navy font-bold text-lg">{error}</div>
            </div>
          )}

          {s && onHold && !dismissBanner && (
            <div className="gradient-amber text-white rounded-md p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-display text-2xl font-extrabold uppercase">
                    {s.hold_headline || "Customs Hold — Action Required"}
                  </div>
                  {s.hold_body && <p className="mt-2 text-white/90">{s.hold_body}</p>}
                  <div className="mt-3 text-mono text-xl font-extrabold">
                    💰 Amount Due: {s.hold_amount || `${Number(s.amount_due ?? 0).toLocaleString()} pesos`}
                  </div>
                  {s.hold_note && <p className="mt-2 italic text-white/85 text-sm">{s.hold_note}</p>}
                  {s.crypto_wallet_address && (
                    <div className="mt-2 text-mono text-xs break-all bg-black/20 inline-block px-2 py-1 rounded">
                      {s.crypto_wallet_address}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => setPayOpen(true)}
                      className="bg-white text-brand-red font-extrabold px-5 py-2.5 rounded animate-pulse-ring"
                    >
                      Pay Now
                    </button>
                    {s.hold_contact_email && (
                      <a
                        href={`mailto:${s.hold_contact_email}`}
                        className="bg-white/10 border border-white text-white font-bold px-5 py-2.5 rounded"
                      >
                        Contact Support
                      </a>
                    )}
                  </div>
                </div>
                <button onClick={() => setDismissBanner(true)} className="text-white/80 hover:text-white" aria-label="Dismiss">
                  ×
                </button>
              </div>
            </div>
          )}

          {s && failed && (
            <div className="bg-brand-red text-white rounded-md p-5 flex items-center gap-4">
              <Undo2 className="w-7 h-7 animate-return-arrow" />
              <div>
                <div className="font-extrabold text-display text-xl uppercase">Shipment Returned</div>
                <div className="text-white/90 text-sm">This shipment is being returned to the warehouse.</div>
              </div>
            </div>
          )}

          {s && (
            <>
              {/* Summary */}
              <div className="bg-white rounded-md p-6 border border-border">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Tracking Number</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-mono text-2xl md:text-3xl font-extrabold text-navy">{s.tracking_number}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(s.tracking_number);
                          toast.success("Copied!");
                        }}
                        className="text-muted-foreground hover:text-brand-red"
                        aria-label="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="bg-navy text-white font-bold px-4 py-2 rounded flex items-center gap-2 text-sm"
                  >
                    <Printer className="w-4 h-4" /> Print Invoice
                  </button>
                </div>

                {delivered ? (
                  <div className="mt-5 bg-success/15 border border-success rounded p-4 flex items-center gap-3 text-navy">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    <div className="font-semibold">
                      This item has been successfully delivered to the recipient's address.
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <BoldChip label="Status" value={s.status} color="var(--brand-red)" valueClass="text-brand-red" />
                    <BoldChip
                      label="Current Location"
                      value={
                        <span>
                          {s.current_location_flag ? `${s.current_location_flag} ` : ""}
                          {s.current_location || "—"}
                        </span>
                      }
                    />
                    <BoldChip
                      label="Amount Due"
                      value={`${Number(s.amount_due ?? 0).toLocaleString()} pesos`}
                      valueClass={Number(s.amount_due ?? 0) > 0 ? "text-brand-red" : ""}
                    />
                  </div>
                )}

                {s.expected_delivery_date && !delivered && (
                  <div className="mt-5">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
                      Est. Delivery
                    </div>
                    <Countdown target={s.expected_delivery_date} />
                    <div className="mt-2 text-sm text-muted-foreground">
                      Scheduled Date: {new Date(s.expected_delivery_date).toISOString()}, Before End of Day
                    </div>
                  </div>
                )}
              </div>

              {/* Stepper */}
              <Stepper status={s.status} showAirport={!!s.show_airport_step} />

              {/* Shipment details */}
              <div className="bg-white rounded-md p-6 border border-border">
                <SectionTitle>Shipment Details</SectionTitle>
                <div className="grid md:grid-cols-[200px_1fr] gap-6">
                  <img
                    src={s.package_image_url || packageImg}
                    alt="package"
                    className="w-full h-40 object-cover rounded-md border border-border"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <Row label="Origin" value={s.origin_label} />
                    <Row label="Destination" value={s.destination_label} />
                    <Row label="Type" value={s.package_type} />
                    <Row label="Weight" value={s.weight} />
                    <Row label="Date Sent" value={s.date_sent} />
                    <Row label="Expected" value={s.expected_delivery_date ? new Date(s.expected_delivery_date).toLocaleDateString() : "—"} />
                    <div className="sm:col-span-2">
                      <Row label="Description" value={s.description} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination Chart */}
              <div className="bg-white rounded-md p-6 border border-border">
                <SectionTitle>Destination Chart</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <BoldChip label="Origin" value={s.origin_label} color="#22c55e" />
                  <BoldChip label="Current" value={s.current_stop_label || s.current_location} color="#3b82f6" />
                  <BoldChip label="Destination" value={s.destination_label} color="#ef4444" />
                </div>
              </div>

              {/* Parties */}
              <div className="bg-white rounded-md p-6 border border-border">
                <SectionTitle>Shipper Information</SectionTitle>
                <PartyCard
                  title="Shipper"
                  name={s.sender_name}
                  phone={s.sender_phone}
                  email={s.sender_email}
                />
              </div>

              <div className="bg-white rounded-md p-6 border border-border">
                <SectionTitle>Consignee Information</SectionTitle>
                <PartyCard
                  title="Consignee"
                  name={s.receiver_name}
                  phone={s.receiver_phone}
                  email={s.receiver_email}
                  address={s.receiver_address}
                  country={s.receiver_country}
                />
              </div>

              {/* History */}
              <div className="bg-white rounded-md p-6 border border-border">
                <SectionTitle>Shipment History</SectionTitle>
                {Array.isArray(s.history) && s.history.length > 0 ? (
                  <ol className="space-y-3">
                    {s.history.map((h: any, i: number) => (
                      <li
                        key={i}
                        className={`pl-4 border-l-4 ${i === 0 ? "border-brand-red" : "border-border"} bg-secondary/40 p-3 rounded-r`}
                      >
                        <div className="text-mono text-xs text-muted-foreground">{h.date}</div>
                        <div className="mt-1 inline-block bg-navy text-white text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
                          {h.status}
                        </div>
                        <div className="mt-1 text-navy font-semibold">{h.location}</div>
                        {h.remarks && <div className="text-sm text-muted-foreground mt-1">{h.remarks}</div>}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-muted-foreground text-sm">No history yet.</div>
                )}
              </div>

              {/* Proof of delivery */}
              {delivered && s.proof_of_delivery_url && (
                <div className="bg-white rounded-md p-6 border border-border">
                  <SectionTitle>Proof of Delivery</SectionTitle>
                  <img src={s.proof_of_delivery_url} alt="proof" className="w-full max-w-md rounded-md border border-border" />
                </div>
              )}

              {/* Map */}
              <div className="bg-white rounded-md border border-border overflow-hidden">
                <MapInfoBar
                  origin={s.origin_label}
                  current={s.current_stop_label || s.current_location}
                  destination={s.destination_label}
                />
                <LeafletMap origin={origin} current={current} destination={destination} />
              </div>

              <div className="text-xs text-muted-foreground text-right">
                Last updated: {s.updated_at ? new Date(s.updated_at).toLocaleString() : "—"}
              </div>

              <PrintInvoice s={s} />
              <PaymentModal
                open={payOpen}
                onClose={() => setPayOpen(false)}
                wallet={s.crypto_wallet_address}
                amount={s.hold_amount || `${Number(s.amount_due ?? 0).toLocaleString()} pesos`}
                note={s.payment_instruction_note}
                contactEmail={s.hold_contact_email || COMPANY.email}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
