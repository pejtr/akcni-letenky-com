import { useState } from "react";
import { X, Mail, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export default function NewsletterBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  return (
    <div className="fixed top-16 left-0 right-0 bg-gradient-to-r from-[#E91E63] to-[#FF6B35] text-white shadow-lg z-[90] animate-in slide-in-from-top">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left side - Icon + Text */}
          <div className="flex items-center gap-3 flex-1 min-w-[250px]">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Gift className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="font-bold text-sm md:text-base">
                🎁 Získejte exkluzivní slevy až -80%
              </p>
              <p className="text-xs md:text-sm text-white/90">
                Přihlaste se k odběru a buďte první, kdo se dozví o akčních nabídkách
              </p>
            </div>
          </div>

          {/* Right side - Form or Success Message */}
          {isSuccess ? (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Mail className="w-5 h-5" />
              <span className="font-semibold text-sm">✅ Děkujeme! Brzy vám pošleme první nabídky.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                type="email"
                placeholder="váš@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/90 border-none text-black placeholder:text-gray-500 h-10"
                required
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-[#E91E63] hover:bg-gray-100 font-bold whitespace-nowrap h-10 px-6"
              >
                {isSubmitting ? "..." : "Odebírat"}
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
  );
}
