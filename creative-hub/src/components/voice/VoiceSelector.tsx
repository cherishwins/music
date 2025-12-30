"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Voice {
  id: string;
  key: string;
  name: string;
  type: "preset" | "cloned";
  status?: string;
}

interface VoiceSelectorProps {
  userId?: string;
  selectedVoiceId?: string;
  onVoiceSelect: (voiceId: string, voiceName: string) => void;
  onCloneClick?: () => void;
  showCloneButton?: boolean;
}

export function VoiceSelector({
  userId,
  selectedVoiceId,
  onVoiceSelect,
  onCloneClick,
  showCloneButton = true,
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVoices();
  }, [userId]);

  const fetchVoices = async () => {
    try {
      setLoading(true);
      const url = userId ? `/api/voice/clone?userId=${userId}` : "/api/voice/clone";
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch voices");
      }

      setVoices(data.voices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load voices");
    } finally {
      setLoading(false);
    }
  };

  const clonedVoices = voices.filter((v) => v.type === "cloned");
  const presetVoices = voices.filter((v) => v.type === "preset");

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-24" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cloned Voices */}
      {clonedVoices.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/80">My Voices</span>
            <span className="px-2 py-0.5 bg-tiger/20 text-tiger text-xs rounded-full">
              {clonedVoices.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {clonedVoices.map((voice) => (
              <VoiceCard
                key={voice.key}
                voice={voice}
                isSelected={selectedVoiceId === voice.id}
                onClick={() => onVoiceSelect(voice.id, voice.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Clone Voice Button */}
      {showCloneButton && (
        <motion.button
          onClick={onCloneClick}
          className="w-full py-3 border-2 border-dashed border-tiger/40 rounded-xl text-tiger hover:bg-tiger/5 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Clone Your Voice
        </motion.button>
      )}

      {/* Preset Voices */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-white/80">AI Voices</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presetVoices.slice(0, 6).map((voice) => (
            <VoiceCard
              key={voice.key}
              voice={voice}
              isSelected={selectedVoiceId === voice.id}
              onClick={() => onVoiceSelect(voice.id, voice.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function VoiceCard({
  voice,
  isSelected,
  onClick,
}: {
  voice: Voice;
  isSelected: boolean;
  onClick: () => void;
}) {
  const voiceIcons: Record<string, string> = {
    adam: "Deep & Powerful",
    arnold: "Strong & Bold",
    josh: "Casual & Authentic",
    sam: "Professional",
    antoni: "Warm & Emotional",
    rachel: "Calm & Soothing",
    domi: "Energetic",
    bella: "Soft & Gentle",
  };

  return (
    <motion.button
      onClick={onClick}
      className={`
        relative p-3 rounded-xl border transition-all text-left
        ${isSelected
          ? "border-tiger bg-tiger/10 shadow-lg shadow-tiger/20"
          : "border-white/10 bg-white/5 hover:border-white/20"
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-tiger flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}

      <div className="flex items-center gap-2">
        {/* Voice type icon */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${voice.type === "cloned" ? "bg-gradient-to-br from-tiger to-neon-cyan" : "bg-white/10"}
        `}>
          {voice.type === "cloned" ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </div>

        <div className="min-w-0">
          <p className={`font-medium truncate ${isSelected ? "text-white" : "text-white/80"}`}>
            {voice.name}
          </p>
          <p className="text-xs text-white/40 truncate">
            {voice.type === "cloned" ? "Your voice" : voiceIcons[voice.key] || "AI Voice"}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default VoiceSelector;
