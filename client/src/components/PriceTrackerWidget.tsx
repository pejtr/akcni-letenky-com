import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Sparkles, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface PriceTrackerWidgetProps {
  defaultDestination?: string;
  defaultType?: "flight" | "holiday" | "both";
  defaultMaxPrice?: number;
}

export default function PriceTrackerWidget({
  defaultDestination = "Dubaj",
  defaultType = "both",
  defaultMaxPrice = 5000,
}: PriceTrackerWidgetProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState(defaultDestination);
  const [type, setType] = useState<"flight" | "holiday" | "both">(defaultType);
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice);

  const createMutation = trpc.priceTracker.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Zadejte platnou e-mailovou adresu.");
      return;
    }

    try {
      const res = await createMutation.mutateAsync({
        email,
        phone,
        type,
        destination,
        maxPrice,
      });

      if (res.success) {
        toast.success(`Hlídač cen aktivován pro ${destination} (do ${maxPrice.toLocaleString("cs-CZ")} Kč)! 🚀`);
        setEmail("");
        setPhone("");
      } else {
        toast.error("Nepodařilo se aktivovat hlídače cen.");
      }
    } catch (err: any) {
      toast.error(err.message || "Chyba při registraci hlídače cen.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-400/30 my-6">
      <div className="flex items-center gap-2 mb-2">
        <Badge className="bg-amber-500 text-gray-950 font-bold px-2.5 py-0.5">
          <TrendingDown className="w-3.5 h-3.5 mr-1" /> Hlídač Cen 24/7
        </Badge>
        <span className="text-xs text-blue-200">Bezplatná automatická notifikace</span>
      </div>

      <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
        Sledování cen letenek & dovolených do {destination}
      </h3>
      <p className="text-xs text-blue-100 mt-1 mb-4 leading-relaxed">
        Nastavte si požadovanou cenu. V momentě, kdy cena klesne pod váš limit, pošleme vám bleskové upozornění!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Type Switcher */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-white/10 rounded-xl backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setType("both")}
            className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
              type === "both" ? "bg-amber-500 text-gray-950 shadow" : "text-blue-100 hover:text-white"
            }`}
          >
            Obojí (Vše)
          </button>
          <button
            type="button"
            onClick={() => setType("flight")}
            className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
              type === "flight" ? "bg-amber-500 text-gray-950 shadow" : "text-blue-100 hover:text-white"
            }`}
          >
            ✈️ Letenky
          </button>
          <button
            type="button"
            onClick={() => setType("holiday")}
            className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
              type === "holiday" ? "bg-amber-500 text-gray-950 shadow" : "text-blue-100 hover:text-white"
            }`}
          >
            🏨 Zájezdy & Dovolená
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-blue-200 block mb-1 font-semibold">Cílová Destinace:</label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Např. Dubaj, Bali, Řím..."
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-300 text-xs h-10"
            />
          </div>

          <div>
            <label className="text-[11px] text-blue-200 block mb-1 font-semibold">
              Maximální požadovaná cena: <span className="font-bold text-amber-400">{maxPrice.toLocaleString("cs-CZ")} Kč</span>
            </label>
            <input
              type="range"
              min="1000"
              max="30000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Váš e-mail pro notifikaci..."
            className="bg-white/10 border-white/20 text-white placeholder:text-blue-300 text-xs h-10"
            required
          />
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Tel. číslo (volitelné pro WhatsApp)..."
            className="bg-white/10 border-white/20 text-white placeholder:text-blue-300 text-xs h-10"
          />
        </div>

        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-sm h-11 shadow-lg"
        >
          <Bell className="w-4 h-4 mr-2" />
          {createMutation.isPending ? "Aktivuji..." : "Aktivovat Hlídače Cen ZDARMA ➔"}
        </Button>
      </form>
    </div>
  );
}
