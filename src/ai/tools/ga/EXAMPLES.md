# GA4 Tool - Exemplos Práticos de Uso

Este documento contém exemplos práticos de como usar a tool GA4 para diferentes cenários de análise.

## 📅 Períodos e Datas

### Ontem
```typescript
{
  dateRange: { startDate: "yesterday", endDate: "yesterday" },
  dimensions: [],
  metrics: ["totalRevenue"]
}
```

### Últimos 7 dias
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: ["date"],
  metrics: ["sessions", "activeUsers"]
}
```

### Últimos 30 dias
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: [],
  metrics: ["totalRevenue", "conversions"]
}
```

### Período específico
```typescript
{
  dateRange: { startDate: "2024-01-01", endDate: "2024-01-31" },
  dimensions: [],
  metrics: ["ecommercePurchases"]
}
```

---

## 1️⃣ ADS (Mídia Paga)

### Performance geral de campanhas
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["sessionCampaignName"],
  metrics: ["sessions", "conversions", "totalRevenue"]
}
```

### ROI por canal pago
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: ["sessionDefaultChannelGroup"],
  metrics: ["sessions", "conversions", "totalRevenue", "activeUsers"]
}
```

### Análise de fonte e mídia
```typescript
{
  dateRange: { startDate: "yesterday", endDate: "yesterday" },
  dimensions: ["sessionSource", "sessionMedium"],
  metrics: ["sessions", "engagedSessions", "conversions"]
}
```

---

## 2️⃣ E-commerce

### Top produtos vendidos (✅ CORRETO - item-scoped)
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["itemName"],
  metrics: ["itemRevenue", "itemPurchaseQuantity"]
}
```

### Receita por categoria de produto (✅ CORRETO - item-scoped)
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: ["itemCategory"],
  metrics: ["itemRevenue", "itemPurchaseQuantity", "itemsViewed"]
}
```

### Performance de marca (✅ CORRETO - item-scoped)
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["itemBrand"],
  metrics: ["itemRevenue", "itemPurchaseQuantity"]
}
```

### Receita total por canal (✅ CORRETO - sem item-scoped)
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["sessionSource"],
  metrics: ["totalRevenue", "ecommercePurchases", "purchaseRevenue"]
}
```

### Valor médio do pedido (✅ CORRETO)
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: [],
  metrics: ["averagePurchaseRevenue", "ecommercePurchases", "purchaseRevenue"]
}
```

### ❌ ERRADO - itemName com sessionSource (escopos incompatíveis)
```typescript
// NÃO FAÇA ISSO!
{
  dateRange: { startDate: "yesterday", endDate: "yesterday" },
  dimensions: ["itemName", "sessionSource"], // ❌ Incompatível!
  metrics: ["itemRevenue"]
}
```

---

## 3️⃣ SEO + Conteúdo Orgânico

### Páginas mais visitadas
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["pagePath"],
  metrics: ["screenPageViews", "sessions", "activeUsers"]
}
```

### Performance de tráfego orgânico
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: ["sessionMedium"],
  metrics: ["sessions", "activeUsers", "engagementRate"]
}
// Filtrar sessionMedium = "organic" no frontend
```

### Landing pages orgânicas
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["landingPage", "sessionSource"],
  metrics: ["sessions", "bounceRate", "averageSessionDuration"]
}
```

---

## 4️⃣ UX / Comportamento

### Engajamento por página
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: ["pagePath"],
  metrics: ["averageSessionDuration", "engagementRate", "bounceRate"]
}
```

### Eventos mais populares
```typescript
{
  dateRange: { startDate: "yesterday", endDate: "yesterday" },
  dimensions: ["eventName"],
  metrics: ["eventCount"]
}
```

### Scroll depth
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: ["pagePath", "percentScrolled"],
  metrics: ["eventCount"]
}
```

---

## 5️⃣ Jornada Multi-canal

### Comparação entre canais
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["sessionDefaultChannelGroup"],
  metrics: ["sessions", "activeUsers", "conversions", "totalRevenue"]
}
```

### Análise de primeira interação
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["firstUserSource", "firstUserMedium"],
  metrics: ["newUsers", "conversions"]
}
```

---

## 6️⃣ Retenção / LTV

### Usuários novos vs recorrentes
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["newVsReturning"],
  metrics: ["activeUsers", "sessions", "purchaseRevenue", "purchasers"]
}
```

### Receita média por usuário
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: [],
  metrics: ["averageRevenuePerUser", "totalRevenue", "activeUsers"]
}
```

### Compradores recorrentes
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["newVsReturning"],
  metrics: ["purchasers", "ecommercePurchases", "purchaseRevenue"]
}
```

---

## 7️⃣ Segmentações de Público

### Performance por tipo de usuário
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: ["newVsReturning"],
  metrics: ["sessions", "conversions", "totalRevenue"]
}
```

### Audiências personalizadas
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["audienceName"],
  metrics: ["activeUsers", "conversions", "totalRevenue"]
}
```

---

## 8️⃣ Busca Interna

### Termos mais buscados
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: ["searchTerm"],
  metrics: ["eventCount"]
}
```

---

## 9️⃣ Performance por Dispositivo/Região

### Dispositivo
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["deviceCategory"],
  metrics: ["sessions", "conversions", "totalRevenue", "bounceRate"]
}
```

### Navegador
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: ["browser"],
  metrics: ["sessions", "averageSessionDuration"]
}
```

### Cidades top
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["city"],
  metrics: ["sessions", "conversions", "totalRevenue"]
}
```

### Estados/Regiões
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["region"],
  metrics: ["activeUsers", "sessions", "purchaseRevenue"]
}
```

### Países
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: ["country"],
  metrics: ["sessions", "conversions"]
}
```

---

## 🔟 Erros e Gargalos do Funil

### Análise de funil de e-commerce
```typescript
{
  dateRange: { startDate: "7daysAgo", endDate: "today" },
  dimensions: ["eventName"],
  metrics: ["eventCount"]
}
// Filtrar eventos: view_item, add_to_cart, begin_checkout, purchase
```

### Taxa de abandono no checkout
```typescript
{
  dateRange: { startDate: "30daysAgo", endDate: "today" },
  dimensions: [],
  metrics: ["itemsCheckedOut", "ecommercePurchases"]
}
// Calcular taxa: (itemsCheckedOut - ecommercePurchases) / itemsCheckedOut
```

---

## 🚨 Combinações Incompatíveis (NÃO FAZER)

### ❌ Item + Atribuição
```typescript
// ERRADO!
{
  dimensions: ["itemName", "sessionSource"],
  metrics: ["itemRevenue"]
}
// Escopos incompatíveis: item-scoped + session-scoped
```

### ❌ Item + eventCount
```typescript
// ERRADO!
{
  dimensions: ["itemName"],
  metrics: ["eventCount"]
}
// Item-scoped dimension não funciona com event-scoped metric
```

### ❌ Attribution + eventCount
```typescript
// ERRADO!
{
  dimensions: ["sessionSource"],
  metrics: ["eventCount"]
}
// Attribution dimensions não funcionam com event-scoped metrics
```

---

## ✅ Alternativas Corretas

### Produtos por canal → Separe em 2 queries

**Query 1: Top produtos**
```typescript
{
  dimensions: ["itemName"],
  metrics: ["itemRevenue", "itemPurchaseQuantity"]
}
```

**Query 2: Receita por canal**
```typescript
{
  dimensions: ["sessionSource"],
  metrics: ["totalRevenue", "purchaseRevenue"]
}
```

### Eventos por canal → Use métricas compatíveis

**Em vez de:**
```typescript
// ❌ ERRADO
{
  dimensions: ["sessionSource"],
  metrics: ["eventCount"]
}
```

**Faça:**
```typescript
// ✅ CORRETO
{
  dimensions: ["sessionSource"],
  metrics: ["sessions", "conversions", "totalRevenue"]
}
```

---

## 📊 Interpretando Resultados

### Exemplo de resposta da API

```json
{
  "rows": [
    {
      "dimensionValues": [
        { "value": "google" },
        { "value": "organic" }
      ],
      "metricValues": [
        { "value": "1250" },
        { "value": "850" },
        { "value": "15000.50" }
      ]
    }
  ]
}
```

**Interpretação:**
- dimensions: ["sessionSource", "sessionMedium"]
- metrics: ["sessions", "activeUsers", "totalRevenue"]
- Resultado: Google Organic teve 1.250 sessões, 850 usuários ativos e R$ 15.000,50 de receita

---

## 🎯 Dicas Gerais

1. **Sempre valide compatibilidade** antes de combinar dimensions e metrics
2. **Use arrays vazios** `[]` quando quiser totais gerais sem segmentação
3. **Interprete datas corretamente**: "ontem" = "yesterday", "últimos 7 dias" = "7daysAgo" to "today"
4. **Evite misturar escopos**: item-scoped com session-scoped causa erro
5. **Consulte múltiplas métricas** quando fizer sentido (ex: sessions + conversions + revenue)
6. **Use date dimension** quando o usuário pedir evolução temporal
