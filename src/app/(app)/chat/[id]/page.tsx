import { Chat } from "@/modules/chat";
import { getChat } from "../actions";
import { notFound } from "next/navigation";

export default async function ChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const result = await getChat(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const chat = result.data;

  return (
    <Chat
      id={chat.id}
      name={chat.name || "New Chat"}
      initialMessages={chat.messages}
    />
  );
}
