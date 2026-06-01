import Barcode from "react-barcode";

export const COMPANY = {
  name: "Tranzex Route Logistics",
  address: "1428 Harbor View Avenue, Manila, Philippines 1000",
  email: "support@tranzexroute.com",
  phone: "+63 (2) 8123 4567",
};

export default function PrintInvoice({ s }: { s: any }) {
  const today = new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const year = new Date().getFullYear();

  return (
    <div id="print-invoice" className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-black text-white flex items-center justify-center text-3xl font-black">T</div>
          <div>
            <div className="text-2xl font-bold uppercase tracking-wider">{COMPANY.name}</div>
            <div className="text-sm text-gray-600 mt-1">{COMPANY.address}</div>
            <div className="text-sm text-gray-600">{COMPANY.email} • {COMPANY.phone}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold uppercase tracking-widest">Invoice / Waybill</div>
          <div className="text-sm mt-1">Issued: {today}</div>
          
          {s?.tracking_number && (
            <div className="mt-4 inline-block p-2 border border-gray-300">
              <Barcode 
                value={s.tracking_number} 
                height={55} 
                width={1.6} 
                fontSize={13} 
                background="#ffffff"
              />
            </div>
          )}
        </div>
      </div>

      {/* Shipper & Consignee */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="font-bold uppercase text-sm tracking-widest border-b pb-1 mb-3">SHIPPER</div>
          <div className="space-y-1 text-sm">
            <div><strong>{s?.sender_name || "—"}</strong></div>
            <div>{s?.sender_phone}</div>
            <div>{s?.sender_email}</div>
          </div>
        </div>

        <div>
          <div className="font-bold uppercase text-sm tracking-widest border-b pb-1 mb-3">CONSIGNEE (RECEIVER)</div>
          <div className="space-y-1 text-sm">
            <div><strong>{s?.receiver_name || "—"}</strong></div>
            <div>{s?.receiver_phone}</div>
            <div>{s?.receiver_email}</div>
            <div>{s?.receiver_address}</div>
            <div>{s?.receiver_country}</div>
          </div>
        </div>
      </div>

      {/* Package Details */}
      <div className="mb-8">
        <div className="font-bold uppercase text-sm tracking-widest border-b pb-1 mb-3">PACKAGE DETAILS</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div><span className="text-gray-600">Origin:</span> {s?.origin_label || "—"}</div>
          <div><span className="text-gray-600">Destination:</span> {s?.destination_label || "—"}</div>
          <div><span className="text-gray-600">Type:</span> {s?.package_type || "—"}</div>
          <div><span className="text-gray-600">Weight:</span> {s?.weight || "—"}</div>
          <div><span className="text-gray-600">Date Sent:</span> {s?.date_sent || "—"}</div>
          <div><span className="text-gray-600">Expected Delivery:</span> {s?.expected_delivery_date ? new Date(s.expected_delivery_date).toLocaleDateString() : "—"}</div>
          
          {s?.description && (
            <div className="col-span-2 mt-2">
              <span className="text-gray-600">Description:</span> {s.description}
            </div>
          )}
        </div>
      </div>

      {/* Billing */}
      <div className="mb-8">
        <div className="font-bold uppercase text-sm tracking-widest border-b pb-1 mb-3">BILLING</div>
        <div className="text-sm space-y-1">
          <div>
            <span className="text-gray-600">Amount Due:</span>{" "}
            <strong>₱{(Number(s?.amount_due ?? 0)).toLocaleString()}</strong>
          </div>
          {s?.payment_mode && (
            <div>
              <span className="text-gray-600">Payment Mode:</span> {s.payment_mode}
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      {s?.comments && (
        <div className="mb-8">
          <div className="font-bold uppercase text-sm tracking-widest border-b pb-1 mb-3">COMMENTS</div>
          <div className="text-sm border-l-4 border-amber-400 pl-4 py-2 bg-amber-50">
            {s.comments}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-8 border-t mt-10">
        This is a computer-generated document and does not require a signature.<br />
        © {year} {COMPANY.name} • For inquiries: {COMPANY.email}
      </div>
    </div>
  );
}
