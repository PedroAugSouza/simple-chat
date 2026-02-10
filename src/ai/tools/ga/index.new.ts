import { gaClient } from "@/ai/clients/ga.client";
import { prisma } from "@/lib/prisma";
import { formatGaReport } from "@/utils/format-ga-response";
import { getSessionServer } from "@/utils/get-session.server";
import { tool } from "ai";
import z from "zod";

export const outputSchema = z.object({
  rows: z
    .array(
      z.object({
        metricValues: z
          .array(z.object({ value: z.string().optional() }))
          .optional()
          .describe(
            "Valores das métricas solicitadas na mesma ordem do array metrics",
          ),
        dimensionValues: z
          .array(z.object({ value: z.string().optional() }))
          .optional()
          .describe(
            "Valores das dimensões solicitadas na mesma ordem do array dimensions",
          ),
      }),
    )
    .optional()
    .describe(
      "Linhas de dados retornadas pela API do GA4. Cada linha representa uma combinação única das dimensões solicitadas com seus respectivos valores de métricas",
    ),
});

/**
 * Tool para consultar dados do Google Analytics 4 (GA4) via Data API.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎯 CONTEXTO GERAL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Esta tool permite extrair dados de analytics do GA4 combinando DIMENSÕES
 * (atributos qualitativos como "cidade", "dispositivo", "fonte de tráfego")
 * com MÉTRICAS (valores quantitativos como "sessões", "receita", "usuários").
 *
 * IMPORTANTE: Nem todas as combinações de dimensões e métricas são compatíveis!
 * O GA4 possui regras estritas de compatibilidade baseadas em ESCOPOS.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 📅 PERÍODOS E DATAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Formatos aceitos para startDate e endDate:
 *
 * 1. YYYY-MM-DD (ex: "2024-01-15")
 * 2. Valores relativos:
 *    - "today" = hoje
 *    - "yesterday" = ontem
 *    - "7daysAgo" = 7 dias atrás
 *    - "30daysAgo" = 30 dias atrás
 *
 * ⚠️ ATENÇÃO: As datas são interpretadas no fuso horário configurado na propriedade do GA4.
 *
 * EXEMPLOS DE CONTEXTO TEMPORAL:
 * - "ontem" / "yesterday" → { startDate: "yesterday", endDate: "yesterday" }
 * - "hoje" / "today" → { startDate: "today", endDate: "today" }
 * - "últimos 7 dias" → { startDate: "7daysAgo", endDate: "today" }
 * - "últimos 30 dias" → { startDate: "30daysAgo", endDate: "today" }
 * - "semana passada" → calcular datas específicas YYYY-MM-DD
 * - "mês passado" → calcular primeiro e último dia do mês anterior
 *
 * Se o usuário NÃO especificar período: use "yesterday" (padrão mais comum).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔍 ESCOPOS E COMPATIBILIDADE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ESCOPOS PRINCIPAIS:
 *
 * 1. USER-SCOPED (escopo de usuário)
 *    - Métricas: totalUsers, activeUsers, newUsers
 *    - Dimensões: userId, city, country, region, deviceCategory, browser, etc.
 *
 * 2. SESSION-SCOPED (escopo de sessão)
 *    - Métricas: sessions, engagedSessions, averageSessionDuration
 *    - Dimensões: sessionSource, sessionMedium, sessionCampaignName, sessionDefaultChannelGroup
 *
 * 3. EVENT-SCOPED (escopo de evento)
 *    - Métricas: eventCount, conversions
 *    - Dimensões: eventName, pagePath, pageTitle, linkUrl
 *
 * 4. ITEM-SCOPED (escopo de item/produto)
 *    - Métricas: itemRevenue, itemPurchaseQuantity, itemsViewed, itemsAddedToCart
 *    - Dimensões: itemId, itemName, itemBrand, itemCategory, itemCategory2-5, itemVariant
 *
 * ⚠️ REGRAS CRÍTICAS DE INCOMPATIBILIDADE (vigentes desde dez/2022 - fev/2023):
 *
 * ❌ ITEM-SCOPED DIMENSIONS NÃO PODEM SER COMBINADAS COM:
 *    - Event-scoped metrics (eventCount)
 *    - Dimensões de atribuição (source, medium, campaign, deviceCategory, city, country, etc.)
 *
 *    ✅ MAS PODEM ser combinadas com:
 *    - Item-scoped metrics (itemRevenue, itemPurchaseQuantity)
 *    - User-based metrics (activeUsers, totalUsers)
 *    - Session-based metrics (sessions)
 *
 * ❌ ATTRIBUTION DIMENSIONS (source, medium, campaign) NÃO PODEM SER COMBINADAS COM:
 *    - Event-scoped metrics (eventCount)
 *
 *    ✅ MAS PODEM ser combinadas com:
 *    - Attributable metrics (conversions, totalRevenue)
 *    - User-based metrics (activeUsers, totalUsers)
 *    - Session-based metrics (sessions)
 *
 * REGRA DE OURO: NÃO misture dimensões de escopos diferentes na mesma query
 * (ex: não combine itemName com source/medium, pois são escopos diferentes).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 CASOS DE USO E COMBINAÇÕES RECOMENDADAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1️⃣ ADS (MÍDIA PAGA)
 * ─────────────────────
 * Objetivo: Avaliar performance de campanhas pagas
 *
 * Dimensões comuns:
 * - sessionSource, sessionMedium, sessionCampaignName
 * - sessionDefaultChannelGroup, sessionGoogleAdsAdGroupName
 *
 * Métricas comuns:
 * - sessions, activeUsers, newUsers
 * - conversions, totalRevenue, purchaseRevenue
 * - engagedSessions, averageSessionDuration
 *
 * Exemplo: "Quantas conversões vieram do Google Ads ontem?"
 * → dimensions: ["sessionSource", "sessionMedium"]
 * → metrics: ["conversions", "sessions", "totalRevenue"]
 *
 *
 * 2️⃣ E-COMMERCE (VENDAS, FUNIL, PRODUTOS, CHECKOUT)
 * ──────────────────────────────────────────────────
 * Objetivo: Analisar produtos, vendas e funil de conversão
 *
 * ⚠️ ATENÇÃO: Use ITEM-SCOPED dimensions apenas com métricas compatíveis!
 *
 * A) Análise por PRODUTO (item-scoped):
 * Dimensões: itemName, itemBrand, itemCategory, itemId
 * Métricas: itemRevenue, itemPurchaseQuantity, itemsViewed, itemsAddedToCart
 *
 * Exemplo: "Qual produto vendeu mais ontem?"
 * → dimensions: ["itemName"]
 * → metrics: ["itemRevenue", "itemPurchaseQuantity"]
 *
 * B) Análise de CONVERSÃO E RECEITA (sem item-scoped):
 * Dimensões: city, country, deviceCategory, sessionSource
 * Métricas: ecommercePurchases, purchaseRevenue, totalRevenue, transactionId
 *
 * Exemplo: "Quantas compras tivemos nos últimos 7 dias?"
 * → dimensions: [] (ou ["date"] para ver evolução diária)
 * → metrics: ["ecommercePurchases", "purchaseRevenue"]
 *
 * C) Funil de E-commerce:
 * Métricas: itemsViewed → itemsAddedToCart → ecommercePurchases
 *
 *
 * 3️⃣ SEO + CONTEÚDO (ORGÂNICO)
 * ─────────────────────────────
 * Objetivo: Avaliar tráfego orgânico e performance de conteúdo
 *
 * Dimensões comuns:
 * - sessionSource (filtrar "google", "bing")
 * - sessionMedium (filtrar "organic")
 * - pagePath, pageTitle, landingPage
 *
 * Métricas comuns:
 * - sessions, activeUsers, newUsers
 * - screenPageViews, averageSessionDuration
 * - engagementRate, bounceRate
 *
 * Exemplo: "Quais páginas tiveram mais visitas orgânicas ontem?"
 * → dimensions: ["pagePath", "sessionMedium"]
 * → metrics: ["screenPageViews", "sessions"]
 *
 *
 * 4️⃣ UX / COMPORTAMENTO NO SITE (ENGAJAMENTO E FRICÇÕES)
 * ───────────────────────────────────────────────────────
 * Objetivo: Entender como usuários interagem com o site
 *
 * Dimensões comuns:
 * - pagePath, pageTitle, eventName
 * - percentScrolled, linkUrl, outbound
 *
 * Métricas comuns:
 * - eventCount, engagedSessions, averageSessionDuration
 * - screenPageViewsPerSession, userEngagementDuration
 *
 * Exemplo: "Quantos usuários rolaram 90% da página X?"
 * → dimensions: ["pagePath", "percentScrolled"]
 * → metrics: ["eventCount"]
 *
 *
 * 5️⃣ JORNADA MULTI-CANAL (SOCIAL, CREATORS, EMAIL, REFERRAL, DIRETO)
 * ───────────────────────────────────────────────────────────────────
 * Objetivo: Comparar performance entre canais de aquisição
 *
 * Dimensões comuns:
 * - sessionDefaultChannelGroup (ex: "Organic Social", "Paid Social", "Email", "Direct")
 * - sessionSource, sessionMedium
 * - firstUserSource, firstUserMedium (atribuição de primeira interação)
 *
 * Métricas comuns:
 * - sessions, activeUsers, newUsers
 * - conversions, totalRevenue
 * - engagementRate, averageSessionDuration
 *
 * Exemplo: "Qual canal trouxe mais receita nos últimos 30 dias?"
 * → dimensions: ["sessionDefaultChannelGroup"]
 * → metrics: ["totalRevenue", "sessions", "conversions"]
 *
 *
 * 6️⃣ RETENÇÃO / RECORRÊNCIA / LTV (RECOMPRA E COORTES)
 * ────────────────────────────────────────────────────
 * Objetivo: Avaliar fidelidade e valor do cliente ao longo do tempo
 *
 * Dimensões comuns:
 * - newVsReturning (new, returning)
 * - cohortNthWeek, cohortNthMonth
 * - transactionId (para contar compras únicas)
 *
 * Métricas comuns:
 * - activeUsers, totalUsers
 * - purchaseRevenue, averageRevenuePerUser
 * - ecommercePurchases, purchasers (compradores únicos)
 *
 * Exemplo: "Quantos usuários recorrentes compraram nos últimos 7 dias?"
 * → dimensions: ["newVsReturning"]
 * → metrics: ["purchasers", "purchaseRevenue"]
 *
 *
 * 7️⃣ SEGMENTAÇÕES DE PÚBLICO (NOVOS VS RECORRENTES, ALTO TICKET)
 * ───────────────────────────────────────────────────────────────
 * Objetivo: Comparar comportamento entre segmentos de usuários
 *
 * Dimensões comuns:
 * - newVsReturning (new = primeiro acesso, returning = retorno)
 * - audienceName (públicos personalizados criados no GA4)
 * - city, country, deviceCategory
 *
 * Métricas comuns:
 * - activeUsers, sessions
 * - conversions, totalRevenue, averageRevenuePerUser
 *
 * Exemplo: "Usuários novos vs recorrentes: quem compra mais?"
 * → dimensions: ["newVsReturning"]
 * → metrics: ["purchasers", "purchaseRevenue", "ecommercePurchases"]
 *
 *
 * 8️⃣ BUSCA INTERNA DO SITE (TERMOS BUSCADOS E GAPS)
 * ─────────────────────────────────────────────────
 * Objetivo: Identificar o que usuários procuram e não encontram
 *
 * Dimensões comuns:
 * - searchTerm (termo buscado internamente)
 * - eventName (filtrar "view_search_results")
 *
 * Métricas comuns:
 * - eventCount, sessions
 *
 * Exemplo: "Quais foram os termos mais buscados ontem?"
 * → dimensions: ["searchTerm"]
 * → metrics: ["eventCount"]
 *
 * ⚠️ Nota: Requer implementação do evento "view_search_results" no site.
 *
 *
 * 9️⃣ PERFORMANCE POR DISPOSITIVO/REGIÃO (MOBILE, NAVEGADOR, UF/CIDADE)
 * ────────────────────────────────────────────────────────────────────
 * Objetivo: Comparar métricas entre dispositivos e geografias
 *
 * Dimensões comuns:
 * - deviceCategory (desktop, mobile, tablet)
 * - browser, operatingSystem
 * - city, region, country
 *
 * Métricas comuns:
 * - sessions, activeUsers
 * - conversions, totalRevenue
 * - averageSessionDuration, bounceRate
 *
 * Exemplo: "Qual dispositivo gerou mais receita ontem?"
 * → dimensions: ["deviceCategory"]
 * → metrics: ["totalRevenue", "sessions", "conversions"]
 *
 * Exemplo: "Quais cidades compraram mais nos últimos 30 dias?"
 * → dimensions: ["city"]
 * → metrics: ["purchaseRevenue", "ecommercePurchases"]
 *
 *
 * 🔟 ERROS E GARGALOS DO FUNIL (CHECKOUT, PAGAMENTO, CARREGAMENTO)
 * ─────────────────────────────────────────────────────────────────
 * Objetivo: Identificar onde usuários abandonam o funil
 *
 * Dimensões comuns:
 * - eventName (ex: "begin_checkout", "add_payment_info", "purchase")
 * - pagePath (páginas do funil)
 *
 * Métricas comuns:
 * - eventCount (contar cada etapa)
 * - sessions
 *
 * Exemplo: "Quantos usuários começaram checkout vs finalizaram compra?"
 * → dimensions: ["eventName"]
 * → metrics: ["eventCount"]
 * → Filtrar eventos: begin_checkout, add_payment_info, purchase
 *
 * ⚠️ Nota: Requer implementação correta dos eventos de e-commerce enhanced.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 🗣️ PERFIS DE PERGUNTAS COMUNS DO USUÁRIO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * "Qual foi o meu faturamento ontem?"
 * → dateRange: { startDate: "yesterday", endDate: "yesterday" }
 * → metrics: ["totalRevenue"] ou ["purchaseRevenue"]
 * → dimensions: [] (sem segmentação)
 *
 * "Quantos usuários tive nos últimos 7 dias?"
 * → dateRange: { startDate: "7daysAgo", endDate: "today" }
 * → metrics: ["activeUsers"] ou ["totalUsers"]
 * → dimensions: [] ou ["date"] (para ver evolução diária)
 *
 * "Qual produto vendeu mais este mês?"
 * → dateRange: calcular primeiro dia do mês até hoje
 * → dimensions: ["itemName"]
 * → metrics: ["itemRevenue", "itemPurchaseQuantity"]
 *
 * "De onde vem meu tráfego?"
 * → dateRange: { startDate: "30daysAgo", endDate: "today" }
 * → dimensions: ["sessionSource"] ou ["sessionDefaultChannelGroup"]
 * → metrics: ["sessions", "activeUsers"]
 *
 * "Quantas conversões teve minha campanha X?"
 * → dateRange: período da campanha
 * → dimensions: ["sessionCampaignName"]
 * → metrics: ["conversions", "sessions"]
 *
 * "Mobile vs Desktop: qual converte mais?"
 * → dimensions: ["deviceCategory"]
 * → metrics: ["conversions", "sessions", "totalRevenue"]
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 📚 REFERÊNCIAS DE DIMENSÕES E MÉTRICAS MAIS USADAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DIMENSÕES PRINCIPAIS:
 *
 * Atribuição/Canal:
 * - sessionSource, sessionMedium, sessionCampaignName
 * - sessionDefaultChannelGroup (Organic Social, Paid Search, Direct, etc.)
 * - firstUserSource, firstUserMedium (primeira interação do usuário)
 *
 * Geografia:
 * - city, country, region, continent
 *
 * Dispositivo/Tecnologia:
 * - deviceCategory, browser, operatingSystem, mobileDeviceModel
 *
 * Conteúdo/Página:
 * - pagePath, pageTitle, landingPage, pagePath+queryString
 * - eventName (nome dos eventos personalizados)
 *
 * E-commerce (Item-scoped - cuidado com compatibilidade!):
 * - itemName, itemBrand, itemCategory, itemCategory2, itemCategory3, itemCategory4, itemCategory5
 * - itemId, itemVariant
 *
 * Usuário:
 * - newVsReturning (new, returning)
 * - audienceName (públicos personalizados)
 *
 * MÉTRICAS PRINCIPAIS:
 *
 * Usuários e Sessões:
 * - activeUsers (usuários com sessão engajada)
 * - totalUsers (usuários únicos)
 * - newUsers (usuários novos)
 * - sessions (total de sessões)
 * - engagedSessions (sessões com >10s, >2 páginas ou conversão)
 *
 * Engajamento:
 * - averageSessionDuration (duração média da sessão em segundos)
 * - screenPageViews (visualizações de página)
 * - screenPageViewsPerSession
 * - engagementRate (taxa de engajamento)
 * - bounceRate (taxa de rejeição)
 * - eventCount (contagem de eventos)
 *
 * Conversões e Receita:
 * - conversions (total de conversões/eventos-chave)
 * - totalRevenue (receita total incluindo compras, assinaturas, ads)
 * - purchaseRevenue (receita apenas de compras)
 * - ecommercePurchases (número de transações de compra)
 * - averageRevenuePerUser (receita média por usuário)
 * - averagePurchaseRevenue (valor médio do pedido)
 *
 * E-commerce (Item-scoped - cuidado com compatibilidade!):
 * - itemRevenue (receita por item/produto)
 * - itemPurchaseQuantity (quantidade de itens comprados)
 * - itemsViewed (visualizações de produtos)
 * - itemsAddedToCart (adições ao carrinho)
 * - itemsCheckedOut (produtos no checkout)
 * - purchasers (compradores únicos)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ VALIDAÇÃO E TRATAMENTO DE ERROS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Antes de executar a query:
 * 1. Validar se a integração com GA4 existe e está ativa
 * 2. Verificar se há refresh_token nas credenciais
 * 3. Validar compatibilidade de dimensions e metrics (escopos)
 * 4. Se houver dimensões item-scoped, usar APENAS métricas item/user/session-scoped
 * 5. Se houver dimensões de atribuição (source/medium), NÃO usar eventCount
 *
 * Em caso de erro:
 * - Explicar ao usuário qual combinação não é permitida
 * - Sugerir alternativas compatíveis
 * - Retornar erro claro em português
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ga = tool({
  description: `
Ferramenta para consultar dados do Google Analytics 4 (GA4).

Use esta tool quando o usuário solicitar:
- Dados de analytics, tráfego, conversões, receita
- Informações sobre usuários, sessões, páginas
- Performance de campanhas, canais, produtos
- Segmentações por dispositivo, região, fonte
- Análise de funil, e-commerce, engajamento

IMPORTANTE:
- Respeite as regras de compatibilidade entre dimensões e métricas (ver documentação acima)
- Interprete corretamente períodos temporais (ontem, últimos 7 dias, este mês, etc.)
- Se o usuário não especificar período, use "yesterday" por padrão
- Sempre valide se a integração existe antes de executar

EXEMPLOS DE USO:
- "Qual foi o faturamento ontem?" → metrics: ["totalRevenue"], dateRange: yesterday
- "Quantos usuários tive nos últimos 7 dias?" → metrics: ["activeUsers"], dateRange: 7daysAgo to today
- "Qual produto vendeu mais?" → dimensions: ["itemName"], metrics: ["itemRevenue"]
- "De onde vem meu tráfego?" → dimensions: ["sessionSource"], metrics: ["sessions"]
`.trim(),
  inputSchema: z.object({
    dateRange: z
      .object({
        startDate: z
          .string()
          .describe(
            'Data inicial no formato "YYYY-MM-DD", "yesterday", "today" ou "NdaysAgo" (ex: "7daysAgo")',
          ),
        endDate: z
          .string()
          .describe(
            'Data final no formato "YYYY-MM-DD", "yesterday", "today" ou "NdaysAgo" (ex: "today")',
          ),
      })
      .describe(
        `Período de análise. Exemplos:
- Ontem: { startDate: "yesterday", endDate: "yesterday" }
- Últimos 7 dias: { startDate: "7daysAgo", endDate: "today" }
- Últimos 30 dias: { startDate: "30daysAgo", endDate: "today" }
Se não especificado pelo usuário, use "yesterday".
ATENÇÃO: Datas são interpretadas no fuso horário da propriedade GA4.`,
      ),
    dimensions: z.array(z.string()).describe(
      `Lista de dimensões (atributos qualitativos) para segmentar os dados.

DIMENSÕES COMUNS:
- Atribuição: sessionSource, sessionMedium, sessionCampaignName, sessionDefaultChannelGroup
- Geografia: city, country, region
- Dispositivo: deviceCategory, browser, operatingSystem
- Conteúdo: pagePath, pageTitle, eventName
- E-commerce (ITEM-SCOPED): itemName, itemBrand, itemCategory, itemId
- Usuário: newVsReturning, audienceName

⚠️ REGRAS CRÍTICAS:
- Dimensões ITEM-SCOPED (itemName, itemBrand, etc.) NÃO podem ser combinadas com dimensões de atribuição (source, medium) ou event-scoped metrics (eventCount)
- Evite misturar dimensões de escopos diferentes
- Array vazio [] é válido quando você quer totais gerais sem segmentação

Exemplos:
- ["sessionSource"] = segmentar por fonte de tráfego
- ["deviceCategory"] = segmentar por tipo de dispositivo
- ["itemName"] = segmentar por produto (use apenas com métricas item-scoped!)
- [] = sem segmentação, retorna total geral`,
    ),
    metrics: z.array(z.string()).describe(
      `Lista de métricas (valores quantitativos) a serem consultadas.

MÉTRICAS COMUNS:
- Usuários: activeUsers, totalUsers, newUsers
- Sessões: sessions, engagedSessions, averageSessionDuration
- Engajamento: screenPageViews, eventCount, engagementRate, bounceRate
- Conversões: conversions, totalRevenue, purchaseRevenue
- E-commerce geral: ecommercePurchases, averagePurchaseRevenue, purchasers
- E-commerce ITEM-SCOPED: itemRevenue, itemPurchaseQuantity, itemsViewed, itemsAddedToCart

⚠️ REGRAS CRÍTICAS:
- Métricas ITEM-SCOPED (itemRevenue, itemPurchaseQuantity) só funcionam com dimensões ITEM-SCOPED
- eventCount NÃO pode ser combinado com dimensões de atribuição (source, medium) ou ITEM-SCOPED
- Sempre consulte pelo menos 1 métrica

Exemplos:
- ["totalRevenue"] = receita total
- ["activeUsers", "sessions"] = usuários ativos e sessões
- ["itemRevenue", "itemPurchaseQuantity"] = receita e quantidade por produto (use com dimensões item-scoped!)
- ["conversions", "sessions"] = conversões e sessões por canal`,
    ),
  }),
  inputExamples: [
    {
      input: {
        dateRange: { startDate: "yesterday", endDate: "yesterday" },
        dimensions: [],
        metrics: ["totalRevenue", "ecommercePurchases"],
      },
    },
    {
      input: {
        dateRange: { startDate: "7daysAgo", endDate: "today" },
        dimensions: ["sessionSource"],
        metrics: ["sessions", "activeUsers"],
      },
    },
    {
      input: {
        dateRange: { startDate: "30daysAgo", endDate: "today" },
        dimensions: ["itemName"],
        metrics: ["itemRevenue", "itemPurchaseQuantity"],
      },
    },
    {
      input: {
        dateRange: { startDate: "yesterday", endDate: "yesterday" },
        dimensions: ["deviceCategory"],
        metrics: ["conversions", "sessions"],
      },
    },
  ],
  outputSchema,
  execute: async ({ dateRange, dimensions, metrics }) => {
    const session = await getSessionServer();

    const integration = await prisma.integration.findFirst({
      where: {
        active: true,
        userId: session.id,
        provider: "ga",
      },
    });

    if (!integration) {
      throw new Error(
        "Integração com Google Analytics não encontrada. O usuário precisa conectar sua conta GA4 primeiro.",
      );
    }

    const credentials = JSON.parse(integration.credentials || "{}");

    if (!credentials.refresh_token) {
      throw new Error(
        "Token de acesso do Google Analytics não encontrado nas credenciais. A integração precisa ser reautorizada.",
      );
    }

    if (!credentials.property_id) {
      throw new Error(
        "ID da propriedade GA4 não encontrado. Configure o property_id nas credenciais da integração.",
      );
    }

    // Validação básica de compatibilidade (pode ser expandida)
    const itemScopedDimensions = [
      "itemName",
      "itemBrand",
      "itemCategory",
      "itemCategory2",
      "itemCategory3",
      "itemCategory4",
      "itemCategory5",
      "itemId",
      "itemVariant",
    ];
    const hasItemDimensions = dimensions.some((d) =>
      itemScopedDimensions.includes(d),
    );

    if (hasItemDimensions && metrics.includes("eventCount")) {
      throw new Error(
        `Incompatibilidade detectada: dimensões de item (${dimensions.filter((d) => itemScopedDimensions.includes(d)).join(", ")}) não podem ser combinadas com a métrica "eventCount".

Sugestões:
- Use métricas item-scoped: itemRevenue, itemPurchaseQuantity
- Ou use métricas de usuário/sessão: activeUsers, sessions
- Ou remova as dimensões de item e use apenas eventCount`,
      );
    }

    const request = await gaClient({
      refresh_token: credentials.refresh_token,
      property_id: credentials.property_id,
      dateRange,
      dimensions,
      metrics,
    });

    const result = formatGaReport(request.data ?? { rows: [] });

    return result as any;
  },
});
