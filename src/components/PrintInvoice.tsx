import Barcode from "react-barcode";

export const COMPANY = {
  name: "Tranzex Route Logistics",
  address: "1428 Harbor View Avenue, Manila, Philippines 1000",
  email: "support@tranzexroute.com",
  phone: "+63 (2) 8123 4567",
};

export default function PrintInvoice({ s }: { s: any }) {
  const today = new Date().toLocaleDateString();
  const year = new Date().getFullYear();
  return (
    <div id="print-invoice" className="hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-2xl font-extrabold">T</div>
          <div>
            <div className="text-xl font-extrabold">{COMPANY.name}</div>
            <div className="text-xs">{COMPANY.address}</div>
            <div className="text-xs">{COMPANY.email} · {COMPANY.phone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold">Invoice / Waybill</div>
          <div className="text-xs">Issued: {today}</div>
          {s?.tracking_number && (
            <div className="mt-2">
              <Barcode value={s.tracking_number} height={48} width={1.4} fontSize={12} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-extrabold border-b pb-1 mb-2">SHIPPER</div>
          <div>{s?.sender_name}</div>
          <div>{s?.sender_phone}</div>
          <div>{s?.sender_email}</div>
        </div>
        <div>
          <div className="font-extrabold border-b pb-1 mb-2">CONSIGNEE</div>
          <div>{s?.receiver_name}</div>
          <div>{s?.receiver_phone}</div>
          <div>{s?.receiver_email}</div>
          <div>{s?.receiver_address}</div>
          <div>{s?.receiver_country}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="font-extrabold border-b pb-1 mb-2">PACKAGE DETAILS</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Origin: {s?.origin_label}</div>
          <div>Destination: {s?.destination_label}</div>
          <div>Type: {s?.package_type}</div>
          <div>Weight: {s?.weight}</div>
          <div>Date Sent: {s?.date_sent}</div>
          <div>Expected: {s?.expected_delivery_date}</div>
          <div className="col-span-2">Description: {s?.description}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="font-extrabold border-b pb-1 mb-2">BILLING</div>
        <div>Amount: {Number(s?.amount_due ?? 0).toLocaleString()} pesos</div>
        {s?.payment_mode && <div>Payment Mode: {s.payment_mode}</div>}
      </div>

      {s?.comments && (
        <div className="mb-6">
          <div className="font-extrabold border-b pb-1 mb-2">COMMENTS</div>
          <div className="text-sm">{s.comments}</div>
        </div>
      )}

      <div className="text-xs text-center mt-12 border-t pt-3">© {year} {COMPANY.name}</div>
    </div>
  );
}
