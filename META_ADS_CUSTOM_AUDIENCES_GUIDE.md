# Meta Ads Custom Audiences Setup Guide

Tento průvodce vám ukáže, jak vytvořit Custom Audiences v Meta Ads Manageru pro retargeting uživatelů webu Akční Letenky.

---

## Proč Custom Audiences?

Custom Audiences umožňují cílit reklamy na uživatele, kteří již interagovali s vaším webem. To výrazně zvyšuje konverzní poměr a snižuje náklady na akvizici (CPA).

**Výhody:**
- 🎯 **Vyšší konverze** - targetujete lidi, kteří už projevili zájem
- 💰 **Nižší CPA** - warm audience je levnější než cold traffic
- 🔄 **Retargeting** - připomeňte se uživatelům, kteří nekonvertovali
- 📊 **Lookalike Audiences** - najděte podobné uživatele

---

## Přehled trackovaných událostí

Web Akční Letenky trackuje tyto Meta Pixel události:

| Událost | Kdy se trackuje | Použití |
|---------|----------------|---------|
| **PageView** | Každá návštěva stránky | Základní retargeting |
| **ViewContent** | Prohlížení detailu letu/dovolené | Targetování podle destinací |
| **Search** | Vyhledávání destinací | Targetování podle zájmu |
| **AddToWishlist** | Přidání do oblíbených nebo nastavení price alertu | Warm audience - vysoký zájem |
| **InitiateCheckout** | Kliknutí na affiliate odkaz (Pelikan.cz) | Hot audience - připraveni koupit |
| **Lead** | Registrace k newsletteru | Email remarketing |

---

## 1. Vytvoření Custom Audience pro retargeting

### Krok 1: Otevřete Meta Ads Manager

1. Přejděte na [Meta Ads Manager](https://business.facebook.com/adsmanager)
2. Klikněte na **☰** (hamburger menu) → **Audiences** (Publikum)
3. Klikněte na **Create Audience** → **Custom Audience**

### Krok 2: Vyberte zdroj

- Vyberte **Website** (Web)
- Vyberte váš Pixel ID: **900387606186389**

### Krok 3: Definujte pravidla

#### Audience 1: **Všichni návštěvníci webu (30 dní)**
```
Pravidlo: PageView
Časové okno: 30 dní
Název: "Akční Letenky - Všichni návštěvníci 30d"
```

**Použití:** Základní retargeting pro všechny návštěvníky.

---

#### Audience 2: **Uživatelé, kteří prohlíželi konkrétní destinace**
```
Pravidlo: ViewContent
Parametr: content_name OBSAHUJE "Dubaj"
Časové okno: 30 dní
Název: "Akční Letenky - ViewContent Dubaj 30d"
```

**Použití:** Targetování uživatelů, kteří prohlíželi lety/dovolené do Dubaje.

**Tip:** Vytvořte samostatnou audience pro každou top destinaci (Barcelona, Paříž, New York, Bali, atd.).

---

#### Audience 3: **Uživatelé, kteří přidali do oblíbených**
```
Pravidlo: AddToWishlist
Časové okno: 60 dní
Název: "Akční Letenky - AddToWishlist 60d"
```

**Použití:** Warm audience s vysokým zájmem. Ideální pro retargeting s urgentními nabídkami.

---

#### Audience 4: **Uživatelé, kteří klikli na affiliate odkaz (ale nekoupili)**
```
Pravidlo: InitiateCheckout
Časové okno: 7 dní
Název: "Akční Letenky - InitiateCheckout 7d"
```

**Použití:** Hot audience - byli blízko nákupu. Retargetujte je s urgentními nabídkami nebo slevami.

---

#### Audience 5: **Newsletter subscribers**
```
Pravidlo: Lead
Parametr: content_name OBSAHUJE "Newsletter"
Časové okno: 90 dní
Název: "Akční Letenky - Newsletter Subscribers 90d"
```

**Použití:** Engaged audience pro cross-sell a upsell kampaně.

---

## 2. Vytvoření Lookalike Audiences

Lookalike Audiences najdou nové uživatele podobné vašim nejlepším zákazníkům.

### Krok 1: Vyberte zdrojovou audience

Nejlepší zdrojové audiences pro Lookalike:
1. **InitiateCheckout** - uživatelé, kteří klikli na affiliate odkaz
2. **AddToWishlist** - uživatelé s vysokým zájmem
3. **Newsletter Subscribers** - engaged audience

### Krok 2: Vytvořte Lookalike

1. V **Audiences** klikněte na Custom Audience
2. Klikněte na **⋯** (tři tečky) → **Create Lookalike**
3. Vyberte **Location**: Česká republika
4. Vyberte **Audience Size**: 1% (nejpřesnější), 2-3% (širší reach)
5. Klikněte na **Create Audience**

**Tip:** Vytvořte 3 Lookalike audiences (1%, 2%, 3%) a testujte, která má nejlepší performance.

---

## 3. Retargeting strategie

### Strategie 1: **Funnel-based Retargeting**

Cílte uživatele podle jejich pozice v conversion funnel:

| Audience | Časové okno | Ad Creative | CTA |
|----------|-------------|-------------|-----|
| **PageView** | 30 dní | Obecné nabídky, top destinace | "Objevte naše nabídky" |
| **ViewContent** | 30 dní | Personalizované nabídky podle prohlížených destinací | "Rezervujte teď" |
| **AddToWishlist** | 60 dní | Urgentní nabídky, časově omezené slevy | "Poslední místa!" |
| **InitiateCheckout** | 7 dní | Urgentní reminder, social proof | "Nekupujte příliš pozdě!" |

### Strategie 2: **Destination-specific Retargeting**

Vytvořte kampaně pro každou top destinaci:

1. **Audience:** ViewContent obsahuje "Dubaj"
2. **Ad Creative:** Fotky Dubaje, specifické nabídky
3. **Landing Page:** Detail stránka Dubaj nebo filtrované výsledky
4. **CTA:** "Zobrazit lety do Dubaje"

### Strategie 3: **Seasonal Retargeting**

Targetujte uživatele podle sezóny:

- **Léto:** Řecko, Itálie, Španělsko
- **Zima:** Dubaj, Thajsko, exotika
- **Svátky:** New York, Paříž, romantické destinace

---

## 4. Exclusion Audiences (Vyloučení)

Vyloučte uživatele, kteří již konvertovali, abyste neplýtvali budgetem:

```
Vyloučit: InitiateCheckout v posledních 24 hodinách
```

**Proč:** Uživatel, který právě klikl na affiliate odkaz, pravděpodobně už rezervoval. Neplýtvejte na něj dalším budgetem.

---

## 5. Kampáňové nastavení

### Objective (Cíl kampaně)

- **Traffic** - pro affiliate model (chcete kliky na Pelikan.cz)
- **Conversions** - pokud trackujete konverze přes Conversion API

### Placement (Umístění)

- **Facebook Feed** - nejlepší pro travel content
- **Instagram Feed** - vizuálně atraktivní destinace
- **Stories** - urgentní nabídky, countdown timery

### Budget & Schedule

- **Daily Budget:** 200-500 Kč/den (začněte menším budgetem a škálujte)
- **Schedule:** Continuous (nepřetržitě) nebo Ad Scheduling (plánování podle peak hours)

### Optimization

- **Optimization for Ad Delivery:** Link Clicks (pro affiliate)
- **Bid Strategy:** Lowest Cost (začněte s tímto)

---

## 6. Ad Creative Best Practices

### Vizuály

- ✅ **Vysoká kvalita fotek** - destinace, pláže, památky
- ✅ **Cena v obrázku** - "od 2 990 Kč"
- ✅ **Urgence** - "Poslední místa!", "Jen dnes!"
- ✅ **Social proof** - "1 234 lidí si právě prohlíží tuto nabídku"

### Copy (Text)

- ✅ **Krátký a výstižný** - max 125 znaků
- ✅ **Benefit-focused** - "Ušetřete až 60%"
- ✅ **Urgence** - "Platí jen do půlnoci!"
- ✅ **CTA** - "Rezervujte teď", "Zobrazit nabídky"

### Headline (Nadpis)

- ✅ **Destinace + cena** - "Dubaj od 4 990 Kč"
- ✅ **Urgence** - "Last Minute Řecko - Poslední místa!"
- ✅ **Benefit** - "Ušetřete 3 000 Kč na dovolené"

---

## 7. Měření úspěšnosti

### Klíčové metriky

| Metrika | Cíl | Popis |
|---------|-----|-------|
| **CTR** (Click-Through Rate) | > 2% | Procento kliků na zobrazení |
| **CPC** (Cost Per Click) | < 5 Kč | Náklady na jeden klik |
| **Event Match Quality** | > 6.0 | Kvalita párování událostí (Conversion API) |
| **ROAS** (Return on Ad Spend) | > 3.0 | Návratnost investice (pokud trackujete revenue) |

### Kde sledovat metriky

1. **Meta Ads Manager** → Campaigns → Columns → Customize Columns
2. **Meta Events Manager** → Data Sources → Pixel 900387606186389 → Event Match Quality

---

## 8. Troubleshooting

### Problém: Audience je příliš malá (< 1 000 uživatelů)

**Řešení:**
- Rozšiřte časové okno (např. z 30 na 60 dní)
- Kombinujte více událostí (např. ViewContent OR AddToWishlist)
- Zvyšte traffic na web (SEO, PPC, social media)

### Problém: Nízký Event Match Quality (< 5.0)

**Řešení:**
- Zkontrolujte, že Conversion API posílá všechny parametry (email, telefon, IP, User Agent)
- Ověřte, že Meta Pixel je správně nainstalován a načítá se po GDPR souhlasu
- Testujte události v Meta Events Manager → Test Events

### Problém: Vysoký CPC (> 10 Kč)

**Řešení:**
- Zúžte audience (targetujte jen warm/hot audiences)
- Vylepšete ad creative (A/B testujte vizuály a copy)
- Snižte frequency (pokud > 3, audience je přesycená)

---

## 9. Pokročilé strategie

### Dynamic Ads for Travel

Pokud máte product catalog (lety/dovolené jako produkty), můžete použít Dynamic Ads:

1. Vytvořte product catalog v Meta Business Manager
2. Nahrajte data z Pelikan API (destination, price, image, URL)
3. Vytvořte Dynamic Ad campaign s retargetingem na ViewContent

**Benefit:** Automaticky zobrazuje personalizované nabídky podle prohlížených destinací.

### Sequential Retargeting

Vytvořte sérii reklam, které se zobrazují v určitém pořadí:

1. **Den 1-3:** Obecná nabídka ("Objevte naše top destinace")
2. **Den 4-7:** Personalizovaná nabídka ("Dubaj od 4 990 Kč")
3. **Den 8-14:** Urgentní nabídka ("Poslední místa! Jen dnes sleva 20%")

### Exclusion Layering

Vytvořte hierarchii audiences a vyloučte ty, kteří jsou dál ve funnel:

- **Audience A:** PageView (vyloučit ViewContent)
- **Audience B:** ViewContent (vyloučit AddToWishlist)
- **Audience C:** AddToWishlist (vyloučit InitiateCheckout)
- **Audience D:** InitiateCheckout (žádné vyloučení)

---

## 10. Checklist pro spuštění

- [ ] Ověřte, že Meta Pixel trackuje události v Meta Events Manager
- [ ] Vytvořte Custom Audiences (PageView, ViewContent, AddToWishlist, InitiateCheckout)
- [ ] Vytvořte Lookalike Audiences (1%, 2%, 3%) z InitiateCheckout
- [ ] Připravte ad creatives (fotky, copy, headlines)
- [ ] Nastavte kampáň (Traffic objective, Link Clicks optimization)
- [ ] Nastavte budget (začněte s 200-500 Kč/den)
- [ ] Spusťte kampaň a sledujte metriky (CTR, CPC, EMQ)
- [ ] A/B testujte ad creatives a audiences
- [ ] Škálujte úspěšné kampaně (zvyšte budget o 20% každé 3 dny)

---

## Závěr

Custom Audiences jsou klíčem k úspěšnému retargetingu a snížení CPA. Začněte s jednoduchými audiences (PageView, ViewContent) a postupně přidávejte pokročilejší strategie (Lookalike, Dynamic Ads, Sequential Retargeting).

**Doporučený postup:**
1. Spusťte základní retargeting kampaň na PageView audience
2. Sledujte metriky a optimalizujte ad creative
3. Přidejte destination-specific audiences (ViewContent)
4. Vytvořte Lookalike audiences z InitiateCheckout
5. Škálujte úspěšné kampaně

**Otázky nebo problémy?** Kontaktujte Meta Support nebo konzultujte s Meta Ads specialistou.
