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
} from "lucide-react";
import Link from "next/link";

const creationModes = [
  {
    id: "thread-to-hit",
    title: "Thread to Hit",
    description:
      "Transmute forum threads or social posts into polished songs with AI-forged lyrics, beats, and vocals.",
    icon: Music,
    color: "from-gold to-gold-muted",
    features: [
      "Story essence extraction",
      "AI lyric synthesis",
      "Suno music generation",
      "Multiple styles",
    ],
    endpoint: "/api/generate/thread-to-hit",
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
];

type GenerationStatus = "idle" | "generating" | "complete" | "error";

interface GenerationResult {
  // Thread to hit
  generationId?: string;
  title?: string;
  lyrics?: string;

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

  // Voice
  audio?: string;
  format?: string;

  // Error
  error?: string;
}

export default function CreatePage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [inputType, setInputType] = useState<"text" | "url" | "file">("text");
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);

  const selectedModeData = creationModes.find((m) => m.id === selectedMode);

  const handleGenerate = async () => {
    if (!selectedModeData || !inputValue.trim()) return;

    setStatus("generating");
    setResult(null);

    try {
      const body: Record<string, string> = {};

      // Build request body based on mode
      switch (selectedMode) {
        case "thread-to-hit":
          body.content = inputValue;
          body.style = "motivational hip-hop";
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
          body.voiceId = "adam";
          break;
      }

      const response = await fetch(selectedModeData.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    }
  };

  const handleDownloadAudio = () => {
    if (!result?.audio) return;

    const byteCharacters = atob(result.audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/mpeg" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voice-generation.mp3";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-obsidian">
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

                        {/* Thread to Hit Result */}
                        {result.lyrics && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-lg">
                                {result.title}
                              </h4>
                              <span className="text-white/40 text-sm">
                                ID: {result.generationId}
                              </span>
                            </div>
                            <pre className="p-4 bg-white/5 rounded-xl text-white/80 whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
                              {result.lyrics}
                            </pre>
                            <p className="text-gold text-sm">
                              Song is being transmuted by Suno. Check back in a
                              few minutes!
                            </p>
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
                        {result.audio && (
                          <div className="space-y-4">
                            <h4 className="font-semibold">Audio Generated</h4>
                            <div className="flex items-center gap-4">
                              <audio
                                controls
                                src={`data:audio/mpeg;base64,${result.audio}`}
                                className="flex-1"
                              />
                              <button
                                onClick={handleDownloadAudio}
                                className="btn-secondary flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
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
