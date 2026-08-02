import React from "react";
import { MessageSquare, Send, Sparkles, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstantAlertBar() {
  const whatsappUrl = "https://chat.whatsapp.com/akcniletenky";
  const telegramUrl = "https://t.me/akcniletenky";

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 my-6 shadow-lg border border-emerald-500/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5 border border-emerald-400/30">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Bleskové upozornění na letenky a dovolené do vašeho telefonu!</span>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              Připojte se k tisícům cestovatelů. Nejvýhodnější chyby v cenách a trháky posíláme zdarma.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold text-xs px-3.5 shadow">
              <MessageSquare className="w-4 h-4 mr-1.5 fill-gray-950" /> WhatsApp Skupina
            </Button>
          </a>
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-3.5 shadow">
              <Send className="w-4 h-4 mr-1.5" /> Telegram Kanál
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
