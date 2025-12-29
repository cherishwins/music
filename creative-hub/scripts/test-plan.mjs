#!/usr/bin/env node

/**
 * Quick test of composition plan creation (FREE - no credits)
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env files manually
const loadEnv = (path) => {
  try {
    const content = readFileSync(path, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch { /* ignore */ }
};

loadEnv(resolve(process.cwd(), '.env.local'));
loadEnv(resolve(process.cwd(), '.env'));

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('ERROR: ELEVENLABS_API_KEY not set');
  process.exit(1);
}

console.log('API Key found:', apiKey.substring(0, 8) + '...');
console.log('\nCreating composition plan (FREE - no credits)...\n');

const response = await fetch('https://api.elevenlabs.io/v1/music/plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'xi-api-key': apiKey
  },
  body: JSON.stringify({
    prompt: 'Korean hip-hop track, emotional boom bap style, 92 BPM, minor key. Piano-driven melody with crisp drums. Male Korean rapper with strained but determined delivery. Building intensity throughout. Theme: underdog rising against the system.',
    music_length_ms: 90000,
    model_id: 'music_v1'
  })
});

console.log('Status:', response.status);

if (!response.ok) {
  const error = await response.text();
  console.error('Error:', error);
  process.exit(1);
}

const data = await response.json();

console.log('\n✅ COMPOSITION PLAN CREATED (FREE!)\n');
console.log('═'.repeat(50));

const positiveStyles = data.positiveGlobalStyles || data.positive_global_styles || [];
const negativeStyles = data.negativeGlobalStyles || data.negative_global_styles || [];

console.log('\nPositive Global Styles:');
positiveStyles.forEach(s => console.log('  ✓', s));

console.log('\nNegative Global Styles:');
negativeStyles.forEach(s => console.log('  ✗', s));

console.log('\nSections:');
const sections = data.sections || [];
let totalDuration = 0;

sections.forEach((s, i) => {
  const name = s.sectionName || s.section_name || 'Section';
  const duration = s.durationMs || s.duration_ms || 0;
  totalDuration += duration;
  const styles = (s.positiveLocalStyles || s.positive_local_styles || []).slice(0, 3);
  console.log(`  ${i + 1}. ${name} (${(duration / 1000).toFixed(1)}s) - ${styles.join(', ')}`);
});

console.log('\n═'.repeat(50));
console.log(`Total duration: ${(totalDuration / 1000).toFixed(1)}s`);
console.log('Credits used: 0 (FREE!)');
console.log('═'.repeat(50));
