import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, Mail, TrendingUp, Users, CheckCircle2, Filter, 
  Flame, Thermometer, Snowflake, RefreshCw, Play, Target,
  Clock, Send, AlertCircle, BarChart3, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function AdminEmails() {
  const [filterPersona, setFilterPersona] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string | null>(null);

  // Fetch email statistics
  const { data: stats, isLoading: statsLoading } = trpc.emails.getStats.useQuery();

  // Fetch all captured emails
  const { data: emails, isLoading: emailsLoading, refetch: refetchEmails } = trpc.emails.getAll.useQuery();

  // Fetch lead score statistics
  const { data: leadStats, isLoading: leadStatsLoading, refetch: refetchLeadStats } = trpc.emails.getLeadScoreStats.useQuery();

  // Fetch email marketing statistics
  const { data: marketingStats, isLoading: marketingStatsLoading, refetch: refetchMarketingStats } = trpc.emails.getMarketingStats.useQuery();

  // Fetch remarketing statistics
  const { data: remarketingStats, isLoading: remarketingStatsLoading, refetch: refetchRemarketingStats } = trpc.emails.getRemarketingStats.useQuery();

  // Mutations
  const recalculateScoresMutation = trpc.emails.recalculateLeadScores.useMutation({
    onSuccess: (data) => {
      toast.success(`Lead scores přepočítány: ${data.updated} aktualizováno, ${data.errors} chyb`);
      refetchEmails();
      refetchLeadStats();
    },
    onError: () => {
      toast.error("Chyba při přepočítávání lead scores");
    },
  });

  const processQueueMutation = trpc.emails.processQueue.useMutation({
    onSuccess: (data) => {
      toast.success(`Email fronta zpracována: ${data.sent} odesláno, ${data.failed} selhalo`);
      refetchMarketingStats();
    },
    onError: () => {
      toast.error("Chyba při zpracování email fronty");
    },
  });

  const processRemarketingMutation = trpc.emails.processRemarketingTriggers.useMutation({
    onSuccess: (data) => {
      toast.success(`Remarketing triggery zpracovány: ${data.triggered} aktivováno, ${data.cancelled} zrušeno`);
      refetchRemarketingStats();
    },
    onError: () => {
      toast.error("Chyba při zpracování remarketing triggerů");
    },
  });

  const markConvertedMutation = trpc.emails.markConverted.useMutation({
    onSuccess: () => {
      toast.success("Uživatel označen jako konvertovaný");
      refetchEmails();
      refetchRemarketingStats();
    },
  });

  const createTriggerMutation = trpc.emails.createManualTrigger.useMutation({
    onSuccess: () => {
      toast.success("Remarketing trigger vytvořen");
      refetchRemarketingStats();
    },
  });

  // Export mutations
  const exportCSVMutation = trpc.emails.exportCSV.useQuery(undefined, { enabled: false });
  const exportMailchimpMutation = trpc.emails.exportMailchimp.useQuery(undefined, { enabled: false });

  const handleExportCSV = async () => {
    const result = await exportCSVMutation.refetch();
    if (result.data) {
      downloadFile(result.data, "email-captures.csv", "text/csv");
    }
  };

  const handleExportMailchimp = async () => {
    const result = await exportMailchimpMutation.refetch();
    if (result.data) {
      downloadFile(result.data, "mailchimp-import.csv", "text/csv");
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter emails
  const filteredEmails = emails?.filter((e) => {
    if (filterPersona && e.personaName !== filterPersona) return false;
    if (filterTier && e.leadTier !== filterTier) return false;
    return true;
  });

  const getTierIcon = (tier: string | null) => {
    switch (tier) {
      case "hot": return <Flame className="w-4 h-4 text-red-500" />;
      case "warm": return <Thermometer className="w-4 h-4 text-orange-500" />;
      default: return <Snowflake className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTierBadge = (tier: string | null, score: number | null) => {
    const tierColors = {
      hot: "bg-red-100 text-red-800 border-red-200",
      warm: "bg-orange-100 text-orange-800 border-orange-200",
      cold: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return (
      <Badge className={tierColors[tier as keyof typeof tierColors] || tierColors.cold}>
        {getTierIcon(tier)}
        <span className="ml-1">{score || 0}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Marketing Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Lead scoring, welcome series, remarketing automation
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={handleExportMailchimp} size="sm" className="bg-orange-500 hover:bg-orange-600">
              <Mail className="w-4 h-4 mr-2" />
              Mailchimp
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">Přehled</TabsTrigger>
            <TabsTrigger value="leads">Lead Scoring</TabsTrigger>
            <TabsTrigger value="campaigns">Kampaně</TabsTrigger>
            <TabsTrigger value="remarketing">Remarketing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Celkem emailů</CardTitle>
                  <Users className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.last7Days || 0} za posledních 7 dní
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Hot Leads</CardTitle>
                  <Flame className="w-4 h-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{leadStats?.hotLeads || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Score 80+ • Připraveni ke konverzi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Odesláno emailů</CardTitle>
                  <Send className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketingStats?.totalSent || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {marketingStats?.openRate || 0}% open rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Remarketing</CardTitle>
                  <Target className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{remarketingStats?.pending || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Čekajících triggerů • {remarketingStats?.conversionRate || 0}% konverze
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Rychlé akce</CardTitle>
                <CardDescription>Manuální spuštění automatizací</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3 flex-wrap">
                <Button 
                  onClick={() => recalculateScoresMutation.mutate()}
                  disabled={recalculateScoresMutation.isPending}
                  variant="outline"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${recalculateScoresMutation.isPending ? 'animate-spin' : ''}`} />
                  Přepočítat Lead Scores
                </Button>
                <Button 
                  onClick={() => processQueueMutation.mutate()}
                  disabled={processQueueMutation.isPending}
                  variant="outline"
                >
                  <Play className={`w-4 h-4 mr-2 ${processQueueMutation.isPending ? 'animate-spin' : ''}`} />
                  Zpracovat Email Frontu ({marketingStats?.queuePending || 0})
                </Button>
                <Button 
                  onClick={() => processRemarketingMutation.mutate()}
                  disabled={processRemarketingMutation.isPending}
                  variant="outline"
                >
                  <Zap className={`w-4 h-4 mr-2 ${processRemarketingMutation.isPending ? 'animate-spin' : ''}`} />
                  Spustit Remarketing ({remarketingStats?.pending || 0})
                </Button>
              </CardContent>
            </Card>

            {/* Email List */}
            <Card>
              <CardHeader>
                <CardTitle>Zachycené emaily</CardTitle>
                <CardDescription>
                  {filteredEmails?.length || 0} emailů
                  {filterPersona && ` • Persona: ${filterPersona}`}
                  {filterTier && ` • Tier: ${filterTier}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-2 flex-wrap mb-4">
                  <Button
                    variant={filterTier === null ? "default" : "outline"}
                    onClick={() => setFilterTier(null)}
                    size="sm"
                  >
                    Všechny
                  </Button>
                  <Button
                    variant={filterTier === "hot" ? "default" : "outline"}
                    onClick={() => setFilterTier("hot")}
                    size="sm"
                    className={filterTier === "hot" ? "bg-red-500" : ""}
                  >
                    <Flame className="w-3 h-3 mr-1" /> Hot ({leadStats?.hotLeads || 0})
                  </Button>
                  <Button
                    variant={filterTier === "warm" ? "default" : "outline"}
                    onClick={() => setFilterTier("warm")}
                    size="sm"
                    className={filterTier === "warm" ? "bg-orange-500" : ""}
                  >
                    <Thermometer className="w-3 h-3 mr-1" /> Warm ({leadStats?.warmLeads || 0})
                  </Button>
                  <Button
                    variant={filterTier === "cold" ? "default" : "outline"}
                    onClick={() => setFilterTier("cold")}
                    size="sm"
                    className={filterTier === "cold" ? "bg-blue-500" : ""}
                  >
                    <Snowflake className="w-3 h-3 mr-1" /> Cold ({leadStats?.coldLeads || 0})
                  </Button>
                </div>

                {emailsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
                    ))}
                  </div>
                ) : filteredEmails && filteredEmails.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Lead Score</TableHead>
                          <TableHead>Persona</TableHead>
                          <TableHead>Destinace</TableHead>
                          <TableHead>Rozpočet</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Akce</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmails.slice(0, 20).map((email) => (
                          <TableRow key={email.id}>
                            <TableCell className="font-medium">{email.email}</TableCell>
                            <TableCell>{getTierBadge(email.leadTier, email.leadScore)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{email.personaName || "N/A"}</Badge>
                            </TableCell>
                            <TableCell>{email.lastDestinationMentioned || "-"}</TableCell>
                            <TableCell>
                              {email.lastBudgetMentioned
                                ? `${email.lastBudgetMentioned.toLocaleString()} Kč`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {email.converted === 1 ? (
                                <Badge className="bg-green-500">Konvertoval</Badge>
                              ) : email.emailSent === 1 ? (
                                <Badge variant="secondary">Email odeslán</Badge>
                              ) : (
                                <Badge variant="outline">Nový</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {email.converted !== 1 && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => markConvertedMutation.mutate({ emailCaptureId: email.id })}
                                      title="Označit jako konvertovaný"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => createTriggerMutation.mutate({ emailCaptureId: email.id })}
                                      title="Vytvořit remarketing trigger"
                                    >
                                      <Target className="w-4 h-4 text-purple-500" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Žádné emaily nenalezeny</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lead Scoring Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Flame className="w-5 h-5" /> Hot Leads
                  </CardTitle>
                  <CardDescription>Score 80-100 • Vysoká pravděpodobnost konverze</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-600">{leadStats?.hotLeads || 0}</div>
                  <p className="text-sm text-red-600 mt-2">
                    Prioritní kontaktování • Personalizované nabídky
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Thermometer className="w-5 h-5" /> Warm Leads
                  </CardTitle>
                  <CardDescription>Score 50-79 • Potřebují nurturing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-orange-600">{leadStats?.warmLeads || 0}</div>
                  <p className="text-sm text-orange-600 mt-2">
                    Email série • Vzdělávací obsah
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Snowflake className="w-5 h-5" /> Cold Leads
                  </CardTitle>
                  <CardDescription>Score 0-49 • Nízká angažovanost</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600">{leadStats?.coldLeads || 0}</div>
                  <p className="text-sm text-blue-600 mt-2">
                    Re-engagement kampaně • Win-back nabídky
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lead Scoring Kritéria</CardTitle>
                <CardDescription>Jak se počítá lead score (0-100 bodů)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700">Engagement (0-25)</h4>
                    <p className="text-sm text-gray-500 mt-1">Počet zpráv v chatbotu</p>
                    <ul className="text-xs text-gray-400 mt-2">
                      <li>10+ zpráv = 25 bodů</li>
                      <li>7-9 zpráv = 20 bodů</li>
                      <li>5-6 zpráv = 15 bodů</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700">Rozpočet (0-25)</h4>
                    <p className="text-sm text-gray-500 mt-1">Zmíněný rozpočet</p>
                    <ul className="text-xs text-gray-400 mt-2">
                      <li>30k+ Kč = 25 bodů</li>
                      <li>15-30k Kč = 18 bodů</li>
                      <li>5-15k Kč = 10 bodů</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700">Destinace (0-20)</h4>
                    <p className="text-sm text-gray-500 mt-1">Typ destinace</p>
                    <ul className="text-xs text-gray-400 mt-2">
                      <li>Premium = 20 bodů</li>
                      <li>Populární = 15 bodů</li>
                      <li>Pláže = 12 bodů</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700">Email (0-20)</h4>
                    <p className="text-sm text-gray-500 mt-1">Email engagement</p>
                    <ul className="text-xs text-gray-400 mt-2">
                      <li>Klik = 15 bodů</li>
                      <li>Otevření = 8 bodů</li>
                      <li>Více interakcí = +5</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700">Čerstvost (0-10)</h4>
                    <p className="text-sm text-gray-500 mt-1">Doba od registrace</p>
                    <ul className="text-xs text-gray-400 mt-2">
                      <li>Dnes = 10 bodů</li>
                      <li>Tento týden = 6 bodů</li>
                      <li>30+ dní = 0 bodů</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Průměrný Lead Score</CardTitle>
                  <CardDescription>Celková kvalita lead databáze</CardDescription>
                </div>
                <Button 
                  onClick={() => recalculateScoresMutation.mutate()}
                  disabled={recalculateScoresMutation.isPending}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${recalculateScoresMutation.isPending ? 'animate-spin' : ''}`} />
                  Přepočítat
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold">{leadStats?.averageScore || 0}</div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-orange-500 to-red-500"
                        style={{ width: `${leadStats?.averageScore || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Cold (0)</span>
                      <span>Warm (50)</span>
                      <span>Hot (100)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Kampaně</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketingStats?.totalCampaigns || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Odesláno</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketingStats?.totalSent || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Open Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketingStats?.openRate || 0}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Click Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketingStats?.clickRate || 0}%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Welcome Email Series</CardTitle>
                <CardDescription>Automatická série 3 emailů po registraci</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Uvítací email + Slevový kód</h4>
                      <p className="text-sm text-gray-500">Ihned po registraci • 5% sleva AKCNI5</p>
                    </div>
                    <Badge className="bg-green-500">Aktivní</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Personalizovaná doporučení</h4>
                      <p className="text-sm text-gray-500">Den 2 • Na základě persony a segmentu</p>
                    </div>
                    <Badge className="bg-blue-500">Aktivní</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Urgency + Social Proof</h4>
                      <p className="text-sm text-gray-500">Den 5 • Sleva brzy vyprší!</p>
                    </div>
                    <Badge className="bg-red-500">Aktivní</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Email Fronta</CardTitle>
                  <CardDescription>Naplánované emaily čekající na odeslání</CardDescription>
                </div>
                <Button 
                  onClick={() => processQueueMutation.mutate()}
                  disabled={processQueueMutation.isPending}
                >
                  <Play className={`w-4 h-4 mr-2 ${processQueueMutation.isPending ? 'animate-spin' : ''}`} />
                  Zpracovat frontu
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">{marketingStats?.queuePending || 0}</div>
                    <p className="text-sm text-yellow-600">Čekající</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-green-500 mb-2" />
                    <div className="text-2xl font-bold text-green-600">{marketingStats?.queueSent || 0}</div>
                    <p className="text-sm text-green-600">Odesláno</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 mx-auto text-red-500 mb-2" />
                    <div className="text-2xl font-bold text-red-600">{marketingStats?.queueFailed || 0}</div>
                    <p className="text-sm text-red-600">Selhalo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Remarketing Tab */}
          <TabsContent value="remarketing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Celkem triggerů</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{remarketingStats?.total || 0}</div>
                </CardContent>
              </Card>
              <Card className="border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-yellow-600">Čekající</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{remarketingStats?.pending || 0}</div>
                </CardContent>
              </Card>
              <Card className="border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-600">Aktivováno</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{remarketingStats?.triggered || 0}</div>
                </CardContent>
              </Card>
              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-600">Konverze</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{remarketingStats?.conversionRate || 0}%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>7-Day Remarketing Trigger</CardTitle>
                <CardDescription>Automatický email po 7 dnech bez konverze</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-800">Remarketing Email - 10% Sleva</h4>
                      <p className="text-sm text-purple-600 mt-1">
                        Automaticky se odešle 7 dní po registraci, pokud uživatel nekonvertoval.
                        Obsahuje speciální kód <strong>VRACIMSE10</strong> s 10% slevou platnou 48 hodin.
                      </p>
                      <div className="flex gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-700">{remarketingStats?.pending || 0}</div>
                          <div className="text-xs text-purple-500">Čeká na odeslání</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-700">{remarketingStats?.triggered || 0}</div>
                          <div className="text-xs text-purple-500">Odesláno</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{remarketingStats?.converted || 0}</div>
                          <div className="text-xs text-green-500">Konvertovalo</div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => processRemarketingMutation.mutate()}
                      disabled={processRemarketingMutation.isPending}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Zap className={`w-4 h-4 mr-2 ${processRemarketingMutation.isPending ? 'animate-spin' : ''}`} />
                      Spustit nyní
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jak to funguje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center p-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Mail className="w-6 h-6 text-orange-500" />
                    </div>
                    <p className="text-sm font-medium">Email zachycen</p>
                    <p className="text-xs text-gray-500">Chatbot popup</p>
                  </div>
                  <div className="text-gray-300">→</div>
                  <div className="flex-1 text-center p-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium">7 dní čekání</p>
                    <p className="text-xs text-gray-500">Trigger naplánován</p>
                  </div>
                  <div className="text-gray-300">→</div>
                  <div className="flex-1 text-center p-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="w-6 h-6 text-purple-500" />
                    </div>
                    <p className="text-sm font-medium">Remarketing email</p>
                    <p className="text-xs text-gray-500">10% sleva, 48h platnost</p>
                  </div>
                  <div className="text-gray-300">→</div>
                  <div className="flex-1 text-center p-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-sm font-medium">Konverze</p>
                    <p className="text-xs text-gray-500">Trigger zrušen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
