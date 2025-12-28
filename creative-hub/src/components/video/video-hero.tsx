"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Lazy load Mux Player for better initial performance
const MuxPlayer = dynamic(
  () => import("@mux/mux-player-react").then((mod) => mod.default),
  { ssr: false }
);

interface VideoHeroProps {
  playbackId?: string;
  fallbackSrc?: string;
  onVideoReady?: () => void;
  onVideoEnded?: () => void;
  className?: string;
  opacity?: number;
}

export function VideoHero({
  playbackId,
  fallbackSrc = "/videos/hero-fallback.mp4",
  onVideoReady,
  onVideoEnded,
  className = "",
  opacity = 1,
}: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [useFallback, setUseFallback] = useState(!playbackId);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8; // Slightly slow motion for cinematic effect
    }
  }, []);

  const handleCanPlay = () => {
    setIsReady(true);
    onVideoReady?.();
  };

  const handleEnded = () => {
    onVideoEnded?.();
  };

  const handleError = () => {
    setUseFallback(true);
    setIsReady(true);
    onVideoReady?.(); // Still trigger ready so loading completes
  };

  return (
    <div
      className={`video-background ${className}`}
      style={{
        opacity,
        transition: "opacity 1s ease-out",
      }}
    >
      {/* Gradient overlay for better text readability */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0.9) 100%)",
        }}
      />

      {useFallback ? (
        // Native video fallback
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={handleCanPlay}
          onEnded={handleEnded}
          onError={handleError}
        >
          <source src={fallbackSrc} type="video/mp4" />
        </video>
      ) : (
        // Mux Player for production
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay="muted"
          loop
          muted
          playsInline
          onCanPlay={handleCanPlay}
          onEnded={handleEnded}
          onError={handleError}
          style={{
            width: "100%",
            height: "100%",
            // Hide controls for background video
            // @ts-ignore - CSS custom properties
            "--controls": "none",
            "--media-object-fit": "cover",
          }}
          metadata={{
            video_id: "hero-background",
            video_title: "Creative Hub Hero",
          }}
        />
      )}

      {/* Loading shimmer effect */}
      {!isReady && (
        <div className="absolute inset-0 bg-cosmic-gradient animate-pulse" />
      )}
    </div>
  );
}
