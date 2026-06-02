const TOKEN_URL = "https://oauth2.googleapis.com/token";
const UPLOAD_INIT_URL =
  "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";

export function validateYouTubeConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.YOUTUBE_CLIENT_ID) missing.push("YOUTUBE_CLIENT_ID");
  if (!process.env.YOUTUBE_CLIENT_SECRET) missing.push("YOUTUBE_CLIENT_SECRET");
  if (!process.env.YOUTUBE_REFRESH_TOKEN) missing.push("YOUTUBE_REFRESH_TOKEN");
  return missing;
}

export function isYouTubeConfigured(): boolean {
  return validateYouTubeConfig().length === 0;
}

async function getAccessToken(): Promise<string> {
  const missing = validateYouTubeConfig();
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!data.access_token) {
    throw new Error(
      `YouTube OAuth failed: ${data.error_description ?? data.error ?? "unknown"}`,
    );
  }

  return data.access_token;
}

export interface YouTubeShortMetadata {
  title: string;
  description: string;
  tags?: string[];
}

/** Uploads a vertical short (≤60s) to the connected YouTube channel. */
export async function uploadYouTubeShort(
  videoBuffer: Buffer,
  metadata: YouTubeShortMetadata,
): Promise<string> {
  const accessToken = await getAccessToken();

  const title = metadata.title.slice(0, 100);
  const description = metadata.description.includes("#Shorts")
    ? metadata.description
    : `${metadata.description}\n\n#Shorts`;

  const body = {
    snippet: {
      title,
      description: description.slice(0, 5000),
      tags: (metadata.tags ?? []).slice(0, 15),
      categoryId: "27",
    },
    status: {
      privacyStatus: "public",
      selfDeclaredMadeForKids: false,
    },
  };

  const initRes = await fetch(UPLOAD_INIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Upload-Content-Type": "video/mp4",
      "X-Upload-Content-Length": String(videoBuffer.length),
    },
    body: JSON.stringify(body),
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`YouTube upload init failed: ${errText}`);
  }

  const uploadUrl = initRes.headers.get("Location");
  if (!uploadUrl) {
    throw new Error("YouTube did not return a resumable upload URL");
  }

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(videoBuffer.length),
    },
    body: new Uint8Array(videoBuffer),
  });

  const result = (await uploadRes.json()) as { id?: string; error?: { message: string } };

  if (!uploadRes.ok || !result.id) {
    throw new Error(
      `YouTube upload failed: ${result.error?.message ?? uploadRes.statusText}`,
    );
  }

  return result.id;
}
