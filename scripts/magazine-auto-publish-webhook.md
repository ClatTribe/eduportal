# Auto-publish carousel + Reel + Short when a magazine article goes live

When you set `status = published` in Supabase, a webhook starts:

1. **Instagram carousel** (`post-instagram` logic)
2. **Instagram Reel** (Remotion video + voice)
3. **YouTube Short** (if `YOUTUBE_*` env vars are set)

Daily crons in `vercel.json` remain as a **backup** if the webhook fails.

---

## 1. Deploy the app

Push to Vercel so this route exists:

`POST https://YOUR_DOMAIN/api/webhooks/magazine-published`

---

## 2. Env on Vercel

Same as manual scripts, plus (optional dedicated secret):

```env
CRON_SECRET=your-long-random-secret
# or
MAGAZINE_WEBHOOK_SECRET=your-long-random-secret
```

Use the **same value** in the Supabase webhook header below.

---

## 3. Supabase Database Webhook

1. Supabase Dashboard → **Database** → **Webhooks** → **Create a new hook**
2. **Name:** `magazine-published-social`
3. **Table:** `magazine_posts`
4. **Events:** `INSERT` and `UPDATE`
5. **Type:** HTTP Request
6. **Method:** POST
7. **URL:** `https://app.goeduabroad.com/api/webhooks/magazine-published`
8. **HTTP Headers** (add one):

   | Key | Value |
   |-----|--------|
   | `Authorization` | `Bearer YOUR_CRON_SECRET` |

9. Save

The hook only **runs the pipeline** when `status` becomes `published` for the first time (not when you edit an already-live article).

---

## 4. Manual test (same as webhook)

```bash
npm run publish-social -- --id=36
```

Or curl:

```bash
curl -X POST "https://app.goeduabroad.com/api/webhooks/magazine-published" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"postId\": 36}"
```

---

## 5. Requirements (same as before)

- `instagram-setup.sql` + `video-setup.sql` run in Supabase
- Public buckets: `instagram-carousel`, `instagram-videos`
- Instagram + Supabase env vars in Vercel
- **Note:** Full render can take **5–15 minutes**. The webhook returns immediately; work continues in the background. On Vercel Hobby, `maxDuration` is 300s — use Pro or run `npm run publish-social` locally if video times out.

---

## Publishing workflow

1. Write article in Supabase (or your CMS)
2. Set `status` = `published` and `published_at` = now
3. Webhook fires → carousel + Reel (+ Short) automatically

No need to wait for 07:30 / 08:30 UTC crons.
