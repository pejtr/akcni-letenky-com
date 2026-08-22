import React, { useState } from "react";
import { Sparkles, Video, Copy, Check, Megaphone, Share2, Flame, Layers, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function AdminUgcContentFactory() {
  const [destination, setDestination] = useState("Dubaj");
  const [price, setPrice] = useState("3 490");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const hooks = [
    `🔥 Přestaň scrollovat! Zrovna jsme našli spi zpáteční letenky do destinace ${destination} jen za ${price} Kč!`,
    `🤫 Co vám cestovky tají? Jak ušetřit až 70 % na dovolené v ${destination}...`,
    `✈️ 3 důvody, proč musíte letět do ${destination} ještě tento měsíc za ${price} Kč!`,
    `💡 Návod: Jak rezervovat zpáteční letenky do ${destination} za cenu jednoho nákupu v Lidlu!`,
  ];

  const videoScript = `🎬 VIRÁLNÍ UCG VIDEO REELS / TIKTOK REKLAMA (15 sekund):

[0:00 - 0:03] HOOK:
Visual: Rychlý střih pláže / panoramatu ${destination} s velkým červeným textem "LETENKY ZA ${price} KČ?".
Voiceover: "Jestli chcete letět do ${destination} za méně než ${price} Kč, poslouchejte!"

[0:03 - 0:10] BODY / VALUE:
Visual: Ukázka vyhledávače Akční-Letenky.com na telefonu s označenou akční cenou a odpočtem.
Voiceover: "Našlapali jsme algoritmus na Akční-Letenky.com, který denně hlídá výprodeje aerolinek bez skrytých poplatků."

[0:10 - 0:15] CTA (CALL TO ACTION):
Visual: Kliknutí na tlačítko Zobrazit akce a přesměrování.
Voiceover: "Odkaz je v biu nebo na Akční-Letenky.com, nabídka platí jen do vyprodání kapacit!"`;

  const metaAdCopy = `✈️ AKČNÍ LETENKY DO DESTINACE ${destination} OD ${price} KČ! 🏝️

Chcete vyrazit na pořádnou dovolenou a neutratit majlant? Právě jsme naskladnili zpáteční letenky s garancí nejnižší ceny!

✅ Včetně všech letištních poplatků
✅ Ověřené nabídky přes Pelikán.cz
✅ Rychlá online rezervace

👉 Klikněte na tlačítko níže a ulovte si svoje místo dřív, než se vyprodají:
https://www.akcni-letenky.com/dovolene?destination=${encodeURIComponent(destination)}&ref=ugc-factory`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="container max-w-6xl py-12 pt-28">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>UGC Content & Ad Factory Engine</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                Generátor virálních UGC reklam & obsahu
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Vytvářejte konverzní skripty pro TikTok, Reels, YouTube Shorts a Meta Ads během pár sekund.
              </p>
            </div>
          </div>

          {/* Generator Input Bar */}
          <Card className="mb-8 border-rose-200 shadow-md bg-gradient-to-r from-rose-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-rose-600" />
                Parametry akce pro vygenerování podkladů
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Cílová destinace / Město</label>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Např. Dubaj, Bali, Řím..."
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Akční cena (Kč)</label>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Např. 3 490"
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Assets Tabs */}
          <Tabs defaultValue="hooks" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-slate-200/70 p-1 rounded-2xl">
              <TabsTrigger value="hooks" className="rounded-xl font-bold">
                🔥 Virální háčky (Hooks)
              </TabsTrigger>
              <TabsTrigger value="script" className="rounded-xl font-bold">
                🎬 UGC Video Skript
              </TabsTrigger>
              <TabsTrigger value="meta" className="rounded-xl font-bold">
                📱 Meta Ads Texty
              </TabsTrigger>
            </TabsList>

            {/* Hooks Tab */}
            <TabsContent value="hooks">
              <div className="space-y-4">
                {hooks.map((hook, index) => (
                  <Card key={index} className="border-slate-200 shadow-sm hover:border-rose-300 transition-all">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="text-sm font-semibold text-slate-800 leading-relaxed">
                        {hook}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(hook, `hook-${index}`)}
                        className="shrink-0 rounded-xl"
                      >
                        {copiedIndex === `hook-${index}` ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold">
                            <Check className="w-4 h-4" /> Zkopírováno
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-4 h-4" /> Zkopírovat
                          </span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Script Tab */}
            <TabsContent value="script">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Strukturovaný UGC Video Skript (15s)</CardTitle>
                    <CardDescription>Příprava pro hlasový záznam a vizuální střih</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(videoScript, "script")}
                    className="rounded-xl"
                  >
                    {copiedIndex === "script" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>Zkopírovat skript</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-900 text-slate-100 p-5 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {videoScript}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Meta Ads Tab */}
            <TabsContent value="meta">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Reklamní text pro Facebook & Instagram Ads</CardTitle>
                    <CardDescription>Ověřená struktura s garancemi a affiliate odkazem</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(metaAdCopy, "meta")}
                    className="rounded-xl"
                  >
                    {copiedIndex === "meta" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>Zkopírovat text</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={metaAdCopy}
                    readOnly
                    className="bg-slate-50 font-sans text-sm min-h-[220px] rounded-2xl border-slate-200"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
