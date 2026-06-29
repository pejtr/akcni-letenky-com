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

const MALDIVES_IMAGE =
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=900&h=650&fit=crop&q=80";

const maldives = (
  id: string,
  title: string,
  path: string,
  tags: string[],
  priority: number,
  subtitle = "Maledivy s odletem pres Pelikan.cz"
): CuratedPelikanOffer => ({
  id,
  title,
  destination: "Maledivy",
  subtitle,
  url: pelikanDeepLink(path, {
    campaign: "maledivy_primary",
    channel: "curated_pelikan",
    content: id,
  }),
  imageUrl: MALDIVES_IMAGE,
  tags,
  priority,
});

export const MALDIVES_PELIKAN_OFFERS: CuratedPelikanOffer[] = [
  maldives(
    "maledivy-levna-dovolena",
    "Maledivy levne",
    "https://www.pelikan.cz/cs/pobyt/maledivy-levna-dovolena",
    ["Nejlevnejsi", "Top proklik"],
    100,
    "Vstupni nabidka pro rychly prodej"
  ),
  maldives(
    "maledivy-all-inclusive",
    "Maledivy all inclusive",
    "https://www.pelikan.cz/cs/pobyt/maledivy-all-inclusive",
    ["All inclusive", "Pro pary"],
    95
  ),
  maldives(
    "maledivy-bandos",
    "Bandos Island Resort",
    "https://www.pelikan.cz/cs/pobyt/maledivy-bandos",
    ["Resort", "Overeno"],
    90
  ),
  maldives(
    "maledivy-villa-park-sun-island",
    "Villa Park Sun Island",
    "https://www.pelikan.cz/cs/pobyt/maledivy-villa-park-sun-island",
    ["Top resort", "Rodiny"],
    88
  ),
  maldives(
    "maledivy-cinnamon-dhonveli",
    "Cinnamon Dhonveli",
    "https://www.pelikan.cz/cs/pobyt/maledivy-cinnamon-dhonveli",
    ["Laguna", "Romantika"],
    84
  ),
  maldives(
    "maledivy-vilamendhoo-island-resort",
    "Vilamendhoo Island Resort",
    "https://www.pelikan.cz/cs/pobyt/maledivy-vilamendhoo-island-resort",
    ["Snorchlovani", "Premium"],
    82
  ),
  maldives(
    "maledivy-all-inclusive-abu-dhabi",
    "All inclusive + Abu Dhabi",
    "https://www.pelikan.cz/cs/pobyt/maledivy-all-inclusive-mezizastavka-abu-dhabi",
    ["All inclusive", "Stopover"],
    78
  ),
  maldives(
    "maledivy-business-class",
    "Maledivy business class",
    "https://www.pelikan.cz/cs/pobyt/maledivy-levna-dovolena-business-class",
    ["Business class", "Premium"],
    74
  ),
  maldives(
    "maledivy-flybeond-business",
    "FlyBeond business",
    "https://www.pelikan.cz/cs/pobyt/maledivy-flybeond-business",
    ["Business", "Luxus"],
    70
  ),
];

export const PRIMARY_PELIKAN_OFFERS = [...MALDIVES_PELIKAN_OFFERS].sort(
  (a, b) => b.priority - a.priority
);
