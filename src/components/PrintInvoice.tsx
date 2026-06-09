import { useEffect, useState } from "react";
import Barcode from "react-barcode";
import { createClient } from "@supabase/supabase-js";
import {
  Package, Flag, Layers, Scale, Calendar, Truck, FileText,
  MapPin, Mail, Phone, Globe, CreditCard, AlertTriangle,
  Building2, Hash, User, ClipboardList, MessageSquare
} from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const COMPANY = {
  name: "Tranzex Route Logistics",
  address: "1428 Harbor View Avenue, Manila, Philippines 1000",
  email: "support@tranzexroute.com",
  phone: "+63 (2) 8123 4567",
};

const LOGO_URL = "https://nzideivdechbxhepmlvz.supabase.co/storage/v1/object/public/shipment-assets/Tranzexroute.PNG";

function statusColour(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered"))                          return { bg: "#16a34a", text: "#fff" };
  if (s.includes("hold"))                               return { bg: "#f97316", text: "#fff" };
  if (s.includes("transit"))                            return { bg: "#b91c1c", text: "#fff" };
  if (s.includes("airport"))                            return { bg: "#0891b2", text: "#fff" };
  if (s.includes("pick"))                               return { bg: "#2563eb", text: "#fff" };
  if (s.includes("failed"))                             return { bg: "#dc2626", text: "#fff" };
  if (s.includes("returned") || s.includes("warehouse")) return { bg: "#4b5563", text: "#fff" };
  if (s.includes("origin"))                             return { bg: "#1d4ed8", text: "#fff" };
  return                                                       { bg: "#6b7280", text: "#fff" };
}

function Stamp({ status }: { status: string }) {
  const label = (status || "PENDING").toUpperCase();
  const r = 60, cx = 80, cy = 80;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.88 }}>
      <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke="#c0392b" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r + 8}  fill="none" stroke="#c0392b" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r + 6}  fill="rgba(192,57,43,0.07)" />
      <path id="topArc" d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" />
      <text fontSize="10" fontWeight="700" fill="#c0392b" letterSpacing="1.5" fontFamily="'Georgia', serif">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">TRANZEX ROUTE LOGISTICS</textPath>
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="11" fontWeight="800"
            fill="#c0392b" fontFamily="'Georgia', serif" letterSpacing="1">{label}</text>
      <path id="botArc" d={`M ${cx - r},${cy} A ${r},${r} 0 0,0 ${cx + r},${cy}`} fill="none" />
      <text fontSize="9" fontWeight="600" fill="#c0392b" letterSpacing="1" fontFamily="'Georgia', serif">
        <textPath href="#botArc" startOffset="50%" textAnchor="middle">★ OFFICIAL ★</textPath>
      </text>
    </svg>
  );
}

const sectionHeading: React.CSSProperties = {
  fontWeight: 800,
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "2px",
  color: "#111",
  borderBottom: "2px solid #e2e8f0",
  paddingBottom: "8px",
  marginBottom: "14px",
  fontFamily: "system-ui, sans-serif",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const labelStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "11px",
  fontWeight: 500,
  marginBottom: "2px",
  fontFamily: "system-ui, sans-serif",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const valueStyle: React.CSSProperties = {
  color: "#111",
  fontSize: "13px",
  fontWeight: 700,
  fontFamily: "system-ui, sans-serif",
};

function DetailItem({
  icon,
  label,
  value,
  fullWidth = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: "4px", gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <div style={labelStyle}>{icon} {label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

function ContactLine({ icon, value, bold }: { icon: React.ReactNode; value?: string | null; bold?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "7px", alignItems: "center", fontSize: "12px",
                  color: "#444", fontWeight: bold ? 700 : 400, marginBottom: "3px" }}>
      <span style={{ color: "#94a3b8", flexShrink: 0 }}>{icon}</span>
      {value}
    </div>
  );
}

export default function PrintInvoice({ s, open, onClose }: { s: any; open: boolean; onClose: () => void }) {
  const [logoUrl, setLogoUrl]         = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [mobile, setMobile]           = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    supabase
      .from("hold_settings")
      .select("company_logo_url, company_name, company_address, company_email")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setCompanyInfo(data);
          setLogoUrl(data.company_logo_url || LOGO_URL);
        } else {
          setLogoUrl(LOGO_URL);
        }
      });
  }, []);

  const company = {
    name:    companyInfo?.company_name    || COMPANY.name,
    address: companyInfo?.company_address || COMPANY.address,
    email:   companyInfo?.company_email   || COMPANY.email,
    phone:   COMPANY.phone,
  };

  const today     = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const year      = new Date().getFullYear();
  const isOnHold  = (s?.status || "").toLowerCase().includes("hold");
  const amountDue = s?.amount_due || s?.hold_amount || "—";
  const sc        = statusColour(s?.status || "");

  if (!open) return null;

  const InvoiceBody = (
    <div
      id="print-invoice"
      style={{
        background: "#f8fafc",
        color: "#111",
        maxWidth: "860px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        lineHeight: "1.6",
      }}
    >
      {/* ── HEADER ── */}
      <div style={{
        background: "#0f172a",
        padding: mobile ? "20px 16px" : "28px 40px",
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: mobile ? "flex-start" : "center",
        gap: "16px",
      }}>
        {/* Logo + company */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            background: "#1e293b",
            borderRadius: "10px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "52px",
            minHeight: "52px",
          }}>
            {logoUrl
              ? <img src={logoUrl} alt="logo" style={{ height: "44px", objectFit: "contain" }} />
              : <span style={{ color: "#fff", fontSize: "26px", fontWeight: 900 }}>T</span>
            }
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>
              {company.name}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>{company.address}</div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{company.email} · {company.phone}</div>
          </div>
        </div>

        {/* INVOICE + barcode */}
        <div style={{ textAlign: mobile ? "left" : "right" }}>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#fff", letterSpacing: "3px" }}>
            INVOICE
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "10px" }}>Issued: {today}</div>
          {s?.tracking_number && (
            <div style={{ background: "#fff", borderRadius: "8px", padding: "8px 10px", display: "inline-block" }}>
              <Barcode value={s.tracking_number} height={44} width={1.4} fontSize={11} background="#ffffff" />
            </div>
          )}
        </div>
      </div>

      {/* ── TRACKING HERO ── */}
      <div style={{
        background: "#fff",
        textAlign: "center",
        padding: mobile ? "20px 16px" : "28px 40px",
        borderBottom: "1px solid #e2e8f0",
      }}>
        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "3px", color: "#94a3b8", marginBottom: "8px" }}>
          Tracking Number
        </div>
        <div style={{ fontSize: mobile ? "22px" : "30px", fontWeight: 900, color: "#7c3aed", letterSpacing: "2px", marginBottom: "14px" }}>
          {s?.tracking_number || "—"}
        </div>
        <div style={{
          display: "inline-block",
          background: sc.bg,
          color: sc.text,
          borderRadius: "20px",
          padding: "6px 20px",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.5px",
          marginBottom: "8px",
        }}>
          {s?.status || "PENDING"}
        </div>
        {s?.current_location && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
            <MapPin size={12} /> {s.current_location}
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: mobile ? "16px" : "32px 40px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* SENDER / RECEIVER */}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
          {/* FROM */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              background: "#dbeafe", color: "#1d4ed8",
              borderRadius: "20px", padding: "3px 12px",
              fontSize: "10px", fontWeight: 800, letterSpacing: "1px",
              marginBottom: "12px", textTransform: "uppercase",
            }}>
              <Package size={10} /> From · Sender
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#111", marginBottom: "10px" }}>
              {s?.sender_name || "—"}
            </div>
            <ContactLine icon={<Phone size={11} />}  value={s?.sender_phone} />
            <ContactLine icon={<Mail size={11} />}   value={s?.sender_email} />
            <ContactLine icon={<MapPin size={11} />} value={s?.sender_address} />
            <ContactLine icon={<Globe size={11} />}  value={s?.sender_country} bold />
          </div>

          {/* TO */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              background: "#dcfce7", color: "#15803d",
              borderRadius: "20px", padding: "3px 12px",
              fontSize: "10px", fontWeight: 800, letterSpacing: "1px",
              marginBottom: "12px", textTransform: "uppercase",
            }}>
              <Truck size={10} /> To · Receiver
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#111", marginBottom: "10px" }}>
              {s?.receiver_name || "—"}
            </div>
            <ContactLine icon={<Phone size={11} />}  value={s?.receiver_phone} />
            <ContactLine icon={<Mail size={11} />}   value={s?.receiver_email} />
            <ContactLine icon={<MapPin size={11} />} value={s?.receiver_address} />
            <ContactLine icon={<Globe size={11} />}  value={s?.receiver_country} bold />
          </div>
        </div>

        {/* SHIPMENT DETAILS */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
          <div style={sectionHeading}>
            <Package size={12} /> Shipment Details
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: "12px 32px" }}>
            <DetailItem icon={<MapPin size={11} />}   label="Origin"            value={s?.origin_label} />
            <DetailItem icon={<Flag size={11} />}     label="Destination"       value={s?.destination_label} />
            <DetailItem icon={<Layers size={11} />}   label="Type"              value={s?.package_type} />
            <DetailItem icon={<Scale size={11} />}    label="Weight"            value={s?.weight} />
            <DetailItem icon={<Calendar size={11} />} label="Date Sent"         value={s?.date_sent} />
            <DetailItem
              icon={<Truck size={11} />}
              label="Expected Delivery"
              value={s?.expected_delivery_date
                ? new Date(s.expected_delivery_date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
                : null}
            />
            {s?.description && (
              <DetailItem icon={<FileText size={11} />} label="Description" value={s.description} fullWidth />
            )}
          </div>
        </div>

        {/* COMMENTS */}
        {s?.comments && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <div style={sectionHeading}>
              <MessageSquare size={12} /> Comments
            </div>
            <div style={{
              borderLeft: "4px solid #f59e0b",
              background: "#fffbeb",
              borderRadius: "0 8px 8px 0",
              padding: "12px 16px",
              fontSize: "13px",
              color: "#374151",
              fontStyle: "italic",
            }}>
              {s.comments}
            </div>
          </div>
        )}

        {/* BILLING */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", position: "relative" }}>
          <div style={sectionHeading}>
            <CreditCard size={12} /> Billing
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
            <span style={{ color: "#6b7280", fontSize: "12px" }}>Amount Due</span>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#111" }}>{amountDue}</span>
          </div>
          {s?.payment_mode && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#555" }}>
              <CreditCard size={11} color="#94a3b8" />
              Payment Mode: <strong>{s.payment_mode}</strong>
            </div>
          )}

          {/* ON HOLD */}
          {isOnHold && (
            <div style={{
              marginTop: "16px",
              border: "2px solid #f59e0b",
              borderRadius: "10px",
              padding: "16px",
              background: "#fffbeb",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontWeight: 800, fontSize: "12px", textTransform: "uppercase",
                letterSpacing: "1px", color: "#92400e", marginBottom: "12px",
              }}>
                <AlertTriangle size={14} color="#92400e" /> Shipment On Hold
              </div>
              {s?.hold_headline && (
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>{s.hold_headline}</div>
              )}
              {s?.hold_body && (
                <div style={{ fontSize: "12px", marginBottom: "8px" }}>{s.hold_body}</div>
              )}
              {s?.hold_footer_note && (
                <div style={{ fontSize: "11px", color: "#555", fontStyle: "italic", marginBottom: "10px" }}>{s.hold_footer_note}</div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: "10px 24px" }}>
                {s?.hold_amount && (
                  <div>
                    <div style={labelStyle}><Scale size={11} /> Hold Amount</div>
                    <div style={valueStyle}>{s.hold_amount}</div>
                  </div>
                )}
                {s?.hold_contact_email && (
                  <div>
                    <div style={labelStyle}><Mail size={11} /> Contact</div>
                    <div style={valueStyle}>{s.hold_contact_email}</div>
                  </div>
                )}
                {s?.crypto_wallet_address && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={labelStyle}><Hash size={11} /> Crypto Wallet</div>
                    <div style={{ ...valueStyle, fontFamily: "monospace", fontSize: "11px", wordBreak: "break-all" }}>{s.crypto_wallet_address}</div>
                  </div>
                )}
                {s?.bank_name && (
                  <div>
                    <div style={labelStyle}><Building2 size={11} /> Bank</div>
                    <div style={valueStyle}>{s.bank_name}</div>
                  </div>
                )}
                {s?.bank_account_number && (
                  <div>
                    <div style={labelStyle}><Hash size={11} /> Account No.</div>
                    <div style={{ ...valueStyle, fontFamily: "monospace" }}>{s.bank_account_number}</div>
                  </div>
                )}
                {s?.bank_account_name && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={labelStyle}><User size={11} /> Account Name</div>
                    <div style={valueStyle}>{s.bank_account_name}</div>
                  </div>
                )}
                {s?.payment_instruction_note && (
                  <div style={{ gridColumn: "1 / -1", borderTop: "1px dashed #f59e0b", paddingTop: "10px", marginTop: "4px" }}>
                    <div style={labelStyle}><ClipboardList size={11} /> Instructions</div>
                    <div style={valueStyle}>{s.payment_instruction_note}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stamp — desktop only */}
          {!mobile && (
            <div style={{ position: "absolute", bottom: "16px", right: "24px", opacity: 0.85 }}>
              <Stamp status={s?.status || "PENDING"} />
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        background: "#0f172a",
        padding: "20px 40px",
        textAlign: "center",
        fontSize: "11px",
        color: "#94a3b8",
        lineHeight: "1.8",
      }}>
        <div>This is a computer-generated document and does not require a signature.</div>
        <div>© {year} {company.name} · {company.email}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* MODAL OVERLAY */}
      <div style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 9999, overflowY: "auto",
        padding: "32px 16px",
      }}>
        {/* Action bar */}
        <div style={{
          maxWidth: "860px", margin: "0 auto 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>Invoice Preview</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => { onClose(); setTimeout(() => window.print(), 100); }}
              style={{
                background: "#7c3aed", color: "#fff", border: "none",
                padding: "10px 24px", fontWeight: 700, cursor: "pointer",
                fontSize: "13px", borderRadius: "8px",
              }}
            >
              Print
            </button>
            <button
              onClick={onClose}
              style={{
                background: "#fff", color: "#111",
                border: "1px solid #e2e8f0",
                padding: "10px 16px", fontWeight: 700,
                cursor: "pointer", fontSize: "13px", borderRadius: "8px",
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div style={{ maxWidth: "860px", margin: "0 auto", boxShadow: "0 8px 40px rgba(0,0,0,0.4)", borderRadius: "4px", overflow: "hidden" }}>
          {InvoiceBody}
        </div>
      </div>

      {/* PRINT ONLY */}
      <div className="print-only-invoice" style={{ display: "none" }}>
        {InvoiceBody}
      </div>
    </>
  );
}
