import { httpRequest } from "@/utils/http-request";

interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
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

interface Report {
  metricValues: { value: string }[];
  dimensionValues: { value: string }[];
}

const getToken = async (refreshToken: string): Promise<string> => {
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
  getToken;

  const token = (await res.json()).access_token as string | undefined;
  if (!token) {
    throw new Error("GA token exchange failed");
  }

  return token;
};

const normalizePropertyId = (propertyId: string) =>
  propertyId.startsWith("properties/")
    ? propertyId
    : `properties/${propertyId}`;

export const gaClient = async (props: Props) => {
  const token = await getToken(props.refresh_token);
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

  try {
    const response = await httpRequest<GaReportResponse, { message?: string }>(
      `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: body as unknown as Record<string, string>,
      }
    );

    if (!response.ok) {
      const message =
        typeof response.error === "object" && response.error !== null
          ? JSON.stringify(response.error)
          : String(response.error ?? "GA request failed");
      throw new Error(message);
    }

    return response;
  } catch (error) {
    throw error;
  }
};
