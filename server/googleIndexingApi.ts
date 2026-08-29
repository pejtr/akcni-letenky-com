import crypto from "crypto";

export interface IndexingResult {
  success: boolean;
  url: string;
  type: "URL_UPDATED" | "URL_DELETED";
  message: string;
  timestamp: string;
  isSimulated?: boolean;
}

const inMemoryLogs: IndexingResult[] = [];

/**
 * Ensures URL is absolute and belongs to https://www.akcni-letenky.com
 */
export function sanitizeIndexingUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://www.akcni-letenky.com${url.startsWith("/") ? "" : "/"}${url}`;
  }
  url = url.replace(/https?:\/\/[^\s"'<>\\]*railway\.app/g, "https://www.akcni-letenky.com");
  url = url.replace(/https?:\/\/akcni-letenky\.com/g, "https://www.akcni-letenky.com");
  return url;
}

/**
 * Generate a JWT token for Google Service Account authentication
 */
export function createGoogleJwtToken(clientEmail: string, privateKey: string): string {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64ClaimSet = Buffer.from(JSON.stringify(claimSet)).toString("base64url");
  const signatureInput = `${base64Header}.${base64ClaimSet}`;

  // Clean formatted private key
  const formattedKey = privateKey.replace(/\\n/g, "\n");
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signatureInput);
  const signature = signer.sign(formattedKey, "base64url");

  return `${signatureInput}.${signature}`;
}

/**
 * Submit single URL to Google Indexing API v3
 */
export async function requestGoogleIndexing(
  urlInput: string,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<IndexingResult> {
  const url = sanitizeIndexingUrl(urlInput);
  const timestamp = new Date().toISOString();

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    const res: IndexingResult = {
      success: true,
      url,
      type,
      message: "Credentials missing (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY). Local simulation logged.",
      timestamp,
      isSimulated: true,
    };
    inMemoryLogs.unshift(res);
    return res;
  }

  try {
    const jwtToken = createGoogleJwtToken(clientEmail, privateKey);

    // Exchange JWT for OAuth access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwtToken,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`OAuth token exchange failed: ${tokenRes.status} ${errText}`);
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    // Call Google Indexing API
    const apiRes = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`Google Indexing API publish failed: ${apiRes.status} ${errText}`);
    }

    console.log(`[Google Indexing API] Successfully submitted ${url} (${type})`);
    const res: IndexingResult = {
      success: true,
      url,
      type,
      message: "Successfully submitted to Google Indexing API v3.",
      timestamp,
      isSimulated: false,
    };
    inMemoryLogs.unshift(res);
    return res;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Google Indexing API Error] Failed for ${url}:`, msg);
    const res: IndexingResult = {
      success: false,
      url,
      type,
      message: `Error: ${msg}`,
      timestamp,
      isSimulated: false,
    };
    inMemoryLogs.unshift(res);
    return res;
  }
}

/** Alias for backward compatibility */
export const submitUrlToGoogleIndexing = requestGoogleIndexing;

/** Trigger Google Indexing API upon publishing a new article */
export async function notifyGoogleForNewArticle(slug: string): Promise<IndexingResult> {
  const articleUrl = `https://www.akcni-letenky.com/blog/${slug}`;
  return await requestGoogleIndexing(articleUrl, "URL_UPDATED");
}

/** Submit core pages in batch */
export async function submitCorePagesToGoogleIndexing(): Promise<IndexingResult[]> {
  const coreUrls = [
    "https://www.akcni-letenky.com/",
    "https://www.akcni-letenky.com/blog",
    "https://www.akcni-letenky.com/dovolene",
    "https://www.akcni-letenky.com/levne-letenky",
    "https://www.akcni-letenky.com/hlidac-cen",
    "https://www.akcni-letenky.com/odskodneni-za-let",
    "https://www.akcni-letenky.com/kalkulacka-zavazadel",
    "https://www.akcni-letenky.com/ebook-zdarma",
  ];
  return await batchGoogleIndexing(coreUrls);
}

/** Get in-memory logs */
export async function getIndexingLogs(): Promise<IndexingResult[]> {
  return inMemoryLogs;
}

/**
 * Submit batch of URLs to Google Indexing API
 */
export async function batchGoogleIndexing(
  urls: string[],
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];
  for (const rawUrl of urls) {
    if (!rawUrl.trim()) continue;
    const res = await requestGoogleIndexing(rawUrl, type);
    results.push(res);
  }
  return results;
}
