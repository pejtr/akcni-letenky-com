/**
 * Wishlist Remarketing Service
 * 
 * Sends personalized remarketing emails to users who added flights to their wishlist
 * but didn't click through to purchase within 24 hours.
 * Supports A/B testing of email subject lines and CTA texts.
 */

import { getDb } from "./db";
import { wishlists, users, flights, remarketingEmailLog } from "../drizzle/schema";
import { sql, eq, and, lte, desc, gte } from "drizzle-orm";
import { isEmailServiceConfigured } from "./emailService";
import { pickEmailVariant, recordEmailSent, autoEvaluateAbTests, type EmailVariant } from "./emailAbTest";

interface UserWishlistData {
  email: string;
  name: string;
  items: Array<{
    wishlistId: number;
    userId: number;
    flightId: number;
    destinationId: string | null;
    addedAt: number | null;
    userName: string | null;
    userEmail: string | null;
    flightTitle: string | null;
    flightPrice: number;
    flightCountry: string | null;
    flightImageUrl: string | null;
    flightAffiliateUrl: string;
  }>;
}

/**
 * Process wishlist remarketing - find users with 24h+ old wishlist items
 * who haven't been sent a remarketing email yet
 */
export async function processWishlistRemarketing(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const configured = await isEmailServiceConfigured();
  if (!configured) {
    console.log("[WishlistRemarketing] Email service not configured, skipping");
    return 0;
  }

  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

  const staleWishlistItems = await db
    .select({
      wishlistId: wishlists.id,
      userId: wishlists.userId,
      flightId: wishlists.flightId,
      destinationId: wishlists.destinationId,
      addedAt: wishlists.addedAt,
      userName: users.name,
      userEmail: users.email,
      flightTitle: flights.toCity,
      flightPrice: flights.price,
      flightCountry: flights.toCity,
      flightImageUrl: flights.imageUrl,
      flightAffiliateUrl: flights.affiliateUrl,
    })
    .from(wishlists)
    .innerJoin(users, eq(wishlists.userId, users.id))
    .innerJoin(flights, eq(wishlists.flightId, flights.id))
    .where(
      and(
        lte(wishlists.addedAt, twentyFourHoursAgo),
        eq(wishlists.isFavorite, 1)
      )
    )
    .limit(50);

  if (staleWishlistItems.length === 0) {
    return 0;
  }

  // Group by user to send one email per user with all their wishlist items
  const userWishlists: Record<number, UserWishlistData> = {};

  for (const item of staleWishlistItems) {
    if (!item.userEmail) continue;
    
    const existing = userWishlists[item.userId];
    if (existing) {
      existing.items.push(item);
    } else {
      userWishlists[item.userId] = {
        email: item.userEmail,
        name: item.userName || "cestovatel",
        items: [item],
      };
    }
  }

  let sentCount = 0;

  // Pick A/B test variant (if active test exists)
  const abVariant = await pickEmailVariant();

  const userIds = Object.keys(userWishlists);
  for (const userIdStr of userIds) {
    const userId = Number(userIdStr);
    const userData = userWishlists[userId];
    try {
      const subject = getEmailSubject(userData, abVariant);
      await sendWishlistRemarketingEmail(userData, abVariant);
      
      // Record A/B test send
      if (abVariant) {
        await recordEmailSent(abVariant.variant);
      }

      // Log the email send to remarketing_email_log
      try {
        await db.insert(remarketingEmailLog).values({
          userId,
          userEmail: userData.email,
          userName: userData.name,
          variant: abVariant?.variant || "default",
          abTestId: null,
          subject,
          itemCount: userData.items.length,
          status: "sent",
        });
      } catch (logErr) {
        console.error(`[WishlistRemarketing] Failed to log email:`, logErr);
      }
      
      // Mark these wishlist items as remarketed by updating isFavorite to 2
      for (const item of userData.items) {
        await db
          .update(wishlists)
          .set({ isFavorite: 2 }) // 2 = remarketed
          .where(eq(wishlists.id, item.wishlistId));
      }
      
      sentCount++;
      console.log(`[WishlistRemarketing] Sent remarketing email to ${userData.email} (variant: ${abVariant?.variant || 'default'}) with ${userData.items.length} items`);
    } catch (error) {
      console.error(`[WishlistRemarketing] Failed to send to ${userData.email}:`, error);
    }
  }

  return sentCount;
}

/**
 * Get the email subject based on item count (segmented templates) and A/B variant
 */
function getEmailSubject(userData: UserWishlistData, abVariant: EmailVariant | null): string {
  const firstDest = userData.items[0]?.flightCountry || "vaší vysněné destinaci";
  const count = userData.items.length;

  if (abVariant) {
    return abVariant.subject
      .replace("{{name}}", userData.name)
      .replace("{{destination}}", firstDest)
      .replace("{{count}}", String(count));
  }

  // Segmented default subjects based on item count
  if (count === 1) {
    return `${userData.name}, vaše oblíbená letenka do ${firstDest} stále čeká!`;
  } else if (count <= 3) {
    return `${userData.name}, ${count} letenky ve vašich oblíbených čekají na rezervaci`;
  } else {
    return `${userData.name}, máte ${count} letenkových nabídek v oblíbených — ceny se mohou změnit!`;
  }
}

/**
 * Send a wishlist remarketing email to a user
 * Uses segmented templates based on item count + A/B test variant
 */
async function sendWishlistRemarketingEmail(
  userData: UserWishlistData,
  abVariant: EmailVariant | null
): Promise<void> {
  const { Resend } = await import("resend");

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Akční Letenky <onboarding@resend.dev>";
  const siteUrl = process.env.VITE_APP_URL || "https://akcni-letenky.manus.space";

  // Get the active A/B test ID for tracking pixel
  let activeTestId: number | null = null;
  if (abVariant) {
    try {
      const { getActiveEmailAbTest: getTest } = await import("./emailAbTest");
      const test = await getTest();
      if (test) activeTestId = test.id;
    } catch (e) {
      // Tracking is optional
    }
  }

  const itemCount = userData.items.length;
  const topItems = userData.items.slice(0, itemCount === 1 ? 1 : itemCount <= 3 ? 3 : 5);

  const subject = getEmailSubject(userData, abVariant);
  const ctaText = abVariant?.ctaText || (itemCount === 1 ? "Rezervovat teď" : itemCount <= 3 ? "Zobrazit nabídky" : "Prohlédnout všechny");

  const html = buildWishlistEmailHtml(
    userData.name,
    topItems,
    siteUrl,
    ctaText,
    activeTestId,
    abVariant?.variant || null,
    itemCount
  );

  await resend.emails.send({
    from: fromEmail,
    to: userData.email,
    subject,
    html,
  });
}

function buildWishlistEmailHtml(
  userName: string,
  items: UserWishlistData["items"],
  siteUrl: string,
  ctaText: string = "Rezervovat",
  testId: number | null = null,
  variant: "A" | "B" | null = null,
  totalItemCount: number = 1
): string {
  const itemsHtml = items.map((item) => {
    const title = item.flightTitle || "Zpáteční letenka";
    const price = item.flightPrice ? `${item.flightPrice.toLocaleString("cs-CZ")} Kč` : "skvělá cena";
    const link = item.flightAffiliateUrl || `${siteUrl}/levne-letenky`;
    const image = item.flightImageUrl || "";

    // Wrap links with click tracking redirect if A/B test is active
    const trackedLink = testId && variant
      ? `${siteUrl}/api/email/click?tid=${testId}&v=${variant}&url=${encodeURIComponent(link)}`
      : link;

    return `
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;">
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${image ? `<td width="120" style="vertical-align:top;"><img src="${image}" width="120" height="80" style="border-radius:8px;object-fit:cover;" alt="${title}" /></td>` : ""}
        <td style="padding:0 15px;vertical-align:top;">
          <p style="margin:0 0 5px;font-weight:bold;color:#003087;font-size:15px;">${title}</p>
          <p style="margin:0 0 5px;color:#333;font-size:13px;">${item.flightCountry || ""}</p>
          <p style="margin:0;color:#E91E63;font-weight:bold;font-size:18px;">od ${price}</p>
        </td>
        <td width="120" style="vertical-align:middle;text-align:center;">
          <a href="${trackedLink}" style="display:inline-block;background:#E91E63;color:#fff;padding:8px 16px;border-radius:20px;text-decoration:none;font-size:13px;font-weight:bold;">
            ${ctaText}
          </a>
        </td>
      </tr>
      </table>
    </td></tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
  <tr><td style="background:linear-gradient(135deg,#003087,#0052cc);padding:30px 40px;text-align:center;">
    <h1 style="color:#FFD700;margin:0;font-size:24px;">Akční Letenky</h1>
    <p style="color:#fff;margin:8px 0 0;font-size:14px;opacity:0.9;">Vaše oblíbené letenky čekají!</p>
  </td></tr>
  <tr><td style="padding:30px 40px;">
    <h2 style="color:#003087;margin:0 0 15px;font-size:20px;">Ahoj ${userName}!</h2>
    ${totalItemCount === 1 ? `
    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Vaše oblíbená letenka stále čeká na rezervaci. 
      <strong>Tato cena nemusí vydržet dlouho</strong> — zajistěte si ji ještě dnes!
    </p>` : totalItemCount <= 3 ? `
    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Máte ${totalItemCount} letenky v oblíbených, které stále čekají na vaši rezervaci.
      <strong>Ceny se mohou kdykoliv změnit</strong> — neváhejte a zajistěte si je!
    </p>` : `
    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Máte celkem <strong>${totalItemCount} letenkových nabídek</strong> v oblíbených!
      To je spousta skvělých příležitostí k cestování. Ceny se mění každý den — 
      <strong>rezervujte si ty nejlepší ještě dnes</strong>.
    </p>`}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF3E0;border-left:4px solid #FF9800;border-radius:4px;margin:0 0 20px;">
    <tr><td style="padding:12px 16px;">
      <p style="margin:0;color:#E65100;font-size:14px;font-weight:bold;">Zbývá omezený počet míst za tuto cenu!</p>
    </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
    ${itemsHtml}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0;">
    <tr><td style="text-align:center;">
      <a href="${testId && variant ? `${siteUrl}/api/email/click?tid=${testId}&v=${variant}&url=${encodeURIComponent(`${siteUrl}/levne-letenky?utm_source=remarketing&utm_medium=email&utm_campaign=wishlist_24h`)}` : `${siteUrl}/levne-letenky?utm_source=remarketing&utm_medium=email&utm_campaign=wishlist_24h`}" 
         style="display:inline-block;background:#003087;color:#fff;padding:12px 30px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:15px;">
        Zobrazit všechny akční letenky
      </a>
    </td></tr>
    </table>
    <p style="color:#666;font-size:13px;line-height:1.5;margin:15px 0 0;">
      <strong>Tip:</strong> Zpáteční letenky od 899 Kč — nové nabídky každý den!
    </p>
  </td></tr>
  <tr><td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
    <p style="color:#999;font-size:12px;margin:0;">
      Tento email jste obdrželi, protože máte uložené letenky v oblíbených na Akční Letenky.<br>
      <a href="${siteUrl}/odhlasit" style="color:#999;">Odhlásit se z odběru</a>
    </p>
  </td></tr>
</table>
${testId && variant ? `<img src="${siteUrl}/api/email/pixel?tid=${testId}&v=${variant}" width="1" height="1" alt="" style="display:none;" />` : ""}
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Get wishlist remarketing statistics
 */
export async function getWishlistRemarketingStats(): Promise<{
  totalFavorites: number;
  pendingRemarketing: number;
  alreadyRemarketed: number;
}> {
  const db = await getDb();
  if (!db) {
    return { totalFavorites: 0, pendingRemarketing: 0, alreadyRemarketed: 0 };
  }

  const stats = await db
    .select({
      isFavorite: wishlists.isFavorite,
      count: sql<number>`COUNT(*)`,
    })
    .from(wishlists)
    .where(sql`${wishlists.isFavorite} > 0`)
    .groupBy(wishlists.isFavorite);

  const result = { totalFavorites: 0, pendingRemarketing: 0, alreadyRemarketed: 0 };
  for (const s of stats) {
    const count = Number(s.count);
    result.totalFavorites += count;
    if (s.isFavorite === 1) result.pendingRemarketing = count;
    if (s.isFavorite === 2) result.alreadyRemarketed = count;
  }

  return result;
}

/**
 * Get remarketing email dashboard data - history of sent emails with open/click rates
 */
export async function getRemarketingEmailDashboard(days: number = 7): Promise<{
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  recentEmails: Array<{
    id: number;
    userEmail: string;
    userName: string | null;
    variant: string;
    subject: string;
    itemCount: number;
    status: string;
    openedAt: Date | null;
    clickedAt: Date | null;
    sentAt: Date;
  }>;
  dailyStats: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return { totalSent: 0, totalOpened: 0, totalClicked: 0, openRate: 0, clickRate: 0, recentEmails: [], dailyStats: [] };
  }

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  // Get recent emails
  const recentEmails = await db
    .select()
    .from(remarketingEmailLog)
    .orderBy(desc(remarketingEmailLog.sentAt))
    .limit(50);

  // Calculate totals
  const totalSent = recentEmails.length;
  const totalOpened = recentEmails.filter(e => e.status === "opened" || e.status === "clicked" || e.openedAt).length;
  const totalClicked = recentEmails.filter(e => e.status === "clicked" || e.clickedAt).length;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 10000) / 100 : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 10000) / 100 : 0;

  // Calculate daily stats
  const dailyMap: Record<string, { sent: number; opened: number; clicked: number }> = {};
  for (const email of recentEmails) {
    const date = email.sentAt ? new Date(email.sentAt).toISOString().split("T")[0] : "unknown";
    if (!dailyMap[date]) dailyMap[date] = { sent: 0, opened: 0, clicked: 0 };
    dailyMap[date].sent++;
    if (email.openedAt || email.status === "opened" || email.status === "clicked") dailyMap[date].opened++;
    if (email.clickedAt || email.status === "clicked") dailyMap[date].clicked++;
  }

  const dailyStats = Object.entries(dailyMap)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { totalSent, totalOpened, totalClicked, openRate, clickRate, recentEmails, dailyStats };
}

/**
 * Schedule the wishlist remarketing processor to run every 30 minutes
 */
export function scheduleWishlistRemarketing(): void {
  setInterval(async () => {
    try {
      const sent = await processWishlistRemarketing();
      if (sent > 0) {
        console.log(`[WishlistRemarketing] Sent ${sent} remarketing emails`);
      }
      // Auto-evaluate A/B tests after each batch
      const evalResult = await autoEvaluateAbTests();
      if (evalResult.winnersFound > 0) {
        console.log(`[WishlistRemarketing] A/B test auto-evaluation: ${evalResult.winnersFound} winner(s) found`);
      }
    } catch (error) {
      console.error("[WishlistRemarketing] Processing error:", error);
    }
  }, 30 * 60 * 1000); // Every 30 minutes

  console.log("[WishlistRemarketing] Processor scheduled (every 30 min)");
}
