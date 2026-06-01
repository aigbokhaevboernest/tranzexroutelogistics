import { useEffect, useState } from "react";
import Barcode from "react-barcode";
import { supabase } from "@/lib/supabase";

// ─── types ────────────────────────────────────────────────────────────────────
interface CompanySettings {
  company_logo_url?: string;
  company_name?: string;
  company_address?: string;
  company_email?: string;
  company_phone?: string;
}

interface PrintInvoiceProps {
  s: any;
  open: boolean;
  onClose: () => void;
}

// ─── Stamp SVG ────────────────────────────────────────────────────────────────
function Stamp({ status }: { status: string }) {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r="50" fill="none" stroke="#ef4444" strokeWidth="3" />
      <circle cx="55" cy="55" r="42" fill="none" stroke="#ef4444" strokeWidth="1" />
      <text
        style={{ font: "bold 10px sans-serif", fill: "#ef4444", letterSpacing: "2px" }}
      >
        <textPath href="#stampCircle" startOffset="10%">
          TRANZEX ROUTE LOGISTICS • TRANZEX ROUTE LOGISTICS •
        </textPath>
      </text>
      <defs>
        <path
          id="stampCircle"
          d="M 55,55 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
        />
      </defs>
      <text
        x="55"
        y="52"
        textAnchor="middle"
        style={{ font: "bold 9px sans-serif", fill: "#ef4444" }}
      >
        {status?.toUpperCase()}
      </text>
      <text
        x="55"
        y="64"
        textAnchor="middle"
        style={{ font: "7px sans-serif", fill: "#ef4444" }}
      >
        VERIFIED
      </text>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PrintInvoice({ s, open, onClose }: PrintInvoiceProps) {
  const [company, setCompany] = useState<CompanySettings>({});

  // Fetch company settings from Supabase hold_settings table
  useEffect(() => {
    if (!open) return;
    supabase
      .from("hold_settings")
      .select("company_logo_url, company_name, company_address, company_email")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) setCompany(data);
      });
  }, [open]);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const year = new Date().getFullYear();

  const isOnHold = s?.status === "On Hold";
  const amountDue = s?.hold_amount || s?.amount_due || "—";

  const companyName = company.company_name || "Tranzex Route Logistics";
  const companyAddress = company.company_address || "1428 Harbor View Avenue, Manila, Philippines 1000";
  const companyEmail = company.company_email || "support@tranzexroute.com";

  if (!open) return null;

  return (
    <>
      {/* ── Print CSS injected into head ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-invoice, #print-invoice * { visibility: visible !important; }
          #print-invoice {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            padding: 32px !important;
            background: white !important;
            color: black !important;
            z-index: 99999 !important;
            overflow: auto !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ── Modal overlay (screen only) ── */}
      <div className="no-print fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-lg text-navy">Invoice Preview</h2>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="bg-brand-red text-white font-bold px-5 py-2 rounded text-sm"
              >
                🖨 Print
              </button>
              <button
                onClick={onClose}
                className="bg-gray-100 text-navy font-bold px-5 py-2 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>

          {/* Invoice content — visible on screen AND in print */}
          <div id="print-invoice" className="p-8 text-black bg-white">

            {/* ── 1. Company Header ── */}
            <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-8">
              <div className="flex items-center gap-4">
                {company.company_logo_url ? (
                  <img
                    src={company.company_logo_url}
                    alt="logo"
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="w-14 h-14 bg-black text-white flex items-center justify-center text-3xl font-black flex-shrink-0">
                    T
                  </div>
                )}
                <div>
                  <div className="text-xl font-black uppercase tracking-wider">{companyName}</div>
                  <div className="text-sm text-gray-600 mt-1">{companyAddress}</div>
                  <div className="text-sm text-gray-600">{companyEmail}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold uppercase tracking-widest">Invoice / Waybill</div>
                <div className="text-sm mt-1 text-gray-600">Issued: {today}</div>
                {s?.tracking_number && (
                  <div className="mt-3 inline-block p-2 border border-gray-300">
                    <Barcode
                      value={s.tracking_number}
                      height={48}
                      width={1.4}
                      fontSize={12}
                      background="#ffffff"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── 2. Tracking Number + Status ── */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">
                  Tracking Number
                </div>
                <div className="text-3xl font-black text-red-600 tracking-widest">
                  {s?.tracking_number || "—"}
                </div>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {s?.status || "—"}
                  </span>
                  {s?.current_location && (
                    <span className="text-sm text-gray-600">
                      📍 {s.current_location_flag ? `${s.current_location_flag} ` : ""}
                      {s.current_location}
                    </span>
                  )}
                </div>
              </div>
              {/* Stamp */}
              <div className="flex-shrink-0">
                <Stamp status={s?.status || ""} />
              </div>
            </div>

            {/* ── 3. Sender & Receiver ── */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="font-bold uppercase text-xs tracking-widest border-b border-gray-300 pb-1 mb-3">
                  SHIPPER (SENDER)
                </div>
                <div className="space-y-1 text-sm">
                  <div className="font-bold">{s?.sender_name || "—"}</div>
                  {s?.sender_phone && <div>📞 {s.sender_phone}</div>}
                  {s?.sender_email && <div>✉ {s.sender_email}</div>}
                  {s?.sender_address && <div>📍 {s.sender_address}</div>}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-xs tracking-widest border-b border-gray-300 pb-1 mb-3">
                  CONSIGNEE (RECEIVER)
                </div>
                <div className="space-y-1 text-sm">
                  <div className="font-bold">{s?.receiver_name || "—"}</div>
                  {s?.receiver_phone && <div>📞 {s.receiver_phone}</div>}
                  {s?.receiver_email && <div>✉ {s.receiver_email}</div>}
                  {s?.receiver_address && <div>📍 {s.receiver_address}</div>}
                  {s?.receiver_country && <div>🌍 {s.receiver_country}</div>}
                </div>
              </div>
            </div>

            {/* ── 4. Shipment Details ── */}
            <div className="mb-8">
              <div className="font-bold uppercase text-xs tracking-widest border-b border-gray-300 pb-1 mb-3">
                SHIPMENT DETAILS
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div><span className="text-gray-500">Origin:</span> <strong>{s?.origin_label || "—"}</strong></div>
                <div><span className="text-gray-500">Destination:</span> <strong>{s?.destination_label || "—"}</strong></div>
                <div><span className="text-gray-500">Type:</span> <strong>{s?.package_type || "—"}</strong></div>
                <div><span className="text-gray-500">Weight:</span> <strong>{s?.weight || "—"}</strong></div>
                <div><span className="text-gray-500">Date Sent:</span> <strong>{s?.date_sent || "—"}</strong></div>
                <div>
                  <span className="text-gray-500">Expected Delivery:</span>{" "}
                  <strong>
                    {s?.expected_delivery_date
                      ? new Date(s.expected_delivery_date).toLocaleDateString()
                      : "—"}
                  </strong>
                </div>
                {s?.description && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Description:</span> {s.description}
                  </div>
                )}
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-gray-500">Status:</span>
                  <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-0.5 rounded-full uppercase">
                    {s?.status || "—"}
                  </span>
                </div>
                {s?.comments && (
                  <div className="col-span-2 mt-2">
                    <div className="text-gray-500 text-xs font-bold uppercase mb-1">Comments</div>
                    <div className="border-l-4 border-amber-400 bg-amber-50 pl-3 py-2 text-sm">
                      {s.comments}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── 5. Billing ── */}
            <div className="mb-8">
              <div className="font-bold uppercase text-xs tracking-widest border-b border-gray-300 pb-1 mb-3">
                BILLING
              </div>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-500">Amount Due:</span>{" "}
                  <strong className="text-red-600 text-lg">{amountDue}</strong>
                </div>
                {s?.payment_mode && (
                  <div>
                    <span className="text-gray-500">Payment Mode:</span> {s.payment_mode}
                  </div>
                )}
              </div>
            </div>

            {/* ── 6. On Hold Details (only if On Hold) ── */}
            {isOnHold && (
              <div className="mb-8 border-2 border-amber-400 rounded p-4 bg-amber-50">
                <div className="font-bold uppercase text-xs tracking-widest text-amber-700 mb-3">
                  ⚠ CUSTOMS HOLD DETAILS
                </div>
                <div className="space-y-2 text-sm">
                  {s?.hold_headline && (
                    <div className="font-black text-base text-amber-800">{s.hold_headline}</div>
                  )}
                  {s?.hold_body && <div>{s.hold_body}</div>}
                  {s?.hold_amount && (
                    <div>
                      <span className="text-gray-600">Hold Amount:</span>{" "}
                      <strong className="text-red-600">{s.hold_amount}</strong>
                    </div>
                  )}
                  {s?.hold_note && (
                    <div className="italic text-gray-600">{s.hold_note}</div>
                  )}
                  {s?.hold_contact_email && (
                    <div>
                      <span className="text-gray-600">Contact:</span> {s.hold_contact_email}
                    </div>
                  )}
                  {s?.payment_instruction_note && (
                    <div className="mt-2 bg-white border border-amber-300 rounded p-3">
                      <div className="text-xs font-bold uppercase text-gray-500 mb-1">
                        Payment Instructions
                      </div>
                      {s.payment_instruction_note}
                    </div>
                  )}
                  {s?.crypto_wallet_address && (
                    <div className="mt-2">
                      <div className="text-xs font-bold uppercase text-gray-500 mb-1">
                        Crypto Wallet Address
                      </div>
                      <div className="font-mono text-xs bg-white border border-gray-200 rounded p-2 break-all">
                        {s.crypto_wallet_address}
                      </div>
                    </div>
                  )}
                  {s?.bank_details && (
                    <div className="mt-2">
                      <div className="text-xs font-bold uppercase text-gray-500 mb-1">
                        Bank Details
                      </div>
                      <div className="text-sm">{s.bank_details}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Footer ── */}
            <div className="text-center text-xs text-gray-400 pt-6 border-t mt-8">
              This is a computer-generated document and does not require a signature.
              <br />
              © {year} {companyName} • {companyEmail}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
