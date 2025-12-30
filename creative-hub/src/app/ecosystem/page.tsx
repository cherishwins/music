"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MainNav } from "@/components/navigation/main-nav";
import {
  Music,
  Shield,
  Palette,
  Rocket,
  Users,
  Zap,
  Globe,
  Star,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const ecosystemPillars = [
  {
    icon: Music,
    title: "White Tiger Studio",
    tagline: "Degen Music Factory",
    description: "AI-powered anthems, album art, and promo videos for your token launch. Drop beats, not bags.",
    href: "/studio",
    color: "from-tiger to-neon-purple",
    stats: "500+ tracks created",
  },
  {
    icon: Shield,
    title: "Rug Pull Insurance",
    tagline: "Safety First, Ape Second",
    description: "Minter credit scoring, whale behavioral analytics, and real-time risk assessment. Know before you throw.",
    href: "/rug-score",
    color: "from-neon-green to-neon-cyan",
    stats: "10K+ tokens scanned",
    badge: "FREE",
  },
  {
    icon: Palette,
    title: "Brand Forge",
    tagline: "Identity in Minutes",
    description: "Complete brand packages with logos, colors, typography, and social templates. Look legit from day one.",
    href: "/brand",
    color: "from-neon-pink to-tiger",
    stats: "200+ brands launched",
  },
  {
    icon: Rocket,
    title: "Launch Pad",
    tagline: "Full Send Protocol",
    description: "Everything bundled: music, art, brand, socials, promo video. One click to moon mission ready.",
    href: "/drops",
    color: "from-neon-cyan to-neon-blue",
    stats: "50+ successful launches",
  },
];

const characters = [
  {
    name: "JPanda",
    role: "The Visionary",
    description: "Crypto OG with diamond hands. Bringing luxury to degens since 2021.",
    image: "/assets/brand/panda-round.png",
    color: "neon-purple",
  },
  {
    name: "White Tiger",
    role: "The Creator",
    description: "AI music mastermind. Turns your ticker into a banger.",
    image: "/assets/brand/logo-primary.jpg",
    color: "tiger",
  },
  {
    name: "Pepe",
    role: "The Degen",
    description: "Suited up and ready to ape. Represents the community spirit.",
    image: "/assets/brand/meme-pepe-panda.jpg",
    color: "neon-green",
  },
];

export default function EcosystemPage() {
  return (
    <main className="min-h-screen bg-obsidian">
      <MainNav />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/assets/brand/ecosystem/hero-ecosystem.png"
            alt="JPanda Ecosystem"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/50 to-obsidian" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiger/10 border border-tiger/20 mb-6"
          >
            <Globe className="w-4 h-4 text-tiger" />
            <span className="text-sm text-tiger font-medium">Welcome to the Network</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-headline mb-6"
          >
            <span className="gradient-text-cyberpunk">JPANDA&apos;S</span>
            <br />
            <span className="text-white">ECOSYSTEM</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-8"
          >
            The complete degen toolkit. Create music, check rugs, build brands, and launch tokens.
            <br />
            <span className="text-tiger">Everything you need to make it.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/studio"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-tiger to-neon-purple text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <Music className="w-5 h-5" />
              Enter Studio
            </Link>
            <Link
              href="/rug-score"
              className="flex items-center gap-2 px-8 py-4 rounded-xl glass border border-neon-green/30 text-white font-semibold hover:bg-neon-green/10 transition-colors"
            >
              <Shield className="w-5 h-5" />
              Check Rug Score
              <span className="px-2 py-0.5 text-xs bg-neon-green/20 text-neon-green rounded">FREE</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem Pillars */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              The <span className="text-tiger">Four Pillars</span>
            </h2>
            <p className="text-white/60">Everything connects. Everything compounds.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {ecosystemPillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={pillar.href}
                  className="block p-6 rounded-2xl glass-tiger hover:ring-2 hover:ring-tiger/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center flex-shrink-0`}>
                      <pillar.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-white group-hover:text-tiger transition-colors">
                          {pillar.title}
                        </h3>
                        {pillar.badge && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-neon-green/20 text-neon-green rounded">
                            {pillar.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-tiger text-sm mb-2">{pillar.tagline}</p>
                      <p className="text-white/60 text-sm mb-3">{pillar.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">{pillar.stats}</span>
                        <ArrowRight className="w-4 h-4 text-tiger opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Characters Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-obsidian to-crucible">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              Meet the <span className="text-tiger">Crew</span>
            </h2>
            <p className="text-white/60">The legends behind the ecosystem</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {characters.map((char, index) => (
              <motion.div
                key={char.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl glass"
              >
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-tiger/30">
                  <Image
                    src={char.image}
                    alt={char.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{char.name}</h3>
                <p className={`text-${char.color} text-sm mb-2`}>{char.role}</p>
                <p className="text-white/60 text-sm">{char.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Tracks Created", icon: Music },
              { value: "10K+", label: "Tokens Scanned", icon: Shield },
              { value: "200+", label: "Brands Launched", icon: Palette },
              { value: "$50K+", label: "Volume Generated", icon: TrendingUp },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl glass"
              >
                <stat.icon className="w-8 h-8 text-tiger mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl glass-tiger"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              Ready to <span className="gradient-text-cyberpunk">Build</span>?
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Join the JPanda ecosystem. Create, protect, and launch with the most degen-friendly toolkit in crypto.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/create"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-tiger to-neon-pink text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <Zap className="w-5 h-5" />
                Start Creating
              </Link>
              <Link
                href="https://t.me/MSUCOBot"
                className="flex items-center gap-2 px-8 py-4 rounded-xl glass border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
              >
                <Star className="w-5 h-5" />
                Join Telegram
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
