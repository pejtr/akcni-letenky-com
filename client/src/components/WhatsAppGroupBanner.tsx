import { useState } from "react";
import { X } from "lucide-react";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/KG1IqrQclfY6NOgkmgs6ml";

export default function WhatsAppGroupBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] py-10 md:py-14">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-8 text-6xl">✈️</div>
        <div className="absolute top-12 right-16 text-5xl">🌍</div>
        <div className="absolute bottom-6 left-1/4 text-4xl">🏖️</div>
        <div className="absolute bottom-4 right-1/3 text-5xl">🎒</div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors z-10"
        aria-label="Zavřít banner"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="container max-w-4xl relative z-[1]">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* WhatsApp icon */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 32 32" className="w-12 h-12 md:w-14 md:h-14" fill="#25D366">
                <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.914 15.914 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.32 22.598c-.39 1.1-1.932 2.014-3.168 2.28-.846.18-1.95.324-5.67-1.218-4.762-1.972-7.826-6.81-8.064-7.126-.23-.316-1.932-2.572-1.932-4.904 0-2.332 1.222-3.478 1.656-3.952.434-.474.948-.592 1.264-.592.316 0 .632.002.908.016.292.014.682-.11 1.068.814.39.938 1.328 3.27 1.446 3.508.118.236.196.512.04.828-.158.316-.236.514-.474.79-.236.276-.498.618-.712.828-.236.236-.484.492-.208.966.276.474 1.228 2.024 2.636 3.278 1.81 1.612 3.336 2.112 3.81 2.348.474.236.75.198 1.026-.118.276-.316 1.184-1.382 1.5-1.856.316-.474.632-.394 1.066-.236.434.158 2.764 1.304 3.238 1.54.474.236.79.354.908.552.118.196.118 1.146-.272 2.254z"/>
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Denní akční nabídky přímo na WhatsApp! 📲
            </h2>
            <p className="text-white/90 text-base md:text-lg mb-1">
              Připojte se k naší skupině a dostávejte <strong>každý den</strong> ty nejlepší slevy na letenky a dovolené.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3 mb-4">
              <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                ✈️ Letenky se slevou až 60%
              </span>
              <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                🏖️ Last minute dovolené
              </span>
              <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                🔔 Denní aktualizace
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <a
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-[#075E54] font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
            >
              <svg viewBox="0 0 32 32" className="w-6 h-6 flex-shrink-0" fill="#25D366">
                <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.914 15.914 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.32 22.598c-.39 1.1-1.932 2.014-3.168 2.28-.846.18-1.95.324-5.67-1.218-4.762-1.972-7.826-6.81-8.064-7.126-.23-.316-1.932-2.572-1.932-4.904 0-2.332 1.222-3.478 1.656-3.952.434-.474.948-.592 1.264-.592.316 0 .632.002.908.016.292.014.682-.11 1.068.814.39.938 1.328 3.27 1.446 3.508.118.236.196.512.04.828-.158.316-.236.514-.474.79-.236.276-.498.618-.712.828-.236.236-.484.492-.208.966.276.474 1.228 2.024 2.636 3.278 1.81 1.612 3.336 2.112 3.81 2.348.474.236.75.198 1.026-.118.276-.316 1.184-1.382 1.5-1.856.316-.474.632-.394 1.066-.236.434.158 2.764 1.304 3.238 1.54.474.236.79.354.908.552.118.196.118 1.146-.272 2.254z"/>
              </svg>
              <span>Připojit se ZDARMA</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <p className="text-white/70 text-xs text-center mt-2">
              Žádný spam. Pouze nejlepší nabídky.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
