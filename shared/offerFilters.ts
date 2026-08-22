export type OfferSort = "featured" | "price-asc" | "price-desc" | "destination";

export interface FilterableOffer {
  name: string;
  country: string;
  price: number;
}

function normalizeSearchText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("cs-CZ");
}

/**
 * Returns a new array with optional destination filtering and deterministic sorting.
 * The input array is never mutated, which keeps the original offer order intact.
 */
export function filterAndSortOffers<T extends FilterableOffer>(
  offers: readonly T[],
  destination: string,
  sort: OfferSort,
  searchQuery = "",
): T[] {
  const normalizedQuery = normalizeSearchText(searchQuery.trim());
  const matchingOffers = offers.filter((offer) => {
    const matchesDestination = destination === "all" || offer.country === destination;
    const searchableText = normalizeSearchText(`${offer.name} ${offer.country}`);
    return matchesDestination && (!normalizedQuery || searchableText.includes(normalizedQuery));
  }) as T[];

  switch (sort) {
    case "price-asc":
      return matchingOffers.sort((a, b) => a.price - b.price);
    case "price-desc":
      return matchingOffers.sort((a, b) => b.price - a.price);
    case "destination":
      return matchingOffers.sort((a, b) => a.name.localeCompare(b.name, "cs"));
    default:
      return matchingOffers;
  }
}

export function getOfferDestinationOptions(offers: readonly FilterableOffer[]): string[] {
  return Array.from(new Set(offers.map((offer) => offer.country))).sort((a, b) => a.localeCompare(b, "cs"));
}
