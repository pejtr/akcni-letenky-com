/**
 * Exit-Intent Popup Component
 * 
 * Captures users trying to leave the site and shows special offers
 * with WhatsApp community CTA.
 */

import * as React from "react";
import { X, MessageCircle, Plane, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useViewedDestinations } from "@/hooks/useViewedDestinations";

interface ExitIntentPopupProps {
  whatsappLink?: string;
}

export default function ExitIntentPopup({ 
  whatsappLink = "https://chat.whatsapp.com/KG1IqrQclfY6NOgkmgs6ml" 
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [hasShown, setHasShown] = React.useState(false);
  
  // Get personalized offers based on browsing history
  const { getPersonalizedOffers, getPersonalizedMessage } = useViewedDestinations();
  const personalizedOffers = getPersonalizedOffers();
  const personalizedMessage = getPersonalizedMessage();

  React.useEffect(() => {
    // Check if already shown in this session
    const shown = sessionStorage.getItem("exit_popup_shown");
    if (shown) {
      setHasShown(true);
      return;
    }

    let timeOnPage = 0;
    const MIN_TIME_ON_PAGE = 10000; // 10 seconds

    // Track time on page
    const timeInterval = setInterval(() => {
      timeOnPage += 1000;
    }, 1000);

    // Desktop: Mouse leaving viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= 0 &&
        timeOnPage >= MIN_TIME_ON_PAGE &&
        !hasShown
      ) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exit_popup_shown", "true");
      }
    };

    // Mobile: Back button detection (beforeunload)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (timeOnPage >= MIN_TIME_ON_PAGE && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exit_popup_shown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(timeInterval);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send email to backend
    console.log("Email captured:", email);
    alert("Děkujeme! Pošleme vám nejlepší nabídky na email.");
    handleClose();
  };

  if (!isVisible) {
    return null;
  }



  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 text-center">
            <Plane className="w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold mb-2">
              Počkejte! Máme pro vás speciální nabídku
            </h2>
            <p className="text-lg">
              {personalizedMessage}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Urgency Timer */}
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6 flex items-center justify-center gap-2 text-red-600 font-bold">
              <Clock className="w-5 h-5 animate-pulse" />
              <span>Nabídka platí pouze dalších 15 minut!</span>
            </div>

            {/* Personalized Deals */}
            <h3 className="text-xl font-bold mb-4">Nejlepší nabídky pro vás:</h3>
            <div className="space-y-3 mb-6">
              {personalizedOffers.map((deal, index) => (
                <a
                  key={index}
                  href={`https://www.kiwi.com/deep?from=PRG&to=${deal.destination}&affilid=levneletenky`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-lg transition-all group"
                >
                  <img
                    src={deal.image}
                    alt={deal.destination}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg group-hover:text-orange-500 transition-colors">
                      {deal.destination}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        {deal.originalPrice} Kč
                      </span>
                      <span className="text-green-600 font-bold text-sm">
                        {deal.discount}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">od</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {deal.price} Kč
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-bold text-lg">Připojte se k naší WhatsApp komunitě</h4>
                  <p className="text-sm text-gray-600">
                    Získejte exkluzivní nabídky a tipy na cestování
                  </p>
                </div>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Připojit se k WhatsApp skupině
                </Button>
              </a>
            </div>

            {/* Email Capture */}
            <div className="border-t pt-6">
              <h4 className="font-bold mb-2">Nebo nechte email a dostanete slevu 10%</h4>
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="vas@email.cz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  Odeslat
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                Sleva platí na vaši první objednávku
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
