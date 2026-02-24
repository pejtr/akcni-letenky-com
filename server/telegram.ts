/**
 * Telegram Bot helper for sending notifications
 * Uses TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars
 */

const TELEGRAM_API = "https://api.telegram.org";

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return token;
}

function getChatId(): string {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID is not set");
  return chatId;
}

export interface TelegramSendResult {
  ok: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Send a text message via Telegram bot
 * Supports Markdown V2 and HTML parse modes
 */
export async function sendTelegramMessage(
  text: string,
  options?: {
    chatId?: string;
    parseMode?: "HTML" | "MarkdownV2";
    disableWebPagePreview?: boolean;
  }
): Promise<TelegramSendResult> {
  try {
    const token = getBotToken();
    const chatId = options?.chatId || getChatId();

    const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode || "HTML",
        disable_web_page_preview: options?.disableWebPagePreview ?? false,
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log(`[Telegram] Message sent successfully (id: ${data.result.message_id})`);
      return { ok: true, messageId: data.result.message_id };
    } else {
      console.error(`[Telegram] Failed to send message: ${data.description}`);
      return { ok: false, error: data.description };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Telegram] Error sending message: ${msg}`);
    return { ok: false, error: msg };
  }
}

/**
 * Send daily WhatsApp offer message via Telegram
 * Formats the message nicely for Telegram with HTML
 */
export async function sendDailyOffersViaTelegram(
  whatsappMessage: string
): Promise<TelegramSendResult> {
  const telegramMessage = [
    "📬 <b>Denní WhatsApp zpráva připravena!</b>",
    "",
    "Zkopíruj následující zprávu a vlož ji do WhatsApp skupiny:",
    "",
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    whatsappMessage,
    "",
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    "💡 <i>Stačí zkopírovat text mezi čarami a vložit do WhatsApp skupiny.</i>",
  ].join("\n");

  return sendTelegramMessage(telegramMessage, {
    disableWebPagePreview: true,
  });
}

/**
 * Validate Telegram bot token by calling getMe
 */
export async function validateTelegramBot(): Promise<{
  valid: boolean;
  botName?: string;
  error?: string;
}> {
  try {
    const token = getBotToken();
    const response = await fetch(`${TELEGRAM_API}/bot${token}/getMe`);
    const data = await response.json();

    if (data.ok) {
      return { valid: true, botName: data.result.first_name };
    }
    return { valid: false, error: data.description };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { valid: false, error: msg };
  }
}
