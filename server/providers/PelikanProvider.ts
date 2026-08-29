import { FlightOfferProvider, ProviderSnapshot, NormalizedFlightOffer } from "./types";
import { PelikanXmlFetcher, FetchOptions } from "./PelikanXmlFetcher";
import { PelikanXmlParser } from "./PelikanXmlParser";
import { PelikanOfferNormalizer } from "./PelikanOfferNormalizer";

export class PelikanProvider implements FlightOfferProvider {
  public key = "pelikan" as const;
  
  private fetcher: PelikanXmlFetcher;
  private parser: PelikanXmlParser;
  private normalizer: PelikanOfferNormalizer;
  private feedUrl: string;

  constructor(feedUrl = "https://www.pelikan.cz/gf3/pelijee-cz/calendars/xmlpromo") {
    this.fetcher = new PelikanXmlFetcher();
    this.parser = new PelikanXmlParser();
    this.normalizer = new PelikanOfferNormalizer();
    this.feedUrl = feedUrl;
  }

  async fetch(options?: Partial<FetchOptions>): Promise<ProviderSnapshot> {
    const fetchTime = Date.now();
    const xmlContent = await this.fetcher.fetchXml({
      url: this.feedUrl,
      ...options
    });
    
    const rawItems = this.parser.parse(xmlContent);
    
    return {
      provider: this.key,
      timestamp: fetchTime,
      rawItems
    };
  }

  async normalize(snapshot: ProviderSnapshot): Promise<NormalizedFlightOffer[]> {
    return this.normalizer.normalize(snapshot.rawItems, snapshot.timestamp);
  }
}
