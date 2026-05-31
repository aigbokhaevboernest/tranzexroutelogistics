import { useState } from "react";
import { Copy, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function PaymentModal({
  open,
  onClose,
  wallet,
  amount,
  note,
  contactEmail,
  bankDetails,
}: {
  open: boolean;
  onClose: () => void;
  wallet?: string;
  amount?: string;
  note?: string;
  contactEmail?: string;
  bankDetails?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!open) return null;
  const copy = (v?: string) => {
    if (!v) return;
    navigator.clipboard.writeText(v);
    toast.success("Copied!");
  };
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-md w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 text-muted-foreground hover:text-navy">
          <X />
        </button>
        <h3 className="text-display text-2xl font-extrabold text-navy uppercase">Pay Customs Fee</h3>
        {amount && <div className="mt-2 text-3xl text-brand-red font-extrabold text-mono">{amount}</div>}

        {wallet && (
          <div className="mt-4">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Crypto Wallet Address</div>
            <div className="mt-1 flex items-center gap-2 bg-secondary rounded p-3">
              <span className="text-mono text-xs break-all flex-1 text-navy">{wallet}</span>
              <button onClick={() => copy(wallet)} className="bg-brand-red text-white px-3 py-2 rounded flex items-center gap-1 text-xs font-bold">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="mt-3 w-full bg-success text-white font-bold py-2.5 rounded hover:opacity-90"
            >
              I Have Sent the Money
            </button>
          </div>
        )}

        {bankDetails && (
          <div className="mt-4">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Bank Details</div>
            <div className="mt-1 bg-secondary rounded p-3 text-sm text-navy whitespace-pre-wrap">{bankDetails}</div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="mt-3 w-full bg-success text-white font-bold py-2.5 rounded hover:opacity-90"
            >
              I Have Sent the Money
            </button>
          </div>
        )}

        <div className="mt-4 bg-warning/20 border border-warning rounded p-3 text-sm text-navy">
          {note || "Once payment is sent, allow up to 30 minutes for confirmation. Send the exact amount only."}
        </div>
        {contactEmail && (
          <a href={`mailto:${contactEmail}`} className="mt-4 inline-block text-brand-red font-bold hover:underline">
            Contact our live support team →
          </a>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-sm p-6 relative text-center">
            <button onClick={() => setConfirmOpen(false)} aria-label="Close" className="absolute top-3 right-3 text-muted-foreground hover:text-navy">
              <X />
            </button>
            <div className="w-14 h-14 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="mt-3 text-display text-xl font-extrabold text-navy uppercase">Payment Notice Received</h4>
            <p className="mt-2 text-sm text-navy">
              Once payment has been confirmed you will be notified immediately and your shipment will start moving.
            </p>
            <button
              onClick={() => setConfirmOpen(false)}
              className="mt-5 w-full bg-navy text-white font-bold py-2.5 rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
