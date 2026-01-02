import { baseURL } from "@/constants/url";
import { DefaultResponse } from "../types";
import { InputUpdateChat, OutputDataLoadChat } from "./contracts";

export const chatService = {
  update: async (
    id: string,
    data: InputUpdateChat
  ): Promise<{ success: boolean }> => {
    const request = await fetch(`/api/chat/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        Connection: "keep-alive",
      },
    });

    const response = await request.json();

    return response;
  },

  getMany: async (
    userId: string
  ): Promise<DefaultResponse<OutputDataLoadChat[]>> => {
    const request = await fetch(`${baseURL}/api/chats/${userId}`, {
      method: "GET",
      headers: {
        Connection: "keep-alive",
      },
      next: {
        tags: ["chat-list"],
      },
    });

    const response = await request.json();

    return response;
  },

  create: async (userId: string): Promise<string> => {
    const request = await fetch(`/api/chat`, {
      method: "POST",
      body: JSON.stringify({ userId }),
      headers: {
        Connection: "keep-alive",
      },
    });

    const data = await request.json();
    return data.data.id;
  },

  load: async (id: string): Promise<DefaultResponse<OutputDataLoadChat>> => {
    const request = await fetch(`${baseURL}/api/chat/${id}`, {
      method: "GET",
      headers: {
        Connection: "keep-alive",
      },
    });

    const data = await request.json();

    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const request = await fetch(`/api/chat/${id}`, {
      method: "DELETE",
      headers: {
        Connection: "keep-alive",
      },
    });

    const response = await request.json();

    return response;
  },
};
