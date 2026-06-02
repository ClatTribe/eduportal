const GRAPH_API = "https://graph.facebook.com/v21.0";

interface GraphError {
  message: string;
  type?: string;
  code?: number;
}

interface GraphResponse {
  id?: string;
  status_code?: string;
  error?: GraphError;
}

function getAccessToken(): string {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    throw new Error("INSTAGRAM_ACCESS_TOKEN is not set");
  }
  return token;
}

export function getInstagramUserId(): string {
  const id = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!id) {
    throw new Error("INSTAGRAM_BUSINESS_ACCOUNT_ID is not set");
  }
  return id;
}

async function graphPost(
  path: string,
  params: Record<string, string>,
): Promise<GraphResponse> {
  const body = new URLSearchParams({
    ...params,
    access_token: getAccessToken(),
  });

  const res = await fetch(`${GRAPH_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as GraphResponse;
  if (data.error) {
    throw new Error(
      `Instagram API error: ${data.error.message} (code ${data.error.code ?? "?"})`,
    );
  }

  return data;
}

async function graphGet(path: string, fields: string): Promise<GraphResponse> {
  const url = new URL(`${GRAPH_API}${path}`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("access_token", getAccessToken());

  const res = await fetch(url.toString());
  const data = (await res.json()) as GraphResponse;
  if (data.error) {
    throw new Error(`Instagram API error: ${data.error.message}`);
  }
  return data;
}

async function waitForContainer(
  containerId: string,
  label: string,
  maxAttempts = 30,
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const data = await graphGet(`/${containerId}`, "status_code");
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") {
      throw new Error(`Instagram container failed for ${label}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`Timeout waiting for Instagram container: ${label}`);
}

export async function createCarouselItem(imageUrl: string): Promise<string> {
  const igUserId = getInstagramUserId();
  const data = await graphPost(`/${igUserId}/media`, {
    image_url: imageUrl,
    is_carousel_item: "true",
  });

  if (!data.id) throw new Error("No container id returned for carousel item");
  await waitForContainer(data.id, "carousel item");
  return data.id;
}

export async function createCarouselContainer(
  childrenIds: string[],
  caption: string,
): Promise<string> {
  const igUserId = getInstagramUserId();
  const data = await graphPost(`/${igUserId}/media`, {
    media_type: "CAROUSEL",
    caption,
    children: childrenIds.join(","),
  });

  if (!data.id) throw new Error("No container id returned for carousel");
  await waitForContainer(data.id, "carousel container");
  return data.id;
}

export async function publishMedia(creationId: string): Promise<string> {
  const igUserId = getInstagramUserId();
  const data = await graphPost(`/${igUserId}/media_publish`, {
    creation_id: creationId,
  });

  if (!data.id) throw new Error("No media id returned after publish");
  return data.id;
}

export async function createReelContainer(
  videoUrl: string,
  caption: string,
): Promise<string> {
  const igUserId = getInstagramUserId();
  const data = await graphPost(`/${igUserId}/media`, {
    media_type: "REELS",
    video_url: videoUrl,
    caption,
    share_to_feed: "true",
  });

  if (!data.id) throw new Error("No container id returned for reel");
  await waitForContainer(data.id, "reel", 90);
  return data.id;
}

export async function publishReel(
  videoUrl: string,
  caption: string,
): Promise<string> {
  const containerId = await createReelContainer(videoUrl, caption);
  return publishMedia(containerId);
}

export async function publishCarousel(
  imageUrls: string[],
  caption: string,
): Promise<string> {
  if (imageUrls.length < 2) {
    throw new Error("Instagram carousel requires at least 2 images");
  }
  if (imageUrls.length > 10) {
    throw new Error("Instagram carousel supports at most 10 images");
  }

  const childIds: string[] = [];
  for (const imageUrl of imageUrls) {
    childIds.push(await createCarouselItem(imageUrl));
  }

  const containerId = await createCarouselContainer(childIds, caption);
  return publishMedia(containerId);
}

export function validateInstagramConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    missing.push("INSTAGRAM_ACCESS_TOKEN");
  }
  if (!process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    missing.push("INSTAGRAM_BUSINESS_ACCOUNT_ID");
  }
  return missing;
}
