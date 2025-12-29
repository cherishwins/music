/**
 * Music Intelligence - Vector Database
 * Qdrant for storing and searching music embeddings
 *
 * Collections:
 * - hit_songs: Reference library of hit song embeddings
 * - user_tracks: Generated tracks with embeddings
 * - patterns: Learned patterns from successful tracks
 */

import { QdrantClient } from "@qdrant/js-client-rest";

// Initialize Qdrant client
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

// Collection names
export const COLLECTIONS = {
  HIT_SONGS: "hit_songs",
  USER_TRACKS: "user_tracks",
  PATTERNS: "patterns",
} as const;

// Vector dimensions (CLAP outputs 512-dim embeddings)
const EMBEDDING_DIM = 512;

// ============================================
// COLLECTION SETUP
// ============================================

/**
 * Initialize all collections (run once on setup)
 */
export async function initializeCollections() {
  const collections = await qdrant.getCollections();
  const existingNames = collections.collections.map((c) => c.name);

  // Hit songs collection - multi-vector (audio + structural + emotional)
  if (!existingNames.includes(COLLECTIONS.HIT_SONGS)) {
    await qdrant.createCollection(COLLECTIONS.HIT_SONGS, {
      vectors: {
        audio: { size: EMBEDDING_DIM, distance: "Cosine" },
        structural: { size: 64, distance: "Cosine" }, // Section patterns
        emotional: { size: 32, distance: "Cosine" }, // Energy curves
      },
    });
    console.log("Created collection:", COLLECTIONS.HIT_SONGS);
  }

  // User tracks collection
  if (!existingNames.includes(COLLECTIONS.USER_TRACKS)) {
    await qdrant.createCollection(COLLECTIONS.USER_TRACKS, {
      vectors: {
        audio: { size: EMBEDDING_DIM, distance: "Cosine" },
      },
    });
    console.log("Created collection:", COLLECTIONS.USER_TRACKS);
  }

  // Patterns collection - learned from successful tracks
  if (!existingNames.includes(COLLECTIONS.PATTERNS)) {
    await qdrant.createCollection(COLLECTIONS.PATTERNS, {
      vectors: {
        pattern: { size: 128, distance: "Cosine" },
      },
    });
    console.log("Created collection:", COLLECTIONS.PATTERNS);
  }
}

// ============================================
// HIT SONG OPERATIONS
// ============================================

export interface HitSongVector {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  key: string;
  audioEmbedding: number[];
  structuralEmbedding?: number[];
  emotionalEmbedding?: number[];
  hookTiming: number;
  sectionStructure: { type: string; start: number; end: number }[];
  energyCurve: number[];
  successScore: number; // Based on chart performance
}

/**
 * Add a hit song to the reference library
 */
export async function addHitSong(song: HitSongVector) {
  await qdrant.upsert(COLLECTIONS.HIT_SONGS, {
    wait: true,
    points: [
      {
        id: song.id,
        vector: {
          audio: song.audioEmbedding,
          ...(song.structuralEmbedding && {
            structural: song.structuralEmbedding,
          }),
          ...(song.emotionalEmbedding && {
            emotional: song.emotionalEmbedding,
          }),
        },
        payload: {
          title: song.title,
          artist: song.artist,
          genre: song.genre,
          bpm: song.bpm,
          key: song.key,
          hookTiming: song.hookTiming,
          sectionStructure: song.sectionStructure,
          energyCurve: song.energyCurve,
          successScore: song.successScore,
        },
      },
    ],
  });
}

/**
 * Find similar hit songs by audio embedding
 */
export async function findSimilarHits(
  audioEmbedding: number[],
  options: {
    limit?: number;
    genre?: string;
    minSuccessScore?: number;
  } = {}
) {
  const { limit = 5, genre, minSuccessScore } = options;

  const filter: Record<string, unknown> = {};

  if (genre) {
    filter.genre = { $eq: genre };
  }

  if (minSuccessScore) {
    filter.successScore = { $gte: minSuccessScore };
  }

  const results = await qdrant.search(COLLECTIONS.HIT_SONGS, {
    vector: {
      name: "audio",
      vector: audioEmbedding,
    },
    limit,
    filter: Object.keys(filter).length > 0 ? { must: [filter] } : undefined,
    with_payload: true,
  });

  return results.map((r) => ({
    id: r.id,
    score: r.score,
    ...r.payload,
  }));
}

/**
 * Search hits by text description (requires CLAP text embedding)
 */
export async function searchHitsByDescription(
  textEmbedding: number[],
  limit: number = 10
) {
  const results = await qdrant.search(COLLECTIONS.HIT_SONGS, {
    vector: {
      name: "audio",
      vector: textEmbedding, // CLAP can encode text to same space as audio
    },
    limit,
    with_payload: true,
  });

  return results;
}

// ============================================
// USER TRACK OPERATIONS
// ============================================

export interface UserTrackVector {
  id: string; // Same as DB track ID
  userId: string;
  audioEmbedding: number[];
  genre?: string;
  bpm?: number;
  engagementScore?: number; // Updated as users interact
}

/**
 * Add a user-generated track
 */
export async function addUserTrack(track: UserTrackVector) {
  await qdrant.upsert(COLLECTIONS.USER_TRACKS, {
    wait: true,
    points: [
      {
        id: track.id,
        vector: {
          audio: track.audioEmbedding,
        },
        payload: {
          userId: track.userId,
          genre: track.genre,
          bpm: track.bpm,
          engagementScore: track.engagementScore || 0,
          createdAt: Date.now(),
        },
      },
    ],
  });
}

/**
 * Update engagement score (for learning loop)
 */
export async function updateEngagementScore(
  trackId: string,
  engagementScore: number
) {
  await qdrant.setPayload(COLLECTIONS.USER_TRACKS, {
    points: [trackId],
    payload: {
      engagementScore,
      updatedAt: Date.now(),
    },
  });
}

/**
 * Find similar user tracks (for recommendations)
 */
export async function findSimilarUserTracks(
  audioEmbedding: number[],
  options: {
    limit?: number;
    excludeUserId?: string;
    minEngagement?: number;
  } = {}
) {
  const { limit = 10, excludeUserId, minEngagement } = options;

  const filter: Record<string, unknown>[] = [];

  if (excludeUserId) {
    filter.push({ userId: { $ne: excludeUserId } });
  }

  if (minEngagement) {
    filter.push({ engagementScore: { $gte: minEngagement } });
  }

  const results = await qdrant.search(COLLECTIONS.USER_TRACKS, {
    vector: {
      name: "audio",
      vector: audioEmbedding,
    },
    limit,
    filter: filter.length > 0 ? { must: filter } : undefined,
    with_payload: true,
  });

  return results;
}

// ============================================
// PATTERN EXTRACTION
// ============================================

/**
 * Extract patterns from similar hit songs
 * This is the core of the "Hit DNA" system
 */
export async function extractHitPatterns(
  audioEmbedding: number[],
  genre?: string
): Promise<{
  avgBpm: number;
  avgHookTiming: number;
  commonStructure: string[];
  energyCurveTemplate: number[];
  productionHints: string[];
}> {
  const similarHits = await findSimilarHits(audioEmbedding, {
    limit: 10,
    genre,
    minSuccessScore: 70,
  });

  if (similarHits.length === 0) {
    return {
      avgBpm: 130,
      avgHookTiming: 30,
      commonStructure: ["intro", "verse", "hook", "verse", "hook", "outro"],
      energyCurveTemplate: [0.3, 0.5, 0.8, 0.5, 0.9, 0.4],
      productionHints: [],
    };
  }

  // Calculate averages
  const avgBpm =
    similarHits.reduce((sum, h) => sum + (h.bpm as number), 0) /
    similarHits.length;

  const avgHookTiming =
    similarHits.reduce((sum, h) => sum + (h.hookTiming as number), 0) /
    similarHits.length;

  // Find most common structure
  const structures = similarHits.map(
    (h) => h.sectionStructure as { type: string }[]
  );
  const commonStructure = structures[0]?.map((s) => s.type) || [];

  // Average energy curve
  const curves = similarHits
    .map((h) => h.energyCurve as number[])
    .filter((c) => c && c.length > 0);

  const maxLen = Math.max(...curves.map((c) => c.length));
  const energyCurveTemplate = new Array(maxLen).fill(0).map((_, i) => {
    const values = curves.map((c) => c[i] || 0).filter((v) => v > 0);
    return values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0.5;
  });

  // Production hints based on genre
  const productionHints: string[] = [];
  const genres = similarHits.map((h) => h.genre);

  if (genres.some((g) => String(g).includes("phonk"))) {
    productionHints.push("distorted 808 bass");
    productionHints.push("808 cowbell melody");
    productionHints.push("lo-fi texture");
  }

  if (genres.some((g) => String(g).includes("trap"))) {
    productionHints.push("rolling hi-hats");
    productionHints.push("punchy 808");
    productionHints.push("dark synth melody");
  }

  return {
    avgBpm: Math.round(avgBpm),
    avgHookTiming: Math.round(avgHookTiming),
    commonStructure,
    energyCurveTemplate,
    productionHints,
  };
}

// ============================================
// LEARNING LOOP
// ============================================

/**
 * When a track gets good engagement, learn from it
 */
export async function learnFromSuccess(
  trackId: string,
  audioEmbedding: number[],
  engagementScore: number
) {
  // Only learn from tracks with high engagement
  if (engagementScore < 70) return;

  // Update the track's engagement score
  await updateEngagementScore(trackId, engagementScore);

  // If it's really good (90+), consider adding to hit library
  if (engagementScore >= 90) {
    console.log(
      `High-engagement track ${trackId} - consider adding to hit library`
    );
    // In production: notify admin or auto-add with human review
  }
}

/**
 * Calculate engagement score from metrics
 */
export function calculateEngagementScore(metrics: {
  plays: number;
  completionRate: number; // 0-1
  likes: number;
  shares: number;
}): number {
  // Weighted score
  const playScore = Math.min(metrics.plays / 100, 1) * 20; // Max 20 points
  const completionScore = metrics.completionRate * 30; // Max 30 points
  const likeScore = Math.min(metrics.likes / 50, 1) * 25; // Max 25 points
  const shareScore = Math.min(metrics.shares / 10, 1) * 25; // Max 25 points

  return Math.round(playScore + completionScore + likeScore + shareScore);
}

// Export client for direct access if needed
export { qdrant };
