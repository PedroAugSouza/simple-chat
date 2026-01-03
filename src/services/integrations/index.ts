import { baseURL } from "@/constants/url";
import { DefaultResponse } from "../types";
import { InputUpdateIntegration, OutputGetPlatforms } from "./contract";

export const integrationService = {
  getPlatforms: async (
    userId: string
  ): Promise<DefaultResponse<OutputGetPlatforms[]>> => {
    const requst = await fetch(`${baseURL}/api/integrations/${userId}`, {
      headers: {
        Connection: "keep-alive",
      },
    });
    return await requst.json();
  },

  update: async (
    integrationId: string,
    body: InputUpdateIntegration
  ): Promise<{ success: boolean }> => {
    const requst = await fetch(`${baseURL}/api/platforms/${integrationId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        Connection: "keep-alive",
      },
    });
    return await requst.json();
  },
};
