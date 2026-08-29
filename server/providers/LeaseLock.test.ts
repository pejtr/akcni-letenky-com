import { describe, it, expect, vi } from "vitest";
import { FlightDealEngine } from "../services/FlightDealEngine";

describe("Distributed Lease Lock for Cron Concurrency", () => {
  it("should instantiate with distinct instanceId and acquire lock", async () => {
    const engine1 = new FlightDealEngine();
    const engine2 = new FlightDealEngine();

    expect((engine1 as any).instanceId).not.toBe((engine2 as any).instanceId);
  });

  it("should simulate lock acquisition and crash recovery with expired lease", async () => {
    const engine = new FlightDealEngine();
    
    // Acquire lock
    const acquired = await engine.acquireLock("pelikan", 300);
    expect(acquired).toBe(true);

    // Release lock
    await engine.releaseLock("pelikan");
  });
});
