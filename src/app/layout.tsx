import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SWRProvider } from "@/providers/swr.providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SimplAi",
  description:
    "Uma experiência de chat de IA sem ruídos. Personalidades distintas, integrações poderosas e um foco monocromático no que importa: seu conteúdo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary selection:text-primary-foreground`}
      >
        <SWRProvider>
          {children}
          <Toaster position="top-center" />
        </SWRProvider>
      </body>
    </html>
  );
}
