import { pelikanDeepLink } from "./affiliateLinks";

export interface CuratedPelikanOffer {
  id: string;
  title: string;
  destination: string;
  subtitle: string;
  url: string;
  imageUrl: string;
  tags: string[];
  priceLabel?: string;
  priority: number;
}

export const PRIMARY_PELIKAN_OFFERS: CuratedPelikanOffer[] = [];
