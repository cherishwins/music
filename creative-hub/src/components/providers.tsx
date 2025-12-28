"use client";

import { ReactNode, useEffect, useState } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

const manifestUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/tonconnect-manifest.json`
    : "";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initialize Telegram WebApp if available
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Apply Telegram theme
      document.documentElement.style.setProperty(
        "--tg-theme-bg-color",
        tg.themeParams.bg_color || "#0a0a0f"
      );
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}

// Extend Window interface for Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        sendData: (data: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
      };
    };
  }
}
