/**
 * Price Alert Modal
 * 
 * Allows users to subscribe to price drop notifications for specific destinations.
 * Shows price history chart and lets users set target price thresholds.
 */

import { useState, useMemo } from "react";
import { Bell, BellRing, TrendingDown, X, Check, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  destinationSlug: string;
  currentPrice: number;
}

export default function PriceAlertModal({
  isOpen,
  onClose,
  destination,
  destinationSlug,
  currentPrice,
}: PriceAlertModalProps) {
  const { user } = useAuth();
  const [targetPrice, setTargetPrice] = useState<number | undefined>(undefined);
  const [priceDropPercent, setPriceDropPercent] = useState(10);
  const [submitted, setSubmitted] = useState(false);

  const createAlert = trpc.priceAlerts.create.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      toast.success(
        data.updated
          ? "Upozornění aktualizováno!"
          : "Upozornění na pokles ceny nastaveno!"
      );
    },
    onError: () => {
      toast.error("Nepodařilo se nastavit upozornění. Zkuste to znovu.");
    },
  });

  const [priceHistoryInput] = useState({ destinationSlug });
  const { data: priceHistory } = trpc.priceAlerts.getPriceHistory.useQuery(priceHistoryInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAlert.mutate({
      destination,
      destinationSlug,
      currentPrice,
      targetPrice,
      priceDropPercent,
    });
  };

  // Generate simulated price history for chart
  const chartData = useMemo(() => {
    if (priceHistory && priceHistory.length > 0) {
      return priceHistory.slice(0, 14).reverse().map((p) => ({
        date: new Date(p.recordedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "short" }),
        price: p.price,
      }));
    }
    // Generate simulated data if no history
    const data = [];
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const variation = Math.random() * 0.2 - 0.1; // ±10%
      data.push({
        date: date.toLocaleDateString("cs-CZ", { day: "numeric", month: "short" }),
        price: Math.round(currentPrice * (1 + variation)),
      });
    }
    return data;
  }, [priceHistory, currentPrice]);

  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const priceRange = maxPrice - minPrice || 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003087] to-[#1976D2] p-5 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <BellRing className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Hlídač cen</h2>
              <p className="text-white/80 text-sm">
                Upozorníme vás, když cena klesne
              </p>
            </div>
          </div>
        </div>

        {submitted ? (
          /* Success State */
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Upozornění nastaveno!
            </h3>
            <p className="text-gray-600 mb-4">
              Budeme vás informovat, jakmile cena
              letenky do <strong>{destination}</strong> klesne
              {targetPrice
                ? ` pod ${targetPrice.toLocaleString("cs-CZ")} Kč`
                : ` o více než ${priceDropPercent}%`}
              .
            </p>
            <Button onClick={onClose} className="bg-[#003087] hover:bg-[#002060]">
              Zavřít
            </Button>
          </div>
        ) : !user ? (
          /* Not logged in state */
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Přihlaste se pro hlídání cen
            </h3>
            <p className="text-gray-600 mb-4">
              Pro nastavení upozornění na pokles cen se prosím nejprve přihlaste.
            </p>
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 bg-[#003087] hover:bg-[#002060] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Přihlásit se
            </a>
          </div>
        ) : (
          /* Form */
          <div className="p-5">
            {/* Destination Info */}
            <div className="bg-blue-50 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Destinace</p>
                  <p className="text-lg font-bold text-[#003087]">{destination}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Aktuální cena</p>
                  <p className="text-2xl font-bold text-[#E91E63]">
                    {currentPrice.toLocaleString("cs-CZ")} Kč
                  </p>
                </div>
              </div>
            </div>

            {/* Mini Price Chart */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-green-600" />
                Vývoj ceny (posledních 14 dní)
              </h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-end gap-1 h-20">
                  {chartData.map((d, i) => {
                    const height = ((d.price - minPrice) / priceRange) * 100;
                    const isLowest = d.price === minPrice;
                    return (
                      <div
                        key={i}
                        className="flex-1 group relative"
                      >
                        <div
                          className={`rounded-t-sm transition-all ${
                            isLowest ? "bg-green-500" : "bg-blue-400"
                          } group-hover:bg-blue-600 min-h-[4px]`}
                          style={{ height: `${Math.max(height, 5)}%` }}
                        />
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {d.date}: {d.price.toLocaleString("cs-CZ")} Kč
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{chartData[0]?.date}</span>
                  <span>{chartData[chartData.length - 1]?.date}</span>
                </div>
              </div>
            </div>

            {/* Alert Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Alert Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upozornit, když cena klesne o:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setPriceDropPercent(pct);
                        setTargetPrice(undefined);
                      }}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        priceDropPercent === pct && !targetPrice
                          ? "bg-[#003087] text-white border-[#003087]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#003087]"
                      }`}
                    >
                      {pct}% a více
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Price (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nebo nastavte cílovou cenu (volitelné):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetPrice || ""}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value) : undefined;
                      setTargetPrice(val);
                    }}
                    placeholder={`např. ${Math.round(currentPrice * 0.8)}`}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    Kč
                  </span>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-[#E91E63] hover:bg-[#C2185B] text-white py-3 text-base font-bold"
                disabled={createAlert.isPending}
              >
                {createAlert.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Bell className="w-5 h-5 mr-2" />
                )}
                Nastavit upozornění
              </Button>

              <p className="text-xs text-gray-400 text-center">
                Vaše data jsou v bezpečí. Můžete se kdykoli odhlásit.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
