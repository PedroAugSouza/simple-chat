import { tool } from "ai";
import z from "zod";

const outputSchema = z.object({
  dimensions: z.array(z.string()),
  metrics: z.array(z.string()),
});

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const unique = (list: string[]) => Array.from(new Set(list));

const METRICS_CATALOG: Array<{ metric: string; keywords: string[] }> = [
  { metric: "sessions", keywords: ["sessao", "sessoes", "sessions"] },
  { metric: "activeUsers", keywords: ["usuario ativo", "usuarios ativos"] },
  { metric: "newUsers", keywords: ["novos usuarios"] },
  { metric: "totalUsers", keywords: ["usuarios", "usuario"] },
  { metric: "engagedSessions", keywords: ["sessoes engajadas", "engajamento"] },
  {
    metric: "averageSessionDuration",
    keywords: ["duracao media", "tempo medio", "tempo na sessao"],
  },
  {
    metric: "screenPageViews",
    keywords: ["visualizacao", "visualizacoes", "pageview"],
  },
  { metric: "eventCount", keywords: ["evento", "eventos"] },
  { metric: "conversions", keywords: ["conversao", "conversoes"] },
  { metric: "totalRevenue", keywords: ["receita", "faturamento"] },
  { metric: "purchaseRevenue", keywords: ["receita de compra"] },
  { metric: "ecommercePurchases", keywords: ["compras", "pedidos"] },
  { metric: "itemRevenue", keywords: ["receita por item", "receita do produto"] },
  {
    metric: "itemPurchaseQuantity",
    keywords: ["quantidade de itens", "itens comprados"],
  },
  { metric: "purchasers", keywords: ["compradores"] },
];

const DIMENSIONS_CATALOG: Array<{ dimension: string; keywords: string[] }> = [
  { dimension: "userPseudoId", keywords: ["por usuario", "por usuarios"] },
  { dimension: "city", keywords: ["cidade"] },
  { dimension: "country", keywords: ["pais"] },
  { dimension: "region", keywords: ["estado", "regiao"] },
  { dimension: "deviceCategory", keywords: ["dispositivo", "device"] },
  { dimension: "browser", keywords: ["navegador", "browser"] },
  { dimension: "sessionSource", keywords: ["fonte"] },
  { dimension: "sessionMedium", keywords: ["midia", "medium"] },
  { dimension: "sessionCampaignName", keywords: ["campanha", "campaign"] },
  {
    dimension: "sessionDefaultChannelGroup",
    keywords: ["canal", "canal padrao", "channel"],
  },
  { dimension: "pagePath", keywords: ["pagina", "page"] },
  { dimension: "pageTitle", keywords: ["titulo da pagina", "page title"] },
  { dimension: "eventName", keywords: ["evento"] },
  { dimension: "screenName", keywords: ["tela", "screen"] },
  { dimension: "language", keywords: ["idioma", "language"] },
  { dimension: "itemName", keywords: ["produto", "item"] },
  { dimension: "itemCategory", keywords: ["categoria do produto", "categoria"] },
  { dimension: "itemBrand", keywords: ["marca"] },
  { dimension: "itemId", keywords: ["sku", "id do produto"] },
];

const DIMENSION_COMPATIBILITY: Record<string, string[]> = {
  userPseudoId: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "averageSessionDuration",
    "eventCount",
    "conversions",
  ],
  city: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "averageSessionDuration",
    "screenPageViews",
    "eventCount",
    "conversions",
    "totalRevenue",
  ],
  country: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "averageSessionDuration",
    "screenPageViews",
    "eventCount",
    "conversions",
    "totalRevenue",
  ],
  region: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "averageSessionDuration",
    "screenPageViews",
    "eventCount",
    "conversions",
    "totalRevenue",
  ],
  deviceCategory: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "averageSessionDuration",
    "screenPageViews",
    "eventCount",
    "conversions",
    "totalRevenue",
  ],
  browser: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "averageSessionDuration",
    "screenPageViews",
    "eventCount",
    "conversions",
    "totalRevenue",
  ],
  sessionSource: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "screenPageViews",
    "eventCount",
    "conversions",
    "totalRevenue",
  ],
  sessionMedium: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "screenPageViews",
    "eventCount",
    "conversions",
    "totalRevenue",
  ],
  sessionCampaignName: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "screenPageViews",
    "eventCount",
    "conversions",
    "totalRevenue",
  ],
  sessionDefaultChannelGroup: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "screenPageViews",
    "eventCount",
    "conversions",
    "totalRevenue",
  ],
  pagePath: [
    "sessions",
    "activeUsers",
    "totalUsers",
    "engagedSessions",
    "averageSessionDuration",
    "screenPageViews",
    "eventCount",
    "conversions",
  ],
  pageTitle: [
    "sessions",
    "activeUsers",
    "totalUsers",
    "engagedSessions",
    "averageSessionDuration",
    "screenPageViews",
    "eventCount",
    "conversions",
  ],
  screenName: [
    "sessions",
    "activeUsers",
    "totalUsers",
    "engagedSessions",
    "averageSessionDuration",
    "screenPageViews",
    "eventCount",
    "conversions",
  ],
  language: [
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "engagedSessions",
    "averageSessionDuration",
    "screenPageViews",
    "eventCount",
    "conversions",
  ],
  eventName: ["eventCount", "conversions"],
  itemName: [
    "itemRevenue",
    "itemPurchaseQuantity",
    "purchaseRevenue",
    "ecommercePurchases",
    "purchasers",
    "totalRevenue",
  ],
  itemCategory: [
    "itemRevenue",
    "itemPurchaseQuantity",
    "purchaseRevenue",
    "ecommercePurchases",
    "purchasers",
    "totalRevenue",
  ],
  itemBrand: [
    "itemRevenue",
    "itemPurchaseQuantity",
    "purchaseRevenue",
    "ecommercePurchases",
    "purchasers",
    "totalRevenue",
  ],
  itemId: [
    "itemRevenue",
    "itemPurchaseQuantity",
    "purchaseRevenue",
    "ecommercePurchases",
    "purchasers",
    "totalRevenue",
  ],
};

const pickCompatibleMetrics = (metrics: string[], dimensions: string[]) => {
  if (dimensions.length === 0) return metrics;
  return metrics.filter((metric) =>
    dimensions.every((dimension) =>
      (DIMENSION_COMPATIBILITY[dimension] ?? []).includes(metric)
    )
  );
};

export const resolveBody = tool({
  description:
    "nesta tool, deve gerar um objeto com dimensions e metrics para o ga4 com base no pedido do usuário.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "texto livre do usuário que descreve o que ele quer ver no GA4"
      ),
  }),
  inputExamples: [
    { input: { query: "quero saber quantas sessões tive por usuário ontem" } },
    { input: { query: "usuários por cidade" } },
    { input: { query: "visualizações por página" } },
  ],
  outputSchema,
  execute: async ({ query }) => {
    const text = normalize(query);

    const metrics = unique(
      METRICS_CATALOG.filter(({ keywords }) =>
        keywords.some((k) => text.includes(k))
      ).map(({ metric }) => metric)
    );

    const dimensions = unique(
      DIMENSIONS_CATALOG.filter(({ keywords }) =>
        keywords.some((k) => text.includes(k))
      ).map(({ dimension }) => dimension)
    );

    const baseMetrics = metrics.length > 0 ? metrics : ["sessions"];
    const safeMetrics = pickCompatibleMetrics(baseMetrics, dimensions);
    const safeDimensions =
      safeMetrics.length > 0
        ? dimensions
        : dimensions.filter(
            (dimension) =>
              (DIMENSION_COMPATIBILITY[dimension] ?? []).includes("sessions")
          );
    const finalMetrics = safeMetrics.length > 0 ? safeMetrics : ["sessions"];

    return outputSchema.parse({
      dimensions: safeDimensions,
      metrics: finalMetrics,
    });
  },
});
