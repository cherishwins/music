/**
 * Image Generation for Album Artwork
 * Uses Vercel AI Gateway with Gemini for image generation
 */

import { generateImage } from "ai";
import { google } from "@ai-sdk/google";
import { put } from "@vercel/blob";

export interface GeneratedImage {
  imageUrl: string;
  downloadUrl: string;
  pathname: string;
}

/**
 * Generate album artwork using AI
 */
export async function generateAlbumArt(prompt: string): Promise<GeneratedImage> {
  // Generate image using Google Imagen
  const result = await generateImage({
    model: google.image("imagen-4.0-generate-001"),
    prompt: `Album cover artwork: ${prompt}. High quality, professional music album art style.`,
    aspectRatio: "1:1",
  });

  // Get the image data as buffer
  const buffer = Buffer.from(result.image.uint8Array);

  // Generate unique filename
  const filename = generateImageFilename("album-art");

  // Upload to Vercel Blob
  const blob = await put(filename, buffer, {
    access: "public",
    contentType: "image/png",
    addRandomSuffix: true,
  });

  return {
    imageUrl: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
  };
}

/**
 * Generate a unique filename for images
 */
function generateImageFilename(type: string): string {
  const timestamp = Date.now();
  return `images/${type}-${timestamp}.png`;
}
