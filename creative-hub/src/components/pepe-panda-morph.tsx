"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface PepePandaMorphProps {
  className?: string;
}

export function PepePandaMorph({ className = "" }: PepePandaMorphProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Track scroll position
  const { scrollYProgress } = useScroll();

  // All transforms defined at top level (not in JSX!)
  const morphProgress = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const pepeOpacity = useTransform(morphProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const pandaOpacity = useTransform(morphProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const floatY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1.1, 1.1, 0.8]);
  const ring1Rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const ring2Rotate = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

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
      style={{ y: floatY, rotate, scale }}
      className={`fixed right-8 top-1/3 z-20 pointer-events-none ${className}`}
    >
      {/* Glow effect - Pepe green */}
      <motion.div
        className="absolute -inset-4 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(74, 222, 128, 0.2) 50%, transparent 70%)",
          opacity: pepeOpacity
        }}
      />
      {/* Glow effect - Panda white/cyan */}
      <motion.div
        className="absolute -inset-4 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(0, 229, 255, 0.3) 0%, rgba(224, 64, 251, 0.2) 50%, transparent 70%)",
          opacity: pandaOpacity
        }}
      />

      {/* Morphing container */}
      <div className="relative w-20 h-20 md:w-28 md:h-28">
        {/* Pepe layer - using actual image */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden border-2 border-green-500/50 shadow-lg shadow-green-500/30"
          style={{ opacity: pepeOpacity }}
        >
          <Image
            src="/assets/brand/meme-pepe-panda.jpg"
            alt="Pepe"
            fill
            className="object-cover"
          />
        </motion.div>

        {/* Panda layer - using actual image */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden border-2 border-neon-cyan/50 shadow-lg shadow-neon-cyan/30"
          style={{ opacity: pandaOpacity }}
        >
          <Image
            src="/assets/brand/panda-round.png"
            alt="Panda"
            fill
            className="object-cover"
          />
        </motion.div>

        {/* Orbital rings */}
        <motion.div
          className="absolute -inset-2 rounded-full border border-tiger/30"
          style={{ rotate: ring1Rotate }}
        />
        <motion.div
          className="absolute -inset-4 rounded-full border border-neon-cyan/20"
          style={{ rotate: ring2Rotate }}
        />
      </div>

      {/* Scroll hint label */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium"
        style={{ opacity: labelOpacity }}
      >
        <span className="text-green-400">scroll to morph ↓</span>
      </motion.div>
    </motion.div>
  );
}
