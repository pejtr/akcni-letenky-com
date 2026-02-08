/**
 * Click Heatmap Service
 * 
 * Tracks click events on the homepage and provides aggregated heatmap data
 * for admin visualization. Records click coordinates, element info, and viewport size.
 */

import { getDb } from "./db";
import { clickEvents } from "../drizzle/schema";
import { sql, and, gte, eq } from "drizzle-orm";

export interface ClickEventInput {
  page: string;
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  elementTag?: string;
  elementText?: string;
  elementId?: string;
  elementClass?: string;
  sessionId?: string;
  userId?: number;
}

/**
 * Record a click event
 */
export async function recordClickEvent(event: ClickEventInput): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(clickEvents).values({
    page: event.page,
    x: event.x,
    y: event.y,
    viewportWidth: event.viewportWidth,
    viewportHeight: event.viewportHeight,
    elementTag: event.elementTag?.substring(0, 50),
    elementText: event.elementText?.substring(0, 255),
    elementId: event.elementId?.substring(0, 100),
    elementClass: event.elementClass?.substring(0, 255),
    sessionId: event.sessionId,
    userId: event.userId,
  });
}

/**
 * Record multiple click events in batch
 */
export async function recordClickEventsBatch(events: ClickEventInput[]): Promise<void> {
  if (events.length === 0) return;
  const db = await getDb();
  if (!db) return;
  await db.insert(clickEvents).values(
    events.map((e: ClickEventInput) => ({
      page: e.page,
      x: e.x,
      y: e.y,
      viewportWidth: e.viewportWidth,
      viewportHeight: e.viewportHeight,
      elementTag: e.elementTag?.substring(0, 50),
      elementText: e.elementText?.substring(0, 255),
      elementId: e.elementId?.substring(0, 100),
      elementClass: e.elementClass?.substring(0, 255),
      sessionId: e.sessionId,
      userId: e.userId,
    }))
  );
}

export interface HeatmapPoint {
  x: number;
  y: number;
  count: number;
}

export interface HeatmapData {
  points: HeatmapPoint[];
  totalClicks: number;
  topElements: { tag: string; text: string; count: number }[];
  clicksByHour: { hour: number; count: number }[];
  avgViewport: { width: number; height: number };
}

/**
 * Get aggregated heatmap data for a specific page and date range
 */
export async function getHeatmapData(
  page: string = "/",
  days: number = 7
): Promise<HeatmapData> {
  const db = await getDb();
  if (!db) {
    return { points: [], totalClicks: 0, topElements: [], clicksByHour: [], avgViewport: { width: 1440, height: 900 } };
  }
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Get raw click points - aggregate into grid cells (20px grid)
  const rawClicks = await db
    .select({
      gridX: sql<number>`ROUND(x / 20) * 20`,
      gridY: sql<number>`ROUND(y / 20) * 20`,
      count: sql<number>`COUNT(*)`,
    })
    .from(clickEvents)
    .where(and(eq(clickEvents.page, page), gte(clickEvents.createdAt, since)))
    .groupBy(sql`ROUND(x / 20) * 20`, sql`ROUND(y / 20) * 20`)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(500);

  const points: HeatmapPoint[] = rawClicks.map((r: any) => ({
    x: Number(r.gridX),
    y: Number(r.gridY),
    count: Number(r.count),
  }));

  // Total clicks
  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(clickEvents)
    .where(and(eq(clickEvents.page, page), gte(clickEvents.createdAt, since)));
  const totalClicks = Number(totalResult[0]?.count || 0);

  // Top clicked elements
  const topElementsResult = await db
    .select({
      tag: clickEvents.elementTag,
      text: clickEvents.elementText,
      count: sql<number>`COUNT(*)`,
    })
    .from(clickEvents)
    .where(
      and(
        eq(clickEvents.page, page),
        gte(clickEvents.createdAt, since),
        sql`${clickEvents.elementTag} IS NOT NULL`
      )
    )
    .groupBy(clickEvents.elementTag, clickEvents.elementText)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

  const topElements = topElementsResult.map((r: any) => ({
    tag: r.tag || "unknown",
    text: (r.text || "").substring(0, 50),
    count: Number(r.count),
  }));

  // Clicks by hour of day
  const hourResult = await db
    .select({
      hour: sql<number>`HOUR(createdAt)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(clickEvents)
    .where(and(eq(clickEvents.page, page), gte(clickEvents.createdAt, since)))
    .groupBy(sql`HOUR(createdAt)`)
    .orderBy(sql`HOUR(createdAt)`);

  const clicksByHour = hourResult.map((r: any) => ({
    hour: Number(r.hour),
    count: Number(r.count),
  }));

  // Average viewport size
  const vpResult = await db
    .select({
      avgWidth: sql<number>`AVG(viewportWidth)`,
      avgHeight: sql<number>`AVG(viewportHeight)`,
    })
    .from(clickEvents)
    .where(and(eq(clickEvents.page, page), gte(clickEvents.createdAt, since)));

  const avgViewport = {
    width: Math.round(Number(vpResult[0]?.avgWidth || 1440)),
    height: Math.round(Number(vpResult[0]?.avgHeight || 900)),
  };

  return { points, totalClicks, topElements, clicksByHour, avgViewport };
}
