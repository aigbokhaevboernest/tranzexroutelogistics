import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGO_URL =
  "https://nzideivdechbxhepmlvz.supabase.co/storage/v1/object/public/shipment-assets/Tranzexroute.PNG";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/#about", label: "About" },
  { to: "/#support", label: "Support" },
  { to: "/tracking", label: "Tracking" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname, loc.hash]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <header
      className="fixed top-0 inset-x-0 z-50 shadow-md"
      style={{ backgroundColor: "#2F3742" }}
    >
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="Tranzex Route" className="h-8 w-auto object-contain" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="text-white hover:text-brand-red transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden w-10 h-10 bg-brand-red text-white rounded-md flex items-center justify-center"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-0 top-16 z-40 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
        <nav className="relative bg-white border-t border-border shadow-xl">
          <ul className="flex flex-col">
            {LINKS.map((l) => (
              <li key={l.label} className="border-b border-border">
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block px-5 py-4 text-navy font-semibold hover:bg-secondary hover:text-brand-red"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
