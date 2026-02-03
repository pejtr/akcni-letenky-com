import { useState } from "react";
import { X } from "lucide-react";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/KG1IqrQclfY6NOgkmgs6ml";

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show tooltip after 10 seconds
  useState(() => {
    const timer = setTimeout(() => {
      if (!dismissed) setShowTooltip(true);
    }, 10000);
    return () => clearTimeout(timer);
  });

  const handleClick = () => {
    // Track click for analytics
    window.open(WHATSAPP_GROUP_URL, "_blank");
  };

  return (
    <div className="fixed bottom-24 left-4 z-40 flex items-end gap-3">
      {/* Tooltip/CTA bubble */}
      {showTooltip && !dismissed && (
        <div className="animate-in slide-in-from-left-5 fade-in duration-300 bg-white rounded-2xl shadow-xl p-4 max-w-[280px] border border-gray-100 relative">
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔥</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Připoj se k 500+ cestovatelům!
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Exkluzivní slevy a last minute nabídky přímo do WhatsAppu
              </p>
              <button
                onClick={handleClick}
                className="mt-2 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Připojit se ZDARMA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main WhatsApp button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => !dismissed && setShowTooltip(true)}
        className="group bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Připojit se k WhatsApp skupině"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        
        {/* Pulse animation */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-bold items-center justify-center">!</span>
        </span>
      </button>
    </div>
  );
}
