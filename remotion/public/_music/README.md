# Universal Reel background music

**One track plays on every Reel and YouTube Short** (same brand sound).

## Setup

1. Add your royalty-free MP3 as:
   ```
   remotion/public/_music/universal.mp3
   ```
2. Or set in `.env.local`:
   ```env
   REEL_BACKGROUND_MUSIC=_music/universal.mp3
   REEL_MUSIC_VOLUME=0.14
   ```

If `universal.mp3` is missing, the app falls back to `default.mp3`.

**Disable:** `VIDEO_MUSIC_ENABLED=false`

Sources: [YouTube Audio Library](https://studio.youtube.com/), [Pixabay Music](https://pixabay.com/music/)

Pick one upbeat Gen-Z instrumental (~60–90s, loopable) and reuse it for all videos.
