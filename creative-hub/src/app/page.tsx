"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { LoadingScreen } from "@/components/loading-screen";
import { VideoHero } from "@/components/video/video-hero";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { ShowcaseSection } from "@/components/sections/showcase-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { PaymentModal } from "@/components/payments/telegram-payment";

// Dynamically import Three.js scene to reduce initial bundle
const CosmicScene = dynamic(
  () =>
    import("@/components/three/cosmic-scene").then((mod) => mod.CosmicScene),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function HomePage() {
  const {
    isLoading,
    loadingProgress,
    setSceneReady,
    setVideoReady,
    setLoadingProgress,
    showPaymentModal,
    setShowPaymentModal,
  } = useAppStore();

  const [showScene, setShowScene] = useState(false);
  const [videoOpacity, setVideoOpacity] = useState(1);

  // Simulate progressive loading
  useEffect(() => {
    const interval = setInterval(() => {
      useAppStore.setState((state) => {
        const newProgress = Math.min(state.loadingProgress + 5, 90);
        return { loadingProgress: newProgress };
      });
    }, 100);

    // Clear interval when video or scene reports ready
    return () => clearInterval(interval);
  }, []);

  // Handle video ready - start loading Three.js scene
  const handleVideoReady = () => {
    setVideoReady(true);
    setShowScene(true);
  };

  // Handle scene ready - fade out video, complete loading
  const handleSceneReady = () => {
    setSceneReady(true);
    setLoadingProgress(100);
    // Fade video as Three.js scene is ready
    setVideoOpacity(0.3);
  };

  return (
    <main className="relative min-h-screen bg-[#0a0a0f]">
      {/* Loading screen */}
      <LoadingScreen isLoading={isLoading} progress={loadingProgress} />

      {/* Video background layer - plays while Three.js loads */}
      <VideoHero
        // Add your Mux playback ID here for production
        // playbackId="your-mux-playback-id"
        fallbackSrc="/videos/cosmic-background.mp4"
        onVideoReady={handleVideoReady}
        opacity={videoOpacity}
      />

      {/* Three.js scene layer - fades in as it loads */}
      {showScene && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <CosmicScene onLoaded={handleSceneReady} />
        </motion.div>
      )}

      {/* Content layer */}
      <div className="content-layer">
        <HeroSection />
        <FeaturesSection />
        <ShowcaseSection />
        <PricingSection />

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div>
                <h3 className="text-xl font-display gradient-text mb-4">
                  Creative Hub
                </h3>
                <p className="text-white/60 text-sm">
                  Your multiverse creative platform. Transform ideas into
                  reality across infinite timelines.
                </p>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-semibold mb-4">Products</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      Thread to Hit
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      Slide Generator
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      Voice Studio
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      Video Creator
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      API Reference
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      Tutorials
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      Community
                    </a>
                  </li>
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      Telegram
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      X (Twitter)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      Discord
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold-400 transition-colors">
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/40 text-sm">
                &copy; 2024 Creative Hub. All rights reserved across all
                timelines.
              </p>
              <div className="flex items-center gap-6 text-white/40 text-sm">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Payment modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </main>
  );
}
