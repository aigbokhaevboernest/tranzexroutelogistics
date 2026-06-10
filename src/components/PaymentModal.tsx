import { useState, useRef } from "react";
import { Copy, X, CheckCircle2, Upload, Landmark, Wallet, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "jameshilterson@gmail.com";

export default function PaymentModal({
  open,
  onClose,
  wallet,
  amount,
  note,
  contactEmail,
  bankDetails,
  trackingNumber,
  consigneeName,
  consigneeEmail,
}: {
  open: boolean;
  onClose: () => void;
  wallet?: string;
  amount?: string;
  note?: string;
  contactEmail?: string;
  bankDetails?: string;
  trackingNumber?: string;
  consigneeName?: string;
  consigneeEmail?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const copy = (v?: string) => {
    if (!v) return;
    navigator.clipboard.writeText(v);
    toast.success("Copied!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const result = String(r.result || "");
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const handleConfirm = async () => {
    setSending(true);
    try {
      let attachment: any = null;
      if (proofFile) {
        const content = await fileToBase64(proofFile);
        attachment = {
          filename: proofFile.name,
          content,
          contentType: proofFile.type || "application/octet-stream",
        };
      }

      const userSubject = `Payment Received — Tracking ${trackingNumber || ""}`;
      const userHtml = `
        <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:560px;margin:auto">
          <h2 style="color:#b91c1c">Payment Received — Under Review</h2>
          <p>Hi ${consigneeName || "there"},</p>
          <p>We have received your payment submission for shipment <strong>${trackingNumber || ""}</strong>${amount ? ` in the amount of <strong>${amount}</strong>` : ""}. Our team is reviewing it now.</p>
          <p>Once payment has been confirmed you will be notified immediately and your shipment will start moving.</p>
          <p style="margin-top:24px;color:#64748b;font-size:12px">Tranzex Route Logistics</p>
        </div>`;

      const adminSubject = `New payment submitted — ${trackingNumber || ""}`;
      const adminHtml = `
        <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:600px;margin:auto">
          <h2 style="color:#b91c1c">New consignee payment submitted</h2>
          <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
            <tr><td><strong>Consignment Name</strong></td><td>${consigneeName || "—"}</td></tr>
            <tr><td><strong>Tracking Number</strong></td><td>${trackingNumber || "—"}</td></tr>
            <tr><td><strong>Consignee Email</strong></td><td>${consigneeEmail || "—"}</td></tr>
            <tr><td><strong>Payment Amount</strong></td><td>${amount || "—"}</td></tr>
            <tr><td><strong>Proof Attached</strong></td><td>${proofFile ? proofFile.name : "No proof uploaded"}</td></tr>
          </table>
        </div>`;

      const sends: Promise<any>[] = [];
      if (consigneeEmail) {
        sends.push(
          supabase.functions.invoke("sende-mail", {
            body: { to: consigneeEmail, subject: userSubject, html: userHtml },
          })
        );
      }
      // User email
sends.push(
  supabase.functions.invoke("sende-mail", {
    body: {
      to: consigneeEmail,
      subject: userSubject,
      first_name: consigneeName?.split(" ")[0] ?? "",
      html_body: userHtml,
    },
  })
);

// Admin email
sends.push(
  supabase.functions.invoke("sende-mail", {
    body: {
      to: ADMIN_EMAIL,
      subject: adminSubject,
      first_name: "Admin",
      html_body: adminHtml,
      attachments: attachment ? [attachment] : [],
    },
  })
);

      await Promise.allSettled(sends);
      setConfirmOpen(true);
    } catch (err) {
      console.error(err);
      setConfirmOpen(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-md relative max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-navy/90 rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-widest font-semibold">Customs Fee Payment</p>
            {amount && (
              <div className="text-white text-3xl font-extrabold font-mono mt-0.5">{amount}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Crypto */}
          {wallet && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-100">
                <Wallet className="w-4 h-4 text-brand-red" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Crypto Wallet</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                  <span className="font-mono text-xs break-all flex-1 text-navy">{wallet}</span>
                  <button
                    onClick={() => copy(wallet)}
                    className="flex-shrink-0 bg-brand-red text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold hover:opacity-90 transition"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>

                {note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    {note}
                  </div>
                )}

                <ProofUpload
                  proofFile={proofFile}
                  proofPreview={proofPreview}
                  fileRef={fileRef}
                  onChange={handleFileChange}
                  onClear={() => { setProofFile(null); setProofPreview(null); }}
                />

                <button
                  onClick={handleConfirm}
                  disabled={sending}
                  className="w-full bg-success text-white font-bold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" /> {sending ? "Sending..." : "I Have Sent the Payment"}
                </button>
              </div>
            </div>
          )}

          {/* Bank */}
          {bankDetails && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-100">
                <Landmark className="w-4 h-4 text-brand-red" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Bank Transfer</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-navy whitespace-pre-wrap leading-relaxed">
                  {bankDetails}
                </div>

                {note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    {note}
                  </div>
                )}

                <ProofUpload
                  proofFile={proofFile}
                  proofPreview={proofPreview}
                  fileRef={fileRef}
                  onChange={handleFileChange}
                  onClear={() => { setProofFile(null); setProofPreview(null); }}
                />

                <button
                  onClick={handleConfirm}
                  disabled={sending}
                  className="w-full bg-success text-white font-bold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" /> {sending ? "Sending..." : "I Have Sent the Payment"}
                </button>
              </div>
            </div>
          )}

          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 text-brand-red font-bold text-sm hover:underline"
            >
              <Mail className="w-4 h-4" /> Contact our live support team →
            </a>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/75 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative text-center shadow-2xl">
            <button
              onClick={() => setConfirmOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-navy"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="mt-4 text-xl font-extrabold text-navy uppercase">Payment Notice Received</h4>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Once payment has been confirmed you will be notified immediately and your shipment will start moving.
            </p>
            {proofPreview && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
                <img src={proofPreview} alt="Payment proof" className="w-full object-cover max-h-32" />
                <p className="text-xs text-gray-400 py-1">Proof of payment attached</p>
              </div>
            )}
            <button
              onClick={() => { setConfirmOpen(false); onClose(); }}
              className="mt-5 w-full bg-navy text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProofUpload({
  proofFile,
  proofPreview,
  fileRef,
  onChange,
  onClear,
}: {
  proofFile: File | null;
  proofPreview: string | null;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Upload Payment Proof</p>
      {proofPreview ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200">
          <img src={proofPreview} alt="Proof" className="w-full object-cover max-h-40" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="bg-success/10 text-success text-xs font-semibold text-center py-1.5 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {proofFile?.name}
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 hover:border-brand-red rounded-xl py-4 flex flex-col items-center gap-1.5 text-gray-400 hover:text-brand-red transition"
        >
          <Upload className="w-5 h-5" />
          <span className="text-xs font-semibold">Tap to upload screenshot or receipt</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}
