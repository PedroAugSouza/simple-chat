import { DefaultResponse } from "../types";
import {
  InputSaveChat,
  InputUpdateChat,
  OutputDataLoadChat,
} from "./contracts";

const baseURL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export const chatService = {
  update: async (
    id: string,
    data: InputUpdateChat
  ): Promise<{ success: boolean }> => {
    const request = await fetch(`/api/chat/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    const response = await request.json();

    return response;
  },

  getMany: async (
    userId: string
  ): Promise<DefaultResponse<OutputDataLoadChat[]>> => {
    const request = await fetch(`/api/chats/${userId}`, {
      method: "GET",
    });

    const response = await request.json();

    return response;
  },

  create: async (userId: string): Promise<string> => {
    const request = await fetch(`/api/chat`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    const data = await request.json();
    return data.data.id;
  },

  load: async (id: string): Promise<DefaultResponse<OutputDataLoadChat>> => {
    const request = await fetch(`${baseURL}/api/chat/${id}`, { method: "GET" });

    const data = await request.json();

    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const request = await fetch(`/api/chat/${id}`, {
      method: "DELETE",
    });

    const response = await request.json();

    return response;
  },
};
