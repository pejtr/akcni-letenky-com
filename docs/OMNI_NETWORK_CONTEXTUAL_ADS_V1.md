# OMNI NETWORK — contextual advertising v1

## Goal

Start the owned contextual advertising layer shown in the OMNI NETWORK concept without turning Akční-Letenky.com into a generic ad-heavy portal.

The first implementation is deliberately narrow:

```
page context
   ↓
eligible approved campaigns
   ↓
deterministic relevance score
   ↓
clearly labelled placement
   ↓
owned project
   ↓
viewable impression / click measurement
```

## v1 campaigns

### Do-Italie.cz
Context:
- topic: travel
- intent: inspiration / planning / flight
- placement: homepage after hero

Purpose:
- move relevant travel discovery traffic into the specialist Italy project

### LastMinuteDovolene.cz
Context:
- topic: travel
- intent: package
- placement: homepage after flight deals

Purpose:
- offer a full-trip alternative when a visitor may want a package rather than a standalone flight

## Public rules

Every placement must:
- say **Reklama · náš projekt**
- keep the original page content primary
- use an explicit destination URL
- open the external project intentionally
- avoid fake prices, scarcity, ratings and availability
- never masquerade as editorial content

If no approved relevant campaign exists, render **nothing**.

## Partner policy

v1 contains **owned projects only**.

Affiliate / external partners such as Booking or Revolut are not enabled until:
1. the commercial program is verified,
2. the destination URL is approved,
3. required disclosure is known,
4. attribution is tested,
5. the campaign is explicitly marked approved.

## Measurement

First-party events:
- `omni_ad_impression`
- `omni_ad_click`

Impression definition:
- at least 50% visible
- for at least 1 second
- only recorded when analytics consent exists

Event metadata includes:
- campaign id
- project
- owner type
- placement
- topic
- intent

Click navigation still works without analytics consent; only measurement is suppressed.

## Current placement cap

Homepage v1 deliberately uses **two placements maximum**:
1. billboard after hero
2. native card after deal feed

No side rails, popups, interstitials or sticky takeovers in v1.

## Next iteration

- server-managed campaign registry
- ONYXO control deck
- project / route / content keyword rules
- frequency caps
- campaign start/end windows
- per-placement performance dashboard
- confirmed downstream revenue import
- external affiliate campaigns behind approval gates
