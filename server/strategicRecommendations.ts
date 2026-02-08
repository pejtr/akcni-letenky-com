/**
 * Strategic Recommendations Service
 * 
 * Uses LLM to analyze weekly report data and generate 3-5 actionable
 * strategic recommendations for the next week. Integrated into weekly
 * report email and admin dashboard.
 * 
 * Follows Alex Hormozi's principles: focus on ROI, scalable systems,
 * and data-driven decision making.
 */

import { invokeLLM } from "./_core/llm";
import type { WeeklyMetrics, WeekOverWeekComparison } from "./weeklyReport";

// ============ Types ============

export interface StrategicRecommendation {
  priority: "high" | "medium" | "low";
  category: "growth" | "retention" | "optimization" | "content" | "monetization";
  title: string;
  description: string;
  expectedImpact: string;
  actionSteps: string[];
}

export interface WeeklyStrategy {
  summary: string;
  recommendations: StrategicRecommendation[];
  keyInsight: string;
  generatedAt: string;
}

// ============ LLM Integration ============

/**
 * Generate strategic recommendations from weekly report data using LLM
 */
export async function generateStrategicRecommendations(
  comparison: WeekOverWeekComparison
): Promise<WeeklyStrategy> {
  const current = comparison.current;
  const changes = comparison.changes;

  // Build context for LLM
  const metricsContext = buildMetricsContext(current, changes);

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Jsi strategický analytik pro affiliate cestovní web "Akční Letenky" (akcni-letenky.com).
Tvým úkolem je analyzovat týdenní metriky a navrhnout 3-5 konkrétních, akčních doporučení pro příští týden.

Principy:
- Zaměř se na ROI a ziskovost (Alex Hormozi přístup)
- Navrhuj škálovatelné a automatizovatelné kroky
- Prioritizuj podle dopadu na příjmy z affiliate kliků
- Piš česky, stručně a konkrétně
- Každé doporučení musí být implementovatelné tento týden

Kategorie doporučení:
- growth: Růst návštěvnosti a nových uživatelů
- retention: Udržení a zapojení stávajících uživatelů
- optimization: Optimalizace konverzí a procesů
- content: Obsahová strategie
- monetization: Přímá monetizace a affiliate výnosy

Odpověz POUZE validním JSON objektem bez markdown formátování.`,
        },
        {
          role: "user",
          content: `Analyzuj tyto týdenní metriky a navrhni strategická doporučení:

${metricsContext}

Odpověz jako JSON objekt s tímto schématem:
{
  "summary": "Stručné shrnutí týdne (1-2 věty)",
  "keyInsight": "Nejdůležitější zjištění z dat (1 věta)",
  "recommendations": [
    {
      "priority": "high|medium|low",
      "category": "growth|retention|optimization|content|monetization",
      "title": "Název doporučení",
      "description": "Popis a zdůvodnění (2-3 věty)",
      "expectedImpact": "Očekávaný dopad (1 věta)",
      "actionSteps": ["Krok 1", "Krok 2", "Krok 3"]
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "weekly_strategy",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string", description: "Brief week summary" },
              keyInsight: { type: "string", description: "Key insight from data" },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    category: { type: "string", enum: ["growth", "retention", "optimization", "content", "monetization"] },
                    title: { type: "string" },
                    description: { type: "string" },
                    expectedImpact: { type: "string" },
                    actionSteps: { type: "array", items: { type: "string" } },
                  },
                  required: ["priority", "category", "title", "description", "expectedImpact", "actionSteps"],
                  additionalProperties: false,
                },
              },
            },
            required: ["summary", "keyInsight", "recommendations"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[StrategicRec] Empty LLM response");
      return getFallbackStrategy(current);
    }

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr) as WeeklyStrategy;
    parsed.generatedAt = new Date().toISOString();

    console.log(`[StrategicRec] Generated ${parsed.recommendations.length} recommendations`);
    return parsed;
  } catch (err) {
    console.error("[StrategicRec] LLM generation failed:", err);
    return getFallbackStrategy(current);
  }
}

/**
 * Build human-readable metrics context for LLM
 */
function buildMetricsContext(
  current: WeeklyMetrics,
  changes: WeekOverWeekComparison["changes"]
): string {
  const formatChange = (label: string, value: number, change?: { value: number; percent: number }) => {
    const changeStr = change
      ? ` (${change.value >= 0 ? "+" : ""}${change.value}, ${change.percent >= 0 ? "+" : ""}${change.percent}% oproti minulému týdnu)`
      : " (bez srovnání)";
    return `- ${label}: ${value}${changeStr}`;
  };

  const lines = [
    `Období: ${current.weekLabel}`,
    "",
    "KLÍČOVÉ METRIKY:",
    formatChange("Affiliate kliky", current.totalAffiliateClicks, changes?.affiliateClicks),
    formatChange("Zobrazení stránek", current.totalPageViews, changes?.pageViews),
    formatChange("Nové registrace", current.totalNewRegistrations, changes?.newRegistrations),
    formatChange("Noví odběratelé", current.totalNewSubscribers, changes?.newSubscribers),
    formatChange("Chatbot konverzace", current.totalChatbotConversations, changes?.chatbotConversations),
    formatChange("Chatbot leady", current.totalChatbotLeads, changes?.chatbotLeads),
    formatChange("Sdílení na sociálních sítích", current.totalSocialShares, changes?.socialShares),
    formatChange("Upozornění na pokles cen", current.totalPriceAlertNotifications, changes ? undefined : undefined),
    formatChange("Odeslané emaily", current.totalEmailsSent, changes ? undefined : undefined),
    "",
    "PRŮMĚRY:",
    `- Průměr kliků/den: ${current.avgDailyClicks}`,
    `- Průměr zobrazení/den: ${current.avgDailyPageViews}`,
    "",
    "TOP DESTINACE:",
    ...(current.topDestinations.length > 0
      ? current.topDestinations.map((d, i) => `  ${i + 1}. ${d.destination}: ${d.clicks} kliků`)
      : ["  Žádná data"]),
    "",
    current.bestDay ? `NEJLEPŠÍ DEN: ${current.bestDay.date} (${current.bestDay.clicks} kliků)` : "",
    current.worstDay ? `NEJSLABŠÍ DEN: ${current.worstDay.date} (${current.worstDay.clicks} kliků)` : "",
  ];

  return lines.filter(Boolean).join("\n");
}

/**
 * Fallback strategy when LLM is unavailable
 */
function getFallbackStrategy(current: WeeklyMetrics): WeeklyStrategy {
  const recommendations: StrategicRecommendation[] = [];

  // Always recommend based on basic metrics
  if (current.totalAffiliateClicks < 100) {
    recommendations.push({
      priority: "high",
      category: "growth",
      title: "Zvýšit návštěvnost webu",
      description: "Affiliate kliky jsou pod 100 za týden. Zaměřte se na SEO optimalizaci a sociální sítě pro zvýšení organické návštěvnosti.",
      expectedImpact: "Potenciální 2-3x nárůst affiliate kliků",
      actionSteps: [
        "Optimalizovat meta tagy pro top 10 destinací",
        "Sdílet 3 akční nabídky na sociálních sítích denně",
        "Vytvořit blog post o nejlevnějších destinacích",
      ],
    });
  }

  if (current.totalNewSubscribers < 10) {
    recommendations.push({
      priority: "high",
      category: "retention",
      title: "Posílit sběr emailů",
      description: "Nízký počet nových odběratelů. Vylepšete newsletter opt-in formuláře a nabídněte exkluzivní slevy.",
      expectedImpact: "Zvýšení subscriber base o 50%+",
      actionSteps: [
        "Přidat exit-intent popup s nabídkou exkluzivních slev",
        "Testovat různé CTA texty na newsletter banneru",
        "Nabídnout lead magnet (průvodce levným cestováním)",
      ],
    });
  }

  recommendations.push({
    priority: "medium",
    category: "optimization",
    title: "Analyzovat konverzní trychtýř",
    description: "Sledujte cestu uživatele od příchodu po affiliate klik a identifikujte místa s největším odpadem.",
    expectedImpact: "Zlepšení konverzního poměru o 10-20%",
    actionSteps: [
      "Zkontrolovat bounce rate na landing page",
      "Optimalizovat CTA tlačítka na kartách destinací",
      "Přidat social proof (počet lidí, kteří si nabídku prohlížejí)",
    ],
  });

  return {
    summary: `Týden ${current.weekLabel}: ${current.totalAffiliateClicks} affiliate kliků, ${current.totalNewRegistrations} registrací.`,
    keyInsight: "Automatická analýza – LLM nedostupný, použita fallback doporučení.",
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate HTML for strategic recommendations (for email)
 */
export function generateRecommendationsHTML(strategy: WeeklyStrategy): string {
  const priorityColors = {
    high: { bg: "#FEE2E2", text: "#991B1B", label: "Vysoká" },
    medium: { bg: "#FEF3C7", text: "#92400E", label: "Střední" },
    low: { bg: "#DBEAFE", text: "#1E40AF", label: "Nízká" },
  };

  const categoryIcons: Record<string, string> = {
    growth: "📈",
    retention: "🔄",
    optimization: "⚡",
    content: "📝",
    monetization: "💰",
  };

  const recsHtml = strategy.recommendations
    .map((rec) => {
      const prio = priorityColors[rec.priority];
      const icon = categoryIcons[rec.category] || "📋";
      const steps = rec.actionSteps
        .map((s) => `<li style="margin-bottom:4px;color:#374151;">${s}</li>`)
        .join("");

      return `
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:20px;">${icon}</span>
            <strong style="color:#111827;font-size:14px;">${rec.title}</strong>
            <span style="background:${prio.bg};color:${prio.text};font-size:10px;padding:2px 8px;border-radius:12px;font-weight:600;">
              ${prio.label}
            </span>
          </div>
          <p style="color:#4B5563;font-size:13px;margin:0 0 8px 0;">${rec.description}</p>
          <p style="color:#059669;font-size:12px;margin:0 0 8px 0;font-weight:600;">
            💡 ${rec.expectedImpact}
          </p>
          <ul style="margin:0;padding-left:20px;font-size:12px;">${steps}</ul>
        </div>`;
    })
    .join("");

  return `
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin-top:24px;">
      <h2 style="color:#166534;font-size:18px;margin:0 0 4px 0;">🧠 Strategická doporučení pro příští týden</h2>
      <p style="color:#15803D;font-size:13px;margin:0 0 16px 0;">${strategy.summary}</p>
      <div style="background:#DCFCE7;border-radius:8px;padding:12px;margin-bottom:16px;">
        <strong style="color:#166534;font-size:12px;">💡 Klíčové zjištění:</strong>
        <span style="color:#166534;font-size:12px;"> ${strategy.keyInsight}</span>
      </div>
      ${recsHtml}
    </div>`;
}
