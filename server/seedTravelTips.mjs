/**
 * Seed script: Tipy pro cestovatele
 * Inserts 6 SEO-optimized travel tips articles into the database
 * Run: node server/seedTravelTips.mjs
 */

import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const KIWI_LINK = "https://tp.media/r?marker=155221&trs=267609&p=4114&u=https%3A%2F%2Fwww.kiwi.com%2Fcs%2F";
const KIWI_SEARCH = "https://tp.media/r?marker=155221&trs=267609&p=4114&u=https%3A%2F%2Fwww.kiwi.com%2Fcs%2Fsearch%2Fresults%2Fprague-czech-republic";

const articles = [
  {
    title: "10 osvědčených triků, jak najít levné letenky v roce 2025",
    slug: "jak-najit-levne-letenky-triky",
    excerpt: "Chcete letět levně, ale nevíte jak? Prozradíme vám 10 prověřených triků, díky kterým ušetříte tisíce korun na letenkách. Od správného načasování nákupu až po skryté hacky, které cestovatelé tají.",
    content: `<article class="travel-tip-article">

<p class="lead">Levné letenky nejsou náhoda — jsou výsledkem správné strategie. Ať plánujete dovolenou v Evropě nebo výlet za oceán, tyto osvědčené triky vám pomohou ušetřit tisíce korun.</p>

<img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80" alt="Letadlo na letišti - levné letenky" class="w-full rounded-xl my-6" />

<h2>1. Rezervujte v úterý nebo středu</h2>
<p>Statistiky ukazují, že nejnižší ceny letenek se objevují v úterý a středu — letecké společnosti tehdy spouštějí akce a výprodeje. Vyhněte se nákupu v pátek a sobotu, kdy jsou ceny historicky nejvyšší.</p>

<h2>2. Leťte v úterý nebo středu</h2>
<p>Nejen nákup, ale i samotný den odletu zásadně ovlivňuje cenu. Lety v úterý, středu a čtvrtek bývají o 15–30 % levnější než víkendové spoje. Pokud máte flexibilní pracovní dobu, využijte toho naplno.</p>

<h2>3. Nastavte si cenové alerty</h2>
<p>Moderní vyhledávače jako <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a> umožňují nastavit automatická upozornění na pokles cen. Zadejte svoji trasu, požadovanou cenu a systém vás sám upozorní e-mailem, jakmile letenka zlevní.</p>

<img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80" alt="Plánování cesty - mapa a letenky" class="w-full rounded-xl my-6" />

<h2>4. Buďte flexibilní s daty</h2>
<p>Rozdíl jednoho nebo dvou dnů v datu odletu může znamenat úsporu stovek až tisíců korun. Použijte funkci "flexibilní data" na Kiwi.com a zobrazí se vám cenový kalendář — ihned uvidíte, kdy je let nejlevnější.</p>

<h2>5. Zvažte alternativní letiště</h2>
<p>Z Prahy létáte do Londýna? Zkuste místo Heathrow Stansted nebo Luton — ceny mohou být výrazně nižší. Podobně platí pro odletová letiště: z Vídně nebo Bratislavy se někdy letí levněji než z Prahy.</p>

<h2>6. Rozdělte zpáteční letenku na dvě jednosměrné</h2>
<p>Zpáteční letenka u jedné aerolinky nemusí být vždy nejlevnější. Porovnejte cenu za dvě jednosměrné letenky od různých dopravců — kombinace nízkonákladových aerolinek s klasickými může přinést překvapivé úspory.</p>

<h2>7. Leťte přes hub místo přímého letu</h2>
<p>Přímé lety jsou pohodlné, ale drahé. Let s přestupem přes Frankfurt, Amsterdam nebo Istanbul může být o 40–60 % levnější. Pokud máte čas, je to skvělá volba pro úsporu peněz.</p>

<h2>8. Využijte chybové ceny (error fares)</h2>
<p>Letecké společnosti občas omylem zveřejní letenky za zlomek běžné ceny. Tyto "chybové ceny" trvají jen pár hodin. Sledujte specializované skupiny na Facebooku nebo weby jako Scott's Cheap Flights, kde je uživatelé sdílejí.</p>

<h2>9. Rezervujte 6–8 týdnů předem pro Evropu</h2>
<p>Pro evropské destinace je ideální okno pro nákup 6–8 týdnů před odletem. Pro dálkové lety (USA, Asie) plánujte 3–6 měsíců dopředu. Příliš brzy ani příliš pozdě — to je klíč k nejnižší ceně.</p>

<h2>10. Porovnejte více vyhledávačů najednou</h2>
<p>Žádný vyhledávač nemá vždy nejnižší cenu. Porovnejte výsledky na <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a>, Skyscanner a Google Flights. Kiwi.com navíc nabízí unikátní funkci "Nomad" pro optimalizaci cesty s více zastávkami.</p>

<div class="bg-blue-50 border border-blue-200 rounded-xl p-6 my-8">
  <h3 class="text-xl font-bold text-blue-800 mb-3">🎯 Bonus tip: Inkognito mód prohlížeče</h3>
  <p class="text-blue-700">Vyhledávače sledují vaše předchozí hledání a mohou zobrazovat vyšší ceny. Vždy hledejte letenky v anonymním (inkognito) okně prohlížeče, aby vám algoritmy nezvedaly ceny.</p>
</div>

<p>Tyto triky fungují nejlépe v kombinaci. Začněte s flexibilními daty, nastavte si cenové alerty a pravidelně kontrolujte ceny na <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a>. Vaše peněženka vám poděkuje!</p>

</article>`,
    featuredImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
    category: "tips",
    keywords: "levné letenky, jak ušetřit na letenkách, levné letenky triky, cheap flights, letenky výprodej, cenové alerty letenky",
    metaDescription: "10 osvědčených triků jak najít levné letenky v roce 2025. Ušetřete tisíce korun díky správnému načasování, cenovým alertům a dalším tipům od cestovatelů.",
  },
  {
    title: "Nejlevnější destinace z Prahy: Kam letět za méně než 2 000 Kč?",
    slug: "nejlevnejsi-destinace-z-prahy",
    excerpt: "Hledáte levné letenky z Prahy? Sestavili jsme přehled nejdostupnějších evropských destinací, kam se dá letět zpátečně za méně než 2 000 Kč. Londýn, Řím, Barcelona a mnoho dalších.",
    content: `<article class="travel-tip-article">

<p class="lead">Praha je skvělým odletovým místem — z Letiště Václava Havla létají desítky nízkonákladových aerolinek do celé Evropy. Tyto destinace nabízejí nejlepší poměr ceny a zážitku.</p>

<img src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80" alt="Letiště Praha - odlety do Evropy" class="w-full rounded-xl my-6" />

<h2>🇬🇧 Londýn — od 899 Kč zpátečně</h2>
<p>Londýn je paradoxně jednou z nejdostupnějších destinací z Prahy. Ryanair a Wizz Air létají na Stansted a Luton za ceny, které vás překvapí. Nejlevnější letenky najdete mimo školní prázdniny — ideálně v říjnu, listopadu nebo únoru.</p>

<h2>🇮🇹 Řím — od 1 199 Kč zpátečně</h2>
<p>Věčné město láká turisty po celý rok. Letenky na Fiumicino nebo Ciampino jsou dostupné díky Ryanair a easyJet. Vyhněte se letním měsícům a Vánocům — ceny pak skáčou třikrát.</p>

<h2>🇪🇸 Barcelona — od 1 299 Kč zpátečně</h2>
<p>Barcelona nabízí skvělou kombinaci architektury, pláží a gastronomie. Vueling a Ryanair létají z Prahy pravidelně. Nejlevnější letenky najdete na jaře (duben, květen) nebo na podzim (září, říjen).</p>

<img src="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80" alt="Barcelona - levné letenky z Prahy" class="w-full rounded-xl my-6" />

<h2>🇬🇷 Atény — od 1 499 Kč zpátečně</h2>
<p>Řecká metropole je dostupná přes Ryanair a Aegean Airlines. Mimo sezónu (říjen–duben) jsou ceny velmi příznivé a město je méně přeplněné turisty.</p>

<h2>🇳🇱 Amsterdam — od 1 599 Kč zpátečně</h2>
<p>Kanálové město je oblíbenou destinací pro víkendové výlety. KLM, Transavia a easyJet nabízejí pravidelné spoje. Pozor — Schiphol je jedno z nejdražších letišť v Evropě, takže počítejte s vyššími letištními poplatky.</p>

<h2>🇵🇹 Lisabon — od 1 799 Kč zpátečně</h2>
<p>Lisabon zažívá turistický boom, ale ceny letenek zůstávají rozumné. TAP Air Portugal a Ryanair létají z Prahy s přestupem nebo přímými spoji. Nejlepší ceny jsou mimo léto.</p>

<h2>🇵🇱 Krakov — od 499 Kč zpátečně</h2>
<p>Nejlevnější destinace na tomto seznamu! Krakov je jen 2,5 hodiny jízdy autem, ale letenky jsou tak levné, že se vyplatí letět. Wizz Air a Ryanair létají za ceny, které jsou někdy nižší než vlakový lístek.</p>

<div class="bg-green-50 border border-green-200 rounded-xl p-6 my-8">
  <h3 class="text-xl font-bold text-green-800 mb-3">💡 Jak najít tyto ceny?</h3>
  <p class="text-green-700 mb-4">Tyto ceny jsou dostupné při správném načasování nákupu. Použijte cenový kalendář na Kiwi.com — zobrazí vám nejlevnější dny v měsíci na jednom přehledném grafu.</p>
  <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg transition-colors">
    Hledat levné letenky z Prahy →
  </a>
</div>

<h2>Kdy kupovat letenky z Prahy?</h2>
<p>Pro evropské destinace je ideální rezervovat 6–8 týdnů předem. Nejlevnější měsíce pro odlet jsou leden, únor, říjen a listopad. Vyhněte se letním prázdninám (červenec, srpen) a vánočním svátkům — ceny jsou pak 2–3× vyšší.</p>

</article>`,
    featuredImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80",
    category: "tips",
    keywords: "levné letenky z Prahy, nejlevnější destinace Praha, letenky Praha Londýn, letenky Praha Barcelona, cheap flights Prague",
    metaDescription: "Nejlevnější destinace z Prahy: kam letět za méně než 2 000 Kč zpátečně? Londýn, Řím, Barcelona, Atény a další. Tipy kdy a kde koupit nejlevnější letenky.",
  },
  {
    title: "Cenový kalendář letenek: Jak ho používat a ušetřit až 60 %",
    slug: "cenovy-kalendar-letenek-jak-pouzivat",
    excerpt: "Cenový kalendář je nejsilnější nástroj pro hledání levných letenek. Ukážeme vám, jak ho správně používat na Kiwi.com a dalších vyhledávačích, abyste vždy letěli za nejnižší cenu.",
    content: `<article class="travel-tip-article">

<p class="lead">Cenový kalendář je funkce, která zobrazuje ceny letenek pro každý den v měsíci na jednom přehledném grafu. Je to nejrychlejší způsob, jak najít nejlevnější termín pro váš let.</p>

<img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80" alt="Plánování cesty - cenový kalendář letenek" class="w-full rounded-xl my-6" />

<h2>Co je cenový kalendář?</h2>
<p>Místo hledání ceny pro konkrétní datum zobrazuje cenový kalendář ceny pro celý měsíc najednou. Na první pohled vidíte, kdy je let nejlevnější a kdy nejdražší. Rozdíl mezi nejdražším a nejlevnějším dnem může být i 300–500 %.</p>

<h2>Jak používat cenový kalendář na Kiwi.com</h2>
<p>Na <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a> zadejte odletové a cílové letiště, pak klikněte na pole s datem. Místo konkrétního data vyberte "Nejlevnější měsíc" nebo přepněte na zobrazení kalendáře. Zelené dny jsou nejlevnější, červené nejdražší.</p>

<h2>Flexibilní data = obrovské úspory</h2>
<p>Pokud máte dovolenou flexibilní, zkuste posunout odlet o 1–3 dny. Na populárních trasách jako Praha–Londýn nebo Praha–Barcelona může tento posun ušetřit 500–2 000 Kč na osobu.</p>

<img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" alt="Cestovatel s telefonem - hledání levných letenek" class="w-full rounded-xl my-6" />

<h2>Sezónní vzory: Kdy jsou letenky nejlevnější?</h2>
<p>Ceny letenek se řídí předvídatelnými vzory. Nejlevnější měsíce v roce jsou leden, únor, říjen a listopad — mimo hlavní turistickou sezónu. Nejdražší jsou červenec, srpen a prosinec (Vánoce). Jaro (duben, květen) a podzim (září) nabízejí skvělý kompromis mezi cenou a počasím.</p>

<h2>Tip: Kombinujte cenový kalendář s cenovými alerty</h2>
<p>Jakmile najdete nejlevnější termín v cenovém kalendáři, nastavte si cenový alert pro toto datum. Pokud cena ještě klesne, dostanete upozornění. Pokud začne stoupat, víte, že je čas koupit.</p>

<div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 my-8">
  <h3 class="text-xl font-bold text-yellow-800 mb-3">⚡ Praktický příklad</h3>
  <p class="text-yellow-700">Praha → Barcelona v říjnu: přímý let v pátek stojí 3 200 Kč, ale let ve středu stojí jen 1 450 Kč. Cenový kalendář vám tento rozdíl ukáže okamžitě — bez zdlouhavého zkoušení různých dat.</p>
</div>

<h2>Alternativní nástroje pro cenový kalendář</h2>
<p>Kromě Kiwi.com nabízí cenový kalendář také Google Flights (záložka "Prozkoumat") a Skyscanner (funkce "Celý měsíc"). Každý vyhledávač má přístup k různým datům, proto se vyplatí porovnat výsledky na více místech.</p>

<p>Cenový kalendář je váš nejlepší přítel při plánování cest. Začněte ho používat na <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a> ještě dnes a uvidíte, jak snadno lze ušetřit tisíce korun na každé cestě.</p>

</article>`,
    featuredImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80",
    category: "tips",
    keywords: "cenový kalendář letenek, flexibilní data letenky, nejlevnější termín letu, kiwi.com cenový kalendář, levné letenky kdy koupit",
    metaDescription: "Jak používat cenový kalendář letenek a ušetřit až 60 %? Průvodce funkcí flexibilních dat na Kiwi.com a dalších vyhledávačích. Praktické tipy a příklady.",
  },
  {
    title: "Last minute letenky: Mýty a pravda — kdy opravdu ušetříte?",
    slug: "last-minute-letenky-myty-a-pravda",
    excerpt: "Last minute letenky jsou opředeny mýty. Jsou opravdu levnější? Kdy se vyplatí čekat a kdy je lepší koupit předem? Rozebíráme pravdu o last minute nabídkách a kdy skutečně ušetříte.",
    content: `<article class="travel-tip-article">

<p class="lead">Slovo "last minute" evokuje obrovské slevy a výhodné nabídky. Ale je to skutečně tak? Pravda je složitější — a záleží na tom, kam letíte a s jakou aerolinou.</p>

<img src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80" alt="Last minute letenky - letiště" class="w-full rounded-xl my-6" />

<h2>Mýtus č. 1: Last minute letenky jsou vždy levnější</h2>
<p>Toto je největší omyl o leteckém průmyslu. U nízkonákladových aerolinek (Ryanair, Wizz Air, easyJet) platí opak — čím blíže k datu odletu, tím vyšší cena. Tyto aerolinky záměrně zdražují poslední volná místa.</p>

<h2>Kdy last minute skutečně funguje</h2>
<p>Last minute výhodné nabídky existují, ale v jiné podobě, než si většina lidí myslí. Fungují hlavně u charterových letů a dovolenkových balíčků — cestovní kanceláře jako Pelikán nebo Fischer prodávají neprodané kapacity se slevou 40–60 % v posledních 2–3 týdnech před odletem.</p>

<h2>Klasické aerolinky vs. nízkonákladové</h2>
<p>U klasických aerolinek (Czech Airlines, Lufthansa, Austrian) se last minute slevy občas objevují — zejména na méně obsazených linkách. Ale ani zde to není pravidlo. Spolehlivější je sledovat jejich věrnostní programy a akční nabídky.</p>

<img src="https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80" alt="Letenky - plánování cesty" class="w-full rounded-xl my-6" />

<h2>Pravé last minute: 24–72 hodin před odletem</h2>
<p>Existuje specifický fenomén "skutečného last minute" — letenky zakoupené 24–72 hodin před odletem. Aerolinky někdy prodávají zbývající místa se slevou, aby neodlétaly s prázdnými sedadly. Ale tato okna jsou nepředvídatelná a vyžadují absolutní flexibilitu.</p>

<h2>Kdy je lepší koupit předem?</h2>
<p>Pro plánované dovolené je vždy lepší koupit předem. Ideální okno je 6–8 týdnů pro Evropu a 3–6 měsíců pro dálkové destinace. <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a> nabízí funkci "Hlídání ceny", která vás upozorní, pokud cena klesne po vašem nákupu.</p>

<div class="bg-red-50 border border-red-200 rounded-xl p-6 my-8">
  <h3 class="text-xl font-bold text-red-800 mb-3">⚠️ Pozor na "falešné" last minute</h3>
  <p class="text-red-700">Mnoho webů označuje jako "last minute" nabídky, které jsou ve skutečnosti standardní ceny nebo dokonce dražší než běžná nabídka. Vždy porovnejte cenu s Kiwi.com nebo Skyscanner, abyste věděli, zda jde o skutečnou slevu.</p>
</div>

<h2>Strategie pro last minute cestovatele</h2>
<p>Pokud milujete spontánní cestování, zaregistrujte se k odběru newsletterů aerolinek a sledujte jejich flash sales. Ryanair a Wizz Air pořádají pravidelné akce s výprodejem sedadel za 1–5 eur. Tyto akce trvají jen 24–48 hodin a jsou to skutečné last minute příležitosti.</p>

<p>Závěr: Last minute letenky jsou výhodné jen ve specifických situacích. Pro většinu cestovatelů je lepší plánovat dopředu a využívat cenové alerty na <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a>.</p>

</article>`,
    featuredImage: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80",
    category: "tips",
    keywords: "last minute letenky, last minute slevy, kdy koupit letenky, levné letenky last minute, last minute výprodej",
    metaDescription: "Jsou last minute letenky opravdu levnější? Rozebíráme mýty a pravdu o last minute nabídkách. Kdy se vyplatí čekat a kdy je lepší koupit letenku předem.",
  },
  {
    title: "Jak ušetřit na letenkách pro celou rodinu: Průvodce rodinným cestováním",
    slug: "levne-letenky-pro-rodinu-pruvodce",
    excerpt: "Cestování s dětmi může být drahé, ale nemusí. Přinášíme kompletní průvodce, jak ušetřit na letenkách pro celou rodinu — od výběru správné aerolinky až po triky s dětskými místenkami.",
    content: `<article class="travel-tip-article">

<p class="lead">Rodinná dovolená s letadlem nemusí zruinovat rodinný rozpočet. S správnou strategií můžete ušetřit tisíce korun i při cestování s dětmi.</p>

<img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80" alt="Rodinné cestování - letenky pro rodinu" class="w-full rounded-xl my-6" />

<h2>Děti do 2 let: Leťte zdarma nebo za symbolickou cenu</h2>
<p>Kojenci do 2 let letí u většiny aerolinek zdarma nebo za 10 % ceny dospělého lístku (bez vlastního sedadla). Toto pravidlo platí u Ryanair, Wizz Air, easyJet i klasických aerolinek. Využijte to — je to jedna z největších úspor v leteckém průmyslu.</p>

<h2>Děti 2–12 let: Hledejte dětské slevy</h2>
<p>Klasické aerolinky (Czech Airlines, Lufthansa, KLM) nabízejí dětské slevy 25–50 % pro děti ve věku 2–12 let. Nízkonákladové aerolinky tyto slevy nenabízejí — u nich platí děti stejnou cenu jako dospělí. Při plánování rodinné dovolené tedy porovnejte obě varianty.</p>

<h2>Strategie: Rozdělte rezervaci</h2>
<p>Vyhledávače někdy zobrazují vyšší ceny pro skupiny. Zkuste vyhledat letenky zvlášť pro každého člena rodiny — výsledky mohou být překvapivě odlišné. Tato technika funguje zejména při hledání posledních volných míst za nižší cenu.</p>

<img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80" alt="Rodina na letišti - cestování s dětmi" class="w-full rounded-xl my-6" />

<h2>Místa v letadle: Plaťte nebo hrajte chytře</h2>
<p>Výběr míst je u nízkonákladových aerolinek placený. Pro rodiny s dětmi do 12 let jsou aerolinky ze zákona povinny poskytnout místa vedle sebe — ale musíte o to požádat při odbavení. Ušetříte tak poplatek za výběr míst, který může být 200–500 Kč na osobu.</p>

<h2>Zavazadla: Největší past pro rodiny</h2>
<p>Poplatky za zavazadla mohou zdvojnásobit cenu letenky pro rodinu. Plánujte zavazadla předem — u Ryanair je levnější přidat zavazadlo při rezervaci než na letišti. Zvažte, zda se nevyplatí vzít jedno větší zavazadlo místo dvou menších.</p>

<h2>Kdy letět s rodinou nejlevněji?</h2>
<p>Vyhněte se letním prázdninám (červenec, srpen) a jarním prázdninám — ceny jsou pak 2–3× vyšší. Ideální jsou jarní prázdniny mimo hlavní termín nebo podzimní prázdniny. Pokud máte flexibilitu ve škole, leťte v říjnu nebo listopadu.</p>

<div class="bg-blue-50 border border-blue-200 rounded-xl p-6 my-8">
  <h3 class="text-xl font-bold text-blue-800 mb-3">👨‍👩‍👧‍👦 Tip pro rodiny</h3>
  <p class="text-blue-700 mb-4">Na Kiwi.com můžete zadat počet dospělých a dětí a vyhledávač automaticky zobrazí ceny s dětskými slevami tam, kde jsou dostupné. Srovnání je přehledné a rychlé.</p>
  <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors">
    Hledat rodinné letenky →
  </a>
</div>

<h2>Pojištění cestovního zpoždění</h2>
<p>S dětmi je cestovní pojištění ještě důležitější. Zpoždění letu s malými dětmi může být stresující — pojištění vám uhradí náklady na jídlo, ubytování a alternativní dopravu. Porovnejte nabídky pojišťoven před každou cestou.</p>

</article>`,
    featuredImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80",
    category: "tips",
    keywords: "levné letenky rodina, rodinné cestování letadlem, letenky s dětmi, dětské slevy letenky, jak ušetřit na letenkách rodina",
    metaDescription: "Jak ušetřit na letenkách pro celou rodinu? Dětské slevy, strategie rezervace, zavazadla a nejlepší termíny pro rodinné lety.",
  },
  {
    title: "Věrnostní programy aerolinek: Jak létat zdarma díky milím",
    slug: "vernostni-programy-aerolinek-jak-letat-zdarma",
    excerpt: "Věrnostní programy aerolinek jsou zlatý důl pro pravidelné cestovatele. Ukážeme vám, jak sbírat míle a body efektivně, jak je uplatnit na letenky zdarma a které programy se nejvíce vyplatí.",
    content: `<article class="travel-tip-article">

<p class="lead">Věrnostní programy aerolinek jsou jedním z nejlepších způsobů, jak létat levněji nebo dokonce zdarma. Ale jen pokud víte, jak je správně využívat.</p>

<img src="https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80" alt="Věrnostní program aerolinek - míle a body" class="w-full rounded-xl my-6" />

<h2>Jak fungují věrnostní programy?</h2>
<p>Za každý let sbíráte míle nebo body, které pak můžete vyměnit za letenky, upgrade do business class nebo jiné odměny. Čím více létáte, tím vyšší status získáte — a s ním přichází výhody jako prioritní odbavení, přístup do salonků nebo větší příruční zavazadlo zdarma.</p>

<h2>Nejdůležitější programy pro české cestovatele</h2>
<p><strong>Miles & More (Lufthansa Group):</strong> Nejrozšířenější program v Evropě. Platí pro Lufthansa, Austrian Airlines, Swiss a desítky partnerů. Pro česky mluvící cestovatele ideální volba díky letům z Prahy přes Frankfurt nebo Vídeň.</p>

<p><strong>Flying Blue (Air France/KLM):</strong> Skvělý program s pravidelným výprodejem odměnových letenek (Promo Awards) se slevou 25–50 %. Míle lze sbírat i u partnerských aerolinek Star Alliance.</p>

<p><strong>Avios (British Airways/Iberia):</strong> Výhodný pro lety do Londýna a dál. Avios se dají sbírat i přes kreditní karty a partnery jako Aer Lingus nebo Vueling.</p>

<img src="https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80" alt="Cestovní kreditní karta - sbírání mil" class="w-full rounded-xl my-6" />

<h2>Kreditní karty: Nejrychlejší způsob sbírání mil</h2>
<p>Pravidelní letci sbírají míle nejen za lety, ale i za každodenní nákupy kreditní kartou. Cestovní kreditní karty nabízejí 1–3 míle za každou utracenou korunu. Za rok běžných výdajů lze nasbírat míle na letenku do Londýna nebo Říma.</p>

<h2>Strategie: Soustřeďte se na jeden program</h2>
<p>Největší chybou začátečníků je sbírání mil ve více programech najednou. Míle expirují a malé zůstatky jsou k ničemu. Vyberte si jeden nebo dva programy a soustřeďte se na ně. Konzistence je klíčem k bezplatným letenkám.</p>

<div class="bg-purple-50 border border-purple-200 rounded-xl p-6 my-8">
  <h3 class="text-xl font-bold text-purple-800 mb-3">🏆 Tip od zkušených cestovatelů</h3>
  <p class="text-purple-700">Nejlepší hodnotu z mil získáte při výměně za business nebo first class letenky na dálkových linkách. Zatímco economy letenka Praha–New York stojí 15 000 Kč, business class stojí 80 000 Kč — ale za míle ji pořídíte za stejný počet bodů jako economy.</p>
</div>

<h2>Kde hledat letenky za míle?</h2>
<p>Odměnové letenky jsou dostupné přímo na webech aerolinek. Ale pro porovnání cen a dostupnosti volných míst použijte <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a> — zobrazí vám všechny dostupné lety a pomůže naplánovat cestu, kterou pak zaplatíte milemi.</p>

<h2>Pozor na expiraci mil</h2>
<p>Míle mají omezenou platnost — obvykle 18–36 měsíců od poslední aktivity na účtu. Aby míle nevypršely, stačí jednou za čas uskutečnit malou transakci — koupit časopis v letištním obchodě nebo zaplatit kreditní kartou. Sledujte expirační data a plánujte uplatnění včas.</p>

</article>`,
    featuredImage: "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=1200&q=80",
    category: "tips",
    keywords: "věrnostní programy aerolinek, míle letenky, jak létat zdarma, Miles and More, Flying Blue, Avios, sbírání mil",
    metaDescription: "Věrnostní programy aerolinek: jak sbírat míle a létat zdarma. Miles & More, Flying Blue, Avios a kreditní karty pro české cestovatele.",
  },
  {
    title: "Příruční zavazadlo zdarma: Kompletní přehled pravidel aerolinek 2025",
    slug: "prirucni-zavazadlo-zdarma-pravidla-aerolinek",
    excerpt: "Pravidla pro příruční zavazadla se liší u každé aerolinky a neustále se mění. Přinášíme aktuální přehled rozměrů a váhy příručního zavazadla u Ryanair, Wizz Air, easyJet a dalších pro rok 2025.",
    content: `<article class="travel-tip-article">

<p class="lead">Poplatky za zavazadla mohou zdvojnásobit cenu letenky. Znát pravidla pro příruční zavazadlo je proto klíčové pro každého, kdo chce skutečně ušetřit.</p>

<img src="https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80" alt="Příruční zavazadlo - cestování letadlem" class="w-full rounded-xl my-6" />

<h2>Ryanair — příruční zavazadlo 2025</h2>
<p><strong>Zdarma:</strong> Malá taška 40×20×25 cm (pod sedadlo před vámi). <strong>Placená:</strong> Kabinové zavazadlo 55×40×20 cm (do 10 kg) za 8–25 EUR podle tarifu. Priority boarding zahrnuje kabinové zavazadlo zdarma. Tip: Koupit Priority při rezervaci je levnější než přidat zavazadlo dodatečně.</p>

<h2>Wizz Air — příruční zavazadlo 2025</h2>
<p><strong>Zdarma:</strong> Malá taška 40×30×20 cm (pod sedadlo). <strong>Placená:</strong> Kabinové zavazadlo 55×40×23 cm (do 10 kg) za 5–15 EUR. Wizz Air má přísnější kontroly rozměrů než ostatní nízkonákladové aerolinky — měřte přesně.</p>

<h2>easyJet — příruční zavazadlo 2025</h2>
<p><strong>Zdarma:</strong> Kabinové zavazadlo 56×45×25 cm (bez omezení váhy, musí se vejít do přihrádky). easyJet je v tomto ohledu nejvelkorysejší z nízkonákladových aerolinek — zdarma dostanete plnohodnotné kabinové zavazadlo.</p>

<img src="https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=800&q=80" alt="Balení zavazadla - tipy pro cestovatele" class="w-full rounded-xl my-6" />

<h2>Czech Airlines — příruční zavazadlo 2025</h2>
<p><strong>Zdarma:</strong> Kabinové zavazadlo 55×45×25 cm do 8 kg + osobní věc 40×30×15 cm. Czech Airlines jsou v tomto ohledu štědřejší než nízkonákladové aerolinky a příruční zavazadlo je vždy zdarma.</p>

<h2>Lufthansa — příruční zavazadlo 2025</h2>
<p><strong>Zdarma:</strong> Kabinové zavazadlo 55×40×23 cm do 8 kg + osobní věc. Platí pro všechny tarifu včetně nejlevnějšího Light. Lufthansa Group (Austrian, Swiss) má stejná pravidla.</p>

<div class="bg-orange-50 border border-orange-200 rounded-xl p-6 my-8">
  <h3 class="text-xl font-bold text-orange-800 mb-3">📏 Zlaté pravidlo</h3>
  <p class="text-orange-700">Vždy měřte zavazadlo doma, ne jen odhadujte. Aerolinky mají měřicí rámy na letišti a při překročení rozměrů zaplatíte pokutu 50–100 EUR. Investice do správně dimenzovaného kabinového kufru se rychle vrátí.</p>
</div>

<h2>Tipy pro maximalizaci prostoru v příručním zavazadle</h2>
<p>Rolování oblečení místo skládání ušetří až 30 % místa. Využijte kompresní vaky pro bundy a svetry. Tekutiny (do 100 ml) dejte do průhledného sáčku — ušetříte čas při bezpečnostní kontrole. Těžší věci (boty, elektronika) dejte na dno kufru.</p>

<h2>Kdy se vyplatí přidat odbavené zavazadlo?</h2>
<p>Pokud cestujete déle než 5 dní nebo vezete sportovní vybavení, může být odbavené zavazadlo výhodné. Porovnejte cenu za zavazadlo s cenou praní prádla v destinaci. Pro kratší cesty je příruční zavazadlo vždy lepší volba — ušetříte čas na letišti i peníze.</p>

<p>Před každou cestou zkontrolujte aktuální pravidla na webu aerolinky nebo při rezervaci na <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a>, kde jsou podmínky přehledně zobrazeny pro každý let.</p>

</article>`,
    featuredImage: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=1200&q=80",
    category: "tips",
    keywords: "příruční zavazadlo zdarma, rozměry příručního zavazadla, Ryanair zavazadlo, Wizz Air zavazadlo, easyJet zavazadlo, pravidla aerolinek zavazadla 2025",
    metaDescription: "Přehled pravidel příručního zavazadla u Ryanair, Wizz Air, easyJet a Lufthansa 2025. Rozměry, váha a tipy jak ušetřit na poplatcích.",
  },
  {
    title: "Jak se vyhnout skrytým poplatkům při nákupu letenek online",
    slug: "skryte-poplatky-letenky-jak-se-vyhnout",
    excerpt: "Cena letenky v inzerátu a skutečná cena při platbě se mohou výrazně lišit. Prozradíme vám, jaké skryté poplatky aerolinky a vyhledávače přidávají a jak se jim vyhnout.",
    content: `<article class="travel-tip-article">

<p class="lead">Koupili jste letenku za 999 Kč a zaplatili 2 400 Kč? Skryté poplatky jsou realitou leteckého průmyslu. Ale s správnými znalostmi se jim dá vyhnout nebo je minimalizovat.</p>

<img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80" alt="Online nákup letenek - skryté poplatky" class="w-full rounded-xl my-6" />

<h2>Poplatek za platbu kartou</h2>
<p>Mnoho aerolinek a rezervačních systémů přidává poplatek za platbu kreditní kartou (1–3 % z ceny). Platba debetní kartou nebo bankovním převodem bývá zdarma. Ryanair a Wizz Air tento poplatek zrušily, ale jiní dopravci ho stále účtují. Vždy zkontrolujte celkovou cenu před potvrzením platby.</p>

<h2>Poplatek za výběr místa</h2>
<p>Výběr konkrétního místa v letadle stojí u nízkonákladových aerolinek 100–500 Kč na osobu na let. Pokud místo nevyberete, systém vám ho přidělí automaticky — a to zdarma. Výjimka: rodiny s dětmi, pro které je sezení vedle sebe zákonná povinnost aerolinky.</p>

<h2>Poplatek za tisk palubního lístku</h2>
<p>Ryanair účtuje 55 EUR za tisk palubního lístku na letišti. Vždy si stáhněte palubní lístek do telefonu nebo ho vytiskněte doma. Tato pokuta je jednou z nejčastějších pastí pro nepozorné cestovatele.</p>

<img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80" alt="Platba online - nákup letenek" class="w-full rounded-xl my-6" />

<h2>Cestovní pojištění: Opt-out vs. Opt-in</h2>
<p>Mnoho rezervačních systémů automaticky přidá cestovní pojištění do košíku. Pokud ho nechcete, musíte ho aktivně odebrat — hledejte zaškrtávací políčko nebo rozbalovací menu. Toto pojištění bývá předražené a nekvalitní — lepší je sjednat pojištění samostatně.</p>

<h2>Poplatek za zavazadla: Největší past</h2>
<p>Cena letenky bez zavazadla může být lákavá, ale přidání odbaveného zavazadla při rezervaci stojí 15–40 EUR. Na letišti zaplatíte 2–3× více. Vždy počítejte s cenou zavazadla do celkové ceny letenky.</p>

<h2>Jak se vyhnout skrytým poplatkům</h2>
<p>Nejlepší ochrana je porovnávat celkové ceny, ne jen základní tarify. <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a> zobrazuje celkovou cenu včetně poplatků, takže vidíte skutečnou cenu od začátku. Vždy čtěte podmínky tarifu před nákupem.</p>

<div class="bg-red-50 border border-red-200 rounded-xl p-6 my-8">
  <h3 class="text-xl font-bold text-red-800 mb-3">🚨 Nejčastější pasti</h3>
  <ul class="text-red-700 space-y-2">
    <li>• Automaticky přidané pojištění v košíku</li>
    <li>• Poplatek za platbu kreditní kartou</li>
    <li>• Zapomenutý tisk palubního lístku (Ryanair: 55 EUR)</li>
    <li>• Zavazadlo přidané na letišti místo při rezervaci</li>
    <li>• Přesměrování na dražší tarif při výběru místa</li>
  </ul>
</div>

<h2>Pravidlo: Vždy porovnejte celkovou cenu</h2>
<p>Před kliknutím na "Koupit" zkontrolujte celkovou cenu včetně všech poplatků. Pokud se cena výrazně liší od inzerované, zjistěte proč. Transparentní vyhledávače jako Kiwi.com nebo Google Flights zobrazují celkové ceny bez překvapení.</p>

<p>Vědomost je nejlepší ochrana. Teď víte, kde hledat skryté poplatky — a jak se jim vyhnout při příštím nákupu letenky na <a href="${KIWI_LINK}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a>.</p>

</article>`,
    featuredImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",
    category: "tips",
    keywords: "skryté poplatky letenky, poplatek za zavazadlo, poplatek za platbu kartou, Ryanair poplatky, jak ušetřit na letenkách, celková cena letenky",
    metaDescription: "Jak se vyhnout skrytým poplatkům při nákupu letenek? Poplatky za zavazadla, platbu kartou, výběr míst a jak je minimalizovat.",
  },
];

async function seed() {
  const conn = await mysql.createConnection(DB_URL);
  
  console.log(`Seeding ${articles.length} travel tips articles...`);
  
  for (const article of articles) {
    const now = new Date();
    
    // Check if article with this slug already exists
    const [existing] = await conn.execute(
      "SELECT id FROM articles WHERE slug = ?",
      [article.slug]
    );
    
    if (existing.length > 0) {
      console.log(`  ⏭️  Skipping (already exists): ${article.slug}`);
      continue;
    }
    
    await conn.execute(
      `INSERT INTO articles (title, slug, content, excerpt, metaDescription, keywords, featuredImage, author, category, status, publishedAt, viewCount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        article.title,
        article.slug,
        article.content,
        article.excerpt,
        article.metaDescription,
        article.keywords,
        article.featuredImage,
        "Akční Letenky",
        article.category,
        "published",
        now,
        Math.floor(Math.random() * 500) + 100, // Simulated view count
        now,
        now,
      ]
    );
    
    console.log(`  ✅ Inserted: ${article.title}`);
  }
  
  await conn.end();
  console.log("\n✅ Travel tips seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
