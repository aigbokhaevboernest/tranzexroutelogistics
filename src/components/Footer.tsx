import { Link } from "react-router-dom";
import { Truck, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-md bg-brand-red flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-display font-extrabold text-xl">
              TRANZEX <span className="text-brand-red">ROUTE</span>
            </span>
          </div>
          <p className="text-white/70 text-sm">4882 Bolman Court, Springfield, IL 62701, USA</p>
          <div className="flex gap-3 mt-4">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a key={i} href="#" aria-label="social" className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-red flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-display font-bold uppercase tracking-wider mb-4">Useful Links</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/" className="hover:text-brand-red">Home</Link></li>
            <li><a href="/#about" className="hover:text-brand-red">About</a></li>
            <li><a href="/#support" className="hover:text-brand-red">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-display font-bold uppercase tracking-wider mb-4">Tracking</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/tracking" className="hover:text-brand-red">Track Shipment</Link></li>
            <li><Link to="/tracking" className="hover:text-brand-red">Delivery Status</Link></li>
            <li><a href="#" className="hover:text-brand-red">Shipping Rates</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-display font-bold uppercase tracking-wider mb-4">Let Us Help</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="mailto:support@tranzexroute.com" className="hover:text-brand-red">Customer Service</a></li>
            <li><a href="mailto:support@tranzexroute.com" className="hover:text-brand-red">File a Claim</a></li>
            <li><a href="mailto:support@tranzexroute.com" className="hover:text-brand-red">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-white/10 text-center text-white/60 text-xs">
        Copyright © Tranzex Route Logistics | All Rights Reserved
      </div>
    </footer>
  );
}
