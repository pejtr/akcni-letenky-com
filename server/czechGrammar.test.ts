import { describe, it, expect } from "vitest";
import { formatDestinationGenitive, formatFlightPageTitle } from "../shared/czechGrammar";

describe("Czech Destination Grammar Engine", () => {
  it("correctly declines cities with preposition 'do'", () => {
    expect(formatDestinationGenitive("Londýn", true)).toBe("do Londýna");
    expect(formatDestinationGenitive("london", true)).toBe("do Londýna");
    expect(formatDestinationGenitive("Paříž", true)).toBe("do Paříže");
    expect(formatDestinationGenitive("paris", true)).toBe("do Paříže");
    expect(formatDestinationGenitive("Řím", true)).toBe("do Říma");
    expect(formatDestinationGenitive("Barcelona", true)).toBe("do Barcelony");
    expect(formatDestinationGenitive("Dubaj", true)).toBe("do Dubaje");
    expect(formatDestinationGenitive("New York", true)).toBe("do New Yorku");
    expect(formatDestinationGenitive("new-york", true)).toBe("do New Yorku");
    expect(formatDestinationGenitive("Milán", true)).toBe("do Milána");
    expect(formatDestinationGenitive("Benátky", true)).toBe("do Benátek");
    expect(formatDestinationGenitive("Lisabon", true)).toBe("do Lisabonu");
    expect(formatDestinationGenitive("Amsterdam", true)).toBe("do Amsterdamu");
    expect(formatDestinationGenitive("Berlín", true)).toBe("do Berlína");
    expect(formatDestinationGenitive("Vídeň", true)).toBe("do Vídně");
  });

  it("correctly declines islands and island states with preposition 'na'", () => {
    expect(formatDestinationGenitive("Mallorca", true)).toBe("na Mallorcu");
    expect(formatDestinationGenitive("majorka", true)).toBe("na Mallorcu");
    expect(formatDestinationGenitive("Ibiza", true)).toBe("na Ibizu");
    expect(formatDestinationGenitive("Tenerife", true)).toBe("na Tenerife");
    expect(formatDestinationGenitive("Kréta", true)).toBe("na Krétu");
    expect(formatDestinationGenitive("Rhodos", true)).toBe("na Rhodos");
    expect(formatDestinationGenitive("Korfu", true)).toBe("na Korfu");
    expect(formatDestinationGenitive("Kypr", true)).toBe("na Kypr");
    expect(formatDestinationGenitive("Malta", true)).toBe("na Maltu");
    expect(formatDestinationGenitive("Madeira", true)).toBe("na Madeiru");
    expect(formatDestinationGenitive("Bali", true)).toBe("na Bali");
    expect(formatDestinationGenitive("Maledivy", true)).toBe("na Maledivy");
    expect(formatDestinationGenitive("Zanzibar", true)).toBe("na Zanzibar");
    expect(formatDestinationGenitive("Réunion", true)).toBe("na Réunion");
    expect(formatDestinationGenitive("Island", true)).toBe("na Island");
    expect(formatDestinationGenitive("Sicílie", true)).toBe("na Sicílii");
    expect(formatDestinationGenitive("Sardínie", true)).toBe("na Sardínii");
  });

  it("generates formatted flight page titles", () => {
    expect(formatFlightPageTitle("Paříž", 890)).toBe("Akční letenky do Paříže od 890 Kč");
    expect(formatFlightPageTitle("Mallorca", 1290)).toBe("Akční letenky na Mallorcu od 1 290 Kč");
    expect(formatFlightPageTitle("Londýn")).toBe("Akční letenky do Londýna");
  });
});