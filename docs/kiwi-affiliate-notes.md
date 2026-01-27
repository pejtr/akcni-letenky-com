# Kiwi.com Affiliate Integration Notes

## Affiliate Link Format (via Travelpayouts)
Base URL: `https://c111.travelpayouts.com/click?shmarker={AFFILIATE_ID}&promo_id=3612&source_type=customlink&type=click&custom_url={ENCODED_KIWI_URL}`

## Kiwi.com Search URL Format
`https://www.kiwi.com/en/search/results/{from}/{to}/{date_from}/{date_to}`

Example:
`https://www.kiwi.com/en/search/results/prague-czech-republic/paris-france/2026-02-15/2026-02-22`

## Commission
- 3% of full booking price
- Average ticket price: $450
- Average commission: $13.5
- Cookie lifetime: 30 days

## Implementation Strategy
Since Tequila API requires registration and API key, we'll use:
1. **Deeplink approach** - Generate Kiwi.com search URLs with affiliate tracking
2. **No API needed** - Just redirect users to Kiwi.com with pre-filled search

## Deeplink URL Structure
`https://www.kiwi.com/{lang}/search/results/{origin}/{destination}/{departure_date}/{return_date}?adults={num}&children={num}`

Parameters:
- lang: cs, en, de, etc.
- origin: city-country (e.g., prague-czech-republic)
- destination: city-country (e.g., paris-france)
- departure_date: YYYY-MM-DD
- return_date: YYYY-MM-DD (optional for one-way)
- adults: number of adults
- children: number of children
