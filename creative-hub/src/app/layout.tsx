import type { Metadata, Viewport } from "next";
import { Inter, Cinzel_Decorative, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-headline",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ALCHEMY | Transmute Noise into Gold",
  description:
    "The ancient science of transformation applied to modern audio production. Turn community chaos into polished hits with AI-powered music creation.",
  keywords: [
    "alchemy",
    "AI music",
    "audio production",
    "thread to hit",
    "music generation",
    "vocal synthesis",
    "TON",
    "Telegram",
  ],
  authors: [{ name: "ALCHEMY" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "ALCHEMY",
    description: "Transmute Noise into Gold.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable} ${jetbrains.variable}`}
    >
      <body className="bg-obsidian text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
