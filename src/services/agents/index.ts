import { InputGenerateChatTitle } from "./contracts";

export const agentsService = {
  generateTitle: async ({
    message,
  }: InputGenerateChatTitle): Promise<string> => {
    const request = await fetch("/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });

    const response = await request.json();

    return response.text;
  },
};
