# Trust Claims Audit

Audit statických a dynamických claimů v projektu Akcni-Letenky.com k přechodu na data-driven architekturu.

| Soubor & Řádek | Text Claimu | Původ hodnoty | Datově doloženo? | Typ hodnoty | Doporučení |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `client/src/pages/LevneLetenky.tsx:251` | `4.8 (Ověřeno Pelikán)` | Hardcoded text v JSX | Ne | Hardcoded | REMOVE (nebo CONNECT_TO_DATA pokud existuje reálné API hodnocení) |
| `client/src/pages/LevneLetenky.tsx:258` | `Poslední {remainingSeats} místa za tuto cenu` | `(flight.salePrice % 4) + 2` | Ne | Calculated / Random | CONNECT_TO_DATA (napojit na reálný feed dostupnosti) |
| `client/src/pages/LevneLetenky.tsx:265` | `Akce končí za: {formatTime(timeLeft)}` | Pseudo-náhodný odpočet z ceny | Ne | Calculated / Random | CONNECT_TO_DATA (napojit na reálný `sourceUpdatedAt` / platnost akce) |
| `client/src/components/SocialProofNotification.tsx:4` | `X lidí právě prohlíží` | `Math.floor(Math.random() * (max - min + 1) + min)` | Ne | Random (time-based) | REMOVE (falešný social proof poškozuje důvěryhodnost) |
| `client/src/components/PelikanPrimaryDeals.tsx:10` | `Garance nejnižší ceny v ČR` | Hardcoded text v badge | Ne | Hardcoded | REMOVE (nebo KEEP s explicitním disclaimerem, pokud Pelikán garantuje) |
| `client/src/components/FlightCard.tsx:141` | `-{flight.discount}% sleva` | Hardcoded / Mock data | Ne | Hardcoded / Mock | CONNECT_TO_DATA (počítat reálně z `originalPrice` vs `salePrice` z feedu) |
| `client/src/components/Footer.tsx:54` | `Garance nejnižší ceny Pelikán.cz` | Hardcoded text | Ne | Hardcoded | KEEP (Pelikán.cz reálně má garanci) |
| `server/routes.ts:300` | Random rating 4.2 - 5.0 | `parseFloat((Math.random() * (5.0 - 4.2) + 4.2).toFixed(1))` | Ne | Random | REMOVE (nechat null / undefined dokud nebude reálné hodnocení) |
| `client/src/components/TrustBadgesShield.tsx:201` | `Nejnižší ceny garantovány` | Hardcoded text | Ne | Hardcoded | REMOVE / CONNECT_TO_DATA |

## Závěr k Trust Claims
Většina prvků vyvolávajících urgenci a společenský důkaz je aktuálně tvořena náhodnými generátory (Math.random, pseudo-random hashe, časově vázané rozsahy). V souladu s prioritou "datová důvěryhodnost" je nezbytné tyto claimy odstranit nebo přímo napojit na real-time data z Pelikán XML. Falešný social proof (počet prohlížejících) bude zahozen úplně, dokud nebude existovat např. Google Analytics API stream.
