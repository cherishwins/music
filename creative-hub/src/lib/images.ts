/**
 * Image Generation for Album Artwork
 * Uses Vercel AI Gateway with Gemini for image generation
 */

import { experimental_generateImage as generateImage, gateway } from "ai";
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
  // Generate image using Vercel AI Gateway
  const result = await generateImage({
    model: gateway("google/gemini-3-pro-image"),
    prompt: `Album cover artwork: ${prompt}. High quality, professional music album art style.`,
  });

  // Get the image data
  const imageData = result.image;

  // Convert base64 to buffer if needed
  const buffer = typeof imageData === "string"
    ? Buffer.from(imageData, "base64")
    : Buffer.from(await imageData.arrayBuffer());

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
