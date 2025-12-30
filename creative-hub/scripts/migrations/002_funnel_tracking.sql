-- Migration: 002_funnel_tracking
-- Description: Add funnel tracking tables and user attribution fields
-- Created: 2025-12-30

-- ============================================
-- UPDATE USERS TABLE
-- ============================================

-- Add first free generation tracking
ALTER TABLE users ADD COLUMN has_used_free_generation INTEGER DEFAULT 0;

-- Add attribution fields
ALTER TABLE users ADD COLUMN discovery_source TEXT;
ALTER TABLE users ADD COLUMN referred_by TEXT;

-- ============================================
-- CREATE FUNNEL_EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS funnel_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  session_id TEXT NOT NULL,

  -- Event type
  event TEXT NOT NULL CHECK (event IN (
    'page_view',
    'generate_start',
    'generate_complete',
    'preview_play',
    'download_watermarked',
    'download_attempt_clean',
    'payment_started',
    'payment_completed',
    'signup',
    'share'
  )),

  -- Discovery attribution
  discovery_source TEXT CHECK (discovery_source IN (
    'telegram_search',
    'telegram_channel',
    'findmini',
    'tapps_center',
    'mcp_directory',
    'product_hunt',
    'tiktok',
    'twitter',
    'referral',
    'direct',
    'unknown'
  )),
  referral_code TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Context
  track_id TEXT REFERENCES tracks(id) ON DELETE SET NULL,
  page_url TEXT,

  -- A/B Testing
  experiment_id TEXT,
  variant TEXT,

  -- Device info
  platform TEXT CHECK (platform IN ('telegram_miniapp', 'web', 'mcp', 'api')),
  user_agent TEXT,

  created_at INTEGER DEFAULT (unixepoch()) NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_funnel_events_session ON funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_user ON funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_anonymous ON funnel_events(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_event ON funnel_events(event);
CREATE INDEX IF NOT EXISTS idx_funnel_events_source ON funnel_events(discovery_source);
CREATE INDEX IF NOT EXISTS idx_funnel_events_created ON funnel_events(created_at);
CREATE INDEX IF NOT EXISTS idx_funnel_events_experiment ON funnel_events(experiment_id);

-- ============================================
-- CREATE EXPERIMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,

  -- Variants as JSON
  variants TEXT NOT NULL,

  -- Targeting
  target_percentage INTEGER DEFAULT 100,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),

  -- Results tracking
  primary_metric TEXT,
  secondary_metrics TEXT,

  started_at INTEGER,
  ended_at INTEGER,

  created_at INTEGER DEFAULT (unixepoch()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);

-- ============================================
-- CREATE REFERRALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,

  -- Stats
  click_count INTEGER DEFAULT 0,
  signup_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,

  -- Rewards
  credits_earned INTEGER DEFAULT 0,

  created_at INTEGER DEFAULT (unixepoch()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- ============================================
-- SEED INITIAL A/B EXPERIMENTS
-- ============================================

INSERT OR IGNORE INTO experiments (id, name, description, variants, status, primary_metric)
VALUES
  (
    'first_gen_free_v1',
    'First Generation Free',
    'Test zero-friction onboarding vs signup-first',
    '[{"id": "control", "weight": 50, "behavior": "signup_first"}, {"id": "treatment", "weight": 50, "behavior": "first_free"}]',
    'running',
    'payment_completed'
  ),
  (
    'watermark_severity_v1',
    'Watermark Severity',
    'Test audio watermark vs metadata-only watermark',
    '[{"id": "audio_watermark", "weight": 50}, {"id": "metadata_only", "weight": 50}]',
    'draft',
    'payment_completed'
  ),
  (
    'per_track_vs_sub_v1',
    'Per-Track vs Subscription',
    'Test per-track purchases vs subscription-first',
    '[{"id": "per_track", "weight": 50}, {"id": "subscription", "weight": 50}]',
    'draft',
    'payment_completed'
  );
