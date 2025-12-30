"use client";

import { motion } from "framer-motion";
import { Rocket, Zap, Volume2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating rockets */}
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-[10%] text-4xl"
        >
          🚀
        </motion.div>
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute top-40 right-[15%] text-3xl"
        >
          🚀
        </motion.div>
        <motion.div
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
          className="absolute bottom-40 left-[20%] text-2xl"
        >
          🌙
        </motion.div>
        <motion.div
          animate={{ y: [15, -15, 15], x: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-60 right-[10%] text-2xl"
        >
          💎
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-60 right-[25%] text-xl"
        >
          ⭐
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-neon mb-6"
        >
          <Sparkles className="w-4 h-4 text-tiger" />
          <span className="text-sm text-white/80">
            AI Music for Meme Coin Legends
          </span>
          <span className="text-sm">🔥</span>
        </motion.div>

        {/* Tiger Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-6"
        >
          <div className="absolute inset-0 bg-tiger/20 rounded-full blur-3xl animate-pulse" />
          <Image
            src="/assets/brand/logo-primary.jpg"
            alt="White Tiger"
            fill
            className="object-cover rounded-full border-4 border-tiger/50 shadow-tiger-glow"
            priority
          />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-headline leading-tight mb-4"
        >
          <span className="gradient-text-cyberpunk">WHITE TIGER</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-2xl md:text-3xl text-tiger font-headline tracking-wide mb-4"
        >
          Bangers for Your Launch 🎵
        </motion.p>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8"
        >
          Generate fire tracks, album art, and brand packages for your meme coin.
          <br />
          <span className="text-tiger-light">
            Pay with Telegram Stars, TON, or USDC. No cap.
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/create"
            className="btn-tiger flex items-center gap-2 text-lg group"
          >
            <Zap className="w-5 h-5 group-hover:animate-pulse" />
            Start Creating
            <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button className="btn-secondary flex items-center gap-2 text-lg">
            <Volume2 className="w-5 h-5" />
            Hear Samples
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: "🚀", label: "To The Moon", sublabel: "Always" },
            { value: "🎵", label: "AI Bangers", sublabel: "Unlimited" },
            { value: "⚡", label: "Instant", sublabel: "Generation" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl mb-1">{stat.value}</div>
              <div className="text-tiger text-sm font-semibold">{stat.label}</div>
              <div className="text-white/40 text-xs">{stat.sublabel}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Supported payments */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-10 flex items-center justify-center gap-6 text-white/40 text-sm"
        >
          <span>Pay with:</span>
          <span className="text-tiger">⭐ Stars</span>
          <span className="text-neon-cyan">💎 TON</span>
          <span className="text-neon-pink">💵 USDC</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-tiger/30 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 bg-tiger rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
