"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  FileText,
  Video,
  ArrowRight,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Wand2,
  Loader2,
  Check,
  Download,
  Play,
  Palette,
  Coins,
  X,
} from "lucide-react";
import Link from "next/link";
import { MultiRailCheckout } from "@/components/payments/multi-rail-checkout";

const creationModes = [
  {
    id: "thread-to-hit",
    title: "Thread to Hit",
    description:
      "Transform any story into a REAL SONG with vocals + music. Powered by ElevenLabs Music AI.",
    icon: Music,
    color: "from-gold to-gold-muted",
    features: [
      "Real vocals + music",
      "Multiple genres",
      "AI lyrics from your story",
      "Download ready MP3",
    ],
    endpoint: "/api/generate/thread-to-hit",
    credits: 10, // Credits required
  },
  {
    id: "quantum-slides",
    title: "Arcane Slides",
    description:
      "Forge presentations of power with AI. Your ideas, transmuted into visual narratives.",
    icon: FileText,
    color: "from-gold-light to-gold",
    features: [
      "AI content generation",
      "Custom visual themes",
      "Esoteric metaphors",
      "Multiple styles",
    ],
    endpoint: "/api/generate/slides",
  },
  {
    id: "multiverse-video",
    title: "Vision Prompts",
    description:
      "Create video prompts optimized for AI video generation tools like Runway ML.",
    icon: Video,
    color: "from-gold-muted to-gold-dark",
    features: [
      "Optimized prompts",
      "Scene breakdowns",
      "Style guidance",
      "Duration suggestions",
    ],
    endpoint: "/api/generate/video-prompt",
  },
  {
    id: "voice-studio",
    title: "Voice Crucible",
    description:
      "Generate refined AI voices with ElevenLabs for podcasts, audiobooks, and voiceovers.",
    icon: Wand2,
    color: "from-gold to-gold-light",
    features: [
      "Multiple voices",
      "Emotion control",
      "High quality audio",
      "Instant generation",
    ],
    endpoint: "/api/generate/voice",
  },
  {
    id: "brand-forge",
    title: "Brand Forge",
    description:
      "Mint your meme coin identity. Generate name, ticker, logo prompts, colors, and social kit in one click.",
    icon: Coins,
    color: "from-purple-500 to-gold",
    features: [
      "Name & ticker",
      "Logo concepts",
      "Color palette",
      "Social media kit",
    ],
    endpoint: "/api/generate/brand",
  },
];

type GenerationStatus = "idle" | "generating" | "complete" | "error";

interface GenerationResult {
  // Thread to hit (new music API)
  title?: string;
  lyrics?: string;
  downloadUrl?: string;      // Direct download link!
  audio?: string;            // Base64 fallback
  songId?: string;
  style?: string;
  durationMs?: number;

  // Slides
  slides?: Array<{
    title: string;
    content: string[];
    notes: string;
    visualSuggestion: string;
  }>;

  // Video
  prompt?: string;
  scenes?: string[];
  duration?: string;
  mood?: string;

  // Voice (simple)
  simpleAudio?: string;
  format?: string;

  // Brand
  brand?: {
    name: string;
    ticker: string;
    tagline?: string;
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
    };
    logoPrompt?: string;
    socialBio?: string;
    elevator?: string;
  };
  tier?: string;

  // Error
  error?: string;
}

// Voice options for Thread-to-Hit
const VOICES = [
  { id: "adam", name: "Adam", description: "Deep male - great for hype content" },
  { id: "arnold", name: "Arnold", description: "Strong male - powerful delivery" },
  { id: "josh", name: "Josh", description: "Casual male - authentic vibe" },
  { id: "sam", name: "Sam", description: "Narrator - professional" },
  { id: "antoni", name: "Antoni", description: "Warm male - emotional" },
  { id: "rachel", name: "Rachel", description: "Calm female - soothing" },
  { id: "domi", name: "Domi", description: "Energetic female - dynamic" },
  { id: "bella", name: "Bella", description: "Soft female - gentle" },
];

// Voice styles (for voice studio)
const VOICE_STYLES = [
  { id: "hype", name: "Hype", description: "Energetic, motivational delivery" },
  { id: "emotional", name: "Emotional", description: "Heartfelt storytelling" },
  { id: "narration", name: "Narration", description: "Clean, professional" },
  { id: "intense", name: "Intense", description: "Aggressive, powerful" },
];

// Music styles (for Thread-to-Hit) - Grammy-level production
const MUSIC_STYLES = [
  { id: "trap", name: "Trap", description: "Metro Boomin style, 808s, hi-hats" },
  { id: "drill", name: "Drill", description: "UK drill, sliding 808s, aggressive" },
  { id: "boombap", name: "Boom Bap", description: "J Dilla style, 90s samples" },
  { id: "piano", name: "Piano Ballad", description: "Adele style, grand piano, emotional" },
  { id: "rnb", name: "R&B", description: "The Weeknd style, smooth, soulful" },
  { id: "gospel", name: "Gospel", description: "Kirk Franklin style, choir, uplifting" },
  { id: "cinematic", name: "Cinematic", description: "Hans Zimmer style, orchestral, epic" },
  { id: "afrobeats", name: "Afrobeats", description: "Burna Boy style, danceable groove" },
  { id: "pop", name: "Pop", description: "Max Martin style, radio-ready hits" },
  { id: "soul", name: "Soul", description: "Motown inspired, live band feel" },
  { id: "lofi", name: "Lo-Fi", description: "Chill beats, vinyl texture, relaxing" },
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ko", name: "Korean" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
];

// Brand tiers for Brand Forge
const BRAND_TIERS = [
  { id: "standard", name: "Standard", description: "Clean, modern, professional" },
  { id: "outlier", name: "Outlier", description: "Luxury hip-hop, urban elite" },
  { id: "1929", name: "1929.world", description: "Art deco luxury, gilded mystique" },
  { id: "juche", name: "Juche", description: "Revolutionary, bold, purposeful" },
];

// Pricing for each mode (in USD)
const MODE_PRICING: Record<string, number> = {
  "thread-to-hit": 1.00,
  "quantum-slides": 0.25,
  "multiverse-video": 0.25,
  "voice-studio": 0.10,
  "brand-forge": 0.25,
};

export default function CreatePage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [inputType, setInputType] = useState<"text" | "url" | "file">("text");
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Payment state
  const [showCheckout, setShowCheckout] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<Record<string, string> | null>(null);

  // Thread-to-Hit options (music generation)
  const [selectedMusicStyle, setSelectedMusicStyle] = useState("trap");

  // Voice Studio options
  const [selectedVoice, setSelectedVoice] = useState("adam");
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState("hype");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Brand Forge options
  const [selectedBrandTier, setSelectedBrandTier] = useState("standard");

  const selectedModeData = creationModes.find((m) => m.id === selectedMode);

  // Build request body based on mode
  const buildRequestBody = (): Record<string, string> => {
    const body: Record<string, string> = {};
    switch (selectedMode) {
      case "thread-to-hit":
        body.content = inputValue;
        body.style = selectedMusicStyle;
        body.durationMs = "120000";
        break;
      case "quantum-slides":
        body.topic = inputValue;
        body.style = "quantum";
        break;
      case "multiverse-video":
        body.concept = inputValue;
        body.style = "cinematic";
        break;
      case "voice-studio":
        body.text = inputValue;
        body.voiceId = selectedVoice;
        break;
      case "brand-forge":
        body.concept = inputValue;
        body.tier = selectedBrandTier;
        break;
    }
    return body;
  };

  // Step 1: User clicks generate - show checkout
  const handleGenerate = async () => {
    if (!selectedModeData || !inputValue.trim()) return;

    // Save the request for after payment
    setPendingRequest(buildRequestBody());
    setShowCheckout(true);
  };

  // Step 2: After payment success - actually generate
  const handlePaymentSuccess = async (method: string) => {
    setShowCheckout(false);

    if (!selectedModeData || !pendingRequest) return;

    setStatus("generating");
    setResult(null);

    try {
      const response = await fetch(selectedModeData.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setResult(data);
      setStatus("complete");
    } catch (error) {
      console.error("Generation error:", error);
      setResult({
        error: error instanceof Error ? error.message : "Generation failed",
      });
      setStatus("error");
    } finally {
      setPendingRequest(null);
    }
  };

  // Cancel payment
  const handlePaymentCancel = () => {
    setShowCheckout(false);
    setPendingRequest(null);
  };

  const handleDownloadAudio = (audioData?: string, filename = "audio.mp3") => {
    if (!audioData) return;

    const byteCharacters = atob(audioData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/mpeg" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Payment Checkout Modal */}
      <AnimatePresence>
        {showCheckout && selectedMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md"
            >
              <button
                onClick={handlePaymentCancel}
                className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <MultiRailCheckout
                productId={selectedMode}
                productName={selectedModeData?.title || "Generation"}
                priceUsd={MODE_PRICING[selectedMode] || 0.25}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-gold border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-xl font-headline gradient-text-gold">
            ALCHEMY
          </Link>
          <span className="text-gold-muted">/</span>
          <span className="text-white/60">Laboratory</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-headline mb-4">
            What would you like to{" "}
            <span className="gradient-text-gold">transmute</span>?
          </h1>
          <p className="text-white/60 text-lg">
            Choose your transmutation method to begin the transformation
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
              onClick={() => {
                setSelectedMode(mode.id);
                setResult(null);
                setStatus("idle");
              }}
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
                  <p className="text-white/60 text-sm mb-4">
                    {mode.description}
                  </p>

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
        <AnimatePresence mode="wait">
          {selectedMode && (
            <motion.div
              key={selectedMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
                  placeholder={
                    selectedMode === "voice-studio"
                      ? "Enter text to convert to speech..."
                      : selectedMode === "quantum-slides"
                        ? "Enter your presentation topic or content..."
                        : selectedMode === "multiverse-video"
                          ? "Describe your video concept..."
                          : "Paste your thread, text, or content here..."
                  }
                  className="w-full h-48 p-4 bg-white/5 rounded-xl border border-white/10 focus:border-gold-400 focus:outline-none resize-none"
                  disabled={status === "generating"}
                />
              )}

              {inputType === "url" && (
                <input
                  type="url"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://example.com/thread/123"
                  className="w-full p-4 bg-white/5 rounded-xl border border-white/10 focus:border-gold-400 focus:outline-none"
                  disabled={status === "generating"}
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

              {/* Brand Tier selection for Brand Forge */}
              {selectedMode === "brand-forge" && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                  <label className="block text-sm text-white/60 mb-3">Brand Aesthetic</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {BRAND_TIERS.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedBrandTier(tier.id)}
                        disabled={status === "generating"}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedBrandTier === tier.id
                            ? "border-gold-400 bg-gold-500/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="font-medium text-sm">{tier.name}</div>
                        <div className="text-xs text-white/50 mt-1">{tier.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Music Style Selection for Thread-to-Hit */}
              {selectedMode === "thread-to-hit" && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                  <label className="block text-sm text-white/60 mb-3">Music Genre</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {MUSIC_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedMusicStyle(style.id)}
                        disabled={status === "generating"}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedMusicStyle === style.id
                            ? "border-gold-400 bg-gold-500/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="font-medium text-sm">{style.name}</div>
                        <div className="text-xs text-white/50 mt-1">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice options for Voice Studio */}
              {selectedMode === "voice-studio" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-white/5 rounded-xl">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Voice</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full p-3 bg-white/10 rounded-lg border border-white/10 focus:border-gold-400 focus:outline-none text-white"
                      disabled={status === "generating"}
                    >
                      {VOICES.map((voice) => (
                        <option key={voice.id} value={voice.id} className="bg-obsidian">
                          {voice.name} - {voice.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Style</label>
                    <select
                      value={selectedVoiceStyle}
                      onChange={(e) => setSelectedVoiceStyle(e.target.value)}
                      className="w-full p-3 bg-white/10 rounded-lg border border-white/10 focus:border-gold-400 focus:outline-none text-white"
                      disabled={status === "generating"}
                    >
                      {VOICE_STYLES.map((style) => (
                        <option key={style.id} value={style.id} className="bg-obsidian">
                          {style.name} - {style.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full p-3 bg-white/10 rounded-lg border border-white/10 focus:border-gold-400 focus:outline-none text-white"
                      disabled={status === "generating"}
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code} className="bg-obsidian">
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Generate button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={
                    status === "generating" || !inputValue.trim()
                  }
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "generating" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : status === "complete" ? (
                    <>
                      <Check className="w-5 h-5" />
                      Generate Again
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Content
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Results Section */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 pt-8 border-t border-white/10"
                  >
                    {result.error ? (
                      <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
                        {result.error}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold gradient-text-gold">
                          Transmutation Complete!
                        </h3>

                        {/* Thread to Hit Result - NEW MUSIC API */}
                        {result.lyrics && (result.downloadUrl || result.audio) && (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-xl gradient-text-gold">
                                🎵 {result.title}
                              </h4>
                              <div className="flex items-center gap-2 text-white/40 text-sm">
                                <span className="px-2 py-1 bg-gold-500/20 rounded text-gold-400">{result.style}</span>
                                <span className="px-2 py-1 bg-white/10 rounded">{Math.round((result.durationMs || 120000) / 1000)}s</span>
                              </div>
                            </div>

                            {/* Audio Player */}
                            <div className="p-4 bg-gradient-to-br from-gold-500/10 to-transparent rounded-xl space-y-4 border border-gold-500/20">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
                                  <Play className="w-6 h-6 text-gold" />
                                </div>
                                <div className="flex-1">
                                  <audio
                                    controls
                                    src={result.downloadUrl || `data:audio/mpeg;base64,${result.audio}`}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {result.downloadUrl ? (
                                  <a
                                    href={result.downloadUrl}
                                    download={`${result.title?.replace(/\s+/g, '-').toLowerCase() || 'track'}.mp3`}
                                    className="btn-primary flex items-center gap-2 text-sm"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download Your Song
                                  </a>
                                ) : (
                                  <button
                                    onClick={() => handleDownloadAudio(result.audio, `${result.title?.replace(/\s+/g, '-').toLowerCase() || 'track'}.mp3`)}
                                    className="btn-primary flex items-center gap-2 text-sm"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download Your Song
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Lyrics */}
                            <details className="group" open>
                              <summary className="cursor-pointer text-gold-400 hover:text-gold-300 transition-colors font-semibold">
                                📝 View Lyrics
                              </summary>
                              <pre className="mt-4 p-4 bg-white/5 rounded-xl text-white/80 whitespace-pre-wrap text-sm max-h-96 overflow-y-auto border border-white/10">
                                {result.lyrics}
                              </pre>
                            </details>
                          </div>
                        )}

                        {/* Slides Result */}
                        {result.slides && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg">
                              {result.slides.length} Slides Generated
                            </h4>
                            <div className="grid gap-4">
                              {result.slides.map((slide, i) => (
                                <div
                                  key={i}
                                  className="p-4 bg-white/5 rounded-xl"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs flex items-center justify-center">
                                      {i + 1}
                                    </span>
                                    <h5 className="font-semibold">
                                      {slide.title}
                                    </h5>
                                  </div>
                                  <ul className="list-disc list-inside text-white/60 text-sm space-y-1">
                                    {slide.content.map((point, j) => (
                                      <li key={j}>{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Video Prompt Result */}
                        {result.prompt && result.scenes && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">
                                Video Prompt
                              </h4>
                              <p className="p-4 bg-white/5 rounded-xl text-white/80">
                                {result.prompt}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-white/40 text-sm">
                                  Duration
                                </span>
                                <p className="text-gold-400">
                                  {result.duration}
                                </p>
                              </div>
                              <div>
                                <span className="text-white/40 text-sm">
                                  Mood
                                </span>
                                <p className="text-gold-400">{result.mood}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Scenes</h4>
                              <ol className="list-decimal list-inside space-y-2 text-white/60">
                                {result.scenes.map((scene, i) => (
                                  <li key={i}>{scene}</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}

                        {/* Voice Result */}
                        {result.simpleAudio && (
                          <div className="space-y-4">
                            <h4 className="font-semibold">Audio Generated</h4>
                            <div className="flex items-center gap-4">
                              <audio
                                controls
                                src={`data:audio/mpeg;base64,${result.simpleAudio}`}
                                className="flex-1"
                              />
                              <button
                                onClick={() => handleDownloadAudio(result.simpleAudio, "voice-generation.mp3")}
                                className="btn-secondary flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Brand Forge Result */}
                        {result.brand && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <Palette className="w-6 h-6 text-gold" />
                              <h4 className="font-semibold text-xl">
                                {result.brand.name}
                              </h4>
                              <span className="px-2 py-1 bg-gold-500/20 rounded text-gold-400 text-sm font-mono">
                                ${result.brand.ticker}
                              </span>
                            </div>

                            {result.brand.tagline && (
                              <p className="text-lg text-white/80 italic">
                                &ldquo;{result.brand.tagline}&rdquo;
                              </p>
                            )}

                            {/* Color Palette */}
                            {result.brand.colors && (
                              <div className="p-4 bg-white/5 rounded-xl">
                                <h5 className="text-sm text-white/60 mb-3">Color Palette</h5>
                                <div className="flex gap-3">
                                  {Object.entries(result.brand.colors).map(([name, color]) => (
                                    <div key={name} className="text-center">
                                      <div
                                        className="w-12 h-12 rounded-lg border border-white/20 mb-1"
                                        style={{ backgroundColor: color }}
                                      />
                                      <span className="text-xs text-white/50 capitalize">{name}</span>
                                      <div className="text-xs font-mono text-white/40">{color}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Logo Prompt */}
                            {result.brand.logoPrompt && (
                              <div className="p-4 bg-white/5 rounded-xl">
                                <h5 className="text-sm text-white/60 mb-2">Logo Generation Prompt</h5>
                                <p className="text-white/80 text-sm">{result.brand.logoPrompt}</p>
                              </div>
                            )}

                            {/* Social Bio */}
                            {result.brand.socialBio && (
                              <div className="p-4 bg-white/5 rounded-xl">
                                <h5 className="text-sm text-white/60 mb-2">Social Media Bio</h5>
                                <p className="text-white/80">{result.brand.socialBio}</p>
                              </div>
                            )}

                            {/* Elevator Pitch */}
                            {result.brand.elevator && (
                              <div className="p-4 bg-gradient-to-br from-gold-500/10 to-transparent rounded-xl border border-gold-500/20">
                                <h5 className="text-sm text-gold-400 mb-2">Elevator Pitch</h5>
                                <p className="text-white/90">{result.brand.elevator}</p>
                              </div>
                            )}

                            <div className="text-xs text-white/40">
                              Tier: {result.tier || "standard"}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
