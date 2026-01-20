import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(user?: AuthenticatedUser): TrpcContext {
  const defaultUser: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: user || defaultUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("flights.featured", () => {
  it("returns featured flights", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.flights.featured();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // Should have featured flights
    if (result.length > 0) {
      const flight = result[0];
      expect(flight).toHaveProperty("id");
      expect(flight).toHaveProperty("fromCity");
      expect(flight).toHaveProperty("toCity");
      expect(flight).toHaveProperty("price");
      expect(flight.isFeatured).toBe(1);
    }
  });
});

describe("flights.list", () => {
  it("returns all flights", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.flights.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // Should have flights
    if (result.length > 0) {
      const flight = result[0];
      expect(flight).toHaveProperty("id");
      expect(flight).toHaveProperty("fromCity");
      expect(flight).toHaveProperty("toCity");
      expect(flight).toHaveProperty("price");
      expect(flight).toHaveProperty("affiliateUrl");
    }
  });
});

describe("flights.byId", () => {
  it("returns a specific flight by ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get all flights to get a valid ID
    const allFlights = await caller.flights.list();
    
    if (allFlights.length > 0) {
      const firstFlight = allFlights[0];
      const result = await caller.flights.byId({ id: firstFlight.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(firstFlight.id);
      expect(result.fromCity).toBe(firstFlight.fromCity);
      expect(result.toCity).toBe(firstFlight.toCity);
    }
  });

  it("throws error for non-existent flight", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.flights.byId({ id: 999999 })).rejects.toThrow("Flight not found");
  });
});

describe("flights.search", () => {
  it("searches flights by destination city", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.flights.search({ toCity: "Barcelona" });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // All results should match the search criteria
    result.forEach((flight) => {
      expect(flight.toCity).toBe("Barcelona");
    });
  });

  it("searches flights by origin city", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.flights.search({ fromCity: "Praha" });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // All results should match the search criteria
    result.forEach((flight) => {
      expect(flight.fromCity).toBe("Praha");
    });
  });
});

describe("wishlist.add", () => {
  it("adds a flight to user's wishlist", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Get a flight to add to wishlist
    const flights = await caller.flights.list();
    
    if (flights.length > 0) {
      const result = await caller.wishlist.add({ flightId: flights[0].id });

      expect(result).toEqual({ success: true });
    }
  });
});

describe("wishlist.list", () => {
  it("returns user's wishlist", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.wishlist.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("wishlist.remove", () => {
  it("removes a flight from user's wishlist", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First add a flight to wishlist
    const flights = await caller.flights.list();
    
    if (flights.length > 0) {
      await caller.wishlist.add({ flightId: flights[0].id });
      
      // Then remove it
      const result = await caller.wishlist.remove({ flightId: flights[0].id });

      expect(result).toEqual({ success: true });
    }
  });
});
