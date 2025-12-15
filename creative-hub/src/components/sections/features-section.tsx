"use client";

import { motion } from "framer-motion";
import {
  Music,
  FileText,
  Video,
  Share2,
  Bot,
  Shield,
  Workflow,
  Palette,
} from "lucide-react";

const features = [
  {
    icon: Music,
    title: "Thread to Hit",
    description:
      "Transform community threads into polished songs with AI-powered lyrics, beats, and voice conversion.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: FileText,
    title: "Quantum Slide Decks",
    description:
      "Generate reality-bending presentations that exist in superposition until observed by your audience.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Video,
    title: "Multiverse Videos",
    description:
      "Create videos with Runway ML that branch across infinite timelines of creative possibility.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Bot,
    title: "AI Voice Studio",
    description:
      "Clone and transform voices with ElevenLabs integration for podcasts, audiobooks, and more.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Share2,
    title: "Omni-Channel Distribution",
    description:
      "Push content to Instagram, TikTok, X, VK, WeChat, and more with n8n workflow automation.",
    color: "from-gold-400 to-gold-600",
  },
  {
    icon: Shield,
    title: "Eigen-Contract Protection",
    description:
      "Your assets exist in quantum superposition - protected until measured by the right observer.",
    color: "from-cosmic-400 to-cosmic-600",
  },
  {
    icon: Workflow,
    title: "Automated Workflows",
    description:
      "Connect your creative tools with powerful n8n integrations and custom MCP servers.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Palette,
    title: "Style Transfer",
    description:
      "Apply the aesthetic of Vermeer, Van Gogh, or any artist to your digital creations.",
    color: "from-pink-500 to-rose-500",
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
          <h2 className="text-4xl md:text-5xl font-display mb-4">
            <span className="gradient-text">Cosmic</span> Creative Tools
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Everything you need to create, distribute, and monetize your digital
            content across the multiverse.
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
              className="group p-6 glass rounded-2xl card-hover"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2 group-hover:text-gold-400 transition-colors">
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
