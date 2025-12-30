"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface PepePandaMorphProps {
  className?: string;
}

export function PepePandaMorph({ className = "" }: PepePandaMorphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Track scroll position
  const { scrollYProgress } = useScroll();

  // Transform scroll to morph progress (0 = Pepe, 1 = Panda)
  const morphProgress = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const pepeOpacity = useTransform(morphProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const pandaOpacity = useTransform(morphProgress, [0, 0.5, 1], [0, 0.5, 1]);

  // Float animation
  const floatY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1.1, 1.1, 0.8]);

  // Hide after scrolling past 70%
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      setIsVisible(value < 0.7);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  if (!isVisible) return null;

  return (
    <motion.div
      ref={containerRef}
      style={{ y: floatY, rotate, scale }}
      className={`fixed right-8 top-1/3 z-20 pointer-events-none ${className}`}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-4 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(224, 64, 251, 0.3) 0%, rgba(0, 229, 255, 0.2) 50%, transparent 70%)",
          opacity: pepeOpacity
        }}
      />
      <motion.div
        className="absolute -inset-4 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(0, 229, 255, 0.3) 0%, rgba(224, 64, 251, 0.2) 50%, transparent 70%)",
          opacity: pandaOpacity
        }}
      />

      {/* Morphing asteroid container */}
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        {/* Pepe layer */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden border-2 border-tiger/50"
          style={{ opacity: pepeOpacity }}
        >
          <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-5xl md:text-6xl">
            🐸
          </div>
        </motion.div>

        {/* Panda layer */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden border-2 border-neon-cyan/50"
          style={{ opacity: pandaOpacity }}
        >
          <div className="w-full h-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center text-5xl md:text-6xl">
            🐼
          </div>
        </motion.div>

        {/* Morphing ring effect */}
        <motion.div
          className="absolute -inset-2 rounded-full border border-tiger/30"
          style={{
            rotate: useTransform(scrollYProgress, [0, 1], [0, 180]),
          }}
        />
        <motion.div
          className="absolute -inset-4 rounded-full border border-neon-cyan/20"
          style={{
            rotate: useTransform(scrollYProgress, [0, 1], [0, -180]),
          }}
        />
      </div>

      {/* Label that changes */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
      >
        <span className="text-green-400">scroll to morph</span>
      </motion.div>
    </motion.div>
  );
}
