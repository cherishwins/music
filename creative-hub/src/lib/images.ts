/**
 * Image Generation for Album Artwork
 * Uses Vercel AI SDK with xAI Grok for image generation
 */

import { generateImage } from "ai";
import { xai } from "@ai-sdk/xai";
import { put } from "@vercel/blob";

export interface GeneratedImage {
  imageUrl: string;
  downloadUrl: string;
  pathname: string;
}

/**
 * Generate album artwork using xAI Grok-2 Image
 */
export async function generateAlbumArt(prompt: string): Promise<GeneratedImage> {
  // Generate image using xAI Grok-2 Image model
  const { image } = await generateImage({
    model: xai.image("grok-2-image-1212"),
    prompt: `Album cover artwork: ${prompt}. High quality, professional music album art style, square format, visually striking.`,
  });

  // Get the image data as buffer
  const buffer = Buffer.from(image.uint8Array);

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
 * Generate a logo image from a prompt
 */
export async function generateLogo(prompt: string): Promise<GeneratedImage> {
  const { image } = await generateImage({
    model: xai.image("grok-2-image-1212"),
    prompt: `Logo design: ${prompt}. Clean, modern, professional logo, minimal, works at small sizes, no text unless specified.`,
  });

  const buffer = Buffer.from(image.uint8Array);
  const filename = generateImageFilename("logo");

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
 * Generate a social media banner
 */
export async function generateBanner(
  prompt: string,
  aspectRatio: "16:9" | "3:1" | "2:1" = "16:9"
): Promise<GeneratedImage> {
  const { image } = await generateImage({
    model: xai.image("grok-2-image-1212"),
    prompt: `Social media banner (${aspectRatio} aspect ratio): ${prompt}. Professional, eye-catching, suitable for Twitter/Discord/Telegram header.`,
  });

  const buffer = Buffer.from(image.uint8Array);
  const filename = generateImageFilename("banner");

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
