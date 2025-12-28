"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Music,
  FileText,
  Video,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Wand2,
} from "lucide-react";
import Link from "next/link";

const creationModes = [
  {
    id: "thread-to-hit",
    title: "Thread to Hit",
    description:
      "Transform a forum thread or social post into a polished song with AI-generated lyrics, beats, and vocals.",
    icon: Music,
    color: "from-purple-500 to-pink-500",
    features: [
      "Hero's journey story extraction",
      "NEFFEX-style lyric generation",
      "MusicGen beats",
      "RVC voice conversion",
    ],
  },
  {
    id: "quantum-slides",
    title: "Quantum Slide Deck",
    description:
      "Generate reality-bending presentations with AI. Your ideas, transformed into visual narratives.",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    features: [
      "AI content generation",
      "Custom visual themes",
      "Physics metaphors",
      "Export to PDF/PPTX",
    ],
  },
  {
    id: "multiverse-video",
    title: "Multiverse Video",
    description:
      "Create videos with Runway ML that branch across infinite creative possibilities.",
    icon: Video,
    color: "from-green-500 to-emerald-500",
    features: [
      "Text-to-video generation",
      "Style transfer",
      "Motion brush",
      "4K export",
    ],
  },
  {
    id: "voice-studio",
    title: "Voice Studio",
    description:
      "Clone and transform voices with ElevenLabs for podcasts, audiobooks, and voiceovers.",
    icon: Wand2,
    color: "from-orange-500 to-red-500",
    features: [
      "Voice cloning",
      "Text-to-speech",
      "Voice conversion",
      "Multi-language support",
    ],
  },
];

export default function CreatePage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [inputType, setInputType] = useState<"text" | "url" | "file">("text");
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-xl font-display gradient-text">
            Creative Hub
          </Link>
          <span className="text-white/40">/</span>
          <span className="text-white/60">Create</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display mb-4">
            What would you like to <span className="gradient-text">create</span>?
          </h1>
          <p className="text-white/60 text-lg">
            Choose a creation mode to begin your multiverse journey
          </p>
        </motion.div>

        {/* Creation Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {creationModes.map((mode, index) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-6 glass rounded-2xl text-left transition-all group ${
                selectedMode === mode.id
                  ? "ring-2 ring-gold-400"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <mode.icon className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-gold-400 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">{mode.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {mode.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-white/10 rounded text-xs text-white/80"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Input Section - Shows when mode is selected */}
        {selectedMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">
              Provide your source material
            </h2>

            {/* Input type tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { id: "text", label: "Paste Text", icon: FileText },
                { id: "url", label: "Enter URL", icon: LinkIcon },
                { id: "file", label: "Upload File", icon: Upload },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setInputType(type.id as typeof inputType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    inputType === type.id
                      ? "bg-gold-500/20 text-gold-400"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </button>
              ))}
            </div>

            {/* Input field */}
            {inputType === "text" && (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste your thread, text, or content here..."
                className="w-full h-48 p-4 bg-white/5 rounded-xl border border-white/10 focus:border-gold-400 focus:outline-none resize-none"
              />
            )}

            {inputType === "url" && (
              <input
                type="url"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="https://example.com/thread/123"
                className="w-full p-4 bg-white/5 rounded-xl border border-white/10 focus:border-gold-400 focus:outline-none"
              />
            )}

            {inputType === "file" && (
              <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-gold-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p className="text-white/60 mb-2">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-white/40 text-sm">
                  Supports: TXT, PDF, DOCX, MP3, WAV, MP4
                </p>
              </div>
            )}

            {/* Generate button */}
            <div className="flex justify-end mt-6">
              <button className="btn-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Content
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
