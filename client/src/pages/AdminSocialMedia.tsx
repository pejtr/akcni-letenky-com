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
  Share2,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Zap,
  Image as ImageIcon,
  MessageSquare,
  ThumbsUp,
  Heart,
  Globe,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSocialMedia() {
  const { user, loading: authLoading } = useAuth();

  const [selectedType, setSelectedType] = useState<"flight_deal" | "blog_article">("flight_deal");
  const [selectedFlightId, setSelectedFlightId] = useState<number | undefined>(undefined);
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);

  const [postTitle, setPostTitle] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [postLinkUrl, setPostLinkUrl] = useState("");
  const [targetPlatform, setTargetPlatform] = useState<"both" | "facebook" | "instagram">("both");

  // Fetch connection status
  const { data: connStatus, isLoading: connLoading, refetch: refetchConn } = trpc.socialMedia.testConnection.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  // Fetch flight deals & articles for selection
  const { data: flightsList } = trpc.flights.getAll.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );
  
  const { data: articlesList } = trpc.articles.getAll.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  // Fetch social posts history
  const { data: postsHistory, isLoading: postsLoading, refetch: refetchPosts } = trpc.socialMedia.getPosts.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  // Fetch preview when flight or article changes
  const { data: previewData, isFetching: previewLoading } = trpc.socialMedia.generatePreview.useQuery(
    {
      type: selectedType,
      targetId: selectedFlightId,
      slug: selectedSlug,
    },
    {
      enabled: user?.role === "admin",
    }
  );

  // Populate editor when preview changes
  React.useEffect(() => {
    if (previewData) {
      setPostTitle(previewData.title || "");
      setPostCaption(previewData.caption || "");
      setPostImageUrl(previewData.imageUrl || "");
      setPostLinkUrl(previewData.linkUrl || "");
    }
  }, [previewData]);

  // Mutations
  const createPostMutation = trpc.socialMedia.createPost.useMutation();
  const publishNowMutation = trpc.socialMedia.publishNow.useMutation();
  const triggerDailyMutation = trpc.socialMedia.triggerDailyPost.useMutation();

  const handlePublishNow = async () => {
    try {
      // 1. Create post
      const newPost = await createPostMutation.mutateAsync({
        platform: targetPlatform,
        postType: selectedType,
        title: postTitle,
        caption: postCaption,
        imageUrl: postImageUrl,
        linkUrl: postLinkUrl,
        status: "scheduled",
      });

      // 2. Publish
      const res = await publishNowMutation.mutateAsync({ id: newPost.id });

      if (res.success) {
        toast.success(
          res.isSimulated
            ? "Příspěvek zpracován v SIMULAČNÍM REŽIMU 🎉"
            : "Příspěvek publikován na Facebook a Instagram! 🎉"
        );
      } else {
        toast.error("Chyba při publikování na sociální sítě ⚠️");
      }

      refetchPosts();
    } catch (err: any) {
      toast.error(err.message || "Nepodařilo se publikovat příspěvek.");
    }
  };

  const handleTriggerDaily = async () => {
    try {
      const res = await triggerDailyMutation.mutateAsync();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
      refetchPosts();
    } catch (err: any) {
      toast.error(err.message || "Nepodařilo se vygenerovat příspěvek.");
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
            <p className="text-muted-foreground mb-4">
              Tato stránka je dostupná pouze pro administrátory.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na hlavní stránku
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Navbar */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              Automatizace Sociálních Sítí (FB & IG)
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={connStatus?.mode === "LIVE_GRAPH_API" ? "default" : "secondary"}>
              {connStatus?.mode === "LIVE_GRAPH_API" ? "🟢 Live Meta Graph API" : "⚡ Dry-Run Simulační Režim"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => { refetchConn(); refetchPosts(); }}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Obnovit
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-7xl">
        {/* Banner with Status & Quick Trigger */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                Automatický Denní Plánovač Příspěvků
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Systém každý den automaticky vybere nejvýhodnější akční letenku nebo nový článek, vytvoří chytlavý příspěvek s emodži a hashtagy a publikuje ho na Facebook Page i Instagram.
              </p>
            </div>
            <Button onClick={handleTriggerDaily} disabled={triggerDailyMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
              <Sparkles className="w-4 h-4 mr-2" />
              {triggerDailyMutation.isPending ? "Generuji..." : "Vygenerovat dnešní příspěvek"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Post Generator & Editor */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Generátor & Editor Příspěvků</span>
                  <Badge variant="outline">{selectedType === "flight_deal" ? "Akční Letenka" : "Blogový Článek"}</Badge>
                </CardTitle>
                <CardDescription>
                  Vyberte nabídku nebo článek, upravte text a publikujte jedním kliknutím.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Source Type Switcher */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={selectedType === "flight_deal" ? "default" : "outline"}
                    onClick={() => setSelectedType("flight_deal")}
                    className="w-full justify-center"
                  >
                    ✈️ Akční Letenka
                  </Button>
                  <Button
                    type="button"
                    variant={selectedType === "blog_article" ? "default" : "outline"}
                    onClick={() => setSelectedType("blog_article")}
                    className="w-full justify-center"
                  >
                    📖 Blogový Článek
                  </Button>
                </div>

                {/* Dropdown Selectors */}
                {selectedType === "flight_deal" ? (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                      Vyberte Akční Letenku pro Příspěvek:
                    </label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={selectedFlightId || ""}
                      onChange={(e) => setSelectedFlightId(e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">-- Automaticky nejvýhodnější nabídka --</option>
                      {flightsList?.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.fromCity} ↔ {f.toCity} za {f.price.toLocaleString("cs-CZ")} Kč (-{f.discountPercent}%)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                      Vyberte Blogový Článek pro Příspěvek:
                    </label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={selectedSlug || ""}
                      onChange={(e) => setSelectedSlug(e.target.value || undefined)}
                    >
                      <option value="">-- Vyberte článek --</option>
                      {articlesList?.map((a) => (
                        <option key={a.id} value={a.slug}>
                          {a.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Target Platform */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Cílové Sociální Sítě:
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={targetPlatform === "both" ? "default" : "outline"}
                      onClick={() => setTargetPlatform("both")}
                    >
                      FB & IG Obě Sítě
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={targetPlatform === "facebook" ? "default" : "outline"}
                      onClick={() => setTargetPlatform("facebook")}
                    >
                      Pouze Facebook
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={targetPlatform === "instagram" ? "default" : "outline"}
                      onClick={() => setTargetPlatform("instagram")}
                    >
                      Pouze Instagram
                    </Button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Titulka / Nadpis:</label>
                  <Input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Nadpis příspěvku" />
                </div>

                {/* Caption / Text */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Text Příspěvku (s Emodži & Hashtagy):
                  </label>
                  <Textarea
                    rows={8}
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    placeholder="Text příspěvku..."
                    className="font-mono text-sm"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Počet znaků: {postCaption.length}</span>
                    <span>Automaticky doplněny akční hashtagy</span>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">URL Obrázku:</label>
                  <Input value={postImageUrl} onChange={(e) => setPostImageUrl(e.target.value)} placeholder="https://..." />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    onClick={handlePublishNow}
                    disabled={publishNowMutation.isPending || createPostMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {publishNowMutation.isPending ? "Publikuji..." : "Publikovat na FB a IG"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Mock Previews */}
          <div className="lg:col-span-5 space-y-6">
            {/* Facebook Preview Card */}
            <Card className="border shadow-md">
              <CardHeader className="py-3 bg-gray-50 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <Globe className="w-4 h-4" />
                  Náhled pro Facebook Page
                </div>
                <Badge variant="outline" className="text-xs">Facebook Feed</Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
                    AL
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 leading-tight">Akční Letenky</h4>
                    <span className="text-xs text-gray-500">Právě teď · 🌎</span>
                  </div>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {postCaption || "Zde se zobrazí naformátovaný text příspěvku..."}
                </p>
                {postImageUrl && (
                  <div className="rounded-lg overflow-hidden border bg-gray-100">
                    <img src={postImageUrl} alt="Obrázek" className="w-full h-48 object-cover" />
                  </div>
                )}
                <div className="pt-2 border-t flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-blue-600" /> To se mi líbí</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Komentovat</span>
                  <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Sdílet</span>
                </div>
              </CardContent>
            </Card>

            {/* Instagram Preview Card */}
            <Card className="border shadow-md">
              <CardHeader className="py-3 bg-gray-50 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-2 text-pink-600 font-bold text-sm">
                  <ImageIcon className="w-4 h-4" />
                  Náhled pro Instagram Business
                </div>
                <Badge variant="outline" className="text-xs">Instagram Feed</Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-xs">
                      AL
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 leading-tight">akcni.letenky</h4>
                    <span className="text-[10px] text-gray-500">Oficiální profil</span>
                  </div>
                </div>
                {postImageUrl && (
                  <div className="rounded-lg overflow-hidden border bg-gray-100 aspect-square">
                    <img src={postImageUrl} alt="Obrázek" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <MessageSquare className="w-5 h-5" />
                  <Share2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed line-clamp-6">
                  <span className="font-bold mr-1">akcni.letenky</span>
                  {postCaption || "Zde se zobrazí text..."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section: Published Posts History */}
        <Card className="mt-10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Historie Publikovaných Příspěvků</CardTitle>
              <CardDescription>Přehled všech odeslaných a naplánovaných příspěvků na FB & IG</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchPosts()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Obnovit
            </Button>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">Načítám historii...</div>
            ) : !postsHistory || postsHistory.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Zatím nebyl publikován žádný příspěvek.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Platforma</th>
                      <th className="py-3 px-4">Titulka / Nadpis</th>
                      <th className="py-3 px-4">Stav</th>
                      <th className="py-3 px-4">Datum</th>
                      <th className="py-3 px-4">Detaily API</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {postsHistory.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-bold">#{post.id}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {post.platform}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium max-w-md truncate">
                          {post.title || post.caption.slice(0, 50)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              post.status === "published"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : post.status === "failed"
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }
                          >
                            {post.status === "published" ? "Publikováno" : post.status === "failed" ? "Chyba" : "Naplánováno"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleString("cs-CZ")
                            : post.createdAt
                            ? new Date(post.createdAt).toLocaleString("cs-CZ")
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-gray-500">
                          {post.fbPostId && <div>FB: {post.fbPostId}</div>}
                          {post.igMediaId && <div>IG: {post.igMediaId}</div>}
                          {post.fbError && <div className="text-rose-600">FB Err: {post.fbError}</div>}
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
    </div>
  );
}
