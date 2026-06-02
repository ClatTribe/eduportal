import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import {
  extractPostId,
  shouldAutoPublishFromWebhook,
  type ManualMagazinePublishBody,
  type SupabaseMagazineWebhookPayload,
} from "../../../../../lib/magazine-webhook";
import { runMagazineSocialPublish } from "../../../../../services/magazineSocialPublishService";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function getWebhookSecret(): string | undefined {
  return process.env.MAGAZINE_WEBHOOK_SECRET || process.env.CRON_SECRET;
}

function isAuthorized(request: NextRequest): boolean {
  const secret = getWebhookSecret();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const headerSecret = request.headers.get("x-webhook-secret");
  return headerSecret === secret;
}

/**
 * Supabase Database Webhook or manual call when a magazine article goes live.
 * Responds immediately; carousel + Reel + Short run in the background (after).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SupabaseMagazineWebhookPayload | ManualMagazinePublishBody;
  try {
    body = (await request.json()) as SupabaseMagazineWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const postId = extractPostId(body);
  if (!postId || Number.isNaN(postId)) {
    return NextResponse.json(
      { error: "Missing post id (record.id or postId)" },
      { status: 400 },
    );
  }

  const isManual = "postId" in body && !("record" in body);
  if (!isManual && !shouldAutoPublishFromWebhook(body)) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Not a new publish event (status already published or not published)",
      postId,
    });
  }

  after(async () => {
    try {
      console.log(`[webhook] Auto social publish started for post ${postId}`);
      const result = await runMagazineSocialPublish(postId);
      console.log(`[webhook] Finished post ${postId}:`, {
        carousel: result.carousel.skipped ? "skipped" : "posted",
        video: result.video.skipped ? "skipped" : "posted",
      });
    } catch (error) {
      console.error(`[webhook] Social publish failed for post ${postId}:`, error);
    }
  });

  return NextResponse.json({
    ok: true,
    queued: true,
    postId,
    message:
      "Carousel, Reel, and Shorts publish started in background (may take several minutes)",
  });
}
