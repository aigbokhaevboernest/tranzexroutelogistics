import { useState, useRef, useMemo } from "react";
import { Copy, X, CheckCircle2, Upload, Landmark, Wallet, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "jameshilterson@gmail.com";
const STORAGE_BUCKET = "payment-proofs";

type CryptoKey = "BTC" | "ETH" | "USDT";

const CRYPTOS: { key: CryptoKey; name: string; symbol: string; color: string; network?: string }[] = [
  { key: "BTC", name: "Bitcoin", symbol: "BTC", color: "#f59e0b" },
  { key: "ETH", name: "Ethereum", symbol: "ETH", color: "#6366f1" },
  { key: "USDT", name: "USDT (Tether)", symbol: "USDT", color: "#10b981", network: "TRON (TRC20)" },
];

export default function PaymentModal({
  open,
  onClose,
  paymentMode,
  wallet,
  cryptoWallets,
  cryptoCurrency,
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
  paymentMode?: string;
  wallet?: string;
  cryptoWallets?: Partial<Record<CryptoKey, string>> | null;
  amount?: string;
  note?: string;
  contactEmail?: string;
  bankDetails?: string;
  trackingNumber?: string;
  consigneeName?: string;
  consigneeEmail?: string;
  cryptoCurrency?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankInstructionNote?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const mode = (paymentMode || "").toLowerCase();
  const showBank = mode === "bank" || (!mode && !!bankDetails && !wallet && !cryptoWallets);
  const showCrypto = mode === "crypto" || (!mode && (!!wallet || !!cryptoWallets));

  // Each currency's wallet is read independently — no fallback chaining
  // between currencies. Only if the shipment has no cryptoWallets object at
  // all do we fall back to the single legacy `wallet` field, attributed to
  // whichever currency the shipment's legacy cryptoCurrency was set to.
  const walletMap: Record<CryptoKey, string | undefined> = useMemo(() => {
    const hasAny = !!(cryptoWallets && (cryptoWallets.BTC || cryptoWallets.ETH || cryptoWallets.USDT));
    if (hasAny) {
      return { BTC: cryptoWallets?.BTC, ETH: cryptoWallets?.ETH, USDT: cryptoWallets?.USDT };
    }
    const legacy = (cryptoCurrency || "Bitcoin").toLowerCase();
    const legacyKey: CryptoKey = legacy.includes("eth") ? "ETH" : legacy.includes("usdt") ? "USDT" : "BTC";
    return { BTC: undefined, ETH: undefined, USDT: undefined, [legacyKey]: wallet } as Record<CryptoKey, string | undefined>;
  }, [cryptoWallets, wallet, cryptoCurrency]);

  const availableCryptos = CRYPTOS.filter((c) => !!walletMap[c.key]);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoKey>(
    availableCryptos[0]?.key ?? "BTC"
  );

  const activeWallet = walletMap[selectedCrypto] || "";
  const activeMeta = CRYPTOS.find((c) => c.key === selectedCrypto)!;
  const qrUrl = activeWallet
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(activeWallet)}`
    : "";

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

  const uploadProofAndSaveUrl = async (file: File): Promise<string | null> => {
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${trackingNumber ?? "unknown"}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return null;
      }
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      const publicUrl = urlData?.publicUrl ?? null;
      if (publicUrl && trackingNumber) {
        const { error: dbError } = await supabase
          .from("shipments")
          .update({ proof_of_payment_url: publicUrl })
          .eq("tracking_number", trackingNumber);
        if (dbError) console.error("DB update error:", dbError);
      }
      return publicUrl;
    } catch (err) {
      console.error("uploadProofAndSaveUrl error:", err);
      return null;
    }
  };

  const handleConfirm = async () => {
    setSending(true);
    try {
      let proofPublicUrl: string | null = null;
      if (proofFile) proofPublicUrl = await uploadProofAndSaveUrl(proofFile);

      const methodLine = showCrypto
        ? `${activeMeta.name} (${activeMeta.symbol})`
        : "Bank Transfer";

      const userSubject = `Payment Received — Tracking ${trackingNumber ?? ""}`;
      const userHtml = `
        <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:560px;margin:auto">
          <h2 style="color:#b91c1c">Payment Received — Under Review</h2>
          <p>Hi ${consigneeName ?? "there"},</p>
          <p>We have received your payment submission for shipment <strong>${trackingNumber ?? ""}</strong>${amount ? ` in the amount of <strong>${amount}</strong>` : ""} via <strong>${methodLine}</strong>. Our team is reviewing it now.</p>
          <p>Once payment has been confirmed you will be notified immediately and your shipment will start moving.</p>
          <p style="margin-top:24px;color:#64748b;font-size:12px">Tranzex Route Logistics</p>
        </div>`;

      const adminHtml = `
        <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:600px;margin:auto">
          <h2 style="color:#b91c1c">New consignee payment submitted</h2>
          <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
            <tr><td><strong>Consignment Name</strong></td><td>${consigneeName ?? "—"}</td></tr>
            <tr><td><strong>Tracking Number</strong></td><td>${trackingNumber ?? "—"}</td></tr>
            <tr><td><strong>Consignee Email</strong></td><td>${consigneeEmail ?? "—"}</td></tr>
            <tr><td><strong>Payment Method</strong></td><td>${methodLine}</td></tr>
            <tr><td><strong>Payment Amount</strong></td><td>${amount ?? "—"}</td></tr>
            <tr><td><strong>Proof of Payment</strong></td><td>
              ${proofPublicUrl ? `<a href="${proofPublicUrl}" style="color:#b91c1c;font-weight:bold" target="_blank">View Proof Image →</a>` : "No proof uploaded"}
            </td></tr>
          </table>
          ${proofPublicUrl ? `<div style="margin-top:16px"><img src="${proofPublicUrl}" alt="Proof of payment" style="max-width:100%;border-radius:8px;border:1px solid #e2e8f0" /></div>` : ""}
        </div>`;

      const adminSubject = `New payment submitted — ${trackingNumber ?? ""}`;
      const sends: Promise<any>[] = [];

      if (consigneeEmail) {
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
      }
      sends.push(
        supabase.functions.invoke("sende-mail", {
          body: {
            to: ADMIN_EMAIL,
            subject: adminSubject,
            first_name: "Admin",
            html_body: adminHtml,
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
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 print:hidden">
      <div className="bg-white rounded-xl w-full max-w-sm relative max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-navy/90 rounded-t-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">Make Payment</p>
            {amount && <div className="text-white text-2xl font-extrabold font-mono mt-0.5">{amount}</div>}
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Crypto */}
          {showCrypto && (
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 flex items-center gap-2 border-b border-gray-100">
                <Wallet className="w-3.5 h-3.5" style={{ color: activeMeta.color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Crypto Wallet</span>
              </div>
              <div className="p-3 space-y-2.5">
                {/* Currency selector — only currencies with a configured wallet are shown */}
                <div className="grid grid-cols-3 gap-1.5">
                  {CRYPTOS.map((c) => {
                    const active = c.key === selectedCrypto;
                    const available = !!walletMap[c.key];
                    return (
                      <button
                        key={c.key}
                        onClick={() => available && setSelectedCrypto(c.key)}
                        disabled={!available}
                        className={`rounded-md border-2 px-1.5 py-1.5 text-[11px] font-bold transition ${
                          active ? "" : "border-gray-200 hover:border-gray-300"
                        } ${!available ? "opacity-40 cursor-not-allowed" : ""}`}
                        style={
                          active
                            ? { borderColor: c.color, background: `${c.color}15`, color: c.color }
                            : undefined
                        }
                      >
                        <div className="text-[9px] uppercase tracking-wider opacity-75">{c.symbol}</div>
                        <div>{c.name.split(" ")[0]}</div>
                      </button>
                    );
                  })}
                </div>

                {activeMeta.network && (
                  <div className="text-center text-[11px] font-bold text-red-600">
                    Network: {activeMeta.network}
                  </div>
                )}

                {/* QR */}
                {activeWallet && (
                  <div className="flex justify-center">
                    <div className="p-1.5 rounded-md border-2" style={{ borderColor: activeMeta.color }}>
                      <img src={qrUrl} alt={`${activeMeta.name} QR`} className="w-[120px] h-[120px]" />
                    </div>
                  </div>
                )}

                <div
                  className="rounded-md p-2.5 flex items-center gap-2 border-2"
                  style={{ borderColor: `${activeMeta.color}55`, background: `${activeMeta.color}10` }}
                >
                  <span className="font-mono text-[11px] break-all flex-1 text-navy">
                    {activeWallet || `No ${activeMeta.name} wallet configured`}
                  </span>
                  <button
                    onClick={() => copy(activeWallet)}
                    disabled={!activeWallet}
                    className="flex-shrink-0 text-white px-2.5 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:opacity-90 transition disabled:opacity-50"
                    style={{ background: activeMeta.color }}
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>

                {note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-[11px] text-amber-800">{note}</div>
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
                  className="w-full bg-success text-white font-bold py-2.5 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                >
                  <ShieldCheck className="w-4 h-4" /> {sending ? "Sending..." : "I Have Sent the Payment"}
                </button>
              </div>
            </div>
          )}

          {/* Bank */}
          {showBank && bankDetails && (
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 flex items-center gap-2 border-b border-gray-100">
                <Landmark className="w-3.5 h-3.5 text-brand-red" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Bank Transfer</span>
              </div>
              <div className="p-3 space-y-2.5">
                <div className="bg-gray-50 rounded-md p-2.5 text-xs text-navy whitespace-pre-wrap leading-relaxed">
                  {bankDetails}
                </div>
                {note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-[11px] text-amber-800">{note}</div>
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
                  className="w-full bg-success text-white font-bold py-2.5 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                >
                  <ShieldCheck className="w-4 h-4" /> {sending ? "Sending..." : "I Have Sent the Payment"}
                </button>
              </div>
            </div>
          )}

          {!showCrypto && !showBank && (
            <div className="text-center text-sm text-gray-500 py-4">
              No payment method configured for this shipment.
            </div>
          )}

          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-brand-red font-bold text-xs hover:underline">
              <Mail className="w-3.5 h-3.5" /> Contact our live support team →
            </a>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/75 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative text-center shadow-2xl">
            <button onClick={() => setConfirmOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-navy">
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
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Upload Payment Proof</p>
      {proofPreview ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img src={proofPreview} alt="Proof" className="w-full object-cover max-h-28" />
          <button
            onClick={onClear}
            className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="bg-success/10 text-success text-[10px] font-semibold text-center py-1 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {proofFile?.name}
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 hover:border-brand-red rounded-lg py-3 flex flex-col items-center gap-1 text-gray-400 hover:text-brand-red transition"
        >
          <Upload className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Tap to upload screenshot or receipt</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  );
}
