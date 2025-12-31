import { DefaultResponse } from "../types";
import { InputUpdateSetting, OutputGetSettings } from "./contracts";

const baseURL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export const settingsService = {
  get: async (userId: string): Promise<DefaultResponse<OutputGetSettings>> => {
    const request = await fetch(`${baseURL}/api/settings/${userId}`, {
      method: "GET",
    });

    const data = await request.json();

    return data;
  },
  update: async (
    userId: string,
    data: InputUpdateSetting
  ): Promise<{ success: boolean }> => {
    const request = await fetch(`${baseURL}/api/settings/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    const response = await request.json();

    return response;
  },
};
