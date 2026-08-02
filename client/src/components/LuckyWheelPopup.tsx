import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Gift, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";

// Wheel segments with prizes
const WHEEL_SEGMENTS = [
  { label: "500 Kč SLEVA", color: "#f59e0b", textColor: "#1f2937", probability: 0.05 },
  { label: "E-book ZDARMA", color: "#3b82f6", textColor: "#ffffff", probability: 0.25 },
  { label: "Retry 🎡", color: "#6b7280", textColor: "#ffffff", probability: 0.15 },
  { label: "300 Kč SLEVA", color: "#10b981", textColor: "#ffffff", probability: 0.10 },
  { label: "Newsletter TIP", color: "#8b5cf6", textColor: "#ffffff", probability: 0.20 },
  { label: "200 Kč SLEVA", color: "#ef4444", textColor: "#ffffff", probability: 0.10 },
  { label: "Retry 🎡", color: "#6b7280", textColor: "#ffffff", probability: 0.05 },
  { label: "100 Kč SLEVA", color: "#f97316", textColor: "#ffffff", probability: 0.10 },
];

const NUM_SEGMENTS = WHEEL_SEGMENTS.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

function selectPrize(): number {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    cumulative += WHEEL_SEGMENTS[i].probability;
    if (rand < cumulative) return i;
  }
  return 0;
}

interface LuckyWheelPopupProps {
  onClose?: () => void;
}

export default function LuckyWheelPopup({ onClose }: LuckyWheelPopupProps) {
  const [visible, setVisible] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"cta" | "wheel" | "result">("cta");
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Show after 45 seconds OR on exit intent (mouse leaving viewport at top)
    const showPopup = () => {
      if (!dismissed && !sessionStorage.getItem("luckyWheelShown")) {
        setVisible(true);
        sessionStorage.setItem("luckyWheelShown", "1");
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10) showPopup();
    };

    timerRef.current = setTimeout(showPopup, 45000);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [dismissed]);

  const handleSpin = () => {
    if (!email || !email.includes("@")) {
      toast.error("Zadejte platný e-mail pro zahájení točení 🎡");
      return;
    }
    if (spinning) return;

    setPhase("wheel");
    setSpinning(true);
    setResult(null);

    const prizeIndex = selectPrize();
    // Target angle: rotate 8 full rounds + land on prize segment
    const targetAngle = 360 * 8 + (360 - prizeIndex * SEGMENT_ANGLE - SEGMENT_ANGLE / 2);
    setRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setSpinning(false);
      const prize = WHEEL_SEGMENTS[prizeIndex].label;
      setResult(prize);
      setPhase("result");
      toast.success(`🎉 Výhra: ${prize}! Odesíláme vám kód na ${email}`);
    }, 5000);
  };

  const handleClose = () => {
    setVisible(false);
    setDismissed(true);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 text-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-amber-500/40">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Zavřít"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Speciální nabídka jen pro vás</span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">
            🎰 Zatočte Kolem Štěstí!
          </h2>
          <p className="text-xs text-gray-300 mt-1">Vyhrajte slevový kód nebo E-book zdarma!</p>
        </div>

        {/* Wheel */}
        <div className="flex justify-center mb-5 relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-amber-400 drop-shadow-lg" />

          <div
            className="relative w-52 h-52 rounded-full border-4 border-amber-400 shadow-2xl"
            style={{
              transition: spinning ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {WHEEL_SEGMENTS.map((seg, i) => {
                const startAngle = i * SEGMENT_ANGLE - 90;
                const endAngle = startAngle + SEGMENT_ANGLE;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const x1 = 100 + 100 * Math.cos(startRad);
                const y1 = 100 + 100 * Math.sin(startRad);
                const x2 = 100 + 100 * Math.cos(endRad);
                const y2 = 100 + 100 * Math.sin(endRad);
                const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180;
                const textX = 100 + 65 * Math.cos(midAngle);
                const textY = 100 + 65 * Math.sin(midAngle);
                return (
                  <g key={i}>
                    <path
                      d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`}
                      fill={seg.color}
                      stroke="#1f2937"
                      strokeWidth="1"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={seg.textColor}
                      fontSize="8"
                      fontWeight="bold"
                      transform={`rotate(${startAngle + SEGMENT_ANGLE / 2}, ${textX}, ${textY})`}
                      style={{ userSelect: "none" }}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="14" fill="#1f2937" stroke="#f59e0b" strokeWidth="3" />
              <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fill="#f59e0b" fontSize="12">🎡</text>
            </svg>
          </div>
        </div>

        {/* Result or Spin Controls */}
        {phase === "result" && result ? (
          <div className="text-center">
            <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl p-4 mb-4">
              <Gift className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-lg font-extrabold text-amber-300">🎉 Vyhráli jste: {result}</div>
              <div className="text-xs text-gray-300 mt-1">Kód jsme odeslali na váš e-mail <span className="text-amber-300 font-bold">{email}</span></div>
            </div>
            <Button onClick={handleClose} className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold h-10">
              Zobrazit akční letenky a uplatnit slevu ✈️
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Váš e-mail pro získání ceny..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm h-11"
            />
            <Button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-sm h-11 shadow-lg"
            >
              {spinning ? (
                <><RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Točí se...</>
              ) : (
                <>🎰 Zatočit Kolem Štěstí!</>
              )}
            </Button>
            <p className="text-center text-[10px] text-gray-500">
              Jednou denně zdarma. Vaše data nebudeme sdílet s třetími stranami.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
