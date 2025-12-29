/**
 * File Storage for Generated Tracks
 * Uses Vercel Blob for production-grade file delivery
 */

import { put } from "@vercel/blob";

export interface StoredTrack {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
}

/**
 * Upload a track to Vercel Blob storage
 */
export async function uploadTrack(
  audioBuffer: Buffer,
  filename: string,
  contentType: string = "audio/mpeg"
): Promise<StoredTrack> {
  const blob = await put(filename, audioBuffer, {
    access: "public",
    contentType,
    addRandomSuffix: true, // Prevent collisions
  });

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    size: audioBuffer.length,
  };
}

/**
 * Generate a unique filename for a track
 */
export function generateTrackFilename(title: string, type: "voice" | "beat" | "final" | "song"): string {
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  const timestamp = Date.now();
  return `tracks/${sanitized}-${type}-${timestamp}.mp3`;
}
