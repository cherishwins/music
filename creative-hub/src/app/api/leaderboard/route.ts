/**
 * /api/leaderboard - Anthem Leaderboard API
 *
 * Tracks top creators, trending anthems, and competition standings
 *
 * Endpoints:
 * GET /api/leaderboard?type=creators - Top anthem creators
 * GET /api/leaderboard?type=anthems - Top anthems by plays/shares
 * GET /api/leaderboard?type=trending - Trending this week
 * GET /api/leaderboard?type=competition&week=1 - Weekly competition standings
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tracks, users } from '@/lib/db/schema';
import { desc, sql, eq, gte, and } from 'drizzle-orm';

type LeaderboardType = 'creators' | 'anthems' | 'trending' | 'competition';

interface CreatorStats {
  userId: string;
  displayName: string | null;
  telegramUsername: string | null;
  avatarUrl: string | null;
  trackCount: number;
  totalPlays: number;
  totalLikes: number;
  rank: number;
}

interface AnthemStats {
  trackId: string;
  title: string;
  creatorName: string | null;
  creatorUsername: string | null;
  playsCount: number | null;
  likesCount: number | null;
  sharesCount: number | null;
  audioUrl: string;
  coverUrl: string | null;
  createdAt: Date;
  rank: number;
}

interface LeaderboardResponse {
  success: boolean;
  type: LeaderboardType;
  period?: string;
  data: CreatorStats[] | AnthemStats[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<LeaderboardResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get('type') || 'anthems') as LeaderboardType;
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const week = searchParams.get('week'); // For competition type

    let data: CreatorStats[] | AnthemStats[] = [];
    let total = 0;

    switch (type) {
      case 'creators': {
        // Top creators by total plays + track count
        const results = await db
          .select({
            userId: users.id,
            displayName: users.displayName,
            telegramUsername: users.telegramUsername,
            avatarUrl: users.avatarUrl,
            trackCount: users.trackCount,
            totalPlays: sql<number>`COALESCE(SUM(${tracks.playsCount}), 0)`,
            totalLikes: sql<number>`COALESCE(SUM(${tracks.likesCount}), 0)`,
          })
          .from(users)
          .leftJoin(tracks, and(eq(tracks.userId, users.id), eq(tracks.isPublic, true)))
          .groupBy(users.id)
          .having(sql`${users.trackCount} > 0`)
          .orderBy(
            desc(sql`COALESCE(SUM(${tracks.playsCount}), 0)`),
            desc(users.trackCount)
          )
          .offset(offset)
          .limit(limit);

        data = results.map((r, i) => ({
          ...r,
          totalPlays: Number(r.totalPlays),
          totalLikes: Number(r.totalLikes),
          rank: offset + i + 1,
        }));

        // Get total count
        const countResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(users)
          .where(sql`${users.trackCount} > 0`);
        total = countResult[0]?.count || 0;
        break;
      }

      case 'anthems': {
        // Top anthems by plays + likes + shares
        const results = await db
          .select({
            trackId: tracks.id,
            title: tracks.title,
            creatorName: users.displayName,
            creatorUsername: users.telegramUsername,
            playsCount: tracks.playsCount,
            likesCount: tracks.likesCount,
            sharesCount: tracks.sharesCount,
            audioUrl: tracks.audioUrl,
            coverUrl: tracks.coverUrl,
            createdAt: tracks.createdAt,
          })
          .from(tracks)
          .leftJoin(users, eq(users.id, tracks.userId))
          .where(eq(tracks.isPublic, true))
          .orderBy(
            desc(sql`${tracks.playsCount} + ${tracks.likesCount} * 2 + ${tracks.sharesCount} * 3`),
            desc(tracks.createdAt)
          )
          .offset(offset)
          .limit(limit);

        data = results.map((r, i) => ({
          ...r,
          rank: offset + i + 1,
        }));

        // Get total count
        const countResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(tracks)
          .where(eq(tracks.isPublic, true));
        total = countResult[0]?.count || 0;
        break;
      }

      case 'trending': {
        // Trending = created in last 7 days with highest engagement rate
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const results = await db
          .select({
            trackId: tracks.id,
            title: tracks.title,
            creatorName: users.displayName,
            creatorUsername: users.telegramUsername,
            playsCount: tracks.playsCount,
            likesCount: tracks.likesCount,
            sharesCount: tracks.sharesCount,
            audioUrl: tracks.audioUrl,
            coverUrl: tracks.coverUrl,
            createdAt: tracks.createdAt,
          })
          .from(tracks)
          .leftJoin(users, eq(users.id, tracks.userId))
          .where(
            and(
              eq(tracks.isPublic, true),
              gte(tracks.createdAt, oneWeekAgo)
            )
          )
          .orderBy(
            desc(sql`(${tracks.playsCount} + ${tracks.likesCount} * 2 + ${tracks.sharesCount} * 3) /
              CASE WHEN (julianday('now') - julianday(${tracks.createdAt})) < 1
                   THEN 1
                   ELSE (julianday('now') - julianday(${tracks.createdAt}))
              END`),
            desc(tracks.createdAt)
          )
          .offset(offset)
          .limit(limit);

        data = results.map((r, i) => ({
          ...r,
          rank: offset + i + 1,
        }));

        // Get total count
        const countResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(tracks)
          .where(
            and(
              eq(tracks.isPublic, true),
              gte(tracks.createdAt, oneWeekAgo)
            )
          );
        total = countResult[0]?.count || 0;
        break;
      }

      case 'competition': {
        // Weekly competition standings
        // Week 1 starts from a fixed date, each week is 7 days
        const baseDate = new Date('2025-01-01'); // Start of competition era
        const weekNum = week ? parseInt(week) : Math.ceil((Date.now() - baseDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

        const weekStart = new Date(baseDate.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        const results = await db
          .select({
            trackId: tracks.id,
            title: tracks.title,
            creatorName: users.displayName,
            creatorUsername: users.telegramUsername,
            playsCount: tracks.playsCount,
            likesCount: tracks.likesCount,
            sharesCount: tracks.sharesCount,
            audioUrl: tracks.audioUrl,
            coverUrl: tracks.coverUrl,
            createdAt: tracks.createdAt,
          })
          .from(tracks)
          .leftJoin(users, eq(users.id, tracks.userId))
          .where(
            and(
              eq(tracks.isPublic, true),
              gte(tracks.createdAt, weekStart),
              sql`${tracks.createdAt} < ${weekEnd}`
            )
          )
          .orderBy(
            desc(sql`${tracks.playsCount} + ${tracks.likesCount} * 2 + ${tracks.sharesCount} * 3`),
            desc(tracks.createdAt)
          )
          .offset(offset)
          .limit(limit);

        data = results.map((r, i) => ({
          ...r,
          rank: offset + i + 1,
        }));

        // Get total count
        const countResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(tracks)
          .where(
            and(
              eq(tracks.isPublic, true),
              gte(tracks.createdAt, weekStart),
              sql`${tracks.createdAt} < ${weekEnd}`
            )
          );
        total = countResult[0]?.count || 0;

        return NextResponse.json({
          success: true,
          type,
          period: `Week ${weekNum} (${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]})`,
          data,
          pagination: { offset, limit, total },
        });
      }
    }

    return NextResponse.json({
      success: true,
      type,
      data,
      pagination: { offset, limit, total },
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({
      success: false,
      type: 'anthems',
      data: [],
      pagination: { offset: 0, limit: 20, total: 0 },
      error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
    }, { status: 500 });
  }
}

/**
 * POST /api/leaderboard/track
 * Record a play/like/share event for a track
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { trackId, event } = body;

    if (!trackId || !event) {
      return NextResponse.json({
        success: false,
        error: 'trackId and event are required',
      }, { status: 400 });
    }

    if (!['play', 'like', 'share'].includes(event)) {
      return NextResponse.json({
        success: false,
        error: 'event must be play, like, or share',
      }, { status: 400 });
    }

    // Update the appropriate counter
    const updateField = event === 'play' ? 'playsCount' : event === 'like' ? 'likesCount' : 'sharesCount';

    await db
      .update(tracks)
      .set({
        [updateField]: sql`${tracks[updateField as keyof typeof tracks]} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(tracks.id, trackId));

    return NextResponse.json({
      success: true,
      event,
      trackId,
    });

  } catch (error) {
    console.error('Track event error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record event',
    }, { status: 500 });
  }
}
