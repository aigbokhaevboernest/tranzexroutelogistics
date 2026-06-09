import { Link } from "react-router-dom";
import { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh-CN", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "it", label: "Italian" },
  { code: "hi", label: "Hindi" },
];

function translatePage(langCode: string) {
  const select = document.querySelector(
    ".goog-te-combo"
  ) as HTMLSelectElement | null;
  if (!select) return;
  select.value = langCode;
  select.dispatchEvent(new Event("change"));
}

export default function StickyTrackingBar() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(LANGUAGES[0]);

  const handleSelect = (lang: typeof LANGUAGES[0]) => {
    setSelected(lang);
    setOpen(false);
    translatePage(lang.code);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 h-14 bg-navy-deep text-white z-40 flex items-center print:hidden">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between gap-3">

        {/* Language selector — left */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm font-medium transition"
          >
            <Globe className="h-4 w-4" />
            <span>{selected.label}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {open && (
            <div className="absolute bottom-12 left-0 w-48 bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="max-h-72 overflow-y-auto py-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                  >
                    <span>{lang.label}</span>
                    {selected.code === lang.code && (
                      <Check className="h-4 w-4 text-brand-red" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Track label + button — right */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-display font-bold tracking-wider text-sm md:text-base whitespace-nowrap">
            Track a Shipment:
          </span>
          <Link
            to="/tracking"
            className="bg-brand-red text-white px-5 py-2 rounded text-sm font-bold tracking-wider hover:opacity-90 whitespace-nowrap"
          >
            Tracking →
          </Link>
        </div>

      </div>
    </div>
  );
}
