import { Copy, X } from "lucide-react";
import { toast } from "sonner";

export default function PaymentModal({
  open,
  onClose,
  wallet,
  amount,
  note,
  contactEmail,
}: {
  open: boolean;
  onClose: () => void;
  wallet?: string;
  amount?: string;
  note?: string;
  contactEmail?: string;
}) {
  if (!open) return null;
  const copy = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet);
    toast.success("Copied!");
  };
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-md w-full max-w-md p-6 relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 text-muted-foreground hover:text-navy">
          <X />
        </button>
        <h3 className="text-display text-2xl font-extrabold text-navy uppercase">Pay Customs Fee</h3>
        {amount && <div className="mt-2 text-3xl text-brand-red font-extrabold text-mono">{amount}</div>}
        {wallet && (
          <div className="mt-4">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Wallet Address</div>
            <div className="mt-1 flex items-center gap-2 bg-secondary rounded p-3">
              <span className="text-mono text-xs break-all flex-1 text-navy">{wallet}</span>
              <button onClick={copy} className="bg-brand-red text-white px-3 py-2 rounded flex items-center gap-1 text-xs font-bold">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
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
    </div>
  );
}
