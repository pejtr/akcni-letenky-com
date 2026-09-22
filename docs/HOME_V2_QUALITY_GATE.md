# Akční Letenky V2 — quality gate

This iteration is intentionally a **stable CRO baseline**, not another bundle of simultaneous experiments.

## Target
Move the audited homepage from roughly 4–5/10 in UX, marketing and visual consistency toward a defensible 7–8/10 baseline before adding more growth features.

## Implemented
- One dominant discovery story: **KÁNĚ Deal Radar**.
- Two hero actions only: browse deals or search a specific flight.
- Live deal cards use current Pelikán feed values; no hard-coded discounts or fake urgency.
- Empty/error states prefer silence over invented prices.
- **ZIPPY Drop** is the retention CTA and uses the real newsletter mutation.
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
- hero_deals_click
- hero_search_click
- deal_card_click
- zippy_intent_click

Do not start another homepage A/B test until this baseline has enough traffic to interpret.
