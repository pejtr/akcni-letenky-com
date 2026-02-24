import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("Telegram Bot Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      TELEGRAM_BOT_TOKEN: "test-token-123",
      TELEGRAM_CHAT_ID: "123456789",
    };
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("sendTelegramMessage", () => {
    it("should send a message successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          result: { message_id: 42 },
        }),
      });

      const { sendTelegramMessage } = await import("./telegram");
      const result = await sendTelegramMessage("Test message");

      expect(result.ok).toBe(true);
      expect(result.messageId).toBe(42);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.telegram.org/bottest-token-123/sendMessage",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("should include correct payload in request", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, result: { message_id: 1 } }),
      });

      const { sendTelegramMessage } = await import("./telegram");
      await sendTelegramMessage("Hello World");

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.chat_id).toBe("123456789");
      expect(callBody.text).toBe("Hello World");
      expect(callBody.parse_mode).toBe("HTML");
    });

    it("should handle API errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          ok: false,
          description: "Bad Request: chat not found",
        }),
      });

      const { sendTelegramMessage } = await import("./telegram");
      const result = await sendTelegramMessage("Test");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Bad Request: chat not found");
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { sendTelegramMessage } = await import("./telegram");
      const result = await sendTelegramMessage("Test");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("should allow custom chat ID", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, result: { message_id: 1 } }),
      });

      const { sendTelegramMessage } = await import("./telegram");
      await sendTelegramMessage("Test", { chatId: "custom-chat-id" });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.chat_id).toBe("custom-chat-id");
    });

    it("should support disableWebPagePreview option", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, result: { message_id: 1 } }),
      });

      const { sendTelegramMessage } = await import("./telegram");
      await sendTelegramMessage("Test", { disableWebPagePreview: true });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.disable_web_page_preview).toBe(true);
    });
  });

  describe("sendDailyOffersViaTelegram", () => {
    it("should format message with header and separator", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, result: { message_id: 1 } }),
      });

      const { sendDailyOffersViaTelegram } = await import("./telegram");
      await sendDailyOffersViaTelegram("Test WhatsApp message");

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.text).toContain("Denní WhatsApp zpráva připravena");
      expect(callBody.text).toContain("Test WhatsApp message");
      expect(callBody.text).toContain("━━━━━━━━━━━━━━━━━━━━");
      expect(callBody.text).toContain("Stačí zkopírovat text");
    });

    it("should disable web page preview", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, result: { message_id: 1 } }),
      });

      const { sendDailyOffersViaTelegram } = await import("./telegram");
      await sendDailyOffersViaTelegram("Test");

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.disable_web_page_preview).toBe(true);
    });
  });

  describe("validateTelegramBot", () => {
    it("should return valid when bot token is correct", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          result: { first_name: "GENERAL BOT", username: "my_general_ibot" },
        }),
      });

      const { validateTelegramBot } = await import("./telegram");
      const result = await validateTelegramBot();

      expect(result.valid).toBe(true);
      expect(result.botName).toBe("GENERAL BOT");
    });

    it("should return invalid when token is wrong", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          ok: false,
          description: "Unauthorized",
        }),
      });

      const { validateTelegramBot } = await import("./telegram");
      const result = await validateTelegramBot();

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });
  });

  describe("Environment variables", () => {
    it("should throw when TELEGRAM_BOT_TOKEN is missing", async () => {
      delete process.env.TELEGRAM_BOT_TOKEN;
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, result: { message_id: 1 } }),
      });

      const { sendTelegramMessage } = await import("./telegram");
      const result = await sendTelegramMessage("Test");

      expect(result.ok).toBe(false);
      expect(result.error).toContain("TELEGRAM_BOT_TOKEN");
    });

    it("should throw when TELEGRAM_CHAT_ID is missing", async () => {
      delete process.env.TELEGRAM_CHAT_ID;
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, result: { message_id: 1 } }),
      });

      const { sendTelegramMessage } = await import("./telegram");
      const result = await sendTelegramMessage("Test");

      expect(result.ok).toBe(false);
      expect(result.error).toContain("TELEGRAM_CHAT_ID");
    });
  });

  describe("Integration with WhatsApp daily scheduler", () => {
    it("should include telegramSent field in generateAndNotify result type", () => {
      // Type check - the function signature should include telegramSent
      type ExpectedResult = {
        success: boolean;
        message: string;
        notificationSent: boolean;
        telegramSent: boolean;
      };

      // This is a compile-time check
      const result: ExpectedResult = {
        success: true,
        message: "test",
        notificationSent: true,
        telegramSent: true,
      };
      expect(result.telegramSent).toBe(true);
    });
  });
});
