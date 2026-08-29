/**
 * Social Media Automation (Facebook & Instagram)
 * 
 * Meta Graph API Integration & Post Generator for Akční Letenky.
 * Automatically formats and publishes top flight deals and blog guides
 * to Facebook Pages and Instagram Business accounts.
 */

import { getDb } from "./db";
import { socialPosts, flights, articles, type Flight, type Article, type InsertSocialPost } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

interface PublishResult {
  success: boolean;
  fbPostId?: string;
  igMediaId?: string;
  fbError?: string;
  igError?: string;
  isSimulated: boolean;
}

// Default hashtags for travel & cheap flights
export const DEFAULT_HASHTAGS = [
  "#akcniletenky",
  "#levneletenky",
  "#cestovani",
  "#letenky",
  "#dovolenky",
  "#akcniceny",
  "#dnescestujem",
  "#dnesletim",
  "#tipnacestovani",
  "#vyhodneletenky",
];

// Captivating destination descriptions dictionary for social posts
export const DESTINATION_DESCRIPTIONS: Record<string, string> = {
  "Dubaj": "☀️ Objevte město budoucnosti! Čekají vás ikonické mrakodrapy s Burj Khalifa v čele, luxusní nákupy, nekonečné písečné pláže, pouštní safari i futuristické atrakce.",
  "Bali": "🌴 Ráj na zemi pro milovníky přírody, surfování a relaxu. Prozkoumejte úchvatná terasovitá rýžová políčka, posvátné chrámy, tyrkysový oceán a vyhlášenou gastro scénu.",
  "New York": "🗽 Město, které nikdy nespí! Projděte se po Times Square, odpočiňte si v Central Parku, užijte si výhled z Empire State Building a zažijte neopakovatelnou atmosféru Wall Street i Broadwaye.",
  "Řím": "🏛️ Věčné město plné historie, antických památek a neodolatelné atmosféry! Ochutnejte pravou pizzu, pravé gelato a navštivte Koloseum i Vatikán.",
  "Paříž": "🗼 Město lásky, umění a gastronomie. Projděte se kolem Eiffelovy věže, navštivte klenoty v muzeu Louvre a vychutnejte si čerstvý křupavý croissant s kávou v útulné kavárničce.",
  "Tokio": "⛩️ Dokonalé spojení futuristických technologií a starobylých tradic! Ochutnejte nejlepší čerstvé sushi, navštivte buddhistické chrámy a zažijte neony osvícenou špičkovou čtvrť Šibuja.",
  "Londýn": "🏰 Historické srdce Velké Británie! Prohlédněte si ikonický Big Ben, Tower Bridge, červené dvoupodlažní autobusy a světová muzea se vstupem zdarma.",
  "Barcelona": "🌊 Slunečné město s dechberoucí architekturou Antoniho Gaudího (Sagrada Família), živou pláží Barceloneta, vynikajícími tapas a nespoutanou noční atmosférou.",
  "Maledivy": "🏝️ Absolutní tropický ráj s vodními vilami nad tyrkysovou lagunou. Bílé korálové pláže, šnorchlování s mantami a želvami a ničím nerušený odpočinek.",
  "Zanzibar": "🏝️ Exotický ostrov koření v Indickém oceánu. Křídově bílé pláže, azurové moře, historické město Stone Town a safari v Tanzanii na dosah ruky.",
  "Reúnion": "🌋 Divoký tropický ostrov s činnou sopkou Piton de la Fournaise, dramatickými kaňony, vodopády a bujnou pralesní přírodou pro opravdové dobrodruhy.",
  "Bangkok": "🛺 Pulzující thajská metropole plná pozlacených chrámů, světoznámého street foodu na každém rohu a divokého nočního života.",
  "Island": "🌌 Země ohně a ledu! Zažijte polární záři, kouřící gejzíry, mohutné vodopády, černé vulkanické pláže a termální lázně Blue Lagoon.",
  "Mallorca": "☀️ Nejkrásnější perla Středozemního moře! Tyrkysové zátoky (calas), romantická horská městečka, cyklistické trasy a středomořská kuchyně.",
  "Istanbul": "🕌 Město na pomezí dvou kontinentů! Obdivujte architekturu Hagia Sophia, procházejte se po Velkém Bazaru a vychutnejte si tradiční turecký čaj při západu slunce nad Bosporem.",
  "Los Angeles": "🎬 Slunečná Kalifornie, Hollywood a chodník slávy! Projděte se po slavné pláži Santa Monica, navštivte filmová studia a zažijte americký sen.",
  "Miami": "🌴 Tropický pulzující hotspot Floridy s ikonickými Art Deco budovami na South Beach, latinskoamerickým jídlem a tyrkysovým Atlantikem.",
  "Cancún": "🇲🇽 Mexická Riviera s karibským tyrkysovým mořem, mayskými pyramidami Chichén Itzá a nezapomenutelným jídlem (tacos, guacamole, tequila).",
  "Srí Lanka": "🐘 Ostrov čaje, divokých slonů a zelených hor! Projeďte se slavným modrým vlakem mezi čajovými plantážemi a navštivte starobylou skalní pevnost Sigiriya.",
};

export function getDestinationDescription(city: string): string {
  if (DESTINATION_DESCRIPTIONS[city]) {
    return DESTINATION_DESCRIPTIONS[city];
  }
  const key = Object.keys(DESTINATION_DESCRIPTIONS).find(
    (k) => k.toLowerCase() === city.toLowerCase()
  );
  if (key) {
    return DESTINATION_DESCRIPTIONS[key];
  }
  return `✨ Objevte kouzlo destinace ${city}! Čeká vás nezapomenutelná atmosféra, místní gastronomické speciality, bohatá kultura a skvělé zážitky. Využijte akční ceny letenek a vyrazte za novým dobrodružstvím!`;
}

/**
 * Format a Flight Deal into an engaging Social Media Caption for FB & IG
 */
export function formatFlightDealPost(flight: Partial<Flight>): {
  title: string;
  caption: string;
  hashtags: string;
  imageUrl: string;
  linkUrl: string;
} {
  const from = flight.fromCity || "Praha";
  const to = flight.toCity || "Destinace";
  const price = flight.price ? `${flight.price.toLocaleString("cs-CZ")} Kč` : "Super cena";
  const originalPrice = flight.originalPrice ? `${flight.originalPrice.toLocaleString("cs-CZ")} Kč` : null;
  const discountPercent = flight.discountPercent || (flight.originalPrice && flight.price ? Math.round((1 - flight.price / flight.originalPrice) * 100) : 0);
  const airline = flight.airline || "Letecká společnost";
  
  const title = `🔥 AKČNÍ LETENKY: ${from} ↔ ${to} za ${price}!`;
  const destinationDesc = getDestinationDescription(to);
  
  let caption = `⚡ EXKLUZIVNÍ NABÍDKA LETENEK! ✈️\n\n`;
  caption += `📍 Trasa: ${from} ↔ ${to}\n`;
  caption += `💰 Akční cena: ${price}\n`;
  if (originalPrice) {
    caption += `🏷️ Běžná cena: ${originalPrice} (Ušetříte ${discountPercent}%!)\n`;
  }
  caption += `✈️ Aerolinka: ${airline}\n`;
  if (flight.remainingSeats && flight.remainingSeats <= 5) {
    caption += `⏰ Rychle! Zbývá pouze ${flight.remainingSeats} volných míst za tuto cenu.\n`;
  }
  caption += `\n✨ Co vás čeká v destinaci ${to}?\n`;
  caption += `${destinationDesc}\n\n`;
  
  const linkUrl = flight.affiliateUrl || `https://www.akcni-letenky.com/letenky`;
  const holidayUrl = `https://www.akcni-letenky.com/dovolene?destination=${encodeURIComponent(to)}`;

  caption += `👉 JAK REZERVOVAT:\n`;
  caption += `✈️ Samostatné akční letenky: ${linkUrl}\n`;
  caption += `🏨 Kompletní zájezdy & dovolená v ${to}: ${holidayUrl}\n\n`;
  
  const hashtags = DEFAULT_HASHTAGS.join(" ") + ` #${to.replace(/\s+/g, "").toLowerCase()} #letenky${to.replace(/\s+/g, "").toLowerCase()}`;
  caption += hashtags;

  const imageUrl = flight.imageUrl || "https://www.akcni-letenky.com/hero-coastal.jpg";

  return { title, caption, hashtags, imageUrl, linkUrl };
}

/**
 * Format a Blog Article into an engaging Social Media Caption
 */
export function formatBlogArticlePost(article: Partial<Article>): {
  title: string;
  caption: string;
  hashtags: string;
  imageUrl: string;
  linkUrl: string;
} {
  const articleTitle = article.title || "Tipy pro cestovatele";
  const excerpt = article.excerpt || article.metaDescription || "Přečtěte si nejnovější průvodce a tipy pro cestování.";
  const linkUrl = article.slug ? `https://www.akcni-letenky.com/blog/${article.slug}` : "https://www.akcni-letenky.com/blog";

  const title = `📖 NOVÝ ČLÁNEK: ${articleTitle}`;

  let caption = `💡 PRŮVODCE PRO CESTOVATELE 🗺️\n\n`;
  caption += `👉 ${articleTitle}\n\n`;
  caption += `${excerpt}\n\n`;
  caption += `📌 V článku se dozvíte:\n`;
  caption += `• Praktické tipy a doporučení\n`;
  caption += `• Kde najít nejlepší místa a zážitky\n`;
  caption += `• Jak ušetřit při plánování cesty\n\n`;
  caption += `🔗 Čtěte celý článek zdarma na webu: ${linkUrl}\n\n`;

  const hashtags = DEFAULT_HASHTAGS.join(" ") + " #pruvodce #dovolenacesko #cestovani2026";
  caption += hashtags;

  const imageUrl = article.featuredImage || "https://www.akcni-letenky.com/hero-coastal.jpg";

  return { title, caption, hashtags, imageUrl, linkUrl };
}

/**
 * Publish post to Facebook Page via Meta Graph API
 */
export async function publishToFacebook(post: {
  title?: string;
  caption: string;
  imageUrl?: string;
  linkUrl?: string;
}): Promise<{ success: boolean; postId?: string; error?: string; isSimulated: boolean }> {
  const pageId = process.env.FB_PAGE_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  // Dry-run simulation mode when credentials not configured
  if (!pageId || !accessToken) {
    console.log("[SocialMedia] Facebook API credentials missing. Running in DRY-RUN SIMULATION mode.");
    return {
      success: true,
      postId: `simulated_fb_post_${Date.now()}`,
      isSimulated: true,
    };
  }

  try {
    let url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    let body: Record<string, any> = {
      message: post.caption,
      access_token: accessToken,
    };

    if (post.linkUrl) {
      body.link = post.linkUrl;
    }

    // If image URL is provided and valid HTTP link, publish photo post
    if (post.imageUrl && post.imageUrl.startsWith("http")) {
      url = `https://graph.facebook.com/v19.0/${pageId}/photos`;
      body = {
        url: post.imageUrl,
        caption: post.caption,
        access_token: accessToken,
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMsg = data.error?.message || response.statusText || "Facebook Graph API returned error";
      console.error("[SocialMedia] Facebook API error:", data.error);
      return { success: false, error: errorMsg, isSimulated: false };
    }

    return {
      success: true,
      postId: data.id || data.post_id,
      isSimulated: false,
    };
  } catch (err: any) {
    console.error("[SocialMedia] Error publishing to Facebook:", err);
    return {
      success: false,
      error: err.message || "Network error publishing to Facebook",
      isSimulated: false,
    };
  }
}

/**
 * Publish post to Instagram Business Account via Meta Graph API
 */
export async function publishToInstagram(post: {
  caption: string;
  imageUrl: string;
}): Promise<{ success: boolean; mediaId?: string; error?: string; isSimulated: boolean }> {
  const igUserId = process.env.IG_USER_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  // Dry-run simulation mode when credentials not configured
  if (!igUserId || !accessToken) {
    console.log("[SocialMedia] Instagram API credentials missing. Running in DRY-RUN SIMULATION mode.");
    return {
      success: true,
      mediaId: `simulated_ig_media_${Date.now()}`,
      isSimulated: true,
    };
  }

  try {
    const validImageUrl = post.imageUrl && post.imageUrl.startsWith("http")
      ? post.imageUrl
      : "https://www.akcni-letenky.com/hero-coastal.jpg";

    // Step 1: Create IG Media Container
    const containerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;
    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: validImageUrl,
        caption: post.caption,
        access_token: accessToken,
      }),
    });

    const containerData = await containerRes.json();

    if (!containerRes.ok || containerData.error || !containerData.id) {
      const errorMsg = containerData.error?.message || "Failed to create Instagram media container";
      console.error("[SocialMedia] Instagram Container Error:", containerData.error);
      return { success: false, error: errorMsg, isSimulated: false };
    }

    const creationId = containerData.id;

    // Step 2: Publish IG Media Container
    const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });

    const publishData = await publishRes.json();

    if (!publishRes.ok || publishData.error || !publishData.id) {
      const errorMsg = publishData.error?.message || "Failed to publish Instagram media";
      console.error("[SocialMedia] Instagram Publish Error:", publishData.error);
      return { success: false, error: errorMsg, isSimulated: false };
    }

    return {
      success: true,
      mediaId: publishData.id,
      isSimulated: false,
    };
  } catch (err: any) {
    console.error("[SocialMedia] Error publishing to Instagram:", err);
    return {
      success: false,
      error: err.message || "Network error publishing to Instagram",
      isSimulated: false,
    };
  }
}

/**
 * Publish Instagram Story with Deal Link via Meta Graph API
 */
export async function publishInstagramStory(post: {
  imageUrl: string;
  linkUrl: string;
}): Promise<{ success: boolean; mediaId?: string; error?: string; isSimulated: boolean }> {
  const igUserId = process.env.IG_USER_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!igUserId || !accessToken) {
    console.log("[SocialMedia] Instagram API credentials missing. Running Story in DRY-RUN SIMULATION mode.");
    return {
      success: true,
      mediaId: `simulated_ig_story_${Date.now()}`,
      isSimulated: true,
    };
  }

  try {
    const validImageUrl = post.imageUrl && post.imageUrl.startsWith("http")
      ? post.imageUrl
      : "https://www.akcni-letenky.com/hero-coastal.jpg";

    // Step 1: Create IG Story Media Container
    const containerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;
    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "STORIES",
        image_url: validImageUrl,
        access_token: accessToken,
      }),
    });

    const containerData = await containerRes.json();

    if (!containerRes.ok || containerData.error || !containerData.id) {
      const errorMsg = containerData.error?.message || "Failed to create Instagram Story container";
      return { success: false, error: errorMsg, isSimulated: false };
    }

    const creationId = containerData.id;

    // Step 2: Publish IG Story Container
    const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });

    const publishData = await publishRes.json();

    if (!publishRes.ok || publishData.error || !publishData.id) {
      const errorMsg = publishData.error?.message || "Failed to publish Instagram Story";
      return { success: false, error: errorMsg, isSimulated: false };
    }

    return {
      success: true,
      mediaId: publishData.id,
      isSimulated: false,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error publishing Instagram Story",
      isSimulated: false,
    };
  }
}

/**
 * Execute full publication flow for a socialPost entry
 */
export async function executeSocialPublishing(postId: number): Promise<PublishResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: true,
      fbPostId: `simulated_fb_${Date.now()}`,
      igMediaId: `simulated_ig_${Date.now()}`,
      isSimulated: true,
    };
  }

  const [post] = await db.select().from(socialPosts).where(eq(socialPosts.id, postId)).limit(1);

  if (!post) {
    throw new Error(`Social post with ID ${postId} not found`);
  }

  let fbResult: any = { success: true, postId: undefined, error: undefined, isSimulated: true };
  let igResult: any = { success: true, mediaId: undefined, error: undefined, isSimulated: true };

  const targetPlatform = post.platform || "both";

  // Publish to Facebook if target is facebook, both, or all
  if (targetPlatform === "facebook" || targetPlatform === "both" || targetPlatform === "all") {
    fbResult = await publishToFacebook({
      title: post.title || undefined,
      caption: post.caption,
      imageUrl: post.imageUrl || undefined,
      linkUrl: post.linkUrl || undefined,
    });
  }

  // Publish to Instagram if target is instagram, both, or all
  if (targetPlatform === "instagram" || targetPlatform === "both" || targetPlatform === "all") {
    if (post.postType === "story") {
      igResult = await publishInstagramStory({
        imageUrl: post.imageUrl || "https://www.akcni-letenky.com/hero-coastal.jpg",
        linkUrl: post.linkUrl || "https://www.akcni-letenky.com",
      });
    } else {
      igResult = await publishToInstagram({
        caption: post.caption,
        imageUrl: post.imageUrl || "https://www.akcni-letenky.com/hero-coastal.jpg",
      });
    }
  }

  const isOverallSuccess = fbResult.success && igResult.success;
  const status = isOverallSuccess ? "published" : "failed";

  await db
    .update(socialPosts)
    .set({
      status,
      publishedAt: new Date(),
      fbPostId: fbResult.postId,
      igMediaId: igResult.mediaId,
      fbError: fbResult.error,
      igError: igResult.error,
      updatedAt: new Date(),
    })
    .where(eq(socialPosts.id, postId));

  return {
    success: isOverallSuccess,
    fbPostId: fbResult.postId,
    igMediaId: igResult.mediaId,
    fbError: fbResult.error,
    igError: igResult.error,
    isSimulated: fbResult.isSimulated || igResult.isSimulated,
  };
}
