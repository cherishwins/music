"use client";

import { motion } from "framer-motion";
import {
  Music,
  ImageIcon,
  Palette,
  Mic2,
  Zap,
  Rocket,
  Coins,
  Share2,
} from "lucide-react";

const features = [
  {
    icon: Music,
    title: "Anthem Generator",
    description:
      "Drop your coin name and vibe. Get a full track with vocals, beat, and lyrics that slap. Your community anthem in minutes.",
    emoji: "🎵",
    color: "from-tiger to-tiger-muted",
  },
  {
    icon: ImageIcon,
    title: "Album Art",
    description:
      "AI-generated cover art that matches your brand. Cyberpunk, cute, degen — whatever fits your token's energy.",
    emoji: "🎨",
    color: "from-tiger-light to-tiger",
  },
  {
    icon: Palette,
    title: "Brand Forge",
    description:
      "Complete brand package: logo concepts, color palette, social templates. Everything for your launch.",
    emoji: "✨",
    color: "from-neon-pink to-tiger",
  },
  {
    icon: Mic2,
    title: "Voice Lab",
    description:
      "8 AI voices from hard rap to smooth singer. Pick your vibe, we synthesize the vocals.",
    emoji: "🎤",
    color: "from-tiger to-neon-cyan",
  },
  {
    icon: Rocket,
    title: "Launch Pack",
    description:
      "Music + art + socials in one drop. Everything you need to make noise on launch day.",
    emoji: "🚀",
    color: "from-neon-cyan to-tiger",
  },
  {
    icon: Share2,
    title: "Social Kit",
    description:
      "Sized for every platform. TikTok, X, Telegram, Discord — post everywhere instantly.",
    emoji: "📱",
    color: "from-tiger-muted to-tiger-light",
  },
  {
    icon: Coins,
    title: "Pay Your Way",
    description:
      "Telegram Stars, TON, USDC on Base, or card. Frictionless payments, no wallet drama.",
    emoji: "💎",
    color: "from-neon-pink to-neon-cyan",
  },
  {
    icon: Zap,
    title: "Instant Drop",
    description:
      "No waiting days. Pay, generate, download. Your content ready in minutes not weeks.",
    emoji: "⚡",
    color: "from-tiger-light to-neon-pink",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-headline mb-4">
            Your <span className="gradient-text-cyberpunk">Launch Arsenal</span> 🔥
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Everything you need to make your meme coin unforgettable.
            <br />
            <span className="text-tiger">No design skills needed. Just vibes.</span>
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 glass-tiger rounded-2xl card-hover relative overflow-hidden"
            >
              {/* Background emoji */}
              <div className="absolute -right-2 -top-2 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
                {feature.emoji}
              </div>

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2 group-hover:text-tiger transition-colors flex items-center gap-2">
                {feature.title}
                <span className="text-base">{feature.emoji}</span>
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
