"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceCloneUploaderProps {
  userId?: string;
  onVoiceCloned?: (voiceId: string, name: string) => void;
  onError?: (error: string) => void;
}

export function VoiceCloneUploader({
  userId,
  onVoiceCloned,
  onError,
}: VoiceCloneUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/m4a", "audio/mp4"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
      setError("Please upload an MP3, WAV, or M4A file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB");
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Auto-generate voice name from filename
    if (!voiceName) {
      const nameFromFile = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setVoiceName(nameFromFile.charAt(0).toUpperCase() + nameFromFile.slice(1));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !voiceName.trim()) {
      setError("Please select a file and enter a voice name");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("name", voiceName.trim());
      formData.append("audio", selectedFile);
      formData.append("description", `Custom voice clone: ${voiceName}`);
      if (userId) {
        formData.append("userId", userId);
      }

      setUploadProgress(30);

      const response = await fetch("/api/voice/clone", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(70);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Voice cloning failed");
      }

      setUploadProgress(100);
      setSuccess(`Voice "${voiceName}" cloned successfully!`);
      setSelectedFile(null);
      setVoiceName("");

      if (onVoiceCloned) {
        onVoiceCloned(data.voiceId, voiceName);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Voice cloning failed";
      setError(message);
      if (onError) {
        onError(message);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tiger to-neon-cyan flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Clone Your Voice</h3>
          <p className="text-xs text-white/60">Upload 1-3 min of clear audio</p>
        </div>
      </div>

      {/* Drop Zone */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer
          ${dragOver ? "border-tiger bg-tiger/10" : "border-white/20 hover:border-white/40"}
          ${selectedFile ? "border-neon-cyan bg-neon-cyan/5" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/m4a"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          {selectedFile ? (
            <>
              <div className="w-12 h-12 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-white/60 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white font-medium">Drop audio file or click to upload</p>
              <p className="text-white/60 text-sm">MP3, WAV, or M4A (max 10MB)</p>
            </>
          )}
        </div>
      </motion.div>

      {/* Voice Name Input */}
      <div className="space-y-2">
        <label className="text-sm text-white/60">Voice Name</label>
        <input
          type="text"
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
          placeholder="My Custom Voice"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-tiger focus:ring-1 focus:ring-tiger"
          disabled={isUploading}
        />
      </div>

      {/* Tips */}
      <div className="bg-white/5 rounded-lg p-3 text-xs text-white/60 space-y-1">
        <p className="font-medium text-white/80">Tips for best results:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Record 1-3 minutes of natural speaking</li>
          <li>Use a quiet room with no echo</li>
          <li>Speak clearly at a consistent volume</li>
          <li>Avoid background music or noise</li>
        </ul>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-tiger to-neon-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center text-sm text-white/60">
              {uploadProgress < 30 && "Uploading audio..."}
              {uploadProgress >= 30 && uploadProgress < 70 && "Cloning voice..."}
              {uploadProgress >= 70 && "Finalizing..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clone Button */}
      <motion.button
        onClick={handleUpload}
        disabled={!selectedFile || !voiceName.trim() || isUploading}
        className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all
          ${selectedFile && voiceName.trim() && !isUploading
            ? "bg-gradient-to-r from-tiger to-neon-cyan text-white hover:shadow-lg hover:shadow-tiger/30"
            : "bg-white/10 text-white/40 cursor-not-allowed"
          }
        `}
        whileHover={selectedFile && voiceName.trim() && !isUploading ? { scale: 1.02 } : {}}
        whileTap={selectedFile && voiceName.trim() && !isUploading ? { scale: 0.98 } : {}}
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Cloning Voice...
          </span>
        ) : (
          "Clone My Voice"
        )}
      </motion.button>

      {/* Pricing Note */}
      <p className="text-center text-xs text-white/40">
        Voice cloning is included with your subscription
      </p>
    </div>
  );
}

export default VoiceCloneUploader;
