import { UIMessage } from "ai";
import z from "zod";

export const messageMetadataSchema = z.object({
  createdAt: z.date().optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type MyUIMessage = UIMessage<MessageMetadata>;
