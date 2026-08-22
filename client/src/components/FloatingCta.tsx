import * as React from "react";
import { Plane, TrendingDown } from "lucide-react";

interface FloatingCtaProps {
  pelikanUrl: string;
  onClick: () => void;
  price?: number;
}

export default function FloatingCta({ pelikanUrl, onClick, price }: FloatingCtaProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href={pelikanUrl}
      target="_blank"
      rel="noopener"
      onClick={onClick}
      className="fixed bottom-20 right-4 z-[110] md:hidden flex items-center gap-2 bg-gradient-to-r from-[#E91E63] to-[#FF5722] text-white font-bold px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom zoom-in-95 active:scale-95"
      aria-label="Rezervovat letenky"
    >
      <div className="relative">
        <Plane className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full" />
      </div>
      <span className="text-sm">
        {price ? (
          <span>od {price.toLocaleString("cs-CZ")} Kč</span>
        ) : (
          "REZERVOVAT"
        )}
      </span>
      <TrendingDown className="w-4 h-4" />
    </a>
  );
}