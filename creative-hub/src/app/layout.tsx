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
  title: "JPanda Ecosystem | Degen Music Studio & Rug Score",
  description:
    "The complete degen toolkit. Create AI music, check token safety, build brands, and launch to the moon. White Tiger Studio, Rug Pull Insurance, Brand Forge, and more.",
  keywords: [
    "jpanda",
    "white tiger",
    "AI music",
    "meme coin",
    "crypto music",
    "rug pull",
    "token safety",
    "brand package",
    "TON",
    "Telegram",
    "degen",
  ],
  authors: [{ name: "JPanda" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/assets/brand/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/brand/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/assets/brand/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "JPanda Ecosystem",
    description: "The complete degen toolkit. AI Music Studio, Rug Score, Brand Forge, and more.",
    type: "website",
    images: ["/assets/brand/social/og-image-1200x630.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "JPanda Ecosystem",
    description: "The complete degen toolkit. AI Music, Rug Score, Brand Forge.",
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
