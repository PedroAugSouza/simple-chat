import { httpRequest } from "@/utils/http-request";

interface DateRange {
  startDate: string; // YYYY-MM-DD ou "yesterday", "today", "NdaysAgo"
  endDate: string; // YYYY-MM-DD ou "yesterday", "today", "NdaysAgo"
}

interface Props {
  refresh_token: string;
  property_id: string; // e.g. "123456789" or "properties/123456789"
  dateRange: DateRange;
  dimensions: string[];
  metrics: string[];
}

interface GaReportRequestBody {
  dateRanges: Array<{ startDate: string; endDate: string }>;
  dimensions: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
}

export interface GaReportResponse {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
}

interface GoogleOAuthTokenResponse {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

/**
 * Obtém um access_token temporário usando o refresh_token
 */
const getAccessToken = async (refreshToken: string): Promise<string> => {
  const body = JSON.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      `Falha ao obter token do Google Analytics: ${errorData.error_description || errorData.error || "Erro desconhecido"}`
    );
  }

  const data: GoogleOAuthTokenResponse = await res.json();

  if (!data.access_token) {
    throw new Error(
      "Google OAuth retornou sucesso mas não forneceu access_token. Verifique as credenciais."
    );
  }

  return data.access_token;
};

/**
 * Normaliza o property_id para o formato esperado pela API ("properties/123456789")
 */
const normalizePropertyId = (propertyId: string): string =>
  propertyId.startsWith("properties/")
    ? propertyId
    : `properties/${propertyId}`;

/**
 * Cliente para fazer requisições à API de dados do Google Analytics 4
 *
 * @see https://developers.google.com/analytics/devguides/reporting/data/v1
 */
export const gaClient = async (
  props: Props
): Promise<{ data: GaReportResponse; ok: boolean; error?: unknown }> => {
  try {
    const token = await getAccessToken(props.refresh_token);
    const propertyId = normalizePropertyId(props.property_id);

    const body: GaReportRequestBody = {
      dateRanges: [
        {
          startDate: props.dateRange.startDate,
          endDate: props.dateRange.endDate,
        },
      ],
      dimensions: props.dimensions.map((name) => ({ name })),
      metrics: props.metrics.map((name) => ({ name })),
    };

    const response = await httpRequest<GaReportResponse, { message?: string }>(
      `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body as unknown as Record<string, string>, // httpRequest espera Record<string, string> mas GA4 aceita objetos aninhados
      }
    );

    if (!response.ok) {
      const errorMessage =
        typeof response.error === "object" && response.error !== null
          ? JSON.stringify(response.error)
          : String(response.error ?? "Erro desconhecido na requisição ao GA4");

      return {
        data: { rows: [] },
        ok: false,
        error: new Error(
          `Erro na API do Google Analytics 4: ${errorMessage}`
        ),
      };
    }

    return {
      data: response.data ?? { rows: [] },
      ok: true,
    };
  } catch (error) {
    console.error("Erro no gaClient:", error);
    return {
      data: { rows: [] },
      ok: false,
      error:
        error instanceof Error
          ? error
          : new Error(String(error ?? "Erro desconhecido")),
    };
  }
};
