/**
 * Telegram Mini App Native Features
 * Client-side SDK for haptics, fullscreen, cloud storage, etc.
 *
 * @see https://docs.telegram-mini-apps.com/
 */

import {
  init,
  hapticFeedback,
  mainButton,
  backButton,
  viewport,
  cloudStorage,
  qrScanner,
  themeParams,
  miniApp,
  initData,
} from '@telegram-apps/sdk';

// Track initialization state
let isInitialized = false;

/**
 * Initialize the Telegram Mini App SDK
 * Call this once when your app loads
 */
export async function initTelegramApp(): Promise<boolean> {
  if (isInitialized) return true;

  try {
    // Check if we're in a Telegram environment
    if (typeof window === 'undefined') return false;

    // Initialize the SDK
    init();

    // Expand the app to full height
    if (viewport.expand.isAvailable()) {
      viewport.expand();
    }

    // Request fullscreen for immersive experience
    if (viewport.requestFullscreen.isAvailable()) {
      await viewport.requestFullscreen();
    }

    isInitialized = true;
    console.log('[TMA] Telegram Mini App initialized');
    return true;
  } catch (error) {
    console.warn('[TMA] Not running in Telegram environment:', error);
    return false;
  }
}

// ============================================
// HAPTIC FEEDBACK
// ============================================

/**
 * Light impact - for small UI elements
 */
export function hapticLight() {
  if (hapticFeedback.impactOccurred.isAvailable()) {
    hapticFeedback.impactOccurred('light');
  }
}

/**
 * Medium impact - for buttons and selections
 */
export function hapticMedium() {
  if (hapticFeedback.impactOccurred.isAvailable()) {
    hapticFeedback.impactOccurred('medium');
  }
}

/**
 * Heavy impact - for important actions
 */
export function hapticHeavy() {
  if (hapticFeedback.impactOccurred.isAvailable()) {
    hapticFeedback.impactOccurred('heavy');
  }
}

/**
 * Success notification - task completed
 */
export function hapticSuccess() {
  if (hapticFeedback.notificationOccurred.isAvailable()) {
    hapticFeedback.notificationOccurred('success');
  }
}

/**
 * Error notification - something failed
 */
export function hapticError() {
  if (hapticFeedback.notificationOccurred.isAvailable()) {
    hapticFeedback.notificationOccurred('error');
  }
}

/**
 * Warning notification - attention needed
 */
export function hapticWarning() {
  if (hapticFeedback.notificationOccurred.isAvailable()) {
    hapticFeedback.notificationOccurred('warning');
  }
}

/**
 * Selection changed - for scrolling/selecting
 */
export function hapticSelection() {
  if (hapticFeedback.selectionChanged.isAvailable()) {
    hapticFeedback.selectionChanged();
  }
}

// ============================================
// MAIN BUTTON (Bottom CTA)
// ============================================

export interface MainButtonConfig {
  text: string;
  color?: string;
  textColor?: string;
  onClick: () => void;
}

/**
 * Show the main button with custom text and action
 */
export function showMainButton(config: MainButtonConfig) {
  try {
    if (!mainButton.setParams.isAvailable()) return;

    mainButton.setParams({
      text: config.text,
      backgroundColor: (config.color || '#8B5CF6') as `#${string}`, // Purple default
      textColor: (config.textColor || '#FFFFFF') as `#${string}`,
      isVisible: true,
    });

    if (mainButton.onClick.isAvailable()) {
      mainButton.onClick(() => {
        hapticMedium();
        config.onClick();
      });
    }
  } catch (e) {
    console.warn('[TMA] Main button not available:', e);
  }
}

/**
 * Hide the main button
 */
export function hideMainButton() {
  try {
    if (mainButton.setParams.isAvailable()) {
      mainButton.setParams({ isVisible: false });
    }
  } catch (e) {
    console.warn('[TMA] Hide main button failed:', e);
  }
}

/**
 * Show loading state on main button
 */
export function setMainButtonLoading(loading: boolean) {
  try {
    if (mainButton.setParams.isAvailable()) {
      mainButton.setParams({ isLoaderVisible: loading });
    }
  } catch (e) {
    console.warn('[TMA] Set loading failed:', e);
  }
}

// ============================================
// BACK BUTTON
// ============================================

/**
 * Show back button with custom handler
 */
export function showBackButton(onClick: () => void) {
  try {
    // SDK v3 API - wrap in try-catch for compatibility
    const bb = backButton as unknown as {
      show?: () => void;
      onClick?: { isAvailable: () => boolean } & ((fn: () => void) => void);
    };
    if (typeof bb.show === 'function') {
      bb.show();
    }
    if (bb.onClick?.isAvailable?.()) {
      bb.onClick(() => {
        hapticLight();
        onClick();
      });
    }
  } catch (e) {
    console.warn('[TMA] Back button not available:', e);
  }
}

/**
 * Hide back button
 */
export function hideBackButton() {
  try {
    const bb = backButton as unknown as { hide?: () => void };
    if (typeof bb.hide === 'function') {
      bb.hide();
    }
  } catch (e) {
    console.warn('[TMA] Hide back button failed:', e);
  }
}

// ============================================
// CLOUD STORAGE
// ============================================

/**
 * Save data to Telegram cloud storage
 */
export async function cloudSave(key: string, value: string): Promise<boolean> {
  if (!cloudStorage.setItem.isAvailable()) return false;

  try {
    await cloudStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('[TMA] Cloud save failed:', error);
    return false;
  }
}

/**
 * Load data from Telegram cloud storage
 */
export async function cloudLoad(key: string): Promise<string | null> {
  if (!cloudStorage.getItem.isAvailable()) return null;

  try {
    return await cloudStorage.getItem(key);
  } catch (error) {
    console.error('[TMA] Cloud load failed:', error);
    return null;
  }
}

/**
 * Delete data from Telegram cloud storage
 */
export async function cloudDelete(key: string): Promise<boolean> {
  if (!cloudStorage.deleteItem.isAvailable()) return false;

  try {
    await cloudStorage.deleteItem(key);
    return true;
  } catch (error) {
    console.error('[TMA] Cloud delete failed:', error);
    return false;
  }
}

// ============================================
// QR SCANNER
// ============================================

/**
 * Open QR scanner and return scanned content
 */
export async function scanQR(promptText?: string): Promise<string | null> {
  if (!qrScanner.open.isAvailable()) return null;

  try {
    hapticMedium();
    const result = await qrScanner.open({ text: promptText || 'Scan QR code' });
    hapticSuccess();
    return result ?? null;
  } catch (error) {
    console.error('[TMA] QR scan failed:', error);
    return null;
  }
}

// ============================================
// VIEWPORT
// ============================================

/**
 * Enter fullscreen mode
 */
export async function enterFullscreen(): Promise<boolean> {
  if (!viewport.requestFullscreen.isAvailable()) return false;

  try {
    await viewport.requestFullscreen();
    return true;
  } catch {
    return false;
  }
}

/**
 * Exit fullscreen mode
 */
export async function exitFullscreen(): Promise<boolean> {
  if (!viewport.exitFullscreen.isAvailable()) return false;

  try {
    await viewport.exitFullscreen();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if currently fullscreen
 */
export function isFullscreen(): boolean {
  return viewport.isFullscreen?.() || false;
}

// ============================================
// THEME
// ============================================

/**
 * Get current Telegram theme colors
 */
export function getThemeColors() {
  if (!themeParams.backgroundColor) return null;

  return {
    bg: themeParams.backgroundColor(),
    text: themeParams.textColor(),
    hint: themeParams.hintColor(),
    link: themeParams.linkColor(),
    button: themeParams.buttonColor(),
    buttonText: themeParams.buttonTextColor(),
    secondaryBg: themeParams.secondaryBackgroundColor(),
  };
}

/**
 * Check if dark mode
 */
export function isDarkMode(): boolean {
  return miniApp.isDark?.() || false;
}

// ============================================
// USER DATA
// ============================================

/**
 * Get current user info from Telegram
 */
export function getTelegramUser() {
  const user = initData.user?.();
  if (!user) return null;

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    languageCode: user.language_code,
    isPremium: user.is_premium,
    photoUrl: user.photo_url,
  };
}

/**
 * Get the start parameter (deep link data)
 */
export function getStartParam(): string | null {
  return initData.startParam?.() || null;
}

// ============================================
// MINI APP ACTIONS
// ============================================

/**
 * Close the Mini App
 */
export function closeApp() {
  if (miniApp.close.isAvailable()) {
    miniApp.close();
  }
}

/**
 * Share content to Telegram
 */
export function share(url: string, text?: string) {
  if (typeof window === 'undefined') return;

  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}${text ? `&text=${encodeURIComponent(text)}` : ''}`;
  window.open(shareUrl, '_blank');
}

// ============================================
// UTILITY HOOKS (for React)
// ============================================

/**
 * Check if running inside Telegram
 */
export function isTelegramEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as unknown as { Telegram?: unknown }).Telegram;
}
