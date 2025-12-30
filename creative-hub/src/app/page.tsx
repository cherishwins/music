"use client";

import { motion } from "framer-motion";
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
  Play,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";

const ecosystemPillars = [
  {
    icon: Music,
    title: "White Tiger Studio",
    tagline: "Degen Music Factory",
    description: "AI-powered anthems, album art, and promo videos for your token launch.",
    href: "/studio",
    color: "from-tiger to-neon-purple",
    price: "$0.50/track",
  },
  {
    icon: Shield,
    title: "Rug Pull Insurance",
    tagline: "Safety First, Ape Second",
    description: "Minter credit scoring and whale behavioral analytics. Know before you throw.",
    href: "/rug-score",
    color: "from-neon-green to-neon-cyan",
    badge: "FREE",
  },
  {
    icon: Palette,
    title: "Brand Forge",
    tagline: "Identity in Minutes",
    description: "Complete brand packages with logos, colors, typography, and social templates.",
    href: "/brand",
    color: "from-neon-pink to-tiger",
    price: "$0.25",
  },
  {
    icon: Rocket,
    title: "Launch Pad",
    tagline: "Full Send Protocol",
    description: "Everything bundled: music, art, brand, socials. One click to moon mission ready.",
    href: "/drops",
    color: "from-neon-cyan to-neon-blue",
    price: "Bundle",
  },
];

const stats = [
  { value: "500+", label: "Tracks Created", icon: Music },
  { value: "10K+", label: "Tokens Scanned", icon: Shield },
  { value: "200+", label: "Brands Launched", icon: Palette },
  { value: "$50K+", label: "Volume Generated", icon: TrendingUp },
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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-obsidian">
      <MainNav />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/brand/ecosystem/hero-ecosystem.png"
            alt="JPanda Ecosystem"
            fill
            className="object-cover object-center opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/50 to-obsidian" />
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 -left-32 w-96 h-96 bg-tiger/30 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 80, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, -80, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/10 rounded-full blur-[200px]"
          />
        </div>

        <div className="relative max-w-6xl mx-auto text-center z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiger/10 border border-tiger/20 mb-8"
          >
            <Star className="w-4 h-4 text-tiger" />
            <span className="text-sm text-tiger font-medium">The Complete Degen Toolkit</span>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-8"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-tiger/40 via-neon-cyan/30 to-tiger/40 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 shadow-2xl">
              <Image
                src="/assets/brand/logo-primary.jpg"
                alt="JPanda"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-headline mb-6"
          >
            <span className="gradient-text-cyberpunk">JPANDA&apos;S</span>
            <br />
            <span className="text-white">ECOSYSTEM</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-10"
          >
            Create music. Check rugs. Build brands. Launch tokens.
            <br />
            <span className="text-tiger font-medium">Everything you need to make it.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/create"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-tiger to-neon-purple rounded-xl font-semibold text-white shadow-lg shadow-tiger/25 hover:shadow-tiger/40 transition-all hover:-translate-y-0.5"
            >
              <Zap className="w-5 h-5" />
              Start Creating
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/rug-score"
              className="flex items-center gap-2 px-8 py-4 glass border border-neon-green/30 rounded-xl font-semibold text-white hover:bg-neon-green/10 transition-all"
            >
              <Shield className="w-5 h-5" />
              Check Rug Score
              <span className="px-2 py-0.5 text-xs bg-neon-green/20 text-neon-green rounded ml-1">FREE</span>
            </Link>
          </motion.div>

          {/* Voice Styles Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {voiceStyles.map((style, i) => (
              <motion.div
                key={style.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm"
              >
                <span className="mr-1">{style.emoji}</span>
                <span className="text-white/60">{style.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 bg-tiger rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Ecosystem Pillars */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-headline mb-4">
              The Four <span className="text-tiger">Pillars</span>
            </h2>
            <p className="text-xl text-white/60">Everything connects. Everything compounds.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {ecosystemPillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={pillar.href}
                  className="block p-8 rounded-2xl glass hover:glass-tiger transition-all group"
                >
                  <div className="flex items-start gap-5">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <pillar.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-semibold text-white group-hover:text-tiger transition-colors">
                          {pillar.title}
                        </h3>
                        {pillar.badge && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-neon-green/20 text-neon-green rounded">
                            {pillar.badge}
                          </span>
                        )}
                        {pillar.price && (
                          <span className="px-2 py-0.5 text-xs bg-white/10 text-white/60 rounded">
                            {pillar.price}
                          </span>
                        )}
                      </div>
                      <p className="text-tiger text-sm mb-3">{pillar.tagline}</p>
                      <p className="text-white/60">{pillar.description}</p>
                      <div className="flex items-center gap-2 mt-4 text-tiger opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium">Explore</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-gradient-to-b from-obsidian to-crucible">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl glass"
              >
                <stat.icon className="w-8 h-8 text-tiger mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-headline mb-4">
              How It <span className="text-tiger">Works</span>
            </h2>
            <p className="text-xl text-white/60">From idea to moon in minutes</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Enter Your Token", desc: "Name, vibe, and any special requests", icon: "🎯" },
              { step: "2", title: "AI Creates", desc: "Custom anthem, art, and brand assets", icon: "🤖" },
              { step: "3", title: "Launch & Moon", desc: "Download everything and take off", icon: "🚀" },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-tiger to-neon-purple flex items-center justify-center text-3xl">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-obsidian border-2 border-tiger flex items-center justify-center text-sm font-bold text-tiger">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-20 px-6 bg-gradient-to-b from-crucible to-obsidian">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-headline mb-6">
                Why <span className="text-tiger">Degens</span> Trust Us
              </h2>
              <ul className="space-y-4">
                {[
                  "Real-time blockchain data analysis",
                  "8 distinct AI voice styles",
                  "Complete brand packages in minutes",
                  "TON, Stars, and USDC payments",
                  "Whale wallet tracking and alerts",
                  "Community-driven risk reports",
                ].map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-3xl overflow-hidden"
            >
              <Image
                src="/assets/brand/banners/white-tiger-party.png"
                alt="White Tiger Studio"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 md:p-16 rounded-3xl glass-tiger"
          >
            <Rocket className="w-16 h-16 text-tiger mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-headline mb-4">
              Ready to <span className="gradient-text-cyberpunk">Build</span>?
            </h2>
            <p className="text-xl text-white/60 mb-10 max-w-lg mx-auto">
              Join the JPanda ecosystem. Create, protect, and launch with the most degen-friendly toolkit in crypto.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/create"
                className="flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-tiger to-neon-pink text-white text-lg font-semibold hover:opacity-90 transition-opacity"
              >
                <Zap className="w-6 h-6" />
                Start Creating
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="https://t.me/MSUCOBot"
                className="flex items-center gap-2 px-10 py-5 rounded-xl glass border border-white/10 text-white text-lg font-semibold hover:bg-white/5 transition-colors"
              >
                <Users className="w-5 h-5" />
                Join Telegram
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-tiger/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src="/assets/brand/logo-primary.jpg"
                    alt="JPanda"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <span className="font-headline text-lg">JPANDA</span>
              </div>
              <p className="text-white/60 text-sm">
                The complete degen toolkit. Make noise. Go viral. Moon.
              </p>
            </div>

            {/* Ecosystem */}
            <div>
              <h4 className="font-semibold mb-4 text-tiger">Ecosystem</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="/studio" className="hover:text-tiger transition-colors">Studio</Link></li>
                <li><Link href="/rug-score" className="hover:text-tiger transition-colors">Rug Score</Link></li>
                <li><Link href="/brand" className="hover:text-tiger transition-colors">Brand Forge</Link></li>
                <li><Link href="/drops" className="hover:text-tiger transition-colors">Drops</Link></li>
              </ul>
            </div>

            {/* Create */}
            <div>
              <h4 className="font-semibold mb-4 text-tiger">Create</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="/create" className="hover:text-tiger transition-colors">Anthem Generator</Link></li>
                <li><Link href="/create" className="hover:text-tiger transition-colors">Album Art</Link></li>
                <li><Link href="/create" className="hover:text-tiger transition-colors">Brand Kit</Link></li>
                <li><Link href="/create" className="hover:text-tiger transition-colors">Launch Pack</Link></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-semibold mb-4 text-tiger">Connect</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="https://t.me/MSUCOBot" className="hover:text-tiger transition-colors">Telegram Bot</a></li>
                <li><a href="#" className="hover:text-tiger transition-colors">X (Twitter)</a></li>
                <li><a href="#" className="hover:text-tiger transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-tiger/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">&copy; 2025 JPanda Ecosystem. Built for degens.</p>
            <div className="flex items-center gap-1 text-white/30 text-xs">
              <span>Pay with</span>
              <span className="text-tiger/70 ml-2">Stars</span>
              <span className="mx-2">•</span>
              <span className="text-neon-cyan/70">TON</span>
              <span className="mx-2">•</span>
              <span className="text-white/50">USDC</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
