-- Run once in Supabase SQL Editor.
-- Tracks which magazine articles were already posted to Instagram.

ALTER TABLE magazine_posts
  ADD COLUMN IF NOT EXISTS instagram_posted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS instagram_media_id TEXT;

CREATE INDEX IF NOT EXISTS idx_magazine_posts_instagram_pending
  ON magazine_posts (published_at DESC)
  WHERE status = 'published' AND instagram_posted_at IS NULL;

-- Optional: skip backlog so only NEW articles post to Instagram going forward.
-- UPDATE magazine_posts
-- SET instagram_posted_at = published_at
-- WHERE instagram_posted_at IS NULL
--   AND published_at < NOW() - INTERVAL '1 day';

-- Create a public storage bucket for carousel images (Meta must fetch these URLs).
-- In Supabase Dashboard: Storage → New bucket → name: instagram-carousel → Public bucket ON
-- Or run (requires storage admin):
-- insert into storage.buckets (id, name, public) values ('instagram-carousel', 'instagram-carousel', true)
-- on conflict (id) do nothing;
