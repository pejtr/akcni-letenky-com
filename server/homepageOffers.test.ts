import { describe, expect, it } from "vitest";
import { filterAndSortOffers, getOfferDestinationOptions } from "../shared/offerFilters";

const offers = [
  { name: "Londýn", country: "Anglie", price: 733 },
  { name: "New York", country: "USA", price: 7490 },
  { name: "Miami", country: "USA", price: 9490 },
  { name: "Řím", country: "Itálie", price: 712 },
] as const;

describe("homepage offer controls", () => {
  it("filters offers by destination country without mutating the source", () => {
    const filtered = filterAndSortOffers(offers, "USA", "featured");

    expect(filtered.map((offer) => offer.name)).toEqual(["New York", "Miami"]);
    expect(offers.map((offer) => offer.name)).toEqual(["Londýn", "New York", "Miami", "Řím"]);
  });

  it("searches by city or country without requiring exact diacritics", () => {
    expect(filterAndSortOffers(offers, "all", "featured", "rim").map((offer) => offer.name)).toEqual(["Řím"]);
    expect(filterAndSortOffers(offers, "USA", "featured", "new").map((offer) => offer.name)).toEqual(["New York"]);
  });

  it("combines country filtering with text search", () => {
    expect(filterAndSortOffers(offers, "USA", "featured", "miami").map((offer) => offer.name)).toEqual(["Miami"]);
    expect(filterAndSortOffers(offers, "Anglie", "featured", "usa")).toEqual([]);
  });

  it("sorts filtered offers from the lowest to the highest price", () => {
    const sorted = filterAndSortOffers(offers, "all", "price-asc");

    expect(sorted.map((offer) => offer.price)).toEqual([712, 733, 7490, 9490]);
  });

  it("sorts offers by destination name", () => {
    const sorted = filterAndSortOffers(offers, "all", "destination");

    expect(sorted.map((offer) => offer.name)).toEqual(["Londýn", "Miami", "New York", "Řím"]);
  });

  it("returns unique sorted destination options", () => {
    expect(getOfferDestinationOptions(offers)).toEqual(["Anglie", "Itálie", "USA"]);
  });
});
