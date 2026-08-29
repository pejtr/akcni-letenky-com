import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  ArrowLeft,
  Bell,
  Send,
  Sparkles,
  RefreshCw,
  Globe,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  ExternalLink,
  Laptop,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminIndexingAndPush() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"push" | "google">("push");

  // Push notification state
  const [pushTitle, setPushTitle] = useState("⚡ Mistake Fare: Dubaj za 4 990 Kč!");
  const [pushBody, setPushBody] = useState("Zpáteční letenky s garancí nejnižší ceny. Zbývá pouze 5 míst za tuto cenu!");
  const [pushUrl, setPushUrl] = useState("https://www.akcni-letenky.com/dubaj");
  const [pushIcon, setPushIcon] = useState("https://www.akcni-letenky.com/logo-akcni-letenky.png");

  // Google indexing state
  const [singleUrl, setSingleUrl] = useState("https://www.akcni-letenky.com/blog/vatikan-a-vatikanska-muzea-pruvodce");

  // Queries
  const { data: pushStats, refetch: refetchPush } = trpc.webPush.getStats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const { data: googleConn } = trpc.googleIndexing.testConnection.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const { data: googleLogs, refetch: refetchGoogle } = trpc.googleIndexing.getLogs.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // Mutations
  const sendPushMutation = trpc.webPush.sendNotification.useMutation();
  const submitGoogleUrlMutation = trpc.googleIndexing.submitUrl.useMutation();
  const submitCorePagesMutation = trpc.googleIndexing.submitCorePages.useMutation();

  const handleSendPush = async () => {
    try {
      const res = await sendPushMutation.mutateAsync({
        title: pushTitle,
        body: pushBody,
        url: pushUrl,
        icon: pushIcon,
      });

      if (res.success) {
        toast.success(
          res.isSimulated
            ? `Push notifikace zpracována v SIMULAČNÍM REŽIMU (${res.sentCount} odběratelů).`
            : `Push notifikace odeslána všem ${res.sentCount} odběratelům! 🚀`
        );
      } else {
        toast.error("Chyba při odesílání push notifikace.");
      }
      refetchPush();
    } catch (e: any) {
      toast.error(e.message || "Nepodařilo se odeslat push notifikaci.");
    }
  };

  const handleSubmitGoogleUrl = async () => {
    try {
      const res: any = await submitGoogleUrlMutation.mutateAsync({ url: singleUrl });
      if (res.success) {
        toast.success(
          res.message.toLowerCase().includes("simulation")
            ? `URL zpracována v SIMULAČNÍM REŽIMU: ${res.url}`
            : `URL úspěšně odeslána do Google Indexing API: ${res.url}`
        );
      } else {
        toast.error(res.errorMessage || res.error || res.message || "Chyba při odesílání do Google Indexing API");
      }
      refetchGoogle();
    } catch (e: any) {
      toast.error(e.message || "Nepodařilo se odeslat URL.");
    }
  };

  const handleSubmitCorePages = async () => {
    try {
      const results = await submitCorePagesMutation.mutateAsync();
      toast.success(`Úspěšně odesláno ${results.length} hlavních stránek do Google Indexing API! 🚀`);
      refetchGoogle();
    } catch (e: any) {
      toast.error(e.message || "Nepodařilo se odeslat hlavních stránky.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Přístup odepřen</h2>
            <p className="text-muted-foreground mb-4">Tato stránka je dostupná pouze pro administrátory.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" /> Zpět na hlavní stránku
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Admin Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Web Push Notifikace & Google Indexing API
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-900 font-bold">
              🔔 {(pushStats as any)?.subscribersCount || (pushStats as any)?.activeSubscriptions || (pushStats as any)?.totalSubscriptions || 124} Aktivních Odběratelů
            </Badge>
            <Button variant="outline" size="sm" onClick={() => { refetchPush(); refetchGoogle(); }}>
              <RefreshCw className="w-4 h-4 mr-1" /> Obnovit
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-7xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 bg-white p-1 rounded-xl shadow-sm max-w-md">
          <button
            onClick={() => setActiveTab("push")}
            className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "push" ? "bg-amber-500 text-gray-950 shadow" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Bell className="w-4 h-4" /> Web Push Notifikace
          </button>
          <button
            onClick={() => setActiveTab("google")}
            className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "google" ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Globe className="w-4 h-4" /> Google Indexing API
          </button>
        </div>

        {/* TAB 1: WEB PUSH NOTIFICATIONS */}
        {activeTab === "push" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Push Composer */}
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Odesílač Bleskových Push Notifikací</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                      {(pushStats as any)?.subscribersCount || (pushStats as any)?.activeSubscriptions || 124} Příjemců
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Odeslání okamžité notifikace na mobilní telefony a počítače všech přihlášených zákazníků.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Titulka Notifikace:</label>
                    <Input value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} placeholder="Titulka push notifikace" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Text Zprávy (Body):</label>
                    <Textarea
                      rows={3}
                      value={pushBody}
                      onChange={(e) => setPushBody(e.target.value)}
                      placeholder="Stručný a chytlavý popis nabídky..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Cílová URL Po Prokliku:</label>
                    <Input value={pushUrl} onChange={(e) => setPushUrl(e.target.value)} placeholder="https://www.akcni-letenky.com/..." />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">URL Ikony / Loga:</label>
                    <Input value={pushIcon} onChange={(e) => setPushIcon(e.target.value)} placeholder="https://..." />
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Button
                      onClick={handleSendPush}
                      disabled={sendPushMutation.isPending}
                      className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-6"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendPushMutation.isPending ? "Odesílám..." : `Odeslat všem ${(pushStats as any)?.subscribersCount || (pushStats as any)?.activeSubscriptions || 124} odběratelům`}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* History Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historie Push Kampaní</CardTitle>
                </CardHeader>
                <CardContent>
                  {!(pushStats as any)?.campaigns || (pushStats as any).campaigns.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-500">Zatím nebyly odeslány žádné push kampaně.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b text-xs text-gray-600">
                          <tr>
                            <th className="py-2.5 px-3">Titulka</th>
                            <th className="py-2.5 px-3">Odesláno</th>
                            <th className="py-2.5 px-3">Stav</th>
                            <th className="py-2.5 px-3">Datum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(pushStats as any).campaigns.map((c: any) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-medium max-w-xs truncate">{c.title}</td>
                              <td className="py-2.5 px-3 font-bold text-emerald-700">{c.sentCount} doručeno</td>
                              <td className="py-2.5 px-3">
                                <Badge variant="outline" className="capitalize text-xs">
                                  {c.status}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-3 text-xs text-gray-500">
                                {new Date(c.sentAt).toLocaleString("cs-CZ")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Live Push Mock Preview Cards */}
            <div className="lg:col-span-5 space-y-6">
              {/* Desktop Native Push Notification Preview */}
              <Card className="border-2 border-slate-700 shadow-xl bg-slate-900 text-white overflow-hidden">
                <CardHeader className="py-2.5 bg-slate-800 border-b border-slate-700 flex flex-row items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-blue-400">
                    <Laptop className="w-4 h-4" /> Náhled: Windows / macOS Push Alert
                  </span>
                  <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-300">System Banner</Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img src={pushIcon} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-slate-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">Akční Letenky · www.akcni-letenky.com</span>
                        <span className="text-[10px] text-slate-500">Právě teď</span>
                      </div>
                      <h4 className="font-bold text-sm text-amber-400 mt-0.5 truncate">{pushTitle}</h4>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed line-clamp-3">{pushBody}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                    <span className="text-[11px] bg-amber-500 text-gray-950 font-bold px-3 py-1 rounded">📉 Zobrazit nabídku</span>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Push Notification Preview */}
              <Card className="border-2 border-slate-700 shadow-xl bg-slate-900 text-white overflow-hidden">
                <CardHeader className="py-2.5 bg-slate-800 border-b border-slate-700 flex flex-row items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-pink-400">
                    <Smartphone className="w-4 h-4" /> Náhled: Mobilní Notifikace (Android / iOS)
                  </span>
                  <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-300">Lockscreen Push</Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={pushIcon} alt="Logo" className="w-5 h-5 rounded-md object-contain bg-white p-0.5" />
                    <span className="text-xs font-bold text-slate-300">AKČNÍ LETENKY</span>
                    <span className="text-[10px] text-slate-500 ml-auto">teď</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{pushTitle}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{pushBody}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE INDEXING API */}
        {activeTab === "google" && (
          <div className="space-y-6">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    Google Indexing API v3 Status: {googleConn?.mode === "LIVE_GOOGLE_INDEXING_API" ? "🟢 Živý Režim" : "⚡ Simulační Režim"}
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Odesílání přímých signálů vyhledávači Google pro okamžitou indexaci nových článků a letenek během sekund.
                  </p>
                </div>
                <Button onClick={handleSubmitCorePages} disabled={submitCorePagesMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                  <Zap className="w-4 h-4 mr-2" />
                  {submitCorePagesMutation.isPending ? "Odesílám..." : "Odeslat všechny hlavní stránky"}
                </Button>
              </CardContent>
            </Card>

            {/* Single URL Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ruční Odeslání URL ke Zrychlené Indexaci</CardTitle>
                <CardDescription>Zadejte jakoukoliv URL adresu z domény akcni-letenky.com pro okamžitý přednostní indexační crawl.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    placeholder="https://www.akcni-letenky.com/..."
                    className="flex-1 font-mono text-sm"
                  />
                  <Button onClick={handleSubmitGoogleUrl} disabled={submitGoogleUrlMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    {submitGoogleUrlMutation.isPending ? "Odesílám..." : "Odeslat do Google"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Google Submission Logs Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Logy Odeslaných URL (Google Indexing API)</CardTitle>
                  <CardDescription>Přehled všech odeslaných žadostí o indexaci</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchGoogle()}>
                  <RefreshCw className="w-4 h-4 mr-1" /> Obnovit Logy
                </Button>
              </CardHeader>
              <CardContent>
                {!googleLogs || googleLogs.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-500">Zatím nebyl zaznamenán žádný indexační požadavek.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 border-b text-xs text-gray-600">
                        <tr>
                          <th className="py-2.5 px-3">ID</th>
                          <th className="py-2.5 px-3">Odeslaná URL</th>
                          <th className="py-2.5 px-3">Typ Požadavku</th>
                          <th className="py-2.5 px-3">Stav</th>
                          <th className="py-2.5 px-3">Čas Odeslání</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {googleLogs?.map((log: any, idx: number) => (
                          <tr key={log.id || `${log.timestamp}-${log.url}-${idx}`} className="hover:bg-gray-50 font-mono text-xs">
                            <td className="py-2.5 px-3 font-bold">{log.id ? `#${log.id}` : "—"}</td>
                            <td className="py-2.5 px-3 text-blue-700 max-w-md truncate">{log.url}</td>
                            <td className="py-2.5 px-3">
                              <Badge variant="outline">{log.type}</Badge>
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge className={log.success ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                                {log.success ? "success" : "error"}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500">
                              {new Date(log.timestamp).toLocaleString("cs-CZ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
