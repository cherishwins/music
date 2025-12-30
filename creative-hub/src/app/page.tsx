"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { MainNav } from "@/components/navigation/main-nav";
import {
  Zap,
  Music,
  Shield,
  Palette,
  Rocket,
  ArrowRight,
  ArrowUpRight,
  Users,
  Disc3,
  Sparkles,
  Eye,
  Lock,
  Volume2,
} from "lucide-react";

// Ecosystem pillars data
const pillars = [
  {
    id: "studio",
    icon: Music,
    title: "WHITE TIGER",
    subtitle: "STUDIO",
    tagline: "Degen Music Factory",
    description: "AI-powered anthems. Album art. Promo videos. Your token's signature sound.",
    href: "/studio",
    gradient: "from-[#E040FB] via-[#9C27B0] to-[#7C4DFF]",
    accent: "#E040FB",
    price: "$0.50",
    stat: "500+ tracks",
  },
  {
    id: "rug",
    icon: Shield,
    title: "RUG PULL",
    subtitle: "INSURANCE",
    tagline: "Safety First, Ape Second",
    description: "Minter credit scoring. Whale behavioral analytics. Know before you throw.",
    href: "/rug-score",
    gradient: "from-[#4ADE80] via-[#22D3EE] to-[#00E5FF]",
    accent: "#4ADE80",
    badge: "FREE",
    stat: "10K+ scans",
  },
  {
    id: "brand",
    icon: Palette,
    title: "BRAND",
    subtitle: "FORGE",
    tagline: "Identity in Minutes",
    description: "Complete brand packages. Logos, colors, typography. Look legit from day one.",
    href: "/brand",
    gradient: "from-[#F472B6] via-[#E040FB] to-[#9C27B0]",
    accent: "#F472B6",
    price: "$0.25",
    stat: "200+ brands",
  },
  {
    id: "launch",
    icon: Rocket,
    title: "LAUNCH",
    subtitle: "PAD",
    tagline: "Full Send Protocol",
    description: "Everything bundled. Music, art, brand, socials. One click to moon mission.",
    href: "/drops",
    gradient: "from-[#00E5FF] via-[#2979FF] to-[#7C4DFF]",
    accent: "#00E5FF",
    price: "Bundle",
    stat: "50+ launches",
  },
];

const voiceStyles = [
  { name: "Hard Trap", emoji: "🔥" },
  { name: "Smooth R&B", emoji: "🎤" },
  { name: "Hype Anthem", emoji: "🚀" },
  { name: "Chill Lofi", emoji: "☁️" },
  { name: "Drill UK", emoji: "🇬🇧" },
  { name: "Phonk", emoji: "👻" },
  { name: "Pop Hook", emoji: "✨" },
  { name: "Degen Rap", emoji: "🐸" },
];

// Glitch text component
function GlitchText({ children, className = "" }: { children: string; className?: string }) {
  const [isGlitching, setIsGlitching] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsGlitching(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsGlitching(true)}
      onMouseLeave={() => setTimeout(() => setIsGlitching(false), 500)}
    >
      <span className="relative z-10">{children}</span>
      {isGlitching && (
        <>
          <span
            className="absolute inset-0 text-[#00E5FF] animate-glitch-1 opacity-80"
            style={{ clipPath: "inset(40% 0 40% 0)" }}
          >
            {children}
          </span>
          <span
            className="absolute inset-0 text-[#E040FB] animate-glitch-2 opacity-80"
            style={{ clipPath: "inset(60% 0 10% 0)" }}
          >
            {children}
          </span>
        </>
      )}
    </span>
  );
}

// Animated counter
function Counter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericValue = parseInt(value.replace(/\D/g, ""));

  return (
    <span ref={ref} className="tabular-nums">
      {isInView ? value : "0"}{suffix}
    </span>
  );
}

// Pillar card with 3D perspective
function PillarCard({ pillar, index }: { pillar: typeof pillars[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
      style={{ perspective: "1000px" }}
    >
      <Link href={pillar.href}>
        <motion.div
          animate={{
            rotateY: isHovered ? 5 : 0,
            rotateX: isHovered ? -5 : 0,
            scale: isHovered ? 1.02 : 1,
            z: isHovered ? 50 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Gradient border glow on hover */}
          <motion.div
            className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${pillar.gradient} opacity-0 blur-sm`}
            animate={{ opacity: isHovered ? 0.6 : 0 }}
          />

          {/* Card content */}
          <div className="relative p-8 md:p-10">
            {/* Top row - Icon and badge */}
            <div className="flex items-start justify-between mb-8">
              <motion.div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center shadow-lg`}
                animate={{
                  rotate: isHovered ? [0, -10, 10, 0] : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.5 }}
                style={{
                  boxShadow: isHovered ? `0 0 40px ${pillar.accent}50` : "none"
                }}
              >
                <pillar.icon className="w-8 h-8 text-white" />
              </motion.div>

              {pillar.badge ? (
                <span className="px-3 py-1.5 text-xs font-bold bg-[#4ADE80]/20 text-[#4ADE80] rounded-full border border-[#4ADE80]/30 uppercase tracking-wider">
                  {pillar.badge}
                </span>
              ) : pillar.price && (
                <span className="px-3 py-1.5 text-xs font-mono bg-white/5 text-white/60 rounded-full border border-white/10">
                  {pillar.price}
                </span>
              )}
            </div>

            {/* Title - oversized stacked */}
            <div className="mb-4">
              <h3 className="font-headline text-3xl md:text-4xl leading-none text-white mb-1">
                {pillar.title}
              </h3>
              <h4
                className="font-headline text-3xl md:text-4xl leading-none"
                style={{ color: pillar.accent }}
              >
                {pillar.subtitle}
              </h4>
            </div>

            {/* Tagline */}
            <p className="text-sm font-medium text-white/40 uppercase tracking-widest mb-4">
              {pillar.tagline}
            </p>

            {/* Description */}
            <p className="text-white/60 leading-relaxed mb-6">
              {pillar.description}
            </p>

            {/* Bottom row - Stats and arrow */}
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <span className="text-sm text-white/40">{pillar.stat}</span>
              <motion.div
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: pillar.accent }}
                animate={{ x: isHovered ? 5 : 0 }}
              >
                Enter
                <ArrowUpRight className="w-4 h-4" />
              </motion.div>
            </div>
          </div>

          {/* Scan line effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.015]">
            <div className="absolute inset-0" style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)"
            }} />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Noise texture overlay
function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// Animated grid background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Perspective grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(224, 64, 251, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(224, 64, 251, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "top",
        }}
      />

      {/* Radial fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-transparent to-obsidian" />
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-transparent to-obsidian" />
    </div>
  );
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLElement>(null);

  // Parallax values
  const y1 = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Smooth spring for header
  const springY = useSpring(y1, { stiffness: 100, damping: 30 });

  return (
    <main className="relative min-h-screen bg-obsidian overflow-x-hidden">
      <NoiseOverlay />
      <MainNav />

      {/* ==================== HERO SECTION ==================== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background layers */}
        <div className="absolute inset-0">
          {/* Base image */}
          <Image
            src="/assets/brand/ecosystem/hero-ecosystem.png"
            alt=""
            fill
            className="object-cover object-center opacity-30"
            priority
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/40 to-obsidian" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-transparent to-obsidian/80" />

          {/* Animated orbs */}
          <motion.div
            animate={{
              x: [0, 150, 0],
              y: [0, -100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#E040FB]/20 rounded-full blur-[200px]"
          />
          <motion.div
            animate={{
              x: [0, -120, 0],
              y: [0, 80, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00E5FF]/15 rounded-full blur-[180px]"
          />

          {/* Scan lines */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)"
            }}
          />
        </div>

        {/* Hero content */}
        <motion.div
          style={{ y: springY, opacity, scale }}
          className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column - Text */}
            <div className="text-left">
              {/* Status badge */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 mb-8"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4ADE80]" />
                </span>
                <span className="text-sm text-white/60 font-medium tracking-wide uppercase">
                  Ecosystem Active
                </span>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-headline leading-[0.85] mb-8"
              >
                <GlitchText className="block text-white mb-2">JPANDA&apos;S</GlitchText>
                <span className="block gradient-text-cyberpunk">ECOSYSTEM</span>
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-white/50 max-w-xl mb-10 leading-relaxed"
              >
                Create music. Check rugs. Build brands. Launch tokens.
                <span className="block text-[#E040FB] font-medium mt-2">
                  The complete degen toolkit.
                </span>
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/create"
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#E040FB] to-[#7C4DFF] rounded-xl font-semibold text-white overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(224,64,251,0.4)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Start Creating
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#7C4DFF] to-[#E040FB]"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>

                <Link
                  href="/rug-score"
                  className="group px-8 py-4 rounded-xl font-semibold text-white border border-[#4ADE80]/30 bg-[#4ADE80]/5 hover:bg-[#4ADE80]/10 hover:border-[#4ADE80]/50 transition-all flex items-center gap-2"
                >
                  <Shield className="w-5 h-5 text-[#4ADE80]" />
                  Check Rug Score
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#4ADE80]/20 text-[#4ADE80] rounded uppercase">
                    Free
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* Right column - Logo & orbital display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 1, type: "spring" }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative w-80 h-80">
                {/* Orbital rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-[#E040FB]/20"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-8 rounded-full border border-[#00E5FF]/10"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-16 rounded-full border border-white/5"
                />

                {/* Orbital dots */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#E040FB] shadow-[0_0_20px_#E040FB]" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-8"
                >
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_15px_#00E5FF]" />
                </motion.div>

                {/* Center logo */}
                <div className="absolute inset-8 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl">
                  <Image
                    src="/assets/brand/logo-primary.jpg"
                    alt="JPanda"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Holographic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#E040FB]/20 via-transparent to-[#00E5FF]/20" />
                </div>

                {/* Glow effects */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-r from-[#E040FB]/30 to-[#00E5FF]/30 blur-3xl -z-10" />
              </div>
            </motion.div>
          </div>

          {/* Voice styles ticker */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20 overflow-hidden"
          >
            <p className="text-xs text-white/30 uppercase tracking-[0.3em] mb-4 text-center">
              8 AI Voice Styles
            </p>
            <div className="flex items-center justify-center flex-wrap gap-3">
              {voiceStyles.map((style, i) => (
                <motion.div
                  key={style.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-sm cursor-default hover:border-[#E040FB]/30 transition-colors"
                >
                  <span className="mr-2">{style.emoji}</span>
                  <span className="text-sm text-white/60">{style.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-[#E040FB] rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ==================== DIAGONAL DIVIDER ==================== */}
      <div className="relative h-32 -mt-16">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 128">
          <path
            d="M0,0 L1440,128 L1440,128 L0,128 Z"
            fill="url(#diagonalGradient)"
          />
          <defs>
            <linearGradient id="diagonalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A0A0A" />
              <stop offset="100%" stopColor="#0C0C14" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E040FB]/30 to-transparent transform -rotate-[5deg]" />
      </div>

      {/* ==================== PILLARS SECTION ==================== */}
      <section className="relative py-32 px-6 bg-crucible">
        <GridBackground />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-20"
          >
            <div className="flex items-end gap-8 mb-6">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-headline leading-none">
                <span className="text-white">THE FOUR</span>
                <br />
                <span className="text-[#E040FB]">PILLARS</span>
              </h2>
              <div className="hidden md:block h-[2px] flex-1 bg-gradient-to-r from-[#E040FB]/50 to-transparent mb-4" />
            </div>
            <p className="text-xl text-white/40 max-w-xl">
              Everything connects. Everything compounds. The complete degen infrastructure.
            </p>
          </motion.div>

          {/* Pillars grid */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {pillars.map((pillar, index) => (
              <PillarCard key={pillar.id} pillar={pillar} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== STATS MARQUEE ==================== */}
      <section className="relative py-20 border-y border-white/5 bg-obsidian overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-16 whitespace-nowrap"
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              <div className="flex items-center gap-4">
                <Music className="w-8 h-8 text-[#E040FB]" />
                <span className="text-4xl font-headline text-white">500+</span>
                <span className="text-white/40 uppercase tracking-wider">Tracks</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#E040FB]/50" />
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-[#4ADE80]" />
                <span className="text-4xl font-headline text-white">10K+</span>
                <span className="text-white/40 uppercase tracking-wider">Scans</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#00E5FF]/50" />
              <div className="flex items-center gap-4">
                <Palette className="w-8 h-8 text-[#F472B6]" />
                <span className="text-4xl font-headline text-white">200+</span>
                <span className="text-white/40 uppercase tracking-wider">Brands</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#F472B6]/50" />
              <div className="flex items-center gap-4">
                <Rocket className="w-8 h-8 text-[#00E5FF]" />
                <span className="text-4xl font-headline text-white">$50K+</span>
                <span className="text-white/40 uppercase tracking-wider">Volume</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#7C4DFF]/50" />
            </div>
          ))}
        </motion.div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="relative py-32 px-6 bg-obsidian">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-headline mb-4">
              <span className="text-white">HOW IT</span>
              <span className="text-[#00E5FF]"> WORKS</span>
            </h2>
            <p className="text-xl text-white/40">From idea to moon in minutes</p>
          </motion.div>

          {/* Process steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-[#E040FB]/50 via-[#00E5FF]/50 to-[#4ADE80]/50" />

            {[
              {
                step: "01",
                title: "ENTER",
                subtitle: "YOUR TOKEN",
                desc: "Name, vibe, and any special requests for your project",
                icon: Disc3,
                color: "#E040FB"
              },
              {
                step: "02",
                title: "AI",
                subtitle: "CREATES",
                desc: "Custom anthem, art, and brand assets generated instantly",
                icon: Sparkles,
                color: "#00E5FF"
              },
              {
                step: "03",
                title: "LAUNCH",
                subtitle: "& MOON",
                desc: "Download everything and take your project to the stars",
                icon: Rocket,
                color: "#4ADE80"
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center group"
              >
                {/* Step number */}
                <div className="relative inline-block mb-8">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center border-2"
                    style={{
                      borderColor: item.color,
                      background: `linear-gradient(135deg, ${item.color}10 0%, transparent 100%)`
                    }}
                  >
                    <item.icon className="w-8 h-8" style={{ color: item.color }} />
                  </motion.div>
                  <span
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-obsidian border-2 flex items-center justify-center text-sm font-mono font-bold"
                    style={{ borderColor: item.color, color: item.color }}
                  >
                    {item.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-headline text-2xl text-white mb-1">{item.title}</h3>
                <h4 className="font-headline text-2xl mb-4" style={{ color: item.color }}>
                  {item.subtitle}
                </h4>
                <p className="text-white/50 max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES BENTO ==================== */}
      <section className="relative py-32 px-6 bg-crucible">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-headline mb-4">
              <span className="text-white">WHY DEGENS</span>
              <br />
              <span className="text-[#F472B6]">TRUST US</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Eye, title: "Real-time Analysis", desc: "Blockchain data processed instantly", color: "#E040FB" },
              { icon: Volume2, title: "8 Voice Styles", desc: "From hard trap to smooth R&B", color: "#00E5FF" },
              { icon: Zap, title: "Instant Delivery", desc: "Minutes, not weeks", color: "#4ADE80" },
              { icon: Lock, title: "Secure Payments", desc: "TON, Stars, and USDC", color: "#F472B6" },
              { icon: Users, title: "Community Reports", desc: "Crowd-sourced intel", color: "#7C4DFF" },
              { icon: Shield, title: "Whale Tracking", desc: "Know the big players", color: "#00E5FF" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-white/10 transition-all group"
              >
                <feature.icon
                  className="w-8 h-8 mb-4 transition-colors"
                  style={{ color: feature.color }}
                />
                <h3 className="font-semibold text-white mb-2 group-hover:text-[#E040FB] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/50">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="relative py-32 px-6 bg-obsidian overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E040FB]/10 rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 md:p-20 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-8"
            >
              <Rocket className="w-16 h-16 text-[#E040FB]" />
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-headline mb-6">
              <span className="text-white">READY TO</span>
              <br />
              <GlitchText className="gradient-text-cyberpunk">BUILD?</GlitchText>
            </h2>

            <p className="text-xl text-white/50 mb-10 max-w-lg mx-auto">
              Join the JPanda ecosystem. Create, protect, and launch with the most degen-friendly toolkit in crypto.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/create"
                className="group px-10 py-5 bg-gradient-to-r from-[#E040FB] to-[#7C4DFF] rounded-xl font-semibold text-white text-lg transition-all hover:shadow-[0_0_60px_rgba(224,64,251,0.4)] hover:scale-105"
              >
                <span className="flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  Start Creating
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="https://t.me/MSUCOBot"
                target="_blank"
                className="px-10 py-5 rounded-xl font-semibold text-white text-lg border border-white/10 hover:bg-white/5 transition-all flex items-center gap-3"
              >
                <Users className="w-5 h-5" />
                Join Telegram
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative py-16 px-6 border-t border-white/5 bg-obsidian">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                  <Image
                    src="/assets/brand/logo-primary.jpg"
                    alt="JPanda"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-headline text-xl text-white">JPANDA</span>
                  <span className="block text-xs text-white/40 uppercase tracking-wider">Ecosystem</span>
                </div>
              </div>
              <p className="text-white/40 text-sm max-w-xs">
                The complete degen toolkit. Create. Protect. Launch. Moon.
              </p>
            </div>

            {/* Links */}
            {[
              { title: "Ecosystem", links: [
                { name: "Studio", href: "/studio" },
                { name: "Rug Score", href: "/rug-score" },
                { name: "Brand Forge", href: "/brand" },
                { name: "Drops", href: "/drops" },
              ]},
              { title: "Create", links: [
                { name: "Anthem Generator", href: "/create" },
                { name: "Album Art", href: "/create" },
                { name: "Brand Kit", href: "/create" },
                { name: "Launch Pack", href: "/create" },
              ]},
              { title: "Connect", links: [
                { name: "Telegram Bot", href: "https://t.me/MSUCOBot" },
                { name: "X (Twitter)", href: "#" },
                { name: "Discord", href: "#" },
              ]},
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-[#E040FB] mb-4 text-sm uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/40 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              &copy; 2025 JPanda Ecosystem. Built for degens.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/30">
              <span>Pay with</span>
              <span className="text-[#E040FB]">Stars</span>
              <span>•</span>
              <span className="text-[#00E5FF]">TON</span>
              <span>•</span>
              <span className="text-white/50">USDC</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
