/**
 * React hooks for Telegram Mini App features
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  initTelegramApp,
  getTelegramUser,
  getThemeColors,
  isDarkMode,
  isTelegramEnvironment,
  hapticMedium,
  hapticSuccess,
  hapticError,
  showMainButton,
  hideMainButton,
  cloudSave,
  cloudLoad,
} from '@/lib/telegram-native';

/**
 * Hook to initialize Telegram and get user info
 */
export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getTelegramUser>>(null);
  const [theme, setTheme] = useState<ReturnType<typeof getThemeColors>>(null);

  useEffect(() => {
    const init = async () => {
      const inTelegram = isTelegramEnvironment();
      setIsTelegram(inTelegram);

      if (inTelegram) {
        await initTelegramApp();
        setUser(getTelegramUser());
        setTheme(getThemeColors());
      }

      setIsReady(true);
    };

    init();
  }, []);

  return {
    isReady,
    isTelegram,
    user,
    theme,
    isDarkMode: isDarkMode(),
  };
}

/**
 * Hook for haptic feedback
 */
export function useHaptics() {
  return {
    tap: useCallback(() => hapticMedium(), []),
    success: useCallback(() => hapticSuccess(), []),
    error: useCallback(() => hapticError(), []),
  };
}

/**
 * Hook for the main button
 */
export function useMainButton(text: string, onClick: () => void, deps: unknown[] = []) {
  useEffect(() => {
    if (!isTelegramEnvironment()) return;

    showMainButton({
      text,
      onClick,
    });

    return () => {
      hideMainButton();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, ...deps]);
}

/**
 * Hook for cloud storage
 */
export function useCloudStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = await cloudLoad(key);
      if (stored) {
        try {
          setValue(JSON.parse(stored) as T);
        } catch {
          setValue(stored as unknown as T);
        }
      }
      setIsLoading(false);
    };

    if (isTelegramEnvironment()) {
      load();
    } else {
      setIsLoading(false);
    }
  }, [key]);

  const save = useCallback(
    async (newValue: T) => {
      setValue(newValue);
      const stringValue = typeof newValue === 'string' ? newValue : JSON.stringify(newValue);
      await cloudSave(key, stringValue);
    },
    [key]
  );

  return { value, save, isLoading };
}
