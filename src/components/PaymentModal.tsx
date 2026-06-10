import { useState, useRef } from "react";
import { Copy, X, CheckCircle2, Upload, Landmark, Wallet, Mail, ShieldCheck } from "lucide-react";
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
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

                {/* Instruction note */}
                {note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    {note}
                  </div>
                )}

                {/* Proof upload */}
                <ProofUpload
                  proofFile={proofFile}
                  proofPreview={proofPreview}
                  fileRef={fileRef}
                  onChange={handleFileChange}
                  onClear={() => { setProofFile(null); setProofPreview(null); }}
                />

                <button
                  onClick={() => setConfirmOpen(true)}
                  className="w-full bg-success text-white font-bold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> I Have Sent the Payment
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

                {/* Instruction note */}
                {note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    {note}
                  </div>
                )}

                {/* Proof upload */}
                <ProofUpload
                  proofFile={proofFile}
                  proofPreview={proofPreview}
                  fileRef={fileRef}
                  onChange={handleFileChange}
                  onClear={() => { setProofFile(null); setProofPreview(null); }}
                />

                <button
                  onClick={() => setConfirmOpen(true)}
                  className="w-full bg-success text-white font-bold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> I Have Sent the Payment
                </button>
              </div>
            </div>
          )}

          {/* Contact */}
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
              Once your payment has been confirmed you will be notified immediately and your shipment will resume.
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
  fileRef: React.RefObject<HTMLInputElement>;
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
