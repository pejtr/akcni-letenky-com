/**
 * Social Share Panel
 * 
 * Incentivized sharing component - users get a discount code when they share a deal.
 * Tracks shares across platforms and generates unique referral links.
 */

import { useState } from "react";
import { Share2, Facebook, MessageCircle, Link2, Copy, Check, Gift, X, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SocialSharePanelProps {
  destination?: string;
  destinationSlug?: string;
  price?: number;
  pageUrl?: string;
  compact?: boolean; // Compact mode for inline use
}

export default function SocialSharePanel({
  destination,
  destinationSlug,
  price,
  pageUrl,
  compact = false,
}: SocialSharePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const createShare = trpc.socialSharing.createShare.useMutation({
    onSuccess: (data) => {
      setDiscountCode(data.discountCode);
      setShareUrl(data.shareUrl);
    },
  });

  const handleShare = async (platform: string) => {
    // Create share record in backend
    const result = await createShare.mutateAsync({
      platform,
      destination,
      destinationSlug,
      pageUrl: pageUrl || window.location.href,
    });

    const shareText = destination
      ? `Našel/la jsem super levnou letenku do ${destination}${price ? ` za ${price.toLocaleString("cs-CZ")} Kč` : ""}! 🛫✈️`
      : "Podívejte se na super levné letenky! 🛫✈️";

    const url = result.shareUrl || window.location.href;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`,
          "_blank",
          "width=600,height=400"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
          "_blank",
          "width=600,height=400"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`,
          "_blank"
        );
        break;
      case "copy_link":
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Odkaz zkopírován!");
        break;
    }

    toast.success("Díky za sdílení! Získali jste slevový kód 🎉");
  };

  const copyDiscountCode = async () => {
    if (discountCode) {
      await navigator.clipboard.writeText(discountCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success("Slevový kód zkopírován!");
    }
  };

  // Compact trigger button
  if (compact && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        title="Sdílet a získat slevu"
      >
        <Share2 className="w-4 h-4" />
        <span>Sdílet</span>
      </button>
    );
  }

  // Full panel (inline or modal)
  if (!isOpen && !compact) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-[#E91E63] to-[#FF5722] text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all hover:scale-105"
      >
        <Gift className="w-4 h-4" />
        Sdílejte a získejte slevu!
      </button>
    );
  }

  return (
    <div className={compact ? "relative" : "fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"}>
      <div
        className={`bg-white rounded-2xl shadow-2xl ${compact ? "absolute top-full mt-2 right-0 w-80 z-50" : "max-w-sm w-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E91E63] to-[#FF5722] p-4 rounded-t-2xl relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-lg font-bold text-white">Sdílejte a ušetřete!</h3>
              <p className="text-white/80 text-xs">
                Za sdílení získáte unikátní slevový kód
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => handleShare("facebook")}
              className="flex items-center gap-2 bg-[#1877F2] text-white px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[#166FE5] transition-colors"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="flex items-center gap-2 bg-black text-white px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Twitter className="w-4 h-4" />
              X / Twitter
            </button>
            <button
              onClick={() => handleShare("whatsapp")}
              className="flex items-center gap-2 bg-[#25D366] text-white px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[#20BD5A] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={() => handleShare("copy_link")}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              {copied ? "Zkopírováno!" : "Kopírovat"}
            </button>
          </div>

          {/* Discount Code (shown after sharing) */}
          {discountCode && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-dashed border-orange-300 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Váš slevový kód:</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-[#E91E63] tracking-wider font-mono">
                  {discountCode}
                </span>
                <button
                  onClick={copyDiscountCode}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedCode ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Použijte při příštím nákupu pro extra slevu
              </p>
            </div>
          )}

          {/* Incentive text */}
          {!discountCode && (
            <div className="text-center text-xs text-gray-500 mt-2">
              <p>
                🎁 Sdílejte nabídku a okamžitě získáte unikátní slevový kód!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
