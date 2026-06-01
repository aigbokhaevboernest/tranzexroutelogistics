import Barcode from "react-barcode";

export const COMPANY = {
  name: "Tranzex Route Logistics",
  address: "1428 Harbor View Avenue, Manila, Philippines 1000",
  email: "support@tranzexroute.com",
  phone: "+63 (2) 8123 4567",
};

function PrintInvoice({ shipment }: { shipment: Shipment }) {
  const today = new Date().toLocaleDateString();
  return (
    <div id="print-invoice" className="hidden print:block text-black">
      <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black text-white grid place-items-center font-extrabold">T</div>
            <div className="text-2xl font-extrabold uppercase tracking-wider">{COMPANY.name}</div>
          </div>
          <div className="text-xs mt-2 leading-snug">
            {COMPANY.address}<br />
            {COMPANY.email} · {COMPANY.phone}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-gray-600">Invoice / Waybill</div>
          <div className="text-xs">Issued: {today}</div>
          <div className="mt-2">
            <Barcode value={shipment.tracking_number} height={48} width={1.4} fontSize={12} background="#ffffff" />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-700 mb-5 leading-relaxed">
        This document confirms the shipment record held by {COMPANY.name}. It serves as a proof-of-shipment
        waybill and itemized invoice for the consignment described below. Please retain a copy for
        customs clearance, billing reconciliation, and pickup verification. For any discrepancy contact
        our support team at {COMPANY.email}.
      </p>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest border-b border-black pb-1 mb-2">Shipper</div>
          <InvoiceRow k="Name" v={shipment.sender_name} />
          <InvoiceRow k="Phone" v={shipment.sender_phone} />
          <InvoiceRow k="Email" v={shipment.sender_email} />
        </div>
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest border-b border-black pb-1 mb-2">Consignee</div>
          <InvoiceRow k="Name" v={shipment.receiver_name} />
          <InvoiceRow k="Phone" v={shipment.receiver_phone} />
          <InvoiceRow k="Email" v={shipment.receiver_email} />
          <InvoiceRow k="Address" v={shipment.receiver_address} />
          <InvoiceRow k="Country" v={shipment.receiver_country} />
        </div>
      </div>

      <div className="mb-6">
        <div className="text-xs font-extrabold uppercase tracking-widest border-b border-black pb-1 mb-2">Package Details</div>
        <div className="grid grid-cols-2 gap-x-6">
          <InvoiceRow k="Tracking #" v={shipment.tracking_number} />
          <InvoiceRow k="Type" v={shipment.package_type} />
          <InvoiceRow k="Weight" v={shipment.weight} />
          <InvoiceRow k="Date Sent" v={shipment.date_sent} />
          <InvoiceRow k="Expected Delivery" v={shipment.expected_delivery_date ? new Date(shipment.expected_delivery_date).toLocaleDateString() : null} />
          <InvoiceRow k="Status" v={shipment.status} />
        </div>
        <InvoiceRow k="Description" v={shipment.description} />
      </div>

      <div className="mb-6">
        <div className="text-xs font-extrabold uppercase tracking-widest border-b border-black pb-1 mb-2">Billing</div>
        <InvoiceRow k="Amount Due" v={`${(shipment.amount_due ?? 0).toLocaleString()} pesos`} />
        <InvoiceRow k="Payment Mode" v={shipment.payment_mode} />
      </div>

      {shipment.comments && (
        <div className="mb-6">
          <div className="text-xs font-extrabold uppercase tracking-widest border-b border-black pb-1 mb-2">Comments</div>
          <p className="text-sm">{shipment.comments}</p>
        </div>
      )}

      <div className="text-[10px] text-gray-600 border-t pt-3 mt-8">
        This invoice is generated electronically and is valid without signature. © {new Date().getFullYear()} {COMPANY.name}.
      </div>
    </div>
  );
}
