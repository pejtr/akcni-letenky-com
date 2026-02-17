import { ArrowRight, Plane, MapPin, Sun, Building2, ShoppingBag, Palmtree } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useABTest, trackABTestConversion } from "@/hooks/useABTest";

export default function DubajPage() {
  const { variant: ctaVariant, ctaText } = useABTest({
    name: "cta_button_dubaj",
    variants: ["zobrazit", "koupit", "zjistit"],
  });

  const handleCTAClick = () => {
    trackABTestConversion("cta_button_dubaj", ctaVariant);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section 
        className="relative h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url('https://files.manuscdn.com/user_upload_by_module/session_file/89740521/QZquhRvWuBkeHxqi.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Dubaj: Město budoucnosti
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Zažijte luxus, moderní architekturu a arabskou kulturu v jednom z nejfascinujících měst světa
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/redirect?url=https://www.pelikan.cz/cs/akce/letenky/dubaj?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=landing&utm_campaign=dubaj"
                onClick={handleCTAClick}
                className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E65C00] text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </a>
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-lg">
                <Plane className="w-5 h-5" />
                Od 5 183 Kč
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Dubai Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-4 text-[#1a5276]">
            Proč navštívit Dubaj?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Dubaj je synonymem pro luxus, inovace a nezapomenutelné zážitky
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Building2 className="w-12 h-12 text-[#FF6B00] mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">Burj Khalifa</h3>
              <p className="text-gray-600">
                Navštivte nejvyšší budovu světa (828 m) a užijte si dechberoucí výhled z vyhlídkové plošiny At The Top na 124. patře.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <ShoppingBag className="w-12 h-12 text-[#FF6B00] mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">Dubai Mall</h3>
              <p className="text-gray-600">
                Největší nákupní centrum světa s 1 200 obchody, akvárium, ledová plocha a fontánová show před Burj Khalifa.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Palmtree className="w-12 h-12 text-[#FF6B00] mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-[#1a5276]">Palm Jumeirah</h3>
              <p className="text-gray-600">
                Umělý ostrov ve tvaru palmy s luxusními resorty, plážemi a ikonickým hotelem Atlantis The Palm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#1a5276]">
            Objevte krásy Dubaje
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/89740521/BbUxLOItholLwtVV.jpg" 
              alt="Dubai skyline" 
              className="w-full h-64 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
            />
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/89740521/tGvKuwwQcvLOhYBx.jpeg" 
              alt="Dubai attractions" 
              className="w-full h-64 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
            />
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/89740521/QZquhRvWuBkeHxqi.jpg" 
              alt="Burj Khalifa" 
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
                Čeští občané nepotřebují vízum pro pobyt do 90 dnů. Platný pas musí mít platnost minimálně 6 měsíců.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">💰 Měna</h3>
              <p className="text-gray-700">
                Dirham (AED). 1 AED ≈ 6 Kč. Kreditní karty přijímány všude, směnárny dostupné na každém rohu.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">🌡️ Nejlepší období</h3>
              <p className="text-gray-700">
                Listopad–březen (20–30°C). Léto je velmi horké (40–50°C), ale hotely a nákupní centra jsou klimatizované.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#1a5276]">✈️ Doba letu</h3>
              <p className="text-gray-700">
                Přímý let z Prahy trvá cca 6 hodin. Dubaj je ideální destinace i pro prodloužený víkend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1a5276] to-[#2874A6] text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">
            Připraveni na dobrodružství v Dubaji?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Najděte nejlevnější letenky do Dubaje a začněte plánovat svou cestu do města budoucnosti
          </p>
          <a
            href="/redirect?url=https://www.pelikan.cz/cs/akce/letenky/dubaj?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=landing&utm_campaign=dubaj"
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
