import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Contact Form tRPC Router", () => {
  const caller = appRouter.createCaller({
    user: null,
    req: {} as any,
    res: {} as any,
  });

  it("successfully accepts a valid message with GDPR consent", async () => {
    const result = await caller.contact.submit({
      name: "Petr Novák",
      email: "petr@example.cz",
      subject: "Dotaz k nabídce letenek",
      message: "Dobrý den, mám dotaz ohledně akčních letenek do Paříže.",
      gdprConsent: true,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Zpráva byla úspěšně odeslána redakci.");
  });

  it("rejects submission if GDPR consent is false", async () => {
    await expect(
      caller.contact.submit({
        name: "Petr Novák",
        email: "petr@example.cz",
        subject: "Dotaz",
        message: "Testovací zpráva",
        gdprConsent: false,
      })
    ).rejects.toThrow();
  });

  it("rejects invalid email format", async () => {
    await expect(
      caller.contact.submit({
        email: "not-an-email",
        subject: "Dotaz",
        message: "Testovací zpráva",
        gdprConsent: true,
      })
    ).rejects.toThrow();
  });

  it("handles honeypot silently for bots", async () => {
    const result = await caller.contact.submit({
      email: "bot@spammer.com",
      subject: "Buy cheap meds",
      message: "Spam message body text",
      gdprConsent: true,
      honeypot: "http://spam-link.com",
    });

    expect(result.success).toBe(true);
  });
});