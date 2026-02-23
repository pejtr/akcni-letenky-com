/**
 * WhatsApp Daily Message Generator
 * 
 * Generates a formatted WhatsApp message with top offers (60% flights, 40% holidays)
 * every day at 8:00 AM CET and sends a notification to the site owner.
 * 
 * The owner receives a notification with the pre-formatted message,
 * which they can copy and paste into the WhatsApp group.
 */

import { pelikanCache } from "./pelikanCache";
import { notifyOwner } from "./_core/notification";
import type { FlightOffer, VacationOffer } from "./pelikanFeed";

// ============ Constants ============

const DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const FLIGHTS_COUNT = 3; // 60% of 5
const HOLIDAYS_COUNT = 2; // 40% of 5
const SITE_URL = "https://akcni-letenky.com";

let whatsappTimeout: NodeJS.Timeout | null = null;
let whatsappInterval: NodeJS.Timeout | null = null;
let lastGeneratedMessage: string | null = null;
let lastGeneratedAt: Date | null = null;

// ============ Message Formatter ============

function formatPrice(price: number): string {
  return price.toLocaleString("cs-CZ");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateWhatsAppMessage(
  flights: (FlightOffer | VacationOffer)[],
  vacations: (FlightOffer | VacationOffer)[]
): string {
  const topFlights = flights
    .sort((a, b) => a.salePrice - b.salePrice)
    .slice(0, FLIGHTS_COUNT);

  const topVacations = vacations
    .sort((a, b) => a.salePrice - b.salePrice)
    .slice(0, HOLIDAYS_COUNT);

  const today = new Date().toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let message = `✈️ *AKČNÍ NABÍDKY ${today}* ✈️\n\n`;
  message += `🔥 *Top letenky a dovolené pro vás:*\n\n`;

  // Flights section (60%)
  if (topFlights.length > 0) {
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `✈️ *LETENKY*\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;

    topFlights.forEach((flight, index) => {
      const destination = flight.destination || flight.title;
      const discount = flight.discount > 0 ? ` (-${flight.discount}%)` : "";
      const originalPrice = flight.price > flight.salePrice ? `~${formatPrice(flight.price)} Kč~` : "";

      message += `${index + 1}. *${destination}* 🌍\n`;
      message += `💰 *${formatPrice(flight.salePrice)} Kč* ${originalPrice}${discount}\n`;
      if (flight.country) {
        message += `📍 ${flight.country}\n`;
      }
      message += `🔗 ${SITE_URL}/${slugify(destination)}\n\n`;
    });
  }

  // Vacations section (40%)
  if (topVacations.length > 0) {
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `🏖️ *DOVOLENÉ*\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;

    topVacations.forEach((vacation, index) => {
      const destination = vacation.destination || vacation.title;
      const discount = vacation.discount > 0 ? ` (-${vacation.discount}%)` : "";
      const originalPrice = vacation.price > vacation.salePrice ? `~${formatPrice(vacation.price)} Kč~` : "";
      const duration = "duration" in vacation && vacation.duration ? ` | ${vacation.duration}` : "";

      message += `${index + 1}. *${destination}* 🌴\n`;
      message += `💰 *${formatPrice(vacation.salePrice)} Kč* ${originalPrice}${discount}\n`;
      if (vacation.country) {
        message += `📍 ${vacation.country}${duration}\n`;
      }
      message += `🔗 ${SITE_URL}/${slugify(destination)}\n\n`;
    });
  }

  message += `━━━━━━━━━━━━━━━━\n`;
  message += `⚡ *Rezervujte rychle - nabídky jsou limitované!*\n\n`;
  message += `🌐 ${SITE_URL}\n`;
  message += `📱 Přidejte se do naší skupiny pro denní nabídky!`;

  return message;
}

// ============ Notification Builder ============

function buildNotificationContent(whatsappMessage: string): string {
  const adminUrl = `${SITE_URL}/admin/whatsapp-generator`;

  let content = `📱 **Denní WhatsApp zpráva je připravena!**\n\n`;
  content += `Zkopírujte zprávu níže a vložte ji do WhatsApp skupiny.\n\n`;
  content += `---\n\n`;
  content += whatsappMessage;
  content += `\n\n---\n\n`;
  content += `🔗 Admin panel: ${adminUrl}\n`;
  content += `📊 Zpráva obsahuje ${FLIGHTS_COUNT} letenky + ${HOLIDAYS_COUNT} dovolené (60/40 split)`;

  return content;
}

// ============ Core Logic ============

export async function generateAndNotify(): Promise<{
  success: boolean;
  message: string;
  notificationSent: boolean;
}> {
  try {
    console.log("[WhatsAppDaily] Generating daily message...");

    const [flights, vacations] = await Promise.all([
      pelikanCache.getFlights(),
      pelikanCache.getVacations(),
    ]);

    if (flights.length === 0 && vacations.length === 0) {
      console.warn("[WhatsAppDaily] No offers available in cache");
      return {
        success: false,
        message: "No offers available in Pelikan cache",
        notificationSent: false,
      };
    }

    const whatsappMessage = generateWhatsAppMessage(flights, vacations);
    lastGeneratedMessage = whatsappMessage;
    lastGeneratedAt = new Date();

    console.log(`[WhatsAppDaily] Message generated (${whatsappMessage.length} chars)`);

    // Send notification to owner
    const notificationContent = buildNotificationContent(whatsappMessage);
    const notificationSent = await notifyOwner({
      title: `📱 WhatsApp zpráva připravena - ${new Date().toLocaleDateString("cs-CZ")}`,
      content: notificationContent,
    });

    if (notificationSent) {
      console.log("[WhatsAppDaily] Owner notification sent successfully");
    } else {
      console.warn("[WhatsAppDaily] Failed to send owner notification");
    }

    return {
      success: true,
      message: whatsappMessage,
      notificationSent,
    };
  } catch (error) {
    console.error("[WhatsAppDaily] Error generating message:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      notificationSent: false,
    };
  }
}

// ============ Scheduling ============

function msUntilNext8AM(): number {
  const now = new Date();
  const cetOffset = 1; // CET = UTC+1
  const nowUTC = now.getTime();
  const nowCET = new Date(nowUTC + cetOffset * 60 * 60 * 1000);

  const next8AM = new Date(nowCET);
  next8AM.setHours(8, 0, 0, 0);

  // If it's already past 8 AM CET today, schedule for tomorrow
  if (nowCET >= next8AM) {
    next8AM.setDate(next8AM.getDate() + 1);
  }

  const next8AMUTC = next8AM.getTime() - cetOffset * 60 * 60 * 1000;
  return next8AMUTC - nowUTC;
}

export function scheduleWhatsAppDailyMessage() {
  const msUntil = msUntilNext8AM();
  const hoursUntil = (msUntil / (1000 * 60 * 60)).toFixed(1);

  console.log(
    `[WhatsAppDaily] Scheduling daily WhatsApp message at 8:00 AM CET (in ${hoursUntil} hours)`
  );

  whatsappTimeout = setTimeout(() => {
    generateAndNotify().catch((err) => {
      console.error("[WhatsAppDaily] Scheduled generation failed:", err);
    });

    // Schedule recurring daily generation
    whatsappInterval = setInterval(() => {
      generateAndNotify().catch((err) => {
        console.error("[WhatsAppDaily] Scheduled generation failed:", err);
      });
    }, DAILY_INTERVAL_MS);
  }, msUntil);
}

// ============ Status ============

export function getWhatsAppDailyStatus() {
  return {
    lastGeneratedAt,
    lastMessageLength: lastGeneratedMessage?.length || 0,
    hasMessage: !!lastGeneratedMessage,
    nextRunAt: new Date(Date.now() + msUntilNext8AM()),
  };
}

export function getLastGeneratedMessage() {
  return lastGeneratedMessage;
}

export function cleanupWhatsAppScheduler() {
  if (whatsappTimeout) clearTimeout(whatsappTimeout);
  if (whatsappInterval) clearInterval(whatsappInterval);
}
