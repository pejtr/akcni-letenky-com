# Route Migration & 301 Redirect Mapping Report

Tento report analyzuje současnou strukturu URL adres a navrhuje bezpečnou migrační architekturu na univerzální pattern `/letenky/{origin}/{destination}` bez ztráty SEO indexace a bez vzniku redirect loops.

---

## 1. Současný stav URL architektur

Aktuálně se v projektu Akcni-Letenky.com vyskytují 4 různé styly URL struktur:

1. **Short root slugs (Special pages):**
   - `/dubaj`
   - `/bali`
   - `/new-york`
   - `/reunion`
   - `/pariz`, `/rim`, `/londyn`, `/barcelona`

2. **City SEO landing pages:**
   - `/letenky-{city}` (např. `/letenky-pariz`, `/letenky-londyn`, `/letenky-rim`)

3. **Country SEO landing pages:**
   - `/letenky-do-{country}` (např. `/letenky-do-italie`, `/letenky-do-spanelska`)

4. **Legacy WordPress / Lowcost patterny:**
   - `/lowcost-all/{origin}-{destination}`
   - `/lowcost-cz/{destination}`

---

## 2. Cílová architektura: `/letenky/{origin}/{destination}`

Dlouhodobým cílem je konsolidovat všechny specifické stránky městských párů pod čistou RESTful a SEO-optimalizovanou routu:

```text
/letenky/{origin}/{destination}
```

Příklady:
- `/letenky/praha/pariz` (nebo `/letenky/prg/cdg`)
- `/letenky/praha/dubaj` (nebo `/letenky/prg/dxb`)
- `/letenky/viden/rim`
- `/letenky/krakov/londyn`

Výhody:
- **Škálovatelnost:** Dynamické renderování desítek tisíc párů letišť z Pelikán XML feedu bez nutnosti ručně tvořit JSX komponenty.
- **Hierarchie pro Google:** Jasná breadcrumb struktura: `Domů > Letenky > Z Prahy > Do Paříže`.
- **Deduplikace kódu:** Nahrazení 20+ statických React souborů (`NewYorkPage.tsx`, `BaliPage.tsx`, `ReunionPage.tsx` atd.) jednou univerzální šablonou `FlightRoutePage.tsx`.

---

## 3. Mapovací tabulka 301 Permanent Redirects

Před spuštěním migrace je nutné do serverového middleware (Express) nasadit následující 301 pravidla:

| Původní URL (Legacy) | Cílová URL (Canonical) | HTTP Status | Backlink / Index Protection |
|:---|:---|:---:|:---|
| `/new-york` | `/letenky/praha/new-york` | 301 | Zachování historie z GSC |
| `/letenky-new-york` | `/letenky/praha/new-york` | 301 | Konsolidace sitemap varianty |
| `/dubaj` | `/letenky/praha/dubaj` | 301 | Zachování rankingu |
| `/letenky-dubaj` | `/letenky/praha/dubaj` | 301 | Odstranění duplicity |
| `/bali` | `/letenky/praha/bali` | 301 | Zachování rankingu |
| `/letenky-bali` | `/letenky/praha/bali` | 301 | Odstranění duplicity |
| `/reunion` | `/letenky/praha/reunion` | 301 | Zachování rankingu |
| `/letenky-reunion` | `/letenky/praha/reunion` | 301 | Odstranění duplicity |
| `/pariz` | `/letenky/praha/pariz` | 301 | Odstranění duplicity |
| `/letenky-pariz` | `/letenky/praha/pariz` | 301 | Konsolidace na novou strukturu |
| `/rim` | `/letenky/praha/rim` | 301 | Odstranění duplicity |
| `/letenky-rim` | `/letenky/praha/rim` | 301 | Konsolidace na novou strukturu |
| `/londyn` | `/letenky/praha/londyn` | 301 | Odstranění duplicity |
| `/letenky-londyn` | `/letenky/praha/londyn` | 301 | Konsolidace na novou strukturu |
| `/barcelona` | `/letenky/praha/barcelona` | 301 | Odstranění duplicity |
| `/letenky-barcelona` | `/letenky/praha/barcelona` | 301 | Konsolidace na novou strukturu |
| `/lowcost-all/:origin-:dest` | `/letenky/:origin/:dest` | 301 | Migrace legacy lowcost patternu |
| `/lowcost-cz/:dest` | `/letenky/praha/:dest` | 301 | Default origin = praha |

---

## 4. Opatření proti Redirect Loops a ztrátě rankingu

1. **Striktní pořadí middleware:**
   - Redirecty musí být vyhodnoceny PŘED fallbackem statických souborů a React routerem.
   - Cílová adresa `/letenky/:origin/:dest` nesmí vyvolat žádný další redirect zpět na kořenový slug.
2. **Canonical tagy v `<head>`:**
   - Každá stránka `/letenky/:origin/:dest` bude obsahovat `<link rel="canonical" href="https://www.akcni-letenky.com/letenky/:origin/:dest" />`.
3. **Aktualizace Sitemap XML:**
   - Okamžitě po nasazení přepnout `sitemap.ts`, aby generoval pouze nové canonical URL.
4. **GSC URL Inspection & Monitoring:**
   - Před migrací stáhnout export 100 nejnavštěvovanějších stránek z Google Search Console a po migraci zkontrolovat 100% úspěšnost HTTP 301 kódů.

---

## 5. Doporučený časový harmonogram realizace

- **Sprint N (Současný):** Příprava datového enginu a reportu (tento dokument).
- **Sprint N+1:** Vytvoření dynamické komponenty `FlightRoutePage.tsx`, napojení na `FlightDealEngine` DB data a otestování 301 redirect mapy na stagingu.
- **Sprint N+2:** Přepnutí produkčních URL, aktualizace sitemap a hlášení změn do Google Search Console.
