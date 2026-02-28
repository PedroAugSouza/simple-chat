import type { Metadata } from "next";
import { Source_Serif_4, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SWRProvider } from "@/providers/swr.providers";

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OrbMind",
  description:
    "Seu espaço de estudo com IA. Centralize materiais, estude com inteligência e domine seu acervo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${sourceSerif.variable} ${sourceSerif.className} ${geistMono.variable} antialiased selection:bg-primary selection:text-primary-foreground `}
      >
        <SWRProvider>
          {children}
          <Toaster position="top-center" />
        </SWRProvider>
      </body>
    </html>
  );
}
