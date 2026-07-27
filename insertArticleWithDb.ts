import "dotenv/config";
import { getDb } from "./server/db";
import { articles } from "./drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available (check DATABASE_URL)");
    process.exit(1);
  }

  const articleData = {
    title: "Zpátky na koleje: Proč čím dál více cestovatelů dává přednost pomalému cestování vlakem",
    slug: "zpatky-na-koleje-proc-cim-dal-vice-cestovatelu-dava-prednost-pomalemu-cestovani-vlakem",
    excerpt: "Čím dál více cestovatelů po celém světě objevuje kouzlo pomalého cestování. Vlaky zažívají obrovský boom – v Británii lámou stoleté rekordy, v USA vzkvétá Amtrak a noční i luxusní spojení napříč Evropou zažívají renesanci.",
    metaDescription: "Zpátky na koleje! Zjistěte, proč lidé po celém světě mění rychlá letadla za romantiku vlaků, jaké jsou nejpopulárnější trasy a jak ušetřit na jízdenkách.",
    keywords: "cestování vlakem, slow travel, pomalé cestování, vlakové trasy, vlakové zájezdy, Amtrak, noční vlaky, evropské železnice",
    featuredImage: "/blog-images/scenic-train-mountains.jpg",
    author: "Akční Letenky Redakce",
    category: "tips",
    status: "published" as const,
    publishedAt: new Date(),
    content: `# Zpátky na koleje: Proč čím dál více cestovatelů dává přednost pomalému cestování vlakem

V době, kdy se většina světa snaží dostat z bodu A do bodu B co nejrychleji, dochází v cestovním ruchu k pozoruhodnému fenoménu. Čím dál více lidí podléhá kouzlu tzv. **„slow travel“** (pomalého cestování) a volí cestu po kolejích místo přeplněných letištních terminálů.

Železniční doprava zažívá globální renesanci. Vzkvétají jak dostupná noční spojení a vyhlídkové trasy, tak extrémně luxusní vlaky, které nabízejí komfort pětihvězdičkového hotelu na kolečkách.

---

## Proč roste obliba cestování vlakem?

1. **Pohodlí a klid bez letištního stresu**  
   Žádné příchody dvě hodiny předem, zdlouhavé bezpečnostní kontroly ani svlékání pásků. Na vlakové nádraží v centru města stačí dorazit pár minut před odjezdem a pohodlně nastoupit.

2. **Cesta jako samotný zážitek**  
   Místo pohledu na mraky z výšky deseti kilometrů sledujete proměňující se krajinu, horské průsmyky, řeky a malebná městečka přímo ze svého sedadla nebo jídelního vozu.

3. **Ekologičtější volba**  
   Železniční doprava vyprodukuje zlomek CO2 ve srovnání s leteckou či automobilovou dopravou. Pro čím dál více cestovatelů je udržitelnost klíčovým faktorem při výběru dovolené.

4. **Příjezd přímo do centra měst**  
   Většina hlavních vlakových nádraží leží přímo v srdci metropolí. Po vystoupení z vlaku jste okamžitě u památek, hotelů a návazné městské hromadné dopravy.

---

## Světový boom: Od Velké Británie po Ameriku

### 🇬🇧 Británie hlásí rekordy za více než 100 let
Ve Spojeném království je cestování vlakem nejpopulárnější od počátku 20. století. Cestující stále častěji volí železnici pro vnitrostátní cesty mezi Londýnem, Skotskem či Walesem, ale i pro mezinárodní spojení Eurostarem do Paříže či Bruselu.

### 🇺🇸 Americký Amtrak zažívá zlaté časy
Spojené státy byly dlouho považovány za zemi s dominancí letecké a automobilové dopravy. Americký národní dopravce **Amtrak** však hlásí rekordní počty cestujících. Dlouhé kontinentální trasy napříč Skalnatými horami a pobřežím Tichého oceánu se stávají vyhledávaným zážitkem pro domácí i zahraniční turisty.

### 🇪🇺 Evropa: Návrat nočních vlaků a luxusních expresů
Evropa stojí v čele železniční revoluce. Operátoři jako rakouský **ÖBB (Nightjet)** masivně investují do nových moderních lůžkových vozů. Zároveň vznikají nové luxusní projekty jako *La Dolce Vita Orient Express* v Itálii nebo znovuzrozené legendy jako *Golden Eagle* a *Belmond*.

---

## Nejkrásnější trasy, které musíte zažít

- **Glacier Express (Švýcarsko):** Legendární osmihodinová cesta přes 291 mostů a 91 tunelů skrz švýcarské Alpy z Zermattu do St. Moritz.
- **West Highland Line (Skotsko):** Průjezd divokou skotskou vysočinou včetně slavného viaduktu Glenfinnan, známého ze sérií o Harrym Potterovi.
- **Bernina Express (Švýcarsko – Itálie):** Trasa zařazená na seznam UNESCO, která vás zaveze z alpských ledovců až pod italské palmy.
- **Cinque Terre Express (Itálie):** Nádherná skalní trasa spojující pět pitoreskních vesniček na pobřeží Ligurského moře.

---

## Jak ušetřit při plánování cesty vlakem?

- **Rezervujte v předstihu:** Stejně jako u letenek, i jízdenky na dálkové a vysokorychlostní vlaky (TGV, ICE, Eurostar, Railjet) bývají nejlevnější 2 až 3 měsíce předem.
- **Využijte síťové jízdenky (Interrail / Eurail):** Pokud plánujete projet více zemí, Interrail pas vám umožní neomezené cestování po evropské železniční síti za výhodnou paušální cenu.
- **Kombinujte vlak s lety:** Často dává smysl doletět akční letenkou do evropské metropole (např. Řím, Paříž, Curych) a odtud pokračovat vyhlídkovým vlakem do okolních regionů.

---

## Závěr

Pomalé cestování vlakem není jen o přepravě z místa na místo – je to návrat ke kořenům cestování, kdy cesta samotná tvoří nejkrásnější část dovolené. Zkuste při příštím plánování vyměnit letadlo za koleje a objevit krásu světa z okna vlaku!`,
  };

  try {
    await db.insert(articles).values(articleData);
    console.log("✅ Successfully created slow travel blog article in database!");
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY" || err.message?.includes("Duplicate")) {
      console.log("ℹ️ Article already exists in database.");
    } else {
      console.error("❌ Error inserting article:", err);
    }
  }
}

main().catch(console.error);
