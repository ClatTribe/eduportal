-- Run once in Supabase SQL Editor (after instagram-setup.sql).
-- Tracks Remotion video posts (Instagram Reel + YouTube Short) per magazine article.

ALTER TABLE magazine_posts
  ADD COLUMN IF NOT EXISTS video_posted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS instagram_reel_media_id TEXT,
  ADD COLUMN IF NOT EXISTS youtube_short_id TEXT;

CREATE INDEX IF NOT EXISTS idx_magazine_posts_video_pending
  ON magazine_posts (published_at DESC)
  WHERE status = 'published'
    AND instagram_posted_at IS NOT NULL
    AND video_posted_at IS NULL;

-- Public bucket so Meta can fetch the MP4 for Reels.
-- Supabase Dashboard: Storage → New bucket → name: instagram-videos → Public bucket ON

-- Optional .env for narration (Edge TTS — no extra API key):
-- VIDEO_TTS_VOICE=en-IN-NeerjaNeural
-- VIDEO_VOICE_ENABLED=false   ← set only to disable voice

-- Optional: skip backlog — only NEW articles get videos after carousel.
-- UPDATE magazine_posts
-- SET video_posted_at = instagram_posted_at
-- WHERE video_posted_at IS NULL
--   AND instagram_posted_at IS NOT NULL
--   AND published_at < NOW() - INTERVAL '1 day';
