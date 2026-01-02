import { Sidebar } from "@/components/commom/sidebar";
import { chatService } from "@/services/chat";
import { TokenPayload } from "@/utils/get-session";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen grid place-items-center">
      <section className="flex flex-row h-204">
        <Sidebar />
        {children}
      </section>
    </main>
  );
}
