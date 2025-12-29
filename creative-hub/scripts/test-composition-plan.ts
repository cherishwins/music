#!/usr/bin/env npx tsx

/**
 * Test Composition Plan Creation (FREE - NO CREDITS)
 *
 * This script tests the ElevenLabs Music API composition plan endpoint.
 * Creating composition plans is FREE and doesn't use any credits.
 *
 * Usage:
 *   npx tsx scripts/test-composition-plan.ts
 *
 * Or with custom prompt:
 *   npx tsx scripts/test-composition-plan.ts "Korean trap with piano and 808s"
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

interface SongSection {
  section_name?: string;
  sectionName?: string;
  positive_local_styles?: string[];
  positiveLocalStyles?: string[];
  negative_local_styles?: string[];
  negativeLocalStyles?: string[];
  duration_ms?: number;
  durationMs?: number;
  lines?: string[];
}

interface CompositionPlan {
  positive_global_styles?: string[];
  positiveGlobalStyles?: string[];
  negative_global_styles?: string[];
  negativeGlobalStyles?: string[];
  sections: SongSection[];
}

async function createCompositionPlan(
  prompt: string,
  durationMs: number = 120000
): Promise<CompositionPlan> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not set in environment");
  }

  console.log("\n📝 Creating composition plan (FREE - no credits used)...\n");
  console.log(`Prompt: "${prompt}"`);
  console.log(`Duration: ${durationMs / 1000}s (${durationMs}ms)\n`);

  const response = await fetch(`${ELEVENLABS_API_BASE}/music/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt,
      music_length_ms: durationMs,
      model_id: "music_v1",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return await response.json();
}

function normalizePlan(plan: CompositionPlan) {
  return {
    positive_global_styles: plan.positiveGlobalStyles || plan.positive_global_styles || [],
    negative_global_styles: plan.negativeGlobalStyles || plan.negative_global_styles || [],
    sections: plan.sections.map((section: SongSection) => ({
      section_name: section.sectionName || section.section_name || "Section",
      positive_local_styles: section.positiveLocalStyles || section.positive_local_styles || [],
      negative_local_styles: section.negativeLocalStyles || section.negative_local_styles || [],
      duration_ms: section.durationMs || section.duration_ms || 30000,
      lines: section.lines || [],
    })),
  };
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

async function main() {
  // Get prompt from command line or use default
  const prompt = process.argv[2] || `
    Emotional Korean hip-hop track, 92 BPM, minor key.

    Sound: Piano-driven melody, crisp drums, atmospheric pads.
    Urban Seoul sounds subtly layered.
    Building intensity throughout.

    Vocals: Male Korean rapper, strained but determined delivery.
    Korean lyrics with occasional English phrases.

    Theme: Hell Joseon struggle, underdog rising against the system.
  `.trim();

  try {
    const rawPlan = await createCompositionPlan(prompt, 180000); // 3 minutes
    const plan = normalizePlan(rawPlan);

    console.log("✅ Composition plan created successfully!\n");
    console.log("═".repeat(60));
    console.log("\n🎵 GLOBAL STYLES\n");

    console.log("Positive (include these):");
    plan.positive_global_styles.forEach((style: string) => console.log(`  ✓ ${style}`));

    console.log("\nNegative (avoid these):");
    plan.negative_global_styles.forEach((style: string) => console.log(`  ✗ ${style}`));

    console.log("\n" + "═".repeat(60));
    console.log("\n📋 SECTIONS\n");

    let totalDuration = 0;
    plan.sections.forEach((section: {
      section_name: string;
      positive_local_styles: string[];
      negative_local_styles: string[];
      duration_ms: number;
      lines: string[];
    }, i: number) => {
      totalDuration += section.duration_ms;
      console.log(`${i + 1}. ${section.section_name} (${formatDuration(section.duration_ms)})`);
      console.log(`   Styles: ${section.positive_local_styles.slice(0, 4).join(", ")}`);
      if (section.lines.length > 0) {
        console.log(`   Lyrics: "${section.lines[0]}..."`);
      }
      console.log();
    });

    console.log("═".repeat(60));
    console.log(`\n📊 SUMMARY`);
    console.log(`   Total sections: ${plan.sections.length}`);
    console.log(`   Total duration: ${formatDuration(totalDuration)}`);
    console.log(`   Credits used: 0 (composition plans are FREE!)`);

    console.log("\n" + "═".repeat(60));
    console.log("\n📄 RAW JSON (for use in API calls):\n");
    console.log(JSON.stringify(plan, null, 2));

    // Save to file
    const fs = await import("fs");
    const outputPath = resolve(process.cwd(), "outputs", "test_composition_plan.json");
    fs.mkdirSync(resolve(process.cwd(), "outputs"), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(plan, null, 2));
    console.log(`\n💾 Plan saved to: ${outputPath}`);

  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

main();
