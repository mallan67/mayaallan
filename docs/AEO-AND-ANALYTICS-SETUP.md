# AEO + Analytics setup — concrete steps

This doc is the operator's manual for the **measurement** side of the AEO work. The code is built; this is what you do in dashboards to make it actually run.

---

## 1. AEO Tracker — environment variables

Open Vercel → Project → Settings → Environment Variables and add the following. Each AI engine is **optional** — the cron skips any engine whose key isn't set, so you can start with one and add more later.

| Variable | Required? | Where to get it | Notes |
|---|---|---|---|
| `CRON_SECRET` | **Yes** | Generate any random 32+ char string (e.g. `openssl rand -hex 32`) | Vercel Cron sends this in the `Authorization: Bearer ...` header. Without it, the cron route returns 401. |
| `ANTHROPIC_API_KEY` | No | console.anthropic.com → API Keys | Claude tracking. Cost: ~$0.10/week for 25 prompts. |
| `OPENAI_API_KEY` | No | platform.openai.com → API keys | ChatGPT tracking. Cost: ~$0.30/week. |
| `PERPLEXITY_API_KEY` | No | perplexity.ai → Settings → API | **Highest-signal engine** — Perplexity actually does live web search and cites sources inline. Cost: ~$0.20/week. |
| `GOOGLE_GENAI_API_KEY` | No | aistudio.google.com/apikey | Gemini tracking. Free tier covers it. |

**Minimum viable**: just set `CRON_SECRET` + one engine key. The cron runs, you start collecting data.

## 2. Storage — Vercel Blob (no setup needed beyond the env var)

The AEO tracker writes each weekly run as one JSON blob to your existing
`mayaallan-blob` store at path `aeo/runs/{timestamp}-{runId}.json`.

**Why Blob, not Supabase**: keeps AEO measurement data fully isolated from
your main site database — different service, different free tier, zero risk
of touching books/events/etc. Supabase Free also has no automatic backups,
so isolating measurement data on Blob is the safer call.

Verify `BLOB_READ_WRITE_TOKEN` is set in Vercel env (it should be already
since you have `mayaallan-blob` provisioned). That's the only setup needed.

Free tier impact: ~50KB per weekly run × 52 runs/year = ~3MB/year vs the
1GB free tier (~0.3% per year). Will not push you over.

## 3. Verify the cron is scheduled

After deploying, check Vercel → Project → Cron Jobs. You should see:

| Path | Schedule |
|---|---|
| `/api/cron/aeo-track` | `0 9 * * 1` (Mondays 9am UTC) |

## 4. Trigger a manual first run

Don't wait for Monday — kick it off now so the dashboard has data:

```bash
curl -X POST https://www.mayaallan.com/api/cron/aeo-track \
  -H "Authorization: Bearer $YOUR_CRON_SECRET"
```

Response is JSON with run summary. Typical first run takes 1-3 minutes.

## 5. View the dashboard

Log in at `/admin/login`, then visit **`/admin/aeo`**. You'll see:

- Citation rate by engine (Claude / ChatGPT / Perplexity / Gemini)
- Recent runs (with hit count + error count)
- Prompts ranked by citation rate — the ones with 0% are your highest-leverage growth targets
- Most-cited URLs — what's working, do more of those
- Recent excerpts — exactly what AI engines say when they cite you

## 6. Add or change tracked prompts

Edit `content/aeo-prompts.json`. Each prompt needs a stable `id` so historical trend data stays linked. Add new ones, change wording, retire ones that have proven uninteresting. The cron picks up changes on the next run — no redeploy needed.

---

# GA4 — "AI Search" custom channel

GA4 doesn't recognize AI engines as a distinct traffic source out of the box. Set this up so you can see ChatGPT/Claude/Perplexity/Gemini referrals separately from generic "Direct" or "Referral".

## Setup steps

1. Open GA4 → Admin → **Data display** → Channel groups
2. Click **Create new channel group** → Name it "AI Search-Aware"
3. Click **Add new channel** at the top of the list (so it's evaluated before the default channels)
4. Channel name: `AI Search`
5. Add a **single condition** with the regex below:

```
Source matches regex: ^.*(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|bing\.com\/chat|you\.com|searchgpt\.com|grok\.com|kagi\.com).*$
```

6. Save → ensure the new channel is **above** the default "Organic Search" and "Direct" channels (drag to reorder)
7. Set this channel group as the **default** for your reports

After about 24 hours GA4 starts attributing AI-engine referrals to the new channel. You'll see real numbers: how many people click through to your site from ChatGPT/Perplexity/etc.

## What "good" looks like

Per the May 2026 SparkToro data: AI-engine click-through rates are **15.9% (ChatGPT) vs 1.76% organic baseline** — so even small AI referral numbers are disproportionately high-intent. Vercel themselves reported 10% of new signups now come from ChatGPT referrals. Track this number monthly.

---

# The full measurement stack (what's running once all of the above is set up)

| What | Where | Frequency |
|---|---|---|
| AI citation probes (4 engines × 25 prompts) | `/admin/aeo` | Weekly auto, manual on-demand |
| AI engine click-through traffic | GA4 → AI Search channel | Real-time |
| Google + Bing organic | GSC + Bing Webmaster | Real-time |
| Site speed (Core Web Vitals) | Vercel Speed Insights | Real-time |
| Bot crawl activity (GPTBot, ClaudeBot, etc.) | Vercel logs → filter `User-Agent` | On-demand |

That's the full feedback loop. Every Monday you get a citation report; every page view via AI engines lands in the AI Search channel; you can correlate the two.

---

# Optional next step: bot crawl log analysis

To see WHICH pages AI bots are actually fetching (vs which they're skipping), set up a Vercel Log Drain → BigQuery or a simple cron that pulls logs via the Vercel API and counts hits by User-Agent. This is the only way to know if Cloudflare or any other layer is silently dropping bot requests before they reach Next.js.

(Not built yet — propose if/when you want it.)
