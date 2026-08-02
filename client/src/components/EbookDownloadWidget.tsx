import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function EbookDownloadWidget() {
  const [email, setEmail] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Zadejte platnou e-mailovou adresu.");
      return;
    }

    setDownloaded(true);
    toast.success("E-book 'Jak na Letenky za Babku' byl úspěšně odeslán na váš e-mail! 📚");
  };

  return (
    <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-amber-400/30 my-6">
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-amber-500 text-gray-950 font-black px-2.5 py-0.5 text-[10px]">
              <Sparkles className="w-3 h-3 mr-1 fill-gray-950" /> E-BOOK ZDARMA (PDF)
            </Badge>
            <span className="text-[10px] text-amber-200">54 stran praktických rad</span>
          </div>
          <h3 className="text-xl font-extrabold text-white leading-tight">
            📘 Jak Cestovat po Světě za Babku & Najít Chyby v Cenách
          </h3>
          <p className="text-xs text-amber-100 mt-1 mb-3 leading-relaxed">
            Stáhněte si kompletního průvodce s 15 tajnými triky, jak kupovat letenky s 50-80% slevou, jak získat upgrade do Business Class zdarma a jak na ubytování za pusu.
          </p>

          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-[11px] text-amber-100">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 15 tajných vyhledávačů chyb v cenách</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Návod na kompenzace až 600 €</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Jak ušetřit na eSIM a roamingu</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Vstupy do salonků zdarma</span>
          </div>
        </div>

        <div className="w-full md:w-72 shrink-0 bg-white/10 p-4 rounded-xl border border-white/15 backdrop-blur-sm">
          {downloaded ? (
            <div className="text-center py-4 space-y-2">
              <BookOpen className="w-10 h-10 text-amber-400 mx-auto" />
              <div className="text-sm font-bold text-amber-300">Stahování zahájeno!</div>
              <p className="text-[11px] text-gray-200">Odkaz pro stažení byl také odeslán na {email}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="text-xs font-bold text-amber-200 block text-center">
                Kam máme e-book poslat?
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Váš e-mail..."
                className="bg-white/10 border-white/20 text-white placeholder:text-amber-200/60 text-xs h-10"
                required
              />
              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs h-10 shadow-lg">
                <Download className="w-4 h-4 mr-1.5" /> Stáhnout E-book ZDARMA ➔
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
