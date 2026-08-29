# Flight Data Audit

Audit zdrojů dat o letech v projektu Akcni-Letenky.com k přechodu na data-driven architekturu.

## Současný stav (Před migrací)

Veškerá současná data o letech jsou hardcoded přímo na frontendu nebo staticky exportovaná z původních návrhů. Aplikace aktuálně nevolá žádné externí API pro získání real-time cen.

| Komponenta / Soubor | Účel | Současný zdroj dat | Formát | Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `client/src/pages/LevneLetenky.tsx` | Hlavní listing letenek | Hardcoded v poli `defaultFlightDeals` | Statický JSON objekt | Neexistuje (je to hardcoded) |
| `client/src/components/TopFlightsThisWeek.tsx` | Carousel nabídek na domovské stránce | Hardcoded `mockDeals` s náhodnými mock cenami | Statické pole | Neexistuje |
| `client/src/components/PelikanPrimaryDeals.tsx` | Primární Pelikán deals na domovské stránce | Hardcoded `deals` | Statický JSON | Neexistuje |
| `client/src/data/destinations.ts` | Navigace do destinací a Hero cards | Hardcoded objekty `cities`, `countries`, `returnFlights` | TypeScript const | Neexistuje |
| `/letenky-do-parize` (Příklad route page) | Statické SEO stránky (např. `NewYorkPage.tsx`, `BaliPage.tsx`) | Hardcoded uvnitř JSX render funkce | Statické JSX | Neexistuje |

## Pelikán XML Schema (Budoucí stav)

Nová architektura bude využívat feed: `https://www.pelikan.cz/gf3/pelijee-cz/calendars/xmlpromo`

Ukázka získané datové struktury z XML:
```xml
<Calendar>
  <CALENDAR_ID>LCC-2026</CALENDAR_ID>
  <URL>https://www.pelikan.cz/akcni-letenka/LCC-2026</URL>
  <IMAGE>https://www.pelikan.cz/web/img/carriers/W6.png</IMAGE>
  <IMAGE_300x300>https://cdn.pelikan.sk/photos/TZL/TZL-300x300.jpg</IMAGE_300x300>
  <PRICE>900</PRICE>
  <TO>Tuzla</TO>
  <FROM>Bratislava</FROM>
  <RETURN_TO>Bratislava</RETURN_TO>
  <RETURN_FROM>Tuzla</RETURN_FROM>
  <AIRLINE>W6</AIRLINE>
  <DEPARTURE_IATA>BTS</DEPARTURE_IATA>
  <DESTINATION_IATA>TZL</DESTINATION_IATA>
  <CITYPAIR_IATA>BTS-TZL</CITYPAIR_IATA>
  <CREATED></CREATED> <!-- Nebo timestamp jako 1489146011945 -->
</Calendar>
```

## Normalizovaná Architektura (Návrh)
Pro odstínění aplikace od specifického XML feedu zavedeme `PelikanXmlProvider` implementující obecný `FlightOfferProvider` interface:

```typescript
interface NormalizedFlightOffer {
  provider: "pelikan_xml" | string;
  externalOfferId: string; // např. 'LCC-2026'
  origin: string; // např. 'BTS'
  destination: string; // např. 'TZL'
  departureDate: string | null;
  returnDate: string | null;
  price: number;
  currency: string;
  deeplink: string; // např. 'https://www.pelikan.cz/akcni-letenka/LCC-2026'
  fetchedAt: number; // Kdy jsme XML stáhli my
  sourceUpdatedAt: number | null; // CREATED timestamp z XML (pokud existuje)
  freshness: "cached" | "live"; // XML je vždy 'cached'
  liveVerified: boolean; // Zda byla cena pingnuta live v době zobrazení
}
```

## Route Pages Audit (Aktuální stav routingu)
Routy typu `/lowcost-all/*` nebo specifické `/letenky-do-parize` jsou aktuálně hardcodované v `App.tsx` na samostatné React komponenty (např. `<Route path="/new-york" component={NewYorkPage} />`). Změna na pattern `/letenky/{origin}/{destination}` je silně žádoucí pro snížení duplicitního kódu a lepší škálování generovaných SEO stránek. Existující statické stránky budou v budoucnu mapovány přes 301 přesměrování.
