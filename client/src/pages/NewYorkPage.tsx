import SEO from "@/components/SEO";
import { ArrowRight, Plane, MapPin, Building, Theater, ShoppingBag, Camera } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useABTest, trackABTestConversion } from "@/hooks/useABTest";
import InternalLinkingHub from "@/components/InternalLinkingHub";

export default function NewYorkPage() {
  const { variant: ctaVariant, ctaText } = useABTest({
    name: "cta_button_newyork",
    variants: ["zobrazit", "koupit", "zjistit"],
  });

  const handleCTAClick = () => {
    trackABTestConversion("cta_button_newyork", ctaVariant);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SEO
        title="New York | Akční Letenky"
        description="Levné letenky do New Yorku. Zažijte město, které nikdy nespí – socha Svobody, Central Park a Broadway."
        canonical="https://www.akcni-letenky.com/new-york"
      />
      <Navigation />

      {/* Hero Section */}
      <section 
        className="relative h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url('https://files.manuscdn.com/user_upload_by_module/session_file/89740521/tybvDHPSeimwZtcF.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              New York: Město, které nikdy nespí
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Zažijte pulzující energii Big Apple – od Times Square přes Central Park až po Sochu svobody
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/redirect?url=https://www.pelikan.cz/cs/akce/letenky/new-york?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=landing&utm_campaign=newyork"
                onClick={handleCTAClick}
                className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E65C00] text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </a>
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-lg">
                <Plane className="w-5 h-5" />
                Od 9 490 Kč
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why New York Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-4 text-[#1a5276]">
            Proč navštívit New York?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            New York je ikonické město plné nezapomenutelných zážitků
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Building className="w-12 h-12 text-[#FF6B00] mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">Ikonické budovy</h3>
              <p className="text-gray-600">
                Empire State Building, One World Trade Center, Chrysler Building – mrakodrapy, které definují moderní architekturu.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Theater className="w-12 h-12 text-[#FF6B00] mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">Broadway & kultura</h3>
              <p className="text-gray-600">
                Zažijte nejlepší muzikály na Broadwayi, navštivte MoMA, Metropolitan Museum nebo Guggenheim.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <ShoppingBag className="w-12 h-12 text-[#FF6B00] mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">Shopping & gastronomie</h3>
              <p className="text-gray-600">
                Fifth Avenue, SoHo, Brooklyn – nákupní ráj. Ochutnávejte kuchyně z celého světa v nejlepších restauracích.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#1a5276]">
            Objevte krásy New Yorku
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/89740521/MjSHVmyfRfbQxLYD.jpg" 
              alt="Statue of Liberty" 
              className="w-full h-64 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
            />
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/89740521/fTCtfAcIzADzCBKl.jpg" 
              alt="New York attractions" 
              className="w-full h-64 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
            />
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/89740521/tybvDHPSeimwZtcF.jpg" 
              alt="NYC skyline" 
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
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">🛂 Vízum</h3>
              <p className="text-gray-700">
                ESTA (Electronic System for Travel Authorization) za 21 USD, platnost 2 roky. Vyřídíte online do 72 hodin před odletem.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">💰 Měna</h3>
              <p className="text-gray-700">
                Americký dolar (USD). 1 USD ≈ 23 Kč. Kreditní karty přijímány všude, spropitné 15–20% je standard.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">🌡️ Nejlepší období</h3>
              <p className="text-gray-700">
                Duben–červen a září–listopad (15–25°C). Léto je horké a vlhké, zima může být mrazivá (-5 až 5°C).
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">✈️ Doba letu</h3>
              <p className="text-gray-700">
                Přímý let z Prahy trvá cca 9 hodin. Časový posun -6 hodin (východní pobřeží USA).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Attractions */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#1a5276]">
            Nejlepší atrakce v New Yorku
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">🗽 Socha svobody</h3>
              <p className="text-gray-700">
                Symbol Ameriky a svobody. Plavba trajektem na Liberty Island s návštěvou muzea a vyhlídky z koruny.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">🌳 Central Park</h3>
              <p className="text-gray-700">
                Zelená oáza uprostřed Manhattanu. 341 hektarů parků, jezer, mostů a kulturních památek.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">✨ Times Square</h3>
              <p className="text-gray-700">
                Křižovatka světa. Neonové billboardy, Broadway divadla, obchody a restaurace – pulzující srdce NYC.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">🌉 Brooklyn Bridge</h3>
              <p className="text-gray-700">
                Ikonický most spojující Manhattan a Brooklyn. Procházka s nezapomenutelným výhledem na skyline.
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
            Připraveni na dobrodružství v New Yorku?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Najděte nejlevnější letenky do New Yorku a začněte plánovat svou cestu do města, které nikdy nespí
          </p>
          <a
            href="/redirect?url=https://www.pelikan.cz/cs/akce/letenky/new-york?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=landing&utm_campaign=newyork"
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
