import { FlightProviderKey } from "./types";

export interface FetchOptions {
  url: string;
  timeoutMs?: number;
  maxSizeBytes?: number;
}

export class PelikanXmlFetcher {
  /**
   * Fetches the XML feed securely, enforcing timeout and size limits
   * to protect against malicious or runaway endpoints.
   */
  async fetchXml(options: FetchOptions): Promise<string> {
    const { url, timeoutMs = 30000, maxSizeBytes = 20 * 1024 * 1024 } = options; // Default 20MB limit

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Accept": "application/xml, text/xml",
          "User-Agent": "OnyxTravelNetwork/1.0 (Flight Data Fetcher)",
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch XML: HTTP ${response.status}`);
      }

      // We read the body as a stream to enforce maxSizeBytes
      const reader = response.body?.getReader();
      if (!reader) {
        // Fallback for environments that don't support streaming fetch (should be rare)
        const text = await response.text();
        if (text.length > maxSizeBytes) {
           throw new Error(`Response size exceeded limit of ${maxSizeBytes} bytes`);
        }
        return text;
      }

      const decoder = new TextDecoder("utf-8");
      let xmlString = "";
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > maxSizeBytes) {
            reader.cancel();
            throw new Error(`Response size exceeded limit of ${maxSizeBytes} bytes`);
          }
          xmlString += decoder.decode(value, { stream: true });
        }
      }
      
      // Flush the decoder
      xmlString += decoder.decode();
      
      return xmlString;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error(`Fetch timed out after ${timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
