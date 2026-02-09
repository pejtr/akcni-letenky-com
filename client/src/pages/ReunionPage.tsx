import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plane,
  MapPin,
  Calendar,
  Sun,
  Mountain,
  Waves,
  TreePalm,
  Heart,
  ArrowLeft,
  Clock,
  Users,
  Star,
  ChevronRight,
  Globe,
  Thermometer,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";

// CDN images
const IMAGES = {
  hero: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/GYqxknqFHFcMjDRe.jpg",
  beach: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/aMPbwdavOzBTmFuS.jpg",
  volcano: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/ItKLEKDxfUaUjUFy.jpg",
  aerial: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/MMKbzEYJqXkpbkAL.jpg",
  coast: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/mFuilsvsmtfPcmlB.jpeg",
  mountain: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/NduVswpGlpgicelP.jpg",
};

const AFFILIATE_LINK =
  "https://www.kiwi.com/deep?affilid=akcniletenkyakcniletenky&currency=CZK&lang=cs&destination=RUN";

const highlights = [
  {
    icon: Mountain,
    title: "Piton de la Fournaise",
    desc: "Jedna z nejaktivnějších sopek na světě. Dechberoucí lávová pole a měsíční krajina.",
  },
  {
    icon: Waves,
    title: "Tyrkysová laguna",
    desc: "Korálový útes na západním pobřeží chrání průzračnou lagunu ideální pro šnorchlování.",
  },
  {
    icon: TreePalm,
    title: "Tropické pralesy",
    desc: "UNESCO chráněné pralesy s vodopády, kaňony a endemickými druhy rostlin.",
  },
  {
    icon: Sun,
    title: "Kreolská kultura",
    desc: "Francouzský šarm smíchaný s africkou, indickou a čínskou kulturou. Úžasná kuchyně!",
  },
];

const practicalInfo = [
  { label: "Jazyk", value: "Francouzština (EU)" },
  { label: "Měna", value: "Euro (€)" },
  { label: "Vízum", value: "Není potřeba (EU)" },
  { label: "Časový posun", value: "+3 hod. oproti CZ" },
  { label: "Teplota", value: "22–30 °C celoročně" },
  { label: "Nejlepší období", value: "Květen – Listopad" },
];

const flightOptions = [
  {
    from: "Praha (PRG)",
    to: "Réunion (RUN)",
    airline: "Air France",
    price: "8 290",
    type: "S přestupem v Paříži",
    duration: "~14 hod.",
  },
  {
    from: "Paříž (ORY)",
    to: "Réunion (RUN)",
    airline: "Corsair",
    price: "1 790",
    type: "Přímý let",
    duration: "~11 hod.",
  },
];

function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calcTimeLeft() {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    }
    setTimeLeft(calcTimeLeft());
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-red-600 text-white py-2 text-center text-sm font-semibold animate-pulse">
      Akce končí za {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s — Zbývá posledních 5 míst!
    </div>
  );
}

export default function ReunionPage() {
  useEffect(() => {
    document.title = "Letenky na Réunion od 1 790 Kč | Exotický ostrov v Indickém oceánu | Akční Letenky";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Levné letenky na ostrov Réunion od 1 790 Kč. Sopky, pralesy, vodopády a tyrkysové pláže. Přímé lety z Paříže nebo s přestupem z Prahy."
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Urgency Banner */}
      <CountdownBanner />

      {/* Header */}
      <header className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-akcni-letenky.png" alt="Akční Letenky" className="h-9 md:h-10" />
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-[#003087] hover:text-[#001f5c] font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Domů
            </Link>
            <Link
              href="/levne-letenky"
              className="text-xs text-[#003087] hover:text-[#001f5c] font-semibold"
            >
              Levné letenky
            </Link>
            <Link
              href="/blog"
              className="text-xs text-[#003087] hover:text-[#001f5c] font-semibold"
            >
              Blog
            </Link>
          </nav>
          <a
            href={AFFILIATE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#E91E63] hover:bg-[#C2185B] text-white px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cta-btn-animated"
          >
            <Plane className="w-3.5 h-3.5" />
            REZERVOVAT
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img
          src={IMAGES.hero}
          alt="Réunion Island - dramatická sopečná krajina"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto max-w-5xl">
            <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              Exotika od 1 790 Kč
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
              Ostrov Réunion
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl leading-relaxed">
              Sopky, pralesy, vodopády a tyrkysové pláže — kousek Francie uprostřed Indického oceánu.
              Letenky již od <span className="text-[#FFD700] font-bold text-2xl">1 790 Kč</span>!
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={AFFILIATE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E91E63] hover:bg-[#C2185B] text-white px-8 py-3 rounded-full font-bold text-base transition-all hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <Plane className="w-5 h-5" />
                ZOBRAZIT LETENKY
              </a>
              <a
                href="#info"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold text-base transition-all backdrop-blur-sm flex items-center gap-2 border border-white/30"
              >
                <MapPin className="w-5 h-5" />
                Více o destinaci
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="bg-[#003087] text-white py-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#FFD700]">od 1 790 Kč</div>
              <div className="text-xs text-white/70">Zpáteční letenka</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#FFD700]">11 hod.</div>
              <div className="text-xs text-white/70">Přímý let z Paříže</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#FFD700]">25 °C</div>
              <div className="text-xs text-white/70">Průměrná teplota</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#FFD700]">EU</div>
              <div className="text-xs text-white/70">Bez víza, platí Euro</div>
            </div>
          </div>
        </div>
      </section>

      {/* Flight Options */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Letenky na Réunion
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Vyberte si z nejlepších nabídek letů na exotický ostrov Réunion
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {flightOptions.map((flight, i) => (
              <Card
                key={i}
                className="overflow-hidden hover:shadow-xl transition-shadow border-2 hover:border-[#E91E63]/30"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-500">{flight.airline}</span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        flight.type.includes("Přímý")
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {flight.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{flight.from.split(" ")[0]}</div>
                      <div className="text-xs text-gray-500">
                        {flight.from.match(/\(([^)]+)\)/)?.[1]}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-px bg-gray-300 flex-1" />
                      <Plane className="w-4 h-4 text-[#E91E63]" />
                      <div className="h-px bg-gray-300 flex-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">Réunion</div>
                      <div className="text-xs text-gray-500">RUN</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {flight.duration}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">od</div>
                      <div className="text-3xl font-extrabold text-[#E91E63]">
                        {flight.price} <span className="text-lg">Kč</span>
                      </div>
                      <div className="text-xs text-gray-500">zpáteční</div>
                    </div>
                  </div>

                  <a
                    href={AFFILIATE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#E91E63] hover:bg-[#C2185B] text-white text-center py-3 rounded-lg font-bold transition-colors"
                  >
                    ZOBRAZIT TERMÍNY →
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            * Ceny jsou orientační a mohou se lišit dle data a dostupnosti. Ceny zahrnují zpáteční let.
          </p>
        </div>
      </section>

      {/* About Réunion */}
      <section id="info" className="py-16 bg-white">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Proč právě Réunion?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Réunion je ostrov a zároveň zámořský departement Francie, ležící v Indickém oceánu
                asi 200 km jihozápadně od Mauricia. Je jedním z nejvzdálenějších regionů Evropské unie
                — a přitom jedním z nejkrásnějších.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Na ploše pouhých 2 512 km² najdete aktivní sopku Piton de la Fournaise, UNESCO
                chráněné tropické pralesy, dramatické kaňony, vodopády padající stovky metrů a
                tyrkysovou lagunu s korálovým útesem.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Jako součást Francie (a tedy EU) nepotřebujete víza, platíte eurem a máte přístup
                k evropskému standardu infrastruktury — od silnic po zdravotnictví. Kreolská kultura
                přidává exotický nádech, který jinde v Evropě nenajdete.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <img
                src={IMAGES.beach}
                alt="Pláž na Réunionu"
                className="rounded-lg shadow-md w-full h-40 object-cover"
              />
              <img
                src={IMAGES.volcano}
                alt="Sopka Piton de la Fournaise"
                className="rounded-lg shadow-md w-full h-40 object-cover"
              />
              <img
                src={IMAGES.coast}
                alt="Pobřeží Réunionu"
                className="rounded-lg shadow-md w-full h-40 object-cover col-span-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Co vás na Réunionu čeká
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => (
              <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[#E91E63]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <h.icon className="w-7 h-7 text-[#E91E63]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{h.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{h.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Galerie Réunionu
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <img
              src={IMAGES.hero}
              alt="Krajina Réunionu"
              className="rounded-lg shadow-md w-full h-48 md:h-64 object-cover col-span-2 md:col-span-1"
            />
            <img
              src={IMAGES.aerial}
              alt="Letecký pohled na Réunion"
              className="rounded-lg shadow-md w-full h-48 md:h-64 object-cover"
            />
            <img
              src={IMAGES.mountain}
              alt="Hory Réunionu"
              className="rounded-lg shadow-md w-full h-48 md:h-64 object-cover"
            />
            <img
              src={IMAGES.beach}
              alt="Pláž Réunionu"
              className="rounded-lg shadow-md w-full h-48 md:h-64 object-cover"
            />
            <img
              src={IMAGES.coast}
              alt="Pobřeží Réunionu"
              className="rounded-lg shadow-md w-full h-48 md:h-64 object-cover"
            />
            <img
              src={IMAGES.volcano}
              alt="Sopka na Réunionu"
              className="rounded-lg shadow-md w-full h-48 md:h-64 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Practical Info */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Praktické informace
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {practicalInfo.map((info, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-5 shadow-sm flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-[#003087]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  {i === 0 && <Globe className="w-5 h-5 text-[#003087]" />}
                  {i === 1 && <span className="text-lg">€</span>}
                  {i === 2 && <Shield className="w-5 h-5 text-[#003087]" />}
                  {i === 3 && <Clock className="w-5 h-5 text-[#003087]" />}
                  {i === 4 && <Thermometer className="w-5 h-5 text-[#003087]" />}
                  {i === 5 && <Calendar className="w-5 h-5 text-[#003087]" />}
                </div>
                <div>
                  <div className="text-sm text-gray-500">{info.label}</div>
                  <div className="font-bold text-gray-900">{info.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Paris Tip */}
          <div className="mt-10 bg-gradient-to-r from-[#003087] to-[#001f5c] rounded-xl p-6 md:p-8 text-white">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#FFD700]" />
              Tip: Spojte Réunion s Paříží!
            </h3>
            <p className="text-white/80 leading-relaxed">
              Většina letů na Réunion vede přes Paříž. Využijte toho a strávte pár dní
              v Městě světel! Navštivte Eiffelovu věž, Louvre, Montmartre nebo si
              dopřejte pravé francouzské croissanty. Přestup v Paříži může být sám o sobě
              nezapomenutelným zážitkem.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Nečekejte — letenky za tyto ceny rychle mizí!
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Réunion je destinace, kterou musíte zažít. Sopky, pralesy, pláže a kreolská
            kultura — to vše od 1 790 Kč zpáteční.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={AFFILIATE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#E91E63] hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <Plane className="w-5 h-5" />
              REZERVOVAT LETENKY
            </a>
            <Link
              href="/"
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-4 rounded-full font-semibold text-base transition-all backdrop-blur-sm flex items-center justify-center gap-2 border border-white/30"
            >
              <ChevronRight className="w-5 h-5" />
              Další akční letenky
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-white/60 text-sm">
            <Users className="w-4 h-4" />
            <span>Již 847 lidí si tuto nabídku prohlédlo</span>
          </div>
        </div>
      </section>

      {/* Social Proof / Community */}
      <section className="py-12 bg-white">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Přidejte se k naší komunitě cestovatelů
          </h3>
          <p className="text-gray-600 mb-6">
            Více než 60 000 členů sdílí tipy na levné letenky a cestovatelské zážitky
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.facebook.com/groups/akcniletenky"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#1565C0] transition-colors"
            >
              <span className="font-bold">f</span> Akční letenky a cestování
            </a>
            <a
              href="https://www.facebook.com/groups/tourdesvet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#1565C0] transition-colors"
            >
              <span className="font-bold">f</span> Tour De Svět
            </a>
            <a
              href="https://chat.whatsapp.com/KDpuBfwm1Uw2GYc0PJJQXE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#1DA851] transition-colors"
            >
              WhatsApp skupina
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 AKČNÍ-LETENKY.com | Všechna práva vyhrazena
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Ceny jsou orientační a mohou se měnit. Zobrazené ceny zahrnují zpáteční letenku včetně
            všech poplatků a daní.
          </p>
        </div>
      </footer>
    </div>
  );
}
