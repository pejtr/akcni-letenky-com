import SEO from "@/components/SEO";
import { ArrowRight, Plane, MapPin, Sun, Waves, TreePine, Heart } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useABTest, trackABTestConversion } from "@/hooks/useABTest";

import InternalLinkingHub from "@/components/InternalLinkingHub";

export default function BaliPage() {
  const { variant: ctaVariant, ctaText } = useABTest({
    name: "cta_button_bali",
    variants: ["zobrazit", "koupit", "zjistit"],
  });

  const handleCTAClick = () => {
    trackABTestConversion("cta_button_bali", ctaVariant);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SEO
        title="Bali: Ostrov bohů"
        description="Levné letenky do Bali. Objevte ráj mezi nebem a zemí – tropické pláže, rýžové terasy a úchvatné chrámy."
        canonical="https://www.akcni-letenky.com/bali"
      />
      <Navigation />

      {/* Hero Section */}
      <section 
        className="relative h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url('https://files.manuscdn.com/user_upload_by_module/session_file/89740521/VwXLLYfFXFqdrhtI.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Bali: Ostrov bohů
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Objevte tropický ráj s chrámovými komplexy, rýžovými terasami a nejkrásnějšími plážemi Asie
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/redirect?url=https://www.pelikan.cz/cs/akce/letenky/bali?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=landing&utm_campaign=bali"
                onClick={handleCTAClick}
                className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E65C00] text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </a>
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-lg">
                <Plane className="w-5 h-5" />
                Od 12 790 Kč
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Bali Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-4 text-[#1a5276]">
            Proč navštívit Bali?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Bali nabízí dokonalou kombinaci kultury, přírody a relaxace
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <TreePine className="w-12 h-12 text-[#FF6B00] mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">Chrámy & kultura</h3>
              <p className="text-gray-600">
                Navštivte ikonické chrámy jako Tanah Lot, Uluwatu nebo Besakih. Zažijte tradiční balijské tance a ceremonie.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Waves className="w-12 h-12 text-[#FF6B00] mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">Pláže & surfing</h3>
              <p className="text-gray-600">
                Seminyak, Nusa Dua, Uluwatu – najděte si svou ideální pláž. Bali je rájem pro surfaře všech úrovní.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Heart className="w-12 h-12 text-[#FF6B00] mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">Wellness & jóga</h3>
              <p className="text-gray-600">
                Ubud je světovým centrem jógy a wellness. Vychutnejte si balijské masáže a meditaci v rýžových terasách.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#1a5276]">
            Objevte krásy Bali
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/89740521/rsnoNdYDlhunFurm.jpg" 
              alt="Bali temple" 
              className="w-full h-64 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
            />
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/89740521/WBJtXaXUdvxtksYS.jpg" 
              alt="Bali beach resort" 
              className="w-full h-64 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
            />
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/89740521/VwXLLYfFXFqdrhtI.jpg" 
              alt="Bali temple architecture" 
              className="w-full h-64 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </section>

      {/* Practical Info */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#1a5276]">
            Praktické informace
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">🛂 Vízum</h3>
              <p className="text-gray-700">
                Vízum při příjezdu (Visa on Arrival) za 35 USD na 30 dnů. Možnost prodloužení o dalších 30 dnů.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">💰 Měna</h3>
              <p className="text-gray-700">
                Indonéská rupie (IDR). 1 000 IDR ≈ 1,5 Kč. Doporučujeme platit v hotovosti, bankomaty jsou všude.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">🌡️ Nejlepší období</h3>
              <p className="text-gray-700">
                Duben–říjen (suchá sezóna, 26–30°C). Listopad–březen je období dešťů, ale stále teplé.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">✈️ Doba letu</h3>
              <p className="text-gray-700">
                Cca 15–18 hodin s přestupem (nejčastěji přes Singapur, Dubaj nebo Dohu). Časový posun +7 hodin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#1a5276]">
            Nejlepší místa na Bali
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">🏝️ Ubud</h3>
              <p className="text-gray-700">
                Kulturní srdce Bali. Rýžové terasy, Opičí les, umělecké galerie, jóga centra a tradiční trhy.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">🏖️ Seminyak</h3>
              <p className="text-gray-700">
                Luxusní pláže, beach clubs, skvělé restaurace a nákupní možnosti. Ideální pro surfing a západ slunce.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">⛰️ Mount Batur</h3>
              <p className="text-gray-700">
                Aktivní sopka (1 717 m). Výstup za úsvitu s nezapomenutelným výhledem na celý ostrov.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">🏛️ Uluwatu</h3>
              <p className="text-gray-700">
                Chrám na útesu nad mořem, tradiční Kecak tanec při západu slunce a skvělé surfařské spoty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Internal Linking Hub */}
      <div className="container max-w-6xl my-8">
        <InternalLinkingHub />
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1a5276] to-[#2874A6] text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">
            Připraveni na dobrodružství na Bali?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Najděte nejlevnější letenky na Bali a začněte plánovat svou cestu do tropického ráje
          </p>
          <a
            href="/redirect?url=https://www.pelikan.cz/cs/akce/letenky/bali?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=landing&utm_campaign=bali"
            onClick={handleCTAClick}
            className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E65C00] text-white font-bold px-10 py-5 rounded-lg transition-all transform hover:scale-105 shadow-xl text-lg"
          >
            {ctaText}
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a5276] text-white py-8">
        <div className="container text-center">
          <p className="opacity-75">
            © 2024 Akční Letenky. Všechna práva vyhrazena.
          </p>
          <p className="text-sm opacity-50 mt-2">
            Nabídky jsou poskytovány partnerem Pelikán.cz
          </p>
        </div>
      </footer>
    </div>
  );
}
