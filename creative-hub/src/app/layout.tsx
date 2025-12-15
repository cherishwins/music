import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Creative Hub | Quantum Asset Protection for Digital Creators",
  description:
    "Transform threads into hits, protect your assets across the multiverse. AI-powered creative tools with blockchain payments.",
  keywords: [
    "creative hub",
    "AI music",
    "digital assets",
    "TON",
    "Telegram",
    "content creation",
  ],
  authors: [{ name: "Creative Hub" }],
  openGraph: {
    title: "Creative Hub",
    description: "Your multiverse creative platform",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#0a0a0f] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
