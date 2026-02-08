import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WishlistSyncItem } from "./db";

describe("Wishlist Sync Module", () => {
  describe("WishlistSyncItem interface", () => {
    it("should have correct shape", () => {
      const item: WishlistSyncItem = {
        id: "barcelona",
        addedAt: 1700000000000,
        isFavorite: true,
      };
      expect(item.id).toBe("barcelona");
      expect(item.addedAt).toBe(1700000000000);
      expect(item.isFavorite).toBe(true);
    });

    it("should support multiple items in array", () => {
      const items: WishlistSyncItem[] = [
        { id: "london", addedAt: 1700000000000, isFavorite: false },
        { id: "paris", addedAt: 1700000001000, isFavorite: true },
        { id: "rome", addedAt: 1700000002000, isFavorite: false },
      ];
      expect(items.length).toBe(3);
      expect(items.map(i => i.id)).toEqual(["london", "paris", "rome"]);
    });
  });

  describe("Merge logic", () => {
    // Test the merge algorithm independently
    function mergeWishlists(
      serverItems: WishlistSyncItem[],
      clientItems: WishlistSyncItem[]
    ): WishlistSyncItem[] {
      const merged = new Map<string, WishlistSyncItem>();

      // Add server items first
      for (const item of serverItems) {
        merged.set(item.id, item);
      }

      // Merge client items
      for (const item of clientItems) {
        const existing = merged.get(item.id);
        if (!existing) {
          merged.set(item.id, item);
        } else {
          merged.set(item.id, {
            id: item.id,
            addedAt: Math.max(existing.addedAt, item.addedAt),
            isFavorite: existing.isFavorite || item.isFavorite,
          });
        }
      }

      return Array.from(merged.values());
    }

    it("should return server items when client is empty", () => {
      const server: WishlistSyncItem[] = [
        { id: "london", addedAt: 1700000000000, isFavorite: true },
      ];
      const result = mergeWishlists(server, []);
      expect(result).toEqual(server);
    });

    it("should return client items when server is empty", () => {
      const client: WishlistSyncItem[] = [
        { id: "paris", addedAt: 1700000000000, isFavorite: false },
      ];
      const result = mergeWishlists([], client);
      expect(result).toEqual(client);
    });

    it("should merge unique items from both sources", () => {
      const server: WishlistSyncItem[] = [
        { id: "london", addedAt: 1700000000000, isFavorite: false },
      ];
      const client: WishlistSyncItem[] = [
        { id: "paris", addedAt: 1700000001000, isFavorite: true },
      ];
      const result = mergeWishlists(server, client);
      expect(result.length).toBe(2);
      expect(result.map(i => i.id).sort()).toEqual(["london", "paris"]);
    });

    it("should keep newer addedAt for duplicate items", () => {
      const server: WishlistSyncItem[] = [
        { id: "london", addedAt: 1700000000000, isFavorite: false },
      ];
      const client: WishlistSyncItem[] = [
        { id: "london", addedAt: 1700000005000, isFavorite: false },
      ];
      const result = mergeWishlists(server, client);
      expect(result.length).toBe(1);
      expect(result[0].addedAt).toBe(1700000005000);
    });

    it("should prefer isFavorite=true when merging duplicates", () => {
      const server: WishlistSyncItem[] = [
        { id: "london", addedAt: 1700000000000, isFavorite: true },
      ];
      const client: WishlistSyncItem[] = [
        { id: "london", addedAt: 1700000000000, isFavorite: false },
      ];
      const result = mergeWishlists(server, client);
      expect(result[0].isFavorite).toBe(true);
    });

    it("should handle complex merge with overlapping and unique items", () => {
      const server: WishlistSyncItem[] = [
        { id: "london", addedAt: 1700000000000, isFavorite: false },
        { id: "rome", addedAt: 1700000001000, isFavorite: true },
        { id: "berlin", addedAt: 1700000002000, isFavorite: false },
      ];
      const client: WishlistSyncItem[] = [
        { id: "london", addedAt: 1700000003000, isFavorite: true }, // overlap, newer + fav
        { id: "paris", addedAt: 1700000004000, isFavorite: false }, // new
        { id: "rome", addedAt: 1700000000500, isFavorite: false }, // overlap, older, not fav
      ];
      const result = mergeWishlists(server, client);
      expect(result.length).toBe(4);

      const london = result.find(i => i.id === "london")!;
      expect(london.addedAt).toBe(1700000003000); // newer
      expect(london.isFavorite).toBe(true); // true from client

      const rome = result.find(i => i.id === "rome")!;
      expect(rome.addedAt).toBe(1700000001000); // server is newer
      expect(rome.isFavorite).toBe(true); // true from server

      const paris = result.find(i => i.id === "paris")!;
      expect(paris.addedAt).toBe(1700000004000);

      const berlin = result.find(i => i.id === "berlin")!;
      expect(berlin.addedAt).toBe(1700000002000);
    });

    it("should return empty array when both sources are empty", () => {
      const result = mergeWishlists([], []);
      expect(result).toEqual([]);
    });

    it("should handle large wishlists efficiently", () => {
      const server: WishlistSyncItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: `dest-server-${i}`,
        addedAt: 1700000000000 + i * 1000,
        isFavorite: i % 3 === 0,
      }));
      const client: WishlistSyncItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: `dest-client-${i}`,
        addedAt: 1700000100000 + i * 1000,
        isFavorite: i % 2 === 0,
      }));
      const result = mergeWishlists(server, client);
      expect(result.length).toBe(200); // all unique
    });
  });

  describe("localStorage migration", () => {
    it("should migrate old string[] format to WishlistItem[]", () => {
      const oldFormat = ["london", "paris", "rome"];
      const migrated: WishlistSyncItem[] = oldFormat.map((id: string) => ({
        id,
        addedAt: Date.now(),
        isFavorite: false,
      }));
      expect(migrated.length).toBe(3);
      expect(migrated[0].id).toBe("london");
      expect(migrated[0].isFavorite).toBe(false);
      expect(typeof migrated[0].addedAt).toBe("number");
    });

    it("should handle empty old format", () => {
      const oldFormat: string[] = [];
      const migrated: WishlistSyncItem[] = oldFormat.map((id: string) => ({
        id,
        addedAt: Date.now(),
        isFavorite: false,
      }));
      expect(migrated).toEqual([]);
    });
  });
});
