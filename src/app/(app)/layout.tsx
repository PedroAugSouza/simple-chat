import { Sidebar } from "@/components/commom/sidebar";

import { TokenPayload } from "@/utils/get-session";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen grid place-items-center bg-zinc-50">
      <section className="flex flex-row h-screen w-full">
        <Sidebar />
        {children}
      </section>
    </main>
  );
}
