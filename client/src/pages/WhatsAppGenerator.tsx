import { useState } from "react";
import { Link } from "wouter";
import { Copy, Check, MessageCircle, Plane, Palmtree, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SEO from "@/components/SEO";

export default function WhatsAppGenerator() {
  const [selectedFlights, setSelectedFlights] = useState<number[]>([]);
  const [selectedHolidays, setSelectedHolidays] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  // Fetch top flights and holidays
  const { data: allFlights, isLoading: loadingFlights } = trpc.flights.list.useQuery();
  const { data: allHolidays, isLoading: loadingHolidays } = trpc.flights.list.useQuery();

  // Take top 10 for selection
  const flights = allFlights?.slice(0, 10) || [];
  const holidays = allHolidays?.slice(0, 10) || [];

  const handleToggleFlight = (id: number) => {
    setSelectedFlights((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleToggleHoliday = (id: number) => {
    setSelectedHolidays((prev) =>
      prev.includes(id) ? prev.filter((hid) => hid !== id) : [...prev, id]
    );
  };

  const handleAutoSelect = () => {
    if (!flights || !holidays) return;

    // Auto-select 60% flights (3 out of 5) and 40% holidays (2 out of 5)
    const flightIds = flights.slice(0, 3).map((f: any) => f.id);
    const holidayIds = holidays.slice(0, 2).map((h: any) => h.id);

    setSelectedFlights(flightIds);
    setSelectedHolidays(holidayIds);
    toast.success("Auto-vybrány 3 letenky + 2 dovolené (60/40 split)");
  };

  const generateMessage = () => {
    if (!flights || !holidays) return "";

    const selectedFlightData = flights.filter((f: any) => selectedFlights.includes(f.id));
    const selectedHolidayData = holidays.filter((h: any) => selectedHolidays.includes(h.id));

    let message = "✈️ *AKČNÍ NABÍDKY DNES!* ✈️\n\n";
    message += "🔥 *Nejlepší letenky a dovolené pro vás:*\n\n";

    // Add flights (60%)
    if (selectedFlightData.length > 0) {
      message += "━━━━━━━━━━━━━━━━\n";
      message += "✈️ *LETENKY*\n";
      message += "━━━━━━━━━━━━━━━━\n\n";

      selectedFlightData.forEach((flight: any, index: number) => {
        message += `${index + 1}. *${flight.toCity}* 🌍\n`;
        message += `💰 Cena: *${flight.price.toLocaleString("cs-CZ")} Kč*\n`;
        message += `📅 Odlet: ${new Date(flight.departureDate).toLocaleDateString("cs-CZ")}\n`;
        if (flight.returnDate) {
          message += `🔙 Návrat: ${new Date(flight.returnDate).toLocaleDateString("cs-CZ")}\n`;
        }
        message += `🔗 https://akcni-letenky.com/letenky-${flight.toCity.toLowerCase().replace(/\s+/g, "-")}\n\n`;
      });
    }

    // Add holidays (40%)
    if (selectedHolidayData.length > 0) {
      message += "━━━━━━━━━━━━━━━━\n";
      message += "🏖️ *DOVOLENÉ*\n";
      message += "━━━━━━━━━━━━━━━━\n\n";

      selectedHolidayData.forEach((holiday: any, index: number) => {
        message += `${index + 1}. *${holiday.toCity}* 🌴\n`;
        message += `💰 Cena: *${holiday.price.toLocaleString("cs-CZ")} Kč*\n`;
        message += `📅 Odlet: ${new Date(holiday.departureDate).toLocaleDateString("cs-CZ")}\n`;
        if (holiday.returnDate) {
          message += `🔙 Návrat: ${new Date(holiday.returnDate).toLocaleDateString("cs-CZ")}\n`;
        }
        message += `🔗 https://www.akcni-letenky.com/letenky-${holiday.toCity.toLowerCase().replace(/\s+/g, "-")}\n\n`;
      });
    }

    message += "━━━━━━━━━━━━━━━━\n";
    message += "⚡ *Rezervujte rychle - nabídky jsou limitované!*\n\n";
    message += "🌐 https://www.akcni-letenky.com\n";

    return message;
  };

  const handleCopy = async () => {
    const message = generateMessage();
    if (!message) {
      toast.error("Vyberte alespoň jednu nabídku");
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Zpráva zkopírována! Vložte ji do WhatsApp skupiny.");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Chyba při kopírování zprávy");
    }
  };

  const totalSelected = selectedFlights.length + selectedHolidays.length;
  const flightPercentage = totalSelected > 0 ? Math.round((selectedFlights.length / totalSelected) * 100) : 0;
  const holidayPercentage = totalSelected > 0 ? Math.round((selectedHolidays.length / totalSelected) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO title="WhatsApp Nabídka | Akční Letenky" description="Sdílejte nabídku letenek přes WhatsApp s přáteli." canonical="https://www.akcni-letenky.com/whatsapp" noindex={true} />
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Akční Letenky" className="h-10" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">WhatsApp Generátor Nabídek</h1>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-7xl">
        {/* Instructions */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <MessageCircle className="w-5 h-5" />
              Jak to funguje?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-700 space-y-2">
            <p>1. Vyberte nabídky (doporučeno: 60% letenky, 40% dovolené)</p>
            <p>2. Zkontrolujte náhled zprávy vpravo</p>
            <p>3. Klikněte "Zkopírovat zprávu"</p>
            <p>4. Vložte zprávu do WhatsApp skupiny: https://chat.whatsapp.com/KG1IqrQclfY6NOgkmgs6ml</p>
          </CardContent>
        </Card>

        {/* Auto-select button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleAutoSelect} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Auto-vybrat (60/40)
            </Button>
            <div className="text-sm text-gray-600">
              Vybráno: {totalSelected} nabídek
              {totalSelected > 0 && (
                <span className="ml-2">
                  ({flightPercentage}% letenky, {holidayPercentage}% dovolené)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Selection */}
          <div className="space-y-6">
            {/* Flights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  Letenky ({selectedFlights.length} vybráno)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingFlights ? (
                  <p className="text-gray-500">Načítání...</p>
                ) : flights && flights.length > 0 ? (
                  flights.map((flight: any) => (
                    <div
                      key={flight.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleToggleFlight(flight.id)}
                    >
                      <Checkbox
                        checked={selectedFlights.includes(flight.id)}
                        onCheckedChange={() => handleToggleFlight(flight.id)}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{flight.toCity}</p>
                        <p className="text-sm text-gray-600">
                          {flight.price.toLocaleString("cs-CZ")} Kč | {new Date(flight.departureDate).toLocaleDateString("cs-CZ")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Žádné letenky k dispozici</p>
                )}
              </CardContent>
            </Card>

            {/* Holidays */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palmtree className="w-5 h-5 text-green-600" />
                  Dovolené ({selectedHolidays.length} vybráno)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingHolidays ? (
                  <p className="text-gray-500">Načítání...</p>
                ) : holidays && holidays.length > 0 ? (
                  holidays.map((holiday: any) => (
                    <div
                      key={holiday.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleToggleHoliday(holiday.id)}
                    >
                      <Checkbox
                        checked={selectedHolidays.includes(holiday.id)}
                        onCheckedChange={() => handleToggleHoliday(holiday.id)}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{holiday.toCity}</p>
                        <p className="text-sm text-gray-600">
                          {holiday.price.toLocaleString("cs-CZ")} Kč | {new Date(holiday.departureDate).toLocaleDateString("cs-CZ")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Žádné dovolené k dispozici</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview & Copy */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Náhled zprávy</span>
                  <Button onClick={handleCopy} className="gap-2" disabled={totalSelected === 0}>
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Zkopírováno!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Zkopírovat zprávu
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalSelected === 0 ? (
                  <p className="text-gray-500 text-center py-8">Vyberte nabídky pro náhled zprávy</p>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">{generateMessage()}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
