import { GaReportResponse } from "@/types";

interface GaDimensionHeader {
  name?: string;
}

interface GaMetricHeader {
  name?: string;
  type?: string;
}

export interface GaRunReportResponse extends GaReportResponse {
  dimensionHeaders?: GaDimensionHeader[];
  metricHeaders?: GaMetricHeader[];
}

export function formatGaReport(
  response: GaRunReportResponse,
): Record<string, string | Record<string, string>> {
  const { rows, dimensionHeaders, metricHeaders } = response;

  if (!rows || rows.length === 0) {
    return {};
  }

  const dimensionCount = dimensionHeaders?.length ?? 0;
  const metricCount = metricHeaders?.length ?? 0;

  if (metricCount === 0) {
    return {};
  }

  const dimensionsSeparator = " ; ";
  const hasDimensions = dimensionCount > 0;
  const hasMultipleDimensions = dimensionCount > 1;
  const hasSingleMetric = metricCount === 1;

  if (!hasDimensions) {
    const metricsOnlyReport: Record<string, string> = {};

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const rowMetricValues = row.metricValues;

      if (!rowMetricValues || rowMetricValues.length === 0) {
        continue;
      }

      const metricLoopCount = Math.min(metricCount, rowMetricValues.length);

      for (let metricIndex = 0; metricIndex < metricLoopCount; metricIndex++) {
        const metricHeader = metricHeaders?.[metricIndex];
        const metricName = metricHeader?.name;
        const metricValue = rowMetricValues[metricIndex]?.value;

        if (!metricName || metricValue == null) {
          continue;
        }

        metricsOnlyReport[metricName] = metricValue;
      }
    }

    return metricsOnlyReport;
  }

  const formattedReport: Record<string, string | Record<string, string>> = {};

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const rowDimensionValues = row.dimensionValues ?? [];
    const rowMetricValues = row.metricValues;

    if (!rowMetricValues || rowMetricValues.length === 0) {
      continue;
    }

    let dimensionKey: string;

    if (!hasMultipleDimensions) {
      const singleDimensionValue = rowDimensionValues[0]?.value;
      if (!singleDimensionValue) {
        continue;
      }
      dimensionKey = singleDimensionValue;
    } else {
      const dimensionKeyParts: string[] = [];

      for (
        let dimensionIndex = 0;
        dimensionIndex < rowDimensionValues.length;
        dimensionIndex++
      ) {
        const dimensionValue = rowDimensionValues[dimensionIndex]?.value ?? "";
        dimensionKeyParts.push(dimensionValue);
      }

      dimensionKey = dimensionKeyParts.join(dimensionsSeparator);

      if (!dimensionKey) {
        continue;
      }
    }

    if (hasSingleMetric) {
      const metricValue = rowMetricValues[0]?.value;
      if (metricValue == null) {
        continue;
      }

      formattedReport[dimensionKey] = metricValue;
      continue;
    }

    const metricsByName: Record<string, string> = {};
    const metricLoopCount = Math.min(metricCount, rowMetricValues.length);

    for (let metricIndex = 0; metricIndex < metricLoopCount; metricIndex++) {
      const metricHeader = metricHeaders?.[metricIndex];
      const metricName = metricHeader?.name;
      const metricValue = rowMetricValues[metricIndex]?.value;

      if (!metricName || metricValue == null) {
        continue;
      }

      metricsByName[metricName] = metricValue;
    }

    if (Object.keys(metricsByName).length === 0) {
      continue;
    }

    formattedReport[dimensionKey] = metricsByName;
  }

  return formattedReport;
}
