import { Chat } from "@/modules/chat";
import { chatService } from "@/services/chat";

export default async function ChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const { data: chat } = await chatService.load(id);

  return <Chat id={id} name={chat.name} initialMessages={chat.messages} />;
}
