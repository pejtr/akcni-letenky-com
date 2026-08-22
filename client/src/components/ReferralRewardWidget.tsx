import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ReferralRewardWidget() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://www.akcni-letenky.com/?ref=tajny-klub";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Odkaz byl zkopírován do schránky! Sdílejte s přáteli 🚀");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-purple-400/30 my-6">
      <div className="flex flex-col md:flex-row items-center gap-5 justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-purple-500 text-white font-black px-2.5 py-0.5 text-[10px]">
              <Gift className="w-3 h-3 mr-1" /> ODMAŇUJEME ZA SDÍLENÍ
            </Badge>
            <span className="text-[10px] text-purple-200">Tajný klub cestovatelů</span>
          </div>
          <h3 className="text-lg font-extrabold text-white leading-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-300" />
            Doporučte Akční-Letenky.com a Odemkněte Tajné Chyby v Cenách!
          </h3>
          <p className="text-xs text-purple-100 mt-1 mb-2 leading-relaxed">
            Sdílejte váš unikátní odkaz s přáteli. Za každé 3 přátele, kteří se připojí, získáte přístup k exkluzivním chybám v cenách letenek dříve než ostatní + e-book zdarma!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-white/10 p-2.5 rounded-xl border border-white/15 backdrop-blur-sm w-full md:w-auto">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="bg-transparent text-xs text-purple-200 font-mono border-0 focus:ring-0 px-2 flex-1 md:w-56"
          />
          <Button onClick={handleCopy} size="sm" className="bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shrink-0">
            {copied ? <><Check className="w-3.5 h-3.5 mr-1" /> Zkopírováno</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Zkopírovat</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
