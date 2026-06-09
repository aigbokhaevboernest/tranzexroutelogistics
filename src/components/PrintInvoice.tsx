import { useEffect, useState } from "react";
import Barcode from "react-barcode";
import { createClient } from "@supabase/supabase-js";
import { MapPin, AlertTriangle } from "lucide-react";

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

function statusColour(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered")) return { bg: "#dcfce7", text: "#15803d", border: "#86efac" };
  if (s.includes("hold"))      return { bg: "#fef9c3", text: "#854d0e", border: "#fde047" };
  if (s.includes("transit"))   return { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" };
  if (s.includes("cancelled")) return { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" };
  return                               { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
}

function Stamp({ status }: { status: string }) {
  const label = (status || "PENDING").toUpperCase();
  const r = 60;
  const cx = 80, cy = 80;

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"
         style={{ opacity: 0.88 }}>
      <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke="#c0392b" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r + 8}  fill="none" stroke="#c0392b" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r + 6}  fill="rgba(192,57,43,0.07)" />
      <path id="topArc" d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" />
      <text fontSize="10" fontWeight="700" fill="#c0392b" letterSpacing="1.5" fontFamily="'Georgia', serif">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">
          TRANZEX ROUTE LOGISTICS
        </textPath>
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="11" fontWeight="800"
            fill="#c0392b" fontFamily="'Georgia', serif" letterSpacing="1">
        {label}
      </text>
      <path id="botArc" d={`M ${cx - r},${cy} A ${r},${r} 0 0,0 ${cx + r},${cy}`} fill="none" />
      <text fontSize="9" fontWeight="600" fill="#c0392b" letterSpacing="1" fontFamily="'Georgia', serif">
        <textPath href="#botArc" startOffset="50%" textAnchor="middle">
          ★ OFFICIAL ★
        </textPath>
      </text>
    </svg>
  );
}

export default function PrintInvoice({ s, open, onClose }: { s: any; open: boolean; onClose: () => void }) {
  const [logoUrl, setLogoUrl]         = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("hold_settings")
      .select("company_logo_url, company_name, company_address, company_email")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setCompanyInfo(data);
          setLogoUrl(data.company_logo_url || null);
        }
      });
  }, []);

  const company = {
    name:    companyInfo?.company_name    || COMPANY.name,
    address: companyInfo?.company_address || COMPANY.address,
    email:   companyInfo?.company_email   || COMPANY.email,
    phone:   COMPANY.phone,
  };

  const today    = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const year     = new Date().getFullYear();
  const isOnHold = (s?.status || "").toLowerCase().includes("hold");
  const amountDue = s?.amount_due || s?.hold_amount || "—";
  const sc       = statusColour(s?.status || "");

  if (!open) return null;

  const InvoiceBody = (
    <div
      id="print-invoice"
      style={{
        background: "#fff", color: "#111", padding: "40px 48px",
        maxWidth: "860px", margin: "0 auto",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "13px", lineHeight: "1.6", position: "relative",
        fontWeight: 600,
      }}
    >
      {/* HEADER */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start",
        borderBottom: "3px solid #111", 
        paddingBottom: "20px", 
        marginBottom: "28px",
        background: "rgba(17, 17, 17, 0.4)",
        padding: "20px 24px",
        margin: "0 -48px 28px -48px",
        borderRadius: "4px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="logo" 
              style={{ 
                height: "68px", 
                objectFit: "contain",
                filter: "brightness(0.85) contrast(1.1)"
              }} 
            />
          ) : (
            <div style={{ 
              width: "68px", 
              height: "68px", 
              background: "#111", 
              color: "#fff",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "32px", 
              fontWeight: 900,
              borderRadius: "4px"
            }}>T</div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px" }}>Invoice / Waybill</div>
          <div style={{ fontSize: "11px", marginTop: "2px", color: "#555" }}>Issued: {today}</div>
          {s?.tracking_number && (
            <div style={{ marginTop: "10px", display: "inline-block", border: "1px solid #ccc", padding: "6px" }}>
              <Barcode value={s.tracking_number} height={50} width={1.5} fontSize={12} background="#ffffff" />
            </div>
          )}
        </div>
      </div>

      {/* TRACKING NUMBER */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#555", marginBottom: "6px" }}>Tracking Number</div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#c0392b", letterSpacing: "2px" }}>
          {s?.tracking_number || "—"}
        </div>
        <div style={{ marginTop: "8px", display: "inline-flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                         borderRadius: "4px", padding: "2px 12px", fontSize: "11px",
                         fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
            {s?.status || "—"}
          </span>
          {s?.current_location && (
            <span style={{ fontSize: "11px", color: "#555", display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={14} /> {s.current_location}
            </span>
          )}
        </div>
      </div>

      {/* SENDER / RECEIVER */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "28px" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "10px", textTransform: "uppercase",
                        letterSpacing: "2px", borderBottom: "1px solid #111", paddingBottom: "4px", marginBottom: "10px" }}>FROM (SENDER)</div>
          <div style={{ fontWeight: 700, fontSize: "15px" }}>{s?.sender_name || "—"}</div>
          <div style={{ fontSize: "12px", color: "#444", marginTop: "4px" }}>
            {s?.sender_phone && <div>{s.sender_phone}</div>}
            {s?.sender_email && <div>{s.sender_email}</div>}
            {s?.sender_address && <div>{s.sender_address}</div>}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "10px", textTransform: "uppercase",
                        letterSpacing: "2px", borderBottom: "1px solid #111", paddingBottom: "4px", marginBottom: "10px" }}>TO (RECEIVER)</div>
          <div style={{ fontWeight: 700, fontSize: "15px" }}>{s?.receiver_name || "—"}</div>
          <div style={{ fontSize: "12px", color: "#444", marginTop: "4px" }}>
            {s?.receiver_phone && <div>{s.receiver_phone}</div>}
            {s?.receiver_email && <div>{s.receiver_email}</div>}
            {s?.receiver_address && <div>{s.receiver_address}</div>}
            {s?.receiver_country && <div style={{ fontWeight: 600 }}>{s.receiver_country}</div>}
          </div>
        </div>
      </div>

      {/* SHIPMENT DETAILS */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontWeight: 700, fontSize: "10px", textTransform: "uppercase",
                      letterSpacing: "2px", borderBottom: "1px solid #111", paddingBottom: "4px", marginBottom: "12px" }}>SHIPMENT DETAILS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px", fontSize: "12px" }}>
          {[
            ["Origin",            s?.origin_label],
            ["Destination",       s?.destination_label],
            ["Type",              s?.package_type],
            ["Weight",            s?.weight],
            ["Date Sent",         s?.date_sent],
            ["Expected Delivery", s?.expected_delivery_date ? new Date(s.expected_delivery_date).toLocaleDateString() : null],
          ].map(([label, val]) => val ? (
            <div key={label as string}>
              <span style={{ color: "#666" }}>{label}: </span>
              <span style={{ fontWeight: 700 }}>{val as string}</span>
            </div>
          ) : null)}
          {s?.description && (
            <div style={{ gridColumn: "1 / -1" }}>
              <span style={{ color: "#666" }}>Description: </span>
              <span style={{ fontWeight: 700 }}>{s.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* COMMENTS */}
      {s?.comments && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontWeight: 700, fontSize: "10px", textTransform: "uppercase",
                        letterSpacing: "2px", borderBottom: "1px solid #111", paddingBottom: "4px", marginBottom: "10px" }}>COMMENTS</div>
          <div style={{ borderLeft: "4px solid #f59e0b", paddingLeft: "12px",
                        paddingTop: "6px", paddingBottom: "6px", background: "#fffbeb", fontSize: "12px" }}>
            {s.comments}
          </div>
        </div>
      )}

      {/* BILLING */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontWeight: 700, fontSize: "10px", textTransform: "uppercase",
                      letterSpacing: "2px", borderBottom: "1px solid #111", paddingBottom: "4px", marginBottom: "10px" }}>BILLING</div>
        <div style={{ fontSize: "13px" }}>
          <div>
            <span style={{ color: "#666" }}>Amount Due: </span>
            <strong style={{ fontSize: "15px" }}>{amountDue}</strong>
          </div>
          {s?.payment_mode && (
            <div style={{ marginTop: "4px" }}>
              <span style={{ color: "#666" }}>Payment Mode: </span>
              <span style={{ fontWeight: 700 }}>{s.payment_mode}</span>
            </div>
          )}
        </div>
      </div>

      {/* ON HOLD SECTION */}
      {isOnHold && (
        <div style={{ marginBottom: "24px", border: "2px solid #f59e0b",
                      borderRadius: "4px", padding: "16px", background: "#fffbeb" }}>
          <div style={{ fontWeight: 700, fontSize: "10px", textTransform: "uppercase",
                        letterSpacing: "2px", marginBottom: "10px", color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={16} /> SHIPMENT ON HOLD
          </div>
          {s?.hold_headline && <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>{s.hold_headline}</div>}
          {s?.hold_body && <div style={{ fontSize: "12px", marginBottom: "8px" }}>{s.hold_body}</div>}
          {s?.hold_footer_note && (
            <div style={{ fontSize: "11px", color: "#555", marginBottom: "8px", fontStyle: "italic" }}>{s.hold_footer_note}</div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontSize: "12px", marginTop: "8px" }}>
            {s?.hold_amount && (
              <div><span style={{ color: "#666" }}>Hold Amount: </span><strong>{s.hold_amount}</strong></div>
            )}
            {s?.hold_contact_email && (
              <div><span style={{ color: "#666" }}>Contact: </span><span>{s.hold_contact_email}</span></div>
            )}
            {s?.crypto_wallet_address && (
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: "#666" }}>Crypto Wallet: </span>
                <span style={{ fontFamily: "monospace", fontSize: "11px" }}>{s.crypto_wallet_address}</span>
              </div>
            )}
            {s?.bank_name && (
              <div><span style={{ color: "#666" }}>Bank: </span><span>{s.bank_name}</span></div>
            )}
            {s?.bank_account_number && (
              <div><span style={{ color: "#666" }}>Account No.: </span><span style={{ fontFamily: "monospace" }}>{s.bank_account_number}</span></div>
            )}
            {s?.bank_account_name && (
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: "#666" }}>Account Name: </span><span>{s.bank_account_name}</span>
              </div>
            )}
            {s?.payment_instruction_note && (
              <div style={{ gridColumn: "1 / -1", marginTop: "6px", borderTop: "1px dashed #f59e0b", paddingTop: "6px" }}>
                <span style={{ color: "#666" }}>Instructions: </span><span>{s.payment_instruction_note}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAMP */}
      <div style={{ position: "absolute", bottom: "48px", right: "48px", opacity: 0.9 }}>
        <Stamp status={s?.status || "PENDING"} />
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: "center", fontSize: "10px", color: "#888",
                    borderTop: "1px solid #ddd", marginTop: "56px", paddingTop: "14px" }}>
        This is a computer-generated document and does not require a signature.<br />
        © {year} {company.name} • For inquiries: {company.email}
      </div>
    </div>
  );

  return (
    <>
      {/* FULLSCREEN PREVIEW MODAL */}
      <div
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          zIndex: 9999, overflowY: "auto", padding: "32px 16px",
        }}
      >
        {/* action bar */}
        <div style={{ maxWidth: "860px", margin: "0 auto 16px",
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>Print Preview</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => { onClose(); setTimeout(() => window.print(), 100); }}
              style={{ background: "#c0392b", color: "#fff", border: "none",
                       padding: "8px 20px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
            >
              🖨 Print
            </button>
            <button
              onClick={() => onClose()}
              style={{ background: "#fff", color: "#111", border: "none",
                       padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* invoice preview */}
        <div style={{ background: "#fff", maxWidth: "860px", margin: "0 auto",
                      boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
          {InvoiceBody}
        </div>
      </div>

      {/* PRINT-ONLY TARGET */}
      <div className="print-only-invoice" style={{ display: "none" }}>
        {InvoiceBody}
      </div>
    </>
  );
}
