"use client";

import { motion } from "framer-motion";
import {
  Music,
  FileText,
  Video,
  Share2,
  Mic2,
  Sparkles,
  Zap,
  Headphones,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Thread to Hit",
    description:
      "Paste your story or post. We extract the essence, transmute the words into lyrics, and forge a complete track.",
    color: "from-gold to-gold-muted",
  },
  {
    icon: Mic2,
    title: "Voice Crucible",
    description:
      "8 distinct AI voices refined to perfection. Select your vessel for the transmutation of text to speech.",
    color: "from-gold-light to-gold",
  },
  {
    icon: Music,
    title: "Forge Chamber",
    description:
      "Suno-powered beat generation. Trap, lo-fi, drill, phonk — whatever element you require, we synthesize it.",
    color: "from-gold-muted to-gold-dark",
  },
  {
    icon: Headphones,
    title: "Master Works",
    description:
      "Not mere vocals over beats. Full production with mixing, mastering — the complete philosopher's stone.",
    color: "from-gold to-gold-light",
  },
  {
    icon: FileText,
    title: "Arcane Slides",
    description:
      "Drop your topic, receive presentations that convey power and presence. Knowledge, refined.",
    color: "from-gold-muted to-gold",
  },
  {
    icon: Video,
    title: "Vision Prompts",
    description:
      "AI-optimized prompts for Runway, Pika, or any video tool. Scene breakdowns crafted with precision.",
    color: "from-gold-light to-gold-muted",
  },
  {
    icon: Share2,
    title: "Distribution Net",
    description:
      "One click to broadcast your creation to TikTok, Instagram, X, Telegram — all channels unified.",
    color: "from-gold to-gold-dark",
  },
  {
    icon: Zap,
    title: "Instant Transmutation",
    description:
      "No waiting. Pay with Telegram Stars or TON, receive your refined content within minutes.",
    color: "from-gold-muted to-gold-light",
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
            The <span className="gradient-text-gold">Alchemist's Tools</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Everything required to transform raw ideas into golden content.
            No experience necessary — bring only your vision.
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
              className="group p-6 glass-gold rounded-2xl card-hover"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-obsidian" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2 group-hover:text-gold transition-colors">
                {feature.title}
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
