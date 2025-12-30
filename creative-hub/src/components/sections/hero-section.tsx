"use client";

import { motion } from "framer-motion";
import { Zap, Play, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-tiger/10 to-transparent" />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-obsidian to-transparent" />
        {/* Side glows */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-tiger/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-neon-cyan/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-tiger animate-pulse" />
          <span className="text-sm text-white/90 font-medium tracking-wide">
            AI-Powered Music for Token Launches
          </span>
        </motion.div>

        {/* Tiger Logo - Premium presentation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative w-48 h-48 md:w-56 md:h-56 mx-auto mb-10"
        >
          {/* Outer glow rings */}
          <div className="absolute -inset-4 bg-gradient-to-r from-tiger/30 via-neon-cyan/20 to-tiger/30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -inset-8 bg-gradient-to-r from-neon-cyan/10 via-tiger/10 to-neon-cyan/10 rounded-full blur-3xl" />
          {/* Logo */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 shadow-2xl">
            <Image
              src="/assets/brand/logo-primary.jpg"
              alt="White Tiger"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

        {/* Main headline - Clean and powerful */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-headline leading-none mb-6"
        >
          <span className="block text-white drop-shadow-[0_0_30px_rgba(224,64,251,0.3)]">
            WHITE TIGER
          </span>
        </motion.h1>

        {/* Tagline - Sleek */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl font-medium tracking-wide mb-6"
        >
          <span className="bg-gradient-to-r from-tiger via-neon-cyan to-tiger bg-clip-text text-transparent">
            Anthems for Your Launch
          </span>
        </motion.p>

        {/* Subheadline - Clear value prop */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg text-white/60 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Generate custom tracks, album art, and complete brand packages
          for your token. Ready in minutes.
        </motion.p>

        {/* CTA Buttons - Premium styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/create"
            className="group relative px-8 py-4 bg-gradient-to-r from-tiger to-neon-purple rounded-xl font-semibold text-white shadow-lg shadow-tiger/25 hover:shadow-tiger/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Start Creating
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <button className="group px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Hear Samples
            </span>
          </button>
        </motion.div>

        {/* Features strip - Clean icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-8 text-sm"
        >
          {[
            { icon: "🎵", text: "AI Music" },
            { icon: "🎨", text: "Album Art" },
            { icon: "✨", text: "Brand Kits" },
            { icon: "⚡", text: "Instant Delivery" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-white/50">
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Payment methods - Subtle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-12 flex items-center justify-center gap-1 text-white/30 text-xs"
        >
          <span>Pay with</span>
          <span className="text-tiger/70 ml-2">Telegram Stars</span>
          <span className="mx-2">•</span>
          <span className="text-neon-cyan/70">TON</span>
          <span className="mx-2">•</span>
          <span className="text-white/50">USDC</span>
        </motion.div>
      </div>

      {/* Scroll indicator - Minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
        >
          <div className="w-0.5 h-1.5 bg-white/40 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
