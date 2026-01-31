import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Mail, TrendingUp, Users, CheckCircle2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminEmails() {
  const [filterPersona, setFilterPersona] = useState<string | null>(null);

  // Fetch email statistics
  const { data: stats, isLoading: statsLoading } = trpc.emails.getStats.useQuery();

  // Fetch all captured emails
  const { data: emails, isLoading: emailsLoading } = trpc.emails.getAll.useQuery();

  // Export mutations
  const exportCSVMutation = trpc.emails.exportCSV.useQuery(undefined, {
    enabled: false,
  });
  const exportMailchimpMutation = trpc.emails.exportMailchimp.useQuery(undefined, {
    enabled: false,
  });

  // Export handlers
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

  // Filter emails by persona
  const filteredEmails = filterPersona
    ? emails?.filter((e) => e.personaName === filterPersona)
    : emails;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
            <p className="text-gray-600 mt-1">
              Manage captured emails for remarketing campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportMailchimp} className="bg-orange-500 hover:bg-orange-600">
              <Mail className="w-4 h-4 mr-2" />
              Export Mailchimp
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Emails
                </CardTitle>
                <Users className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.last7Days || 0} in last 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  GDPR Consent
                </CardTitle>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.withConsent || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.consentRate || 0}% consent rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Growth Rate
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.growthRate || 0}%</div>
                <p className="text-xs text-gray-500 mt-1">Annualized growth</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Top Persona
                </CardTitle>
                <Filter className="w-4 h-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.byPersona
                    ? Object.entries(stats.byPersona).sort(([, a], [, b]) => b - a)[0]?.[0] ||
                      "N/A"
                    : "N/A"}
                </div>
                <p className="text-xs text-gray-500 mt-1">Most captures</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Persona Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Persona</CardTitle>
            <CardDescription>View emails captured by specific chatbot persona</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterPersona === null ? "default" : "outline"}
                onClick={() => setFilterPersona(null)}
                size="sm"
              >
                All ({emails?.length || 0})
              </Button>
              {stats?.byPersona &&
                Object.entries(stats.byPersona).map(([persona, count]) => (
                  <Button
                    key={persona}
                    variant={filterPersona === persona ? "default" : "outline"}
                    onClick={() => setFilterPersona(persona)}
                    size="sm"
                  >
                    {persona} ({count})
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Email List Table */}
        <Card>
          <CardHeader>
            <CardTitle>Captured Emails</CardTitle>
            <CardDescription>
              {filteredEmails?.length || 0} emails
              {filterPersona && ` from ${filterPersona}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      <TableHead>Persona</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>GDPR</TableHead>
                      <TableHead>Captured</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell className="font-medium">{email.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{email.personaName || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{email.segment || "general"}</Badge>
                        </TableCell>
                        <TableCell>{email.messageCount || 0}</TableCell>
                        <TableCell>{email.lastDestinationMentioned || "-"}</TableCell>
                        <TableCell>
                          {email.lastBudgetMentioned
                            ? `${email.lastBudgetMentioned.toLocaleString()} Kč`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {email.gdprConsent === 1 ? (
                            <Badge className="bg-green-500">Yes</Badge>
                          ) : (
                            <Badge variant="destructive">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {email.capturedAt
                            ? new Date(email.capturedAt).toLocaleDateString("cs-CZ")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No emails captured yet</p>
                <p className="text-sm mt-1">
                  Emails will appear here when users submit them via the chatbot
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
