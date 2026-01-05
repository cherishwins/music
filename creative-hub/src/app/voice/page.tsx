'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MainNav } from '@/components/navigation/main-nav'
import VoiceChat from '@/components/VoiceChat'
import { ArrowLeft, Mic, Sparkles, Zap, MessageSquare } from 'lucide-react'

export default function VoicePage() {
  return (
    <main className="min-h-screen bg-obsidian">
      <MainNav />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Ecosystem
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E040FB] to-[#7C4DFF] flex items-center justify-center">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-headline text-white">WHITE TIGER</h1>
                <h2 className="text-3xl font-headline text-[#E040FB]">VOICE AI</h2>
              </div>
            </div>

            <p className="text-white/50">
              Talk to the Tiger. Press and hold to speak, or type your message.
              AI-powered assistant for the JPanda ecosystem.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              { icon: Mic, label: 'Voice Input', desc: 'Whisper STT' },
              { icon: Sparkles, label: 'AI Brain', desc: 'Grok + Claude' },
              { icon: MessageSquare, label: 'Voice Reply', desc: 'ElevenLabs' },
            ].map((feature, i) => (
              <div
                key={feature.label}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-center"
              >
                <feature.icon className="w-6 h-6 mx-auto mb-2 text-[#E040FB]" />
                <div className="text-sm font-medium text-white">{feature.label}</div>
                <div className="text-xs text-white/40">{feature.desc}</div>
              </div>
            ))}
          </motion.div>

          {/* Voice Chat Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
          >
            <VoiceChat className="min-h-[500px]" />
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-white/30 uppercase tracking-widest mb-4">
              Try asking
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Generate a meme coin anthem',
                'Check the rug score for BONK',
                'Create a brand for my token',
                'What\'s trending on TON?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  className="px-4 py-2 rounded-full text-sm text-white/60 bg-white/[0.03] border border-white/10 hover:border-[#E040FB]/30 hover:text-white transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Payment info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5">
              <Zap className="w-4 h-4 text-[#E040FB]" />
              <span className="text-sm text-white/50">
                First 10 messages free, then
                <span className="text-[#00E5FF] font-medium ml-1">1 Star</span> or
                <span className="text-[#E040FB] font-medium ml-1">0.05 TON</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
