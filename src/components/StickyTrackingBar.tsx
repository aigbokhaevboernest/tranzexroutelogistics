import { Link } from "react-router-dom";

export default function StickyTrackingBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 h-14 bg-navy-deep text-white z-40 flex items-center print:hidden">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
        <span className="text-display font-bold tracking-wider text-sm md:text-base">Track a Shipment:</span>
        <Link to="/tracking" className="bg-brand-red text-white px-5 py-2 rounded text-sm font-bold tracking-wider hover:opacity-90">
          Tracking →
        </Link>
      </div>
    </div>
  );
}
