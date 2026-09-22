# Akční Letenky V2 — quality gate

This iteration is intentionally a **stable CRO baseline**, not another bundle of simultaneous experiments.

## Target
Move the audited homepage from roughly 4–5/10 in UX, marketing and visual consistency toward a defensible 7–8/10 baseline before adding more growth features.

## Implemented
- One dominant discovery story: **Akční Zuzka + Deal Radar**.
- Two hero actions only: browse deals or search a specific flight.
- Live deal cards use current Pelikán feed values; no hard-coded discounts or fake urgency.
- Empty/error states prefer silence over invented prices.
- **Akční Zuzka** is the public-facing virtual guide; **ZIPPY Drop** remains the secondary delivery/retention utility.
- Global navigation reduced to the highest-intent destinations.
- Global footer simplified and stripped of hard-coded prices/discount claims.
- Homepage first-party funnel events use the existing tRPC conversion funnel.
- Legacy CTA experiments no longer contain countdowns, fake scarcity or unsupported urgency.
- Global schema identifies the project as an Organization/WebSite, not a TravelAgency.
- Mobile zoom is no longer disabled.

## Release gate
The branch may be merged only when:
1. Typecheck passes.
2. Targeted truth/SEO tests pass.
3. Production build passes.
4. Home renders at mobile, tablet and desktop without horizontal overflow.
5. Deal card with missing/zero price is not rendered.
6. Primary CTA path reaches /letenky.
7. Partner deal CTA goes through /go/pelikan/:id.
8. No homepage copy contains unsupported discount percentages, fake countdowns or fake audience counts.

## Measurement baseline
Primary:
- affiliate_outbound / qualified session

Secondary:
- ZIPPY Drop signup / session
- engagement:hero_deals_click
- search:hero_search_click
- affiliate_click:deal_card_click
- intent_select

Do not start another homepage A/B test until this baseline has enough traffic to interpret.


## Public brand hierarchy
- **Akční Zuzka** = public virtual travel guide and primary human face of the brand.
- **ZIPPY** = secondary delivery helper used for newsletter/alerts.
- **OMNISOJKA** = internal intelligence/orchestration name only; do not expose it in consumer copy by default.
- **KÁNĚ** = retired from public-facing Akční Letenky copy to reduce brand complexity.

## Akční Zuzka truth rule
Akční Zuzka may present or recommend only data that already passed the canonical deal/truth layer.
Her visual identity must never introduce a hard-coded price, discount, scarcity claim, rating, or availability statement that is not supplied by current verified data.
