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
import { PepePandaMorph } from "@/components/pepe-panda-morph";

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

      {/* Pepe→Panda morphing asteroid */}
      <PepePandaMorph />

      {/* Content layer */}
      <div className="content-layer">
        <HeroSection />
        <FeaturesSection />
        <ShowcaseSection />
        <PricingSection />

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-tiger/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div>
                <h3 className="text-xl font-headline gradient-text-cyberpunk mb-4">
                  WHITE TIGER 🐯
                </h3>
                <p className="text-white/60 text-sm">
                  AI-powered music and branding for meme coin creators.
                  Make noise. Go viral. Moon. 🚀
                </p>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-semibold mb-4 text-tiger-light">Create</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li>
                    <a href="/create" className="hover:text-tiger transition-colors">
                      🎵 Anthem Generator
                    </a>
                  </li>
                  <li>
                    <a href="/create" className="hover:text-tiger transition-colors">
                      🎨 Album Art
                    </a>
                  </li>
                  <li>
                    <a href="/create" className="hover:text-tiger transition-colors">
                      ✨ Brand Forge
                    </a>
                  </li>
                  <li>
                    <a href="/create" className="hover:text-tiger transition-colors">
                      🚀 Launch Pack
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold mb-4 text-tiger-light">Info</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li>
                    <a href="#" className="hover:text-tiger transition-colors">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-tiger transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-tiger transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h4 className="font-semibold mb-4 text-tiger-light">Connect</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li>
                    <a href="https://t.me/MSUCOBot" className="hover:text-tiger transition-colors">
                      📱 Telegram Bot
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-tiger transition-colors">
                      🐦 X (Twitter)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-tiger transition-colors">
                      💬 Discord
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-8 border-t border-tiger/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/40 text-sm">
                &copy; 2025 White Tiger. Built for degens. 🔥
              </p>
              <div className="flex items-center gap-6 text-white/40 text-sm">
                <a href="#" className="hover:text-tiger transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-tiger transition-colors">
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
