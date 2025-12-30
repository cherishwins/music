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
  title: "White Tiger | AI Music for Meme Coins",
  description:
    "Create bangers for your meme coin launch. AI-powered music, album art, and brand packages. Built for degens.",
  keywords: [
    "white tiger",
    "AI music",
    "meme coin",
    "crypto music",
    "music generation",
    "brand package",
    "TON",
    "Telegram",
  ],
  authors: [{ name: "White Tiger" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/assets/brand/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/brand/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/assets/brand/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "White Tiger",
    description: "AI Music for Meme Coins. Create bangers for your launch.",
    type: "website",
    images: ["/assets/brand/social/og-image-1200x630.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "White Tiger",
    description: "AI Music for Meme Coins",
    images: ["/assets/brand/social/og-image-1200x630.jpg"],
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
