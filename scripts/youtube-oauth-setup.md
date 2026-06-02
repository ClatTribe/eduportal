# YouTube Shorts upload — one-time OAuth setup

The video cron uploads to YouTube using a **refresh token** (no browser step on each run).

## 1. Google Cloud Console

1. Create or open a project at https://console.cloud.google.com
2. Enable **YouTube Data API v3**
3. **Credentials** → Create **OAuth client ID** → type **Desktop app** (or Web with redirect you control)
4. Add your account as a **test user** if the app is in "Testing" mode

## 2. Get a refresh token

Use [Google OAuth Playground](https://developers.google.com/oauthplayground):

1. Click the gear → check **Use your own OAuth credentials**
2. Enter `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET`
3. In Step 1, select scope: `https://www.googleapis.com/auth/youtube.upload`
4. Authorize and exchange for tokens
5. Copy the **Refresh token** into `.env.local`:

```env
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...
```

## 3. Vercel

Add the same three variables in the Vercel project **Environment Variables** for Production.

Videos are uploaded as public Shorts (vertical MP4 from Remotion, `#Shorts` in description).
