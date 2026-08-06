import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { scheduleDailyArticleGeneration } from "../articleGenerator";
import { schedulePriceCheckCron } from "../priceCheckCron";
import { scheduleDailyReport } from "../dailyReport";
import { scheduleWeeklyReport } from "../weeklyReport";
import { scheduleFollowupProcessor } from "../emailFollowup";
import { scheduleWishlistRemarketing } from "../wishlistRemarketing";
import { scheduleWhatsAppDailyMessage } from "../whatsappDailyMessage";
import { scheduleDailyTipArticle } from "../tipsArticleGenerator";
import { scheduleMidnightPriceRefresh } from "../travelpayoutsCache";
import { scheduleDailySocialPostCron } from "../dailySocialPostCron";
import { generateSitemap, generateSitemapIndex, generateRobotsTxt } from "../sitemap";
import { recordEmailOpened, recordEmailClicked } from "../emailAbTest";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function ensureDbSchema() {
  try {
    const { getDb } = await import("../db");
    const db = await getDb();
    if (db) {
      const { sql } = await import("drizzle-orm");
      await db.execute(sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS title VARCHAR(255)`);
      console.log("[DB] Schema check: social_posts.title column ensured");
    }
  } catch (e: any) {
    if (!e?.message?.includes("Duplicate column")) {
      console.warn("[DB] Schema migration warning:", e?.message);
    }
  }
}

async function startServer() {
  await ensureDbSchema();
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Sitemap and robots.txt
  app.get("/sitemap.xml", async (req, res) => {
    try {
      let sitemap = await generateSitemap();
      sitemap = sitemap.replace(/https?:\/\/[^\s"'<>\\]*railway\.app/g, "https://www.akcni-letenky.com");
      sitemap = sitemap.replace(/https?:\/\/akcni-letenky\.com/g, "https://www.akcni-letenky.com");
      res.header("Content-Type", "application/xml; charset=utf-8");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/sitemap_index.xml", (req, res) => {
    let indexXml = generateSitemapIndex();
    indexXml = indexXml.replace(/https?:\/\/[^\s"'<>\\]*railway\.app/g, "https://www.akcni-letenky.com");
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(indexXml);
  });

  // Redirect legacy WordPress sitemap endpoints to clean sitemap.xml
  app.get(["/wpms-sitemap.xml", "/category-sitemap.xml", "/post-sitemap.xml", "/page-sitemap.xml"], (req, res) => {
    res.redirect(301, "/sitemap.xml");
  });
  
  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain; charset=utf-8");
    res.send(generateRobotsTxt());
  });
  
  // Email tracking pixel (1x1 transparent GIF) - for open tracking in email clients
  // Usage in email: <img src="https://domain/api/email/pixel?tid=123&v=A" />
  const TRANSPARENT_GIF = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  app.get("/api/email/pixel", async (req, res) => {
    try {
      const testId = parseInt(req.query.tid as string);
      const variant = req.query.v as "A" | "B";
      if (testId && (variant === "A" || variant === "B")) {
        await recordEmailOpened(testId, variant);
      }
    } catch (e) {
      // Silently fail - tracking should never break the email
    }
    res.set({
      "Content-Type": "image/gif",
      "Content-Length": String(TRANSPARENT_GIF.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    res.end(TRANSPARENT_GIF);
  });

  // Email click redirect - tracks clicks and redirects to destination
  // Usage in email: <a href="https://domain/api/email/click?tid=123&v=A&url=https://...">
  app.get("/api/email/click", async (req, res) => {
    const targetUrl = req.query.url as string;
    try {
      const testId = parseInt(req.query.tid as string);
      const variant = req.query.v as "A" | "B";
      if (testId && (variant === "A" || variant === "B")) {
        await recordEmailClicked(testId, variant);
      }
    } catch (e) {
      // Silently fail
    }
    // Redirect to the actual destination
    const safeUrl = targetUrl && targetUrl.startsWith("http") ? targetUrl : "/levne-letenky";
    res.redirect(302, safeUrl);
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Initialize daily article generation scheduler
    scheduleDailyArticleGeneration();

    // Initialize price check cron job (every 6 hours)
    schedulePriceCheckCron();

    // Initialize daily report scheduler (7:00 AM CET)
    scheduleDailyReport();

    // Initialize weekly report scheduler (Monday 8:00 AM CET)
    scheduleWeeklyReport();

    // Email follow-up processor (every 15 min)
    scheduleFollowupProcessor();

    // Wishlist remarketing processor (every 30 min)
    scheduleWishlistRemarketing();

    // WhatsApp daily message generator (8:00 AM CET)
    scheduleWhatsAppDailyMessage();

    // Daily travel tips article generator (7:00 AM)
    scheduleDailyTipArticle();

    // Travelpayouts price cache (fetch on startup + midnight refresh)
    scheduleMidnightPriceRefresh();

    // Social Media daily post generator (Facebook & Instagram)
    scheduleDailySocialPostCron();
  });
}

startServer().catch(console.error);
