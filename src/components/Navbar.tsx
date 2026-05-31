import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Truck, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const onHome = loc.pathname === "/";
  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled || !onHome ? "bg-white/95 shadow-md backdrop-blur" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-brand-red flex items-center justify-center text-white">
            <Truck className="w-5 h-5" />
          </div>
          <span className={cn("text-display font-extrabold text-xl tracking-wide", scrolled || !onHome ? "text-navy" : "text-white")}>
            TRANZEX <span className="text-brand-red">ROUTE</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {[
            { to: "/", label: "Home" },
            { to: "/#about", label: "About" },
            { to: "/#support", label: "Support" },
            { to: "/tracking", label: "Tracking" },
          ].map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={cn(
                "hover:text-brand-red transition-colors",
                scrolled || !onHome ? "text-navy" : "text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button aria-label="Search" className={cn(scrolled || !onHome ? "text-navy" : "text-white")}>
            <Search className="w-5 h-5" />
          </button>
          <button aria-label="Menu" className="w-10 h-10 bg-brand-red text-white rounded-md flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
