import { useState, useEffect } from "react";
import { X, Mail, Gift, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useNewsletterABTest } from "@/hooks/useNewsletterABTest";

interface NewsletterBarProps {
  isScrolled?: boolean;
}

export default function NewsletterBar({ isScrolled = false }: NewsletterBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const variant = useNewsletterABTest();
  const subscribeEmailMutation = trpc.newsletter.subscribe.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      return;
    }

    setIsSubmitting(true);

    try {
      await subscribeEmailMutation.mutateAsync({ email });
      setIsSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Store in localStorage to not show again for 7 days
    localStorage.setItem("newsletter-bar-closed", Date.now().toString());
  };

  // Check if user closed it within last 7 days
  const closedTimestamp = localStorage.getItem("newsletter-bar-closed");
  if (closedTimestamp) {
    const daysSinceClosed = (Date.now() - parseInt(closedTimestamp)) / (1000 * 60 * 60 * 24);
    if (daysSinceClosed < 7) {
      return null;
    }
  }

  if (!isVisible) {
    return null;
  }

  // Select icon based on variant
  const IconComponent = variant.icon === 'gift' ? Gift : variant.icon === 'sparkles' ? Sparkles : Mail;

  const topClass = isScrolled ? "top-[48px] md:top-[52px]" : "top-[84px] md:top-[88px]";

  return (
    <>
      {/* Spacer to prevent content overlap */}
      <div className="h-[48px] md:h-[44px]" />
      {/* Fixed newsletter bar positioned below the header */}
      <div className={`fixed ${topClass} left-0 right-0 bg-gradient-to-r ${variant.bgGradient} text-white shadow-lg z-40 transition-all duration-300 animate-in slide-in-from-top`}>
        <div className="container py-2.5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left side - Icon + Text */}
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm md:text-base leading-tight flex items-center gap-2">
                  {variant.title}
                  <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-[10px] font-normal">
                    <Users className="w-3 h-3" /> 12 340+ cestovatelů
                  </span>
                </p>
                <p className="text-xs md:text-sm text-white/90 leading-tight">
                  {variant.subtitle}
                </p>
              </div>
            </div>

            {/* Right side - Form or Success Message */}
            {isSuccess ? (
              <div className="flex items-center gap-3 bg-emerald-800/90 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-400/30">
                <span className="font-semibold text-xs md:text-sm">✅ Děkujeme! Váš e-mail byl uložen.</span>
                <a
                  href="https://chat.whatsapp.com/KG1IqrQclfY6NOgkmgs6ml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#1ebd56] text-white font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap transition-transform hover:scale-105"
                >
                  <span>💬 WhatsApp Skupina →</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto sm:max-w-md">
                <Input
                  type="email"
                  placeholder="váš@email.cz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/90 border-none text-black placeholder:text-gray-500 h-9"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-[#E91E63] hover:bg-gray-100 font-bold whitespace-nowrap h-9 px-5"
                >
                  {isSubmitting ? "..." : variant.buttonText}
                </Button>
              </form>
            )}

            {/* Close button */}
            <button
              onClick={handleClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
              aria-label="Zavřít"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
