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

  // Fast loading - skip waiting for video/scene
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingProgress(100);
    }, 1500); // Complete after 1.5s regardless of video/scene

    return () => clearTimeout(timer);
  }, [setLoadingProgress]);

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
    <main className="relative min-h-screen bg-obsidian">
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
        <footer className="py-12 px-6 border-t border-gold/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div>
                <h3 className="text-xl font-headline gradient-text-gold mb-4">
                  ALCHEMY
                </h3>
                <p className="text-white/60 text-sm">
                  Transmute Noise into Gold.
                  AI-powered audio production applying ancient transformation principles.
                </p>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-semibold mb-4 text-gold-light">Laboratory</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li>
                    <a href="/create" className="hover:text-gold transition-colors">
                      Thread to Hit
                    </a>
                  </li>
                  <li>
                    <a href="/create" className="hover:text-gold transition-colors">
                      Voice Crucible
                    </a>
                  </li>
                  <li>
                    <a href="/create" className="hover:text-gold transition-colors">
                      Forge Chamber
                    </a>
                  </li>
                  <li>
                    <a href="/create" className="hover:text-gold transition-colors">
                      Arcane Slides
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold mb-4 text-gold-light">Knowledge</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li>
                    <a href="#" className="hover:text-gold transition-colors">
                      The Process
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold transition-colors">
                      Transmutations
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h4 className="font-semibold mb-4 text-gold-light">Guild</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li>
                    <a href="#" className="hover:text-gold transition-colors">
                      Telegram
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold transition-colors">
                      X (Twitter)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold transition-colors">
                      Discord
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gold transition-colors">
                      YouTube
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-8 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/40 text-sm">
                &copy; 2024 ALCHEMY. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-white/40 text-sm">
                <a href="#" className="hover:text-gold transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-gold transition-colors">
                  Terms
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
