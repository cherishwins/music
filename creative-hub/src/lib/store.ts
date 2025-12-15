import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  isPremium: boolean;
  credits: number;
}

interface AppState {
  // Loading states
  isLoading: boolean;
  loadingProgress: number;
  sceneReady: boolean;
  videoReady: boolean;

  // User state
  user: User | null;
  isAuthenticated: boolean;

  // UI state
  activeSection: string;
  showPaymentModal: boolean;
  selectedPlan: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setSceneReady: (ready: boolean) => void;
  setVideoReady: (ready: boolean) => void;
  setUser: (user: User | null) => void;
  setActiveSection: (section: string) => void;
  setShowPaymentModal: (show: boolean) => void;
  setSelectedPlan: (plan: string | null) => void;
  addCredits: (amount: number) => void;
  useCredits: (amount: number) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial loading states
      isLoading: true,
      loadingProgress: 0,
      sceneReady: false,
      videoReady: false,

      // Initial user state
      user: null,
      isAuthenticated: false,

      // Initial UI state
      activeSection: "hero",
      showPaymentModal: false,
      selectedPlan: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setLoadingProgress: (progress) => {
        set({ loadingProgress: progress });
        if (progress >= 100) {
          setTimeout(() => set({ isLoading: false }), 500);
        }
      },

      setSceneReady: (ready) => {
        set({ sceneReady: ready });
        const state = get();
        if (ready && state.videoReady) {
          set({ loadingProgress: 100 });
        }
      },

      setVideoReady: (ready) => {
        set({ videoReady: ready });
        const state = get();
        if (ready && state.sceneReady) {
          set({ loadingProgress: 100 });
        } else if (ready) {
          set({ loadingProgress: 50 });
        }
      },

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setActiveSection: (section) => set({ activeSection: section }),

      setShowPaymentModal: (show) => set({ showPaymentModal: show }),

      setSelectedPlan: (plan) => set({ selectedPlan: plan }),

      addCredits: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, credits: state.user.credits + amount }
            : null,
        })),

      useCredits: (amount) => {
        const state = get();
        if (!state.user || state.user.credits < amount) {
          return false;
        }
        set({
          user: { ...state.user, credits: state.user.credits - amount },
        });
        return true;
      },
    }),
    {
      name: "creative-hub-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Pricing plans
export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for exploring",
    priceStars: 50,
    priceTon: 0.5,
    credits: 100,
    features: [
      "100 AI generations",
      "Basic content tools",
      "Community access",
      "Email support",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    description: "For serious creators",
    priceStars: 200,
    priceTon: 2,
    credits: 500,
    features: [
      "500 AI generations",
      "Advanced tools & workflows",
      "Priority processing",
      "Social media automation",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    id: "studio",
    name: "Studio",
    description: "Unlimited creativity",
    priceStars: 500,
    priceTon: 5,
    credits: 2000,
    features: [
      "2000 AI generations",
      "All premium features",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "White-label options",
    ],
  },
];
