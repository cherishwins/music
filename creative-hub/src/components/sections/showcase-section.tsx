"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Music,
  FileText,
  Video,
  Image as ImageIcon,
  Palette,
  Share2,
  Rocket,
  Shield,
  Zap,
  Play,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Degen-targeted services
const services = [
  {
    id: "anthem",
    icon: Music,
    title: "Anthem Forge",
    tagline: "Your coin needs a banger. Period.",
    description: "Drop your token name, pick a vibe, get a full track with AI vocals, hard beat, and lyrics that slap. Your community anthem in minutes, not weeks.",
    features: ["8 AI voice styles", "Custom lyrics", "Radio-ready quality", "Instant download"],
    price: "$0.50",
    emoji: "🎵",
    color: "from-tiger to-neon-purple",
    thumbnail: "/assets/brand/hero-dj-party.jpg",
    cta: "Forge My Anthem",
    hot: true,
  },
  {
    id: "rugcheck",
    icon: Shield,
    title: "Rug Score",
    tagline: "Is it safe or nah?",
    description: "Paste any TON token address. We check liquidity, holder distribution, contract code, and socials. Get a 0-100 safety score before you ape.",
    features: ["Liquidity analysis", "Holder whale check", "Contract scan", "Social verification"],
    price: "FREE",
    emoji: "🛡️",
    color: "from-neon-green to-neon-cyan",
    thumbnail: "/assets/brand/meme-pepe-panda.jpg",
    cta: "Check Token",
    hot: false,
  },
  {
    id: "whitepaper",
    icon: FileText,
    title: "Litepaper Wizard",
    tagline: "Sound smart without trying.",
    description: "Enter your token concept. Get a professionally formatted litepaper with roadmap, tokenomics, and team bios. Serious enough to convince, degen enough to entertain.",
    features: ["Tokenomics generator", "Roadmap builder", "Team bio templates", "PDF export"],
    price: "$0.25",
    emoji: "📜",
    color: "from-tiger-light to-tiger",
    thumbnail: "/assets/brand/hero-laser-eyes.jpg",
    cta: "Generate Litepaper",
    hot: false,
  },
  {
    id: "promo",
    icon: Video,
    title: "Promo Video",
    tagline: "TikTok viral in 60 seconds.",
    description: "Your album art + anthem + hype text = viral-ready promo video. Optimized for TikTok, Reels, and Shorts. Make the algo work for you.",
    features: ["60s format", "Auto-captions", "Trending effects", "All platforms"],
    price: "$0.35",
    emoji: "🎬",
    color: "from-neon-cyan to-neon-blue",
    thumbnail: "/assets/brand/meme-dance-floor.jpg",
    cta: "Create Video",
    hot: true,
  },
  {
    id: "albumart",
    icon: ImageIcon,
    title: "Album Art",
    tagline: "Cover art that goes hard.",
    description: "AI-generated cover art that matches your energy. Cyberpunk tiger? Laser-eye Pepe? Cute mascot? Whatever fits your token's vibe.",
    features: ["Multiple styles", "High-res output", "Transparent PNGs", "Social sizes"],
    price: "$0.10",
    emoji: "🎨",
    color: "from-neon-pink to-tiger",
    thumbnail: "/assets/brand/hero-cosmic-disco.jpg",
    cta: "Generate Art",
    hot: false,
  },
  {
    id: "brandkit",
    icon: Palette,
    title: "Brand Forge",
    tagline: "Full identity. Zero effort.",
    description: "Complete brand package: logo concepts, color palette, typography, social templates. Everything you need to look legit from day one.",
    features: ["Logo variations", "Color system", "Font pairing", "Guidelines PDF"],
    price: "$0.25",
    emoji: "✨",
    color: "from-tiger to-tiger-muted",
    thumbnail: "/assets/brand/marketing-triple-tigers.jpg",
    cta: "Forge Brand",
    hot: false,
  },
  {
    id: "socialkit",
    icon: Share2,
    title: "Social Kit",
    tagline: "Post everywhere. Look fire.",
    description: "Your branding sized for every platform. Twitter/X headers, Telegram stickers, Discord banners, profile pics. Post once, win everywhere.",
    features: ["All platform sizes", "Animated variants", "Sticker pack", "Banner set"],
    price: "$0.15",
    emoji: "📱",
    color: "from-tiger-muted to-tiger-light",
    thumbnail: "/assets/brand/meme-dj-crew.jpg",
    cta: "Get Social Kit",
    hot: false,
  },
  {
    id: "launchpack",
    icon: Rocket,
    title: "Launch Pack",
    tagline: "The full send. Everything.",
    description: "Anthem + Album Art + Brand Kit + Social Kit + Promo Video. One price, complete launch arsenal. This is the degen starter pack.",
    features: ["5 products", "Best value", "Priority gen", "VIP support"],
    price: "$1.00",
    emoji: "🚀",
    color: "from-neon-pink to-neon-cyan",
    thumbnail: "/assets/brand/hero-mech-wings.jpg",
    cta: "Get Launch Pack",
    hot: true,
  },
];

export function ShowcaseSection() {
  const [activeService, setActiveService] = useState(services[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % services.length;
    setCurrentIndex(newIndex);
    setActiveService(services[newIndex]);
  };

  const prevSlide = () => {
    const newIndex = (currentIndex - 1 + services.length) % services.length;
    setCurrentIndex(newIndex);
    setActiveService(services[newIndex]);
  };

  return (
    <section id="services" className="py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiger/10 border border-tiger/20 mb-6">
            <Sparkles className="w-4 h-4 text-tiger" />
            <span className="text-sm text-tiger font-medium">Degen Arsenal</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-headline mb-4">
            What We <span className="gradient-text-cyberpunk">Build</span> 🔥
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Everything your meme coin needs to go from &quot;literally who&quot; to &quot;OMG I&apos;m early&quot;.
            <br />
            <span className="text-tiger">No design skills. No waiting. Just vibes.</span>
          </p>
        </motion.div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {services.map((service, index) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                setActiveService(service);
                setCurrentIndex(index);
              }}
              className={`relative p-4 rounded-2xl text-left transition-all duration-300 ${
                activeService.id === service.id
                  ? "glass-tiger ring-2 ring-tiger scale-[1.02]"
                  : "glass hover:glass-tiger"
              }`}
            >
              {/* Hot badge */}
              {service.hot && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-tiger to-neon-pink rounded-full text-xs font-bold text-white">
                  HOT 🔥
                </div>
              )}

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-3`}>
                <service.icon className="w-5 h-5 text-white" />
              </div>

              {/* Title */}
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                {service.title}
                <span className="text-sm">{service.emoji}</span>
              </h3>

              {/* Price */}
              <span className={`text-sm font-bold ${service.price === "FREE" ? "text-neon-green" : "text-tiger-light"}`}>
                {service.price}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Featured Service Detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeService.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-3xl overflow-hidden glass-tiger"
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image side */}
              <div className="relative aspect-video md:aspect-auto md:min-h-[400px]">
                <Image
                  src={activeService.thumbnail}
                  alt={activeService.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-obsidian/90 hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent md:hidden" />

                {/* Floating emoji */}
                <div className="absolute top-4 left-4 text-5xl animate-float">
                  {activeService.emoji}
                </div>
              </div>

              {/* Content side */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                {/* Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeService.color} flex items-center justify-center`}>
                    <activeService.icon className="w-6 h-6 text-white" />
                  </div>
                  {activeService.hot && (
                    <span className="px-3 py-1 bg-tiger/20 text-tiger text-xs font-bold rounded-full">
                      POPULAR
                    </span>
                  )}
                </div>

                {/* Title & tagline */}
                <h3 className="text-3xl md:text-4xl font-headline mb-2">
                  {activeService.title}
                </h3>
                <p className="text-tiger text-lg font-medium mb-4">
                  {activeService.tagline}
                </p>

                {/* Description */}
                <p className="text-white/70 mb-6 leading-relaxed">
                  {activeService.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {activeService.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-white/60">
                      <Zap className="w-3 h-3 text-tiger" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${activeService.price === "FREE" ? "text-neon-green" : "text-white"}`}>
                      {activeService.price}
                    </span>
                    {activeService.price !== "FREE" && (
                      <span className="text-white/40 text-sm">USDC</span>
                    )}
                  </div>
                  <Link
                    href="/create"
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${activeService.color} hover:opacity-90 transition-opacity`}
                  >
                    {activeService.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-white/50 text-sm mb-4">
            All services payable in{" "}
            <span className="text-tiger">Telegram Stars</span> •{" "}
            <span className="text-neon-cyan">TON</span> •{" "}
            <span className="text-white/70">USDC</span> •{" "}
            <span className="text-white/70">Card</span>
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-obsidian bg-gradient-to-r from-tiger via-tiger-light to-neon-cyan hover:opacity-90 transition-opacity"
          >
            <Rocket className="w-5 h-5" />
            Start Building
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
