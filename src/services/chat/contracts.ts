import { MyUIMessage } from "@/types";
import { UIMessage } from "@ai-sdk/react";

export interface InputUpdateChat {
  name?: string;
}
export interface InputSaveChat {
  chatId: string;
  messages: UIMessage[];
}

export interface OutputDataLoadChat {
  id: string;
  name: string;
  messages: MyUIMessage[];
}

export interface OutputGetChats {
  id: string;
  name: string;
}
