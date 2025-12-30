"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MainNav } from "@/components/navigation/main-nav";
import {
  Palette,
  Type,
  Sparkles,
  Download,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Image as ImageIcon,
  Layers,
  Share2,
  FileText,
  Users,
  Star,
} from "lucide-react";

const brandFeatures = [
  {
    icon: Type,
    title: "Typography",
    description: "Custom font pairings that match your token's vibe. Headlines that pop, body text that reads.",
    included: ["Primary headline font", "Secondary body font", "Accent display font", "Size & weight guide"],
  },
  {
    icon: Palette,
    title: "Color Palette",
    description: "Cohesive color schemes for dark and light modes. Gradients, accents, and everything in between.",
    included: ["Primary brand colors", "Secondary palette", "Gradient combinations", "Accessibility contrast"],
  },
  {
    icon: ImageIcon,
    title: "Logo Suite",
    description: "Multiple logo variations for every use case. From Twitter PFPs to billboard displays.",
    included: ["Primary logo", "Icon/favicon", "Wordmark", "Dark & light versions"],
  },
  {
    icon: Layers,
    title: "Asset Pack",
    description: "Ready-to-use graphics for all your marketing needs. Sized for every platform.",
    included: ["Social headers", "Profile pictures", "Story templates", "Banner variations"],
  },
  {
    icon: Share2,
    title: "Social Kit",
    description: "Platform-specific assets so you never have to resize anything again.",
    included: ["Twitter/X kit", "Telegram assets", "Discord pack", "Instagram templates"],
  },
  {
    icon: FileText,
    title: "Brand Guide",
    description: "Professional documentation on how to use your brand assets correctly.",
    included: ["Usage guidelines", "Do's and don'ts", "Spacing rules", "Color codes (HEX/RGB)"],
  },
];

const colorPalettes = [
  {
    name: "Degen Purple",
    colors: ["#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6"],
    vibe: "Authority, Creativity",
  },
  {
    name: "Neon Cyber",
    colors: ["#22D3EE", "#06B6D4", "#0891B2", "#0E7490"],
    vibe: "Tech, Innovation",
  },
  {
    name: "Moon Green",
    colors: ["#4ADE80", "#22C55E", "#16A34A", "#15803D"],
    vibe: "Growth, Success",
  },
  {
    name: "Fire Orange",
    colors: ["#FB923C", "#F97316", "#EA580C", "#C2410C"],
    vibe: "Energy, Urgency",
  },
];

const characters = [
  {
    name: "JPanda",
    role: "The Founder",
    description: "Luxury degen vibes",
    image: "/assets/brand/panda-round.png",
  },
  {
    name: "White Tiger",
    role: "The Creator",
    description: "AI music legend",
    image: "/assets/brand/logo-primary.jpg",
  },
  {
    name: "Pepe",
    role: "The Degen",
    description: "Community spirit",
    image: "/assets/brand/meme-pepe-panda.jpg",
  },
];

export default function BrandPage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <main className="min-h-screen bg-obsidian">
      <MainNav />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/assets/brand/brand-kit-dark.png"
            alt="Brand Kit"
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/80 to-obsidian" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-pink/10 border border-neon-pink/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-neon-pink" />
            <span className="text-sm text-neon-pink font-medium">AI-Powered Branding</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-headline mb-6"
          >
            <span className="text-white">BRAND</span>
            <br />
            <span className="gradient-text-cyberpunk">FORGE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-4"
          >
            Complete brand identity in minutes.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-lg text-white/40 max-w-xl mx-auto mb-8"
          >
            Logos, colors, typography, and social assets - everything you need to look legit from day one.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/create"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-neon-pink to-tiger text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <Palette className="w-5 h-5" />
              Generate Brand Kit
              <span className="px-2 py-0.5 text-xs bg-white/20 rounded ml-1">$0.25</span>
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 rounded-xl glass border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
            >
              See What&apos;s Included
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              What&apos;s <span className="text-neon-pink">Included</span>
            </h2>
            <p className="text-white/60">Everything you need to build a professional brand</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl glass hover:glass-tiger transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-pink/20 to-tiger/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-neon-pink" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm mb-4">{feature.description}</p>
                <ul className="space-y-1">
                  {feature.included.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/50">
                      <Check className="w-3 h-3 text-neon-green" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Color Palettes Preview */}
      <section className="py-20 px-6 bg-gradient-to-b from-obsidian to-crucible">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              <span className="text-neon-pink">Color</span> Palettes
            </h2>
            <p className="text-white/60">Choose a vibe, we&apos;ll generate the perfect palette</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {colorPalettes.map((palette, index) => (
              <motion.div
                key={palette.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-2xl glass"
              >
                <div className="flex gap-1 mb-4">
                  {palette.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => copyColor(color)}
                      className="flex-1 h-16 rounded-lg hover:scale-105 transition-transform relative group"
                      style={{ backgroundColor: color }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedColor === color ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Copy className="w-4 h-4 text-white" />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                <h3 className="font-semibold text-white mb-1">{palette.name}</h3>
                <p className="text-xs text-white/50">{palette.vibe}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Characters */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              <span className="text-neon-pink">Character</span> Assets
            </h2>
            <p className="text-white/60">Mascots and avatars for your brand</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {characters.map((char, index) => (
              <motion.div
                key={char.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl glass hover:glass-tiger transition-all group"
              >
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-neon-pink/30 group-hover:border-neon-pink/60 transition-colors">
                  <Image
                    src={char.image}
                    alt={char.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{char.name}</h3>
                <p className="text-neon-pink text-sm mb-2">{char.role}</p>
                <p className="text-white/60 text-sm">{char.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-6 bg-gradient-to-b from-obsidian to-crucible">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              How It <span className="text-neon-pink">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Enter Token Name", desc: "Tell us about your project" },
              { step: "2", title: "Pick a Vibe", desc: "Choose color and style direction" },
              { step: "3", title: "AI Generates", desc: "Complete brand kit in ~2 min" },
              { step: "4", title: "Download All", desc: "Get all assets in one ZIP" },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-pink to-tiger flex items-center justify-center text-xl font-bold text-white mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "200+", label: "Brands Created", icon: Star },
              { value: "<2min", label: "Generation Time", icon: Zap },
              { value: "6", label: "Asset Types", icon: Layers },
              { value: "$0.25", label: "Per Package", icon: Sparkles },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl glass"
              >
                <stat.icon className="w-6 h-6 text-neon-pink mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl glass-tiger"
          >
            <Palette className="w-16 h-16 text-neon-pink mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              Look <span className="gradient-text-cyberpunk">Legendary</span>
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Your token deserves a brand that matches its potential. Let AI create your
              complete identity package.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-neon-pink to-tiger text-white text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Zap className="w-6 h-6" />
              Generate Brand Kit
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
