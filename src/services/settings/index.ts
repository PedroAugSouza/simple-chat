import { baseURL } from "@/constants/url";
import { DefaultResponse } from "../types";
import { InputUpdateSetting, OutputGetSettings } from "./contracts";

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
