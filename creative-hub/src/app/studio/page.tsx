"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MainNav } from "@/components/navigation/main-nav";
import {
  Music,
  Mic2,
  Image as ImageIcon,
  Video,
  Palette,
  Share2,
  Zap,
  Play,
  ArrowRight,
  Headphones,
  Disc3,
} from "lucide-react";

const studioServices = [
  {
    icon: Music,
    title: "Anthem Forge",
    description: "Full AI-generated tracks with vocals, beats, and lyrics. Your token's signature sound.",
    price: "$0.50",
    time: "~2 min",
    popular: true,
  },
  {
    icon: ImageIcon,
    title: "Album Art",
    description: "AI cover art that matches your vibe. Cyberpunk, cute, degen - whatever fits.",
    price: "$0.10",
    time: "~30 sec",
    popular: false,
  },
  {
    icon: Video,
    title: "Promo Video",
    description: "60-second viral-ready videos for TikTok, Reels, and Shorts.",
    price: "$0.35",
    time: "~3 min",
    popular: true,
  },
  {
    icon: Palette,
    title: "Brand Kit",
    description: "Complete brand identity: logos, colors, typography, guidelines.",
    price: "$0.25",
    time: "~2 min",
    popular: false,
  },
  {
    icon: Share2,
    title: "Social Kit",
    description: "All your assets sized for every platform. Post everywhere instantly.",
    price: "$0.15",
    time: "~1 min",
    popular: false,
  },
  {
    icon: Mic2,
    title: "Voice Lab",
    description: "8 distinct AI voices from hard rap to smooth R&B. Pick your style.",
    price: "Included",
    time: "—",
    popular: false,
  },
];

const voiceStyles = [
  { name: "Hard Trap", emoji: "🔥", vibe: "Aggressive, punchy, street" },
  { name: "Smooth R&B", emoji: "🎤", vibe: "Melodic, soulful, clean" },
  { name: "Hype Anthem", emoji: "🚀", vibe: "Epic, stadium, energy" },
  { name: "Chill Lofi", emoji: "☁️", vibe: "Relaxed, dreamy, mellow" },
  { name: "Drill UK", emoji: "🇬🇧", vibe: "Dark, sliding, bass-heavy" },
  { name: "Phonk", emoji: "👻", vibe: "Drift, cowbell, Memphis" },
  { name: "Pop Hook", emoji: "✨", vibe: "Catchy, radio, mainstream" },
  { name: "Degen Rap", emoji: "🐸", vibe: "Meme-core, fun, viral" },
];

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-obsidian">
      <MainNav />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/assets/brand/studio/hero-studio.png"
            alt="Degen Music Studio"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/60 to-obsidian" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiger/10 border border-tiger/20 mb-6"
          >
            <Disc3 className="w-4 h-4 text-tiger animate-spin" style={{ animationDuration: "3s" }} />
            <span className="text-sm text-tiger font-medium">Hit Music Anthem Maker</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-headline mb-6"
          >
            <span className="text-white">DEGEN</span>
            <br />
            <span className="gradient-text-cyberpunk">MUSIC STUDIO</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-8"
          >
            Drop your token name. Pick a vibe. Get a banger.
            <br />
            <span className="text-tiger">AI-powered anthems in minutes, not weeks.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/create"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-tiger to-neon-purple text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <Music className="w-5 h-5" />
              Drop a Beat
            </Link>
            <button className="flex items-center gap-2 px-8 py-4 rounded-xl glass border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">
              <Play className="w-5 h-5" />
              Browse Tracks
            </button>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              Studio <span className="text-tiger">Services</span>
            </h2>
            <p className="text-white/60">Everything you need to sound legendary</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studioServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-6 rounded-2xl glass hover:glass-tiger transition-all ${
                  service.popular ? "ring-2 ring-tiger/50" : ""
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-tiger to-neon-pink rounded-full text-xs font-bold text-white">
                    POPULAR 🔥
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiger/20 to-neon-cyan/20 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-tiger" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-white/60 text-sm mb-4">{service.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-tiger">{service.price}</span>
                  <span className="text-white/40">{service.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Styles */}
      <section className="py-20 px-6 bg-gradient-to-b from-obsidian to-crucible">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              <span className="text-tiger">8 Voice</span> Styles
            </h2>
            <p className="text-white/60">Pick the vibe that fits your token</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {voiceStyles.map((voice, index) => (
              <motion.div
                key={voice.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl glass hover:glass-tiger transition-all cursor-pointer group"
              >
                <div className="text-3xl mb-2">{voice.emoji}</div>
                <h3 className="font-semibold text-white group-hover:text-tiger transition-colors">
                  {voice.name}
                </h3>
                <p className="text-xs text-white/50">{voice.vibe}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              How It <span className="text-tiger">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Enter Details", desc: "Token name, vibe, any special requests" },
              { step: "2", title: "AI Creates", desc: "Our AI generates your custom anthem" },
              { step: "3", title: "Download & Moon", desc: "Get your files and launch to the stars" },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tiger to-neon-purple flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
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
            <Headphones className="w-16 h-16 text-tiger mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              Ready to Drop a <span className="gradient-text-cyberpunk">Banger</span>?
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Your community anthem is waiting. Create something legendary.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-tiger to-neon-pink text-white text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Zap className="w-6 h-6" />
              Start Creating
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
