export interface SupabaseMagazineWebhookPayload {
  type?: "INSERT" | "UPDATE" | "DELETE";
  table?: string;
  schema?: string;
  record?: Record<string, unknown>;
  old_record?: Record<string, unknown> | null;
}

/** Manual trigger: { "postId": 36 } */
export interface ManualMagazinePublishBody {
  postId: number;
}

export function isMagazinePostsTable(payload: SupabaseMagazineWebhookPayload): boolean {
  return payload.table === "magazine_posts" || payload.table === undefined;
}

/** True when an article is newly published (not a content edit while already live). */
export function shouldAutoPublishFromWebhook(
  payload: SupabaseMagazineWebhookPayload,
): boolean {
  if (payload.type === "DELETE") return false;
  if (!isMagazinePostsTable(payload)) return false;

  const record = payload.record;
  if (!record || record.status !== "published") return false;

  const oldStatus = payload.old_record?.status;
  if (oldStatus === "published") return false;

  return true;
}

export function extractPostId(
  payload: SupabaseMagazineWebhookPayload | ManualMagazinePublishBody,
): number | null {
  if ("postId" in payload && typeof payload.postId === "number") {
    return payload.postId;
  }

  const webhook = payload as SupabaseMagazineWebhookPayload;
  const id = webhook.record?.id;
  if (typeof id === "number") return id;
  if (typeof id === "string") return Number(id);

  return null;
}
