"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  isLoading: boolean;
  progress?: number;
}

export function LoadingScreen({ isLoading, progress = 0 }: LoadingScreenProps) {
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!showContent) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Animated logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-8"
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Logo icon */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="absolute inset-2 rounded-full bg-[#0a0a0f]" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cosmic-600 to-cosmic-800" />
              </motion.div>

              {/* Orbiting dot */}
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-gold-400"
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  transformOrigin: "50% 50%",
                  left: "50%",
                  top: "0",
                  marginLeft: "-4px",
                }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl md:text-4xl font-display gradient-text mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Creative Hub
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-white/60 text-sm mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Entering the Multiverse...
          </motion.p>

          {/* Progress bar */}
          <motion.div
            className="w-64 h-1 bg-white/10 rounded-full overflow-hidden"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Progress text */}
          <motion.span
            className="mt-3 text-gold-400/80 text-xs font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {progress.toFixed(0)}%
          </motion.span>

          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: "-10px",
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
