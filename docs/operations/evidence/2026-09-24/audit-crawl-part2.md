# Live crawl audit, part 2 (lens FULL LIVE CRAWL, ids crawl-)

UTC window 2026-09-24T18:48:20Z to 2026-09-24T18:48:42Z; live sources and method as in `docs/operations/evidence/2026-09-24/audit-crawl.md`.

## robots.txt

GET https://www.mayaallan.com/robots.txt 200 text/plain @2026-09-24T18:48:20Z, 2990 bytes, 33 user-agent groups, Disallow: /admin/ /api/ /download/, Sitemap: https://www.mayaallan.com/sitemap.xml, Host: https://www.mayaallan.com, x-vercel-cache HIT, age 1417871 s.

## Sitemap URL audit

GET https://www.mayaallan.com/sitemap.xml 200 application/xml @2026-09-24T18:48:20Z, 10027 bytes, 38 URLs, 84 hreflang alternates.

| # | loc | read UTC | status | redirects | self-canonical | indexable | inbound links | title |
|---|---|---|---|---|---|---|---|---|
| 1 | https://www.mayaallan.com | 2026-09-24T18:48:20Z | 200 | 0 | true | true | 39 | Maya Allan — Author of the Psilocybin Integration Guide |
| 2 | https://www.mayaallan.com/about | 2026-09-24T18:48:22Z | 200 | 0 | true | true | 39 | About \| Maya Allan |
| 3 | https://www.mayaallan.com/books | 2026-09-24T18:48:21Z | 200 | 0 | true | true | 39 | Books \| Maya Allan |
| 4 | https://www.mayaallan.com/events | 2026-09-24T18:48:22Z | 200 | 0 | true | true | 39 | Events \| Maya Allan |
| 5 | https://www.mayaallan.com/media | 2026-09-24T18:48:22Z | 200 | 0 | true | true | 39 | Media \| Maya Allan |
| 6 | https://www.mayaallan.com/contact | 2026-09-24T18:48:22Z | 200 | 0 | true | true | 39 | Contact \| Maya Allan |
| 7 | https://www.mayaallan.com/legal | 2026-09-24T18:48:23Z | 200 | 0 | true | true | 3 | Educational Disclaimer \| Maya Allan |
| 8 | https://www.mayaallan.com/privacy | 2026-09-24T18:48:22Z | 200 | 0 | true | true | 39 | Privacy Policy \| Maya Allan |
| 9 | https://www.mayaallan.com/terms | 2026-09-24T18:48:23Z | 200 | 0 | true | true | 39 | Terms of Service \| Maya Allan |
| 10 | https://www.mayaallan.com/refunds | 2026-09-24T18:48:23Z | 200 | 0 | true | true | 39 | Refund Policy \| Maya Allan |
| 11 | https://www.mayaallan.com/practices | 2026-09-24T18:48:23Z | 200 | 0 | true | true | 1 | Practices — Belief Inquiry, Nervous System Reset, Integration Reflecti... |
| 12 | https://www.mayaallan.com/methods | 2026-09-24T18:48:22Z | 200 | 0 | true | true | 39 | Methods & Attributions \| Maya Allan |
| 13 | https://www.mayaallan.com/belief-inquiry | 2026-09-24T18:48:21Z | 200 | 0 | true | true | 39 | Belief Inquiry — A Curious Exploration of Limiting Beliefs \| Maya Alla... |
| 14 | https://www.mayaallan.com/nervous-system-reset | 2026-09-24T18:48:21Z | 200 | 0 | true | true | 38 | Free Nervous System Reset — Calm Anxiety, Release Tension & Regulate Y... |
| 15 | https://www.mayaallan.com/integration-reflection | 2026-09-24T18:48:21Z | 200 | 0 | true | true | 38 | Integration Tool — Help a New Insight or Experience Land \| Maya Allan |
| 16 | https://www.mayaallan.com/integration-journal | 2026-09-24T18:48:22Z | 200 | 0 | true | true | 39 | Free Integration Journal — 7-Day PDF Template \| Maya Allan |
| 17 | https://www.mayaallan.com/blog | 2026-09-24T18:48:22Z | 200 | 0 | true | true | 39 | Writing — Belief work, nervous-system regulation, integration \| Maya A... |
| 18 | https://www.mayaallan.com/scenarios | 2026-09-24T18:48:23Z | 200 | 0 | true | true | 39 | Psilocybin Journey Scenarios — Practical Navigation Guide \| Maya Allan |
| 19 | https://www.mayaallan.com/faq | 2026-09-24T18:48:23Z | 200 | 0 | true | true | 39 | Reader Questions — Psilocybin Integration Guide \| Maya Allan |
| 20 | https://www.mayaallan.com/glossary | 2026-09-24T18:48:23Z | 200 | 0 | true | true | 39 | Psilocybin & Integration Glossary \| Maya Allan |
| 21 | https://www.mayaallan.com/es | 2026-09-24T18:48:25Z | 200 | 0 | true | true | 0 | Guía con los pies en la tierra para la integración de la psilocibina y... |
| 22 | https://www.mayaallan.com/pt | 2026-09-24T18:48:25Z | 200 | 0 | true | true | 0 | Orientação fundamentada para a integração da psilocibina e o trabalho ... |
| 23 | https://www.mayaallan.com/de | 2026-09-24T18:48:25Z | 200 | 0 | true | true | 0 | Fundierte Begleitung für Psilocybin-Integration und innere Arbeit. \| M... |
| 24 | https://www.mayaallan.com/fr | 2026-09-24T18:48:25Z | 200 | 0 | true | true | 0 | Un accompagnement ancré pour l'intégration de la psilocybine et le tra... |
| 25 | https://www.mayaallan.com/he | 2026-09-24T18:48:25Z | 200 | 0 | true | true | 0 | ליווי מבוסס ושקול לאינטגרציה של פסילוסיבין ולעבודה הפנימית. \| Maya All... |
| 26 | https://www.mayaallan.com/es/about | 2026-09-24T18:48:25Z | 200 | 0 | true | true | 1 | Sobre Maya Allan \| Maya Allan |
| 27 | https://www.mayaallan.com/pt/about | 2026-09-24T18:48:25Z | 200 | 0 | true | true | 1 | Sobre Maya Allan \| Maya Allan |
| 28 | https://www.mayaallan.com/de/about | 2026-09-24T18:48:25Z | 200 | 0 | true | true | 1 | Über Maya Allan \| Maya Allan |
| 29 | https://www.mayaallan.com/fr/about | 2026-09-24T18:48:25Z | 200 | 0 | true | true | 1 | À propos de Maya Allan \| Maya Allan |
| 30 | https://www.mayaallan.com/he/about | 2026-09-24T18:48:26Z | 200 | 0 | true | true | 1 | אודות מאיה אלן \| Maya Allan |
| 31 | https://www.mayaallan.com/books/psilocybin-integration-guide | 2026-09-24T18:48:22Z | 200 | 0 | true | true | 13 | Psilocybin Integration Guide - 40 Real Psychedelic Experiences \| Maya ... |
| 32 | https://www.mayaallan.com/media/Mushroom-Healing | 2026-09-24T18:48:26Z | 200 | 0 | true | true | 0 | Mushroom Healing \| Maya Allan |
| 33 | https://www.mayaallan.com/blog/affirmations-vs-integration | 2026-09-24T18:48:24Z | 200 | 0 | true | true | 1 | The difference between an affirmation and an integration — and why it ... |
| 34 | https://www.mayaallan.com/blog/inherited-beliefs-grandmother-marriage | 2026-09-24T18:48:24Z | 200 | 0 | true | true | 1 | How your grandmother's fear shows up in your marriage \| Maya Allan |
| 35 | https://www.mayaallan.com/blog/curiosity-over-judgment-ifs | 2026-09-24T18:48:24Z | 200 | 0 | true | true | 1 | Curiosity over judgment: the IFS move that changes how you relate to a... |
| 36 | https://www.mayaallan.com/blog/psilocybin-integration-research | 2026-09-24T18:48:23Z | 200 | 0 | true | true | 5 | Integration after psilocybin: what the memory research supports, and w... |
| 37 | https://www.mayaallan.com/blog/audit-is-the-wrong-word | 2026-09-24T18:48:24Z | 200 | 0 | true | true | 1 | Why 'audit' is the wrong word for belief work \| Maya Allan |
| 38 | https://www.mayaallan.com/scenarios/ego-dissolution | 2026-09-24T18:48:23Z | 200 | 0 | true | true | 5 | What does ego dissolution feel like during a psilocybin journey? \| May... |

## Host, protocol, slash, case, duplicate, soft-404 and well-known tests

| group | request | read UTC | chain (status Location) | final status | final URL | t s | X-Robots-Tag | canonical | meta robots | title / type |
|---|---|---|---|---|---|---|---|---|---|---|
| proto | http://www.mayaallan.com/ | 2026-09-24T18:48:29Z | 308 https://www.mayaallan.com/ &gt; 200 | 200 | https://www.mayaallan.com/ | 0.43 | - | https://www.mayaallan.com | robots=index, follow + googlebot=index, follow | Maya Allan — Author of the Psilocybin Integration Guide (lang en) |
| proto | http://mayaallan.com/ | 2026-09-24T18:48:29Z | 308 https://mayaallan.com/ &gt; 308 https://www.mayaallan.com/ &gt; 200 | 200 | https://www.mayaallan.com/ | 0.67 | - | https://www.mayaallan.com | robots=index, follow + googlebot=index, follow | Maya Allan — Author of the Psilocybin Integration Guide (lang en) |
| apex | https://mayaallan.com/ | 2026-09-24T18:48:29Z | 308 https://www.mayaallan.com/ &gt; 200 | 200 | https://www.mayaallan.com/ | 0.55 | - | https://www.mayaallan.com | robots=index, follow + googlebot=index, follow | Maya Allan — Author of the Psilocybin Integration Guide (lang en) |
| apex | https://mayaallan.com/about | 2026-09-24T18:48:29Z | 308 https://www.mayaallan.com/about &gt; 200 | 200 | https://www.mayaallan.com/about | 0.51 | - | https://www.mayaallan.com/about | robots=index, follow + googlebot=index, follow | About \| Maya Allan (lang en) |
| apex | http://mayaallan.com/books?ref=audit | 2026-09-24T18:48:29Z | 308 https://mayaallan.com/books?ref=audit &gt; 308 https://www.mayaallan.com/books?ref=audit &gt; 200 | 200 | https://www.mayaallan.com/books?ref=audit | 0.57 | - | https://www.mayaallan.com/books | robots=index, follow + googlebot=index, follow | Books \| Maya Allan (lang en) |
| alt-domain | https://psilowire.com/ | 2026-09-24T18:48:29Z | 308 https://www.mayaallan.com/ &gt; 200 | 200 | https://www.mayaallan.com/ | 0.47 | - | https://www.mayaallan.com | robots=index, follow + googlebot=index, follow | Maya Allan — Author of the Psilocybin Integration Guide (lang en) |
| alt-domain | https://www.psilowire.com/ | 2026-09-24T18:48:29Z | 308 https://www.mayaallan.com/ &gt; 200 | 200 | https://www.mayaallan.com/ | 0.90 | - | https://www.mayaallan.com | robots=index, follow + googlebot=index, follow | Maya Allan — Author of the Psilocybin Integration Guide (lang en) |
| alt-domain | http://psilowire.com/ | 2026-09-24T18:48:29Z | 308 https://psilowire.com/ &gt; 308 https://www.mayaallan.com/ &gt; 200 | 200 | https://www.mayaallan.com/ | 0.62 | - | https://www.mayaallan.com | robots=index, follow + googlebot=index, follow | Maya Allan — Author of the Psilocybin Integration Guide (lang en) |
| alt-domain | https://psilocybinintegrationguide.com/ | 2026-09-24T18:48:30Z | 308 https://www.mayaallan.com/ &gt; 200 | 200 | https://www.mayaallan.com/ | 0.56 | - | https://www.mayaallan.com | robots=index, follow + googlebot=index, follow | Maya Allan — Author of the Psilocybin Integration Guide (lang en) |
| alt-domain | https://www.psilocybinintegrationguide.com/ | 2026-09-24T18:48:30Z | 308 https://www.mayaallan.com/ &gt; 200 | 200 | https://www.mayaallan.com/ | 0.54 | - | https://www.mayaallan.com | robots=index, follow + googlebot=index, follow | Maya Allan — Author of the Psilocybin Integration Guide (lang en) |
| alt-domain | https://psilocybinintegrationguide.com/about | 2026-09-24T18:48:30Z | 308 https://www.mayaallan.com/about &gt; 200 | 200 | https://www.mayaallan.com/about | 0.91 | - | https://www.mayaallan.com/about | robots=index, follow + googlebot=index, follow | About \| Maya Allan (lang en) |
| vercel-domain | https://mayaallan.vercel.app/ | 2026-09-24T18:48:30Z | 308 https://www.mayaallan.com/ &gt; 200 | 200 | https://www.mayaallan.com/ | 0.78 | - | https://www.mayaallan.com | robots=index, follow + googlebot=index, follow | Maya Allan — Author of the Psilocybin Integration Guide (lang en) |
| vercel-domain | https://mayaallan.vercel.app/about | 2026-09-24T18:48:30Z | 308 https://www.mayaallan.com/about &gt; 200 | 200 | https://www.mayaallan.com/about | 0.79 | - | https://www.mayaallan.com/about | robots=index, follow + googlebot=index, follow | About \| Maya Allan (lang en) |
| vercel-domain | https://mayaallan-mallan.vercel.app/ | 2026-09-24T18:48:30Z | 302 https://vercel.com/sso-api?url=https%3A%2F%2Fmayaallan-mallan.vercel.a... &gt; 307 /login?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fmayaallan-mallan.ve... &gt; 200 | 200 | https://vercel.com/login?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fmayaallan-m... | 0.98 | - | https://vercel.com/login |  | Login – Vercel (lang en-US) |
| vercel-domain | https://mayaallan-git-main-mallan.vercel.app/ | 2026-09-24T18:48:31Z | 302 https://vercel.com/sso-api?url=https%3A%2F%2Fmayaallan-git-main-mallan... &gt; 307 /login?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fmayaallan-git-main-... &gt; 200 | 200 | https://vercel.com/login?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fmayaallan-g... | 0.94 | - | https://vercel.com/login |  | Login – Vercel (lang en-US) |
| slash | https://www.mayaallan.com/about/ | 2026-09-24T18:48:31Z | 308 /about &gt; 200 | 200 | https://www.mayaallan.com/about | 0.28 | - | https://www.mayaallan.com/about | robots=index, follow + googlebot=index, follow | About \| Maya Allan (lang en) |
| slash | https://www.mayaallan.com/books/ | 2026-09-24T18:48:31Z | 308 /books &gt; 200 | 200 | https://www.mayaallan.com/books | 0.33 | - | https://www.mayaallan.com/books | robots=index, follow + googlebot=index, follow | Books \| Maya Allan (lang en) |
| slash | https://www.mayaallan.com/blog/affirmations-vs-integration/ | 2026-09-24T18:48:31Z | 308 /blog/affirmations-vs-integration &gt; 200 | 200 | https://www.mayaallan.com/blog/affirmations-vs-integration | 0.25 | - | https://www.mayaallan.com/blog/affirmations-vs-integration | robots=index, follow + googlebot=index, follow | The difference between an affirmation and an integration — a... (lang en) |
| case | https://www.mayaallan.com/About | 2026-09-24T18:48:32Z | 404 | 404 | https://www.mayaallan.com/About | 0.27 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| case | https://www.mayaallan.com/media/mushroom-healing | 2026-09-24T18:48:32Z | 404 | 404 | https://www.mayaallan.com/media/mushroom-healing | 0.33 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| dup | https://www.mayaallan.com/index.html | 2026-09-24T18:48:32Z | 404 | 404 | https://www.mayaallan.com/index.html | 0.24 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| dup | https://www.mayaallan.com/?utm_source=audit | 2026-09-24T18:48:32Z | 200 | 200 | https://www.mayaallan.com/?utm_source=audit | 0.28 | - | https://www.mayaallan.com | robots=index, follow + googlebot=index, follow | Maya Allan — Author of the Psilocybin Integration Guide (lang en) |
| dup | https://www.mayaallan.com//about | 2026-09-24T18:48:32Z | 308 /about &gt; 200 | 200 | https://www.mayaallan.com/about | 0.30 | - | https://www.mayaallan.com/about | robots=index, follow + googlebot=index, follow | About \| Maya Allan (lang en) |
| soft404 | https://www.mayaallan.com/zz-audit-missing-mufvxm3a | 2026-09-24T18:48:32Z | 404 | 404 | https://www.mayaallan.com/zz-audit-missing-mufvxm3a | 0.24 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| soft404 | https://www.mayaallan.com/books/zz-audit-missing-mufvxm3a | 2026-09-24T18:48:32Z | 404 | 404 | https://www.mayaallan.com/books/zz-audit-missing-mufvxm3a | 0.31 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| soft404 | https://www.mayaallan.com/blog/zz-audit-missing-mufvxm3a | 2026-09-24T18:48:32Z | 404 | 404 | https://www.mayaallan.com/blog/zz-audit-missing-mufvxm3a | 0.40 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| soft404 | https://www.mayaallan.com/media/zz-audit-missing-mufvxm3a | 2026-09-24T18:48:32Z | 404 | 404 | https://www.mayaallan.com/media/zz-audit-missing-mufvxm3a | 0.31 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| soft404 | https://www.mayaallan.com/scenarios/zz-audit-missing-mufvxm3a | 2026-09-24T18:48:32Z | 404 | 404 | https://www.mayaallan.com/scenarios/zz-audit-missing-mufvxm3a | 0.21 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| soft404 | https://www.mayaallan.com/es/zz-audit-missing-mufvxm3a | 2026-09-24T18:48:32Z | 404 | 404 | https://www.mayaallan.com/es/zz-audit-missing-mufvxm3a | 0.22 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang es) |
| wellknown | https://www.mayaallan.com/favicon.ico | 2026-09-24T18:48:33Z | 200 | 200 | https://www.mayaallan.com/favicon.ico | 0.17 | - | n/a | - | image/vnd.microsoft.icon 938B |
| wellknown | https://www.mayaallan.com/llms.txt | 2026-09-24T18:48:33Z | 200 | 200 | https://www.mayaallan.com/llms.txt | 0.17 | - | n/a | - | text/markdown 5651B |
| wellknown | https://www.mayaallan.com/llms-full.txt | 2026-09-24T18:48:33Z | 200 | 200 | https://www.mayaallan.com/llms-full.txt | 0.19 | - | n/a | - | text/markdown 109820B |
| wellknown | https://www.mayaallan.com/rss.xml | 2026-09-24T18:48:33Z | 404 | 404 | https://www.mayaallan.com/rss.xml | 0.23 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| wellknown | https://www.mayaallan.com/feed.xml | 2026-09-24T18:48:33Z | 404 | 404 | https://www.mayaallan.com/feed.xml | 0.40 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| wellknown | https://www.mayaallan.com/manifest.webmanifest | 2026-09-24T18:48:33Z | 404 | 404 | https://www.mayaallan.com/manifest.webmanifest | 0.26 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| wellknown | https://www.mayaallan.com/apple-touch-icon.png | 2026-09-24T18:48:33Z | 404 | 404 | https://www.mayaallan.com/apple-touch-icon.png | 0.24 | - | https://www.mayaallan.com | robots=noindex + robots=index, follow + googlebot=index, follow | Maya Allan \| Psilocybin Integration Author & Educator (lang none) |
| wellknown | https://www.mayaallan.com/.well-known/security.txt | 2026-09-24T18:48:33Z | 200 | 200 | https://www.mayaallan.com/.well-known/security.txt | 0.18 | - | n/a | - | text/plain 415B |

## User-agent parity (UA strings only, not crawler IPs)

| path | UA | read UTC | status | t s | bytes | title+desc in head | meta in head/total | og:image | canonical | x-vercel-cache |
|---|---|---|---|---|---|---|---|---|---|---|
| / | googlebot | 2026-09-24T18:48:33Z | 200 | 0.75 | 90273 | true | 23/23 | 1 | https://www.mayaallan.com | MISS |
| / | bingbot | 2026-09-24T18:48:33Z | 200 | 0.34 | 89984 | true | 23/23 | 1 | https://www.mayaallan.com | MISS |
| / | gptbot | 2026-09-24T18:48:33Z | 200 | 0.35 | 90230 | true | 23/23 | 1 | https://www.mayaallan.com | MISS |
| / | claudebot | 2026-09-24T18:48:33Z | 200 | 0.37 | 90273 | true | 23/23 | 1 | https://www.mayaallan.com | MISS |
| / | perplexitybot | 2026-09-24T18:48:34Z | 200 | 1.45 | 90273 | true | 23/23 | 1 | https://www.mayaallan.com | MISS |
| / | facebook | 2026-09-24T18:48:34Z | 200 | 0.33 | 89984 | true | 23/23 | 1 | https://www.mayaallan.com | MISS |
| / | chrome | 2026-09-24T18:48:34Z | 200 | 0.29 | 91506 | false | 3/23 | 1 | https://www.mayaallan.com | MISS |
| / | audit | 2026-09-24T18:48:34Z | 200 | 0.35 | 90273 | true | 23/23 | 1 | https://www.mayaallan.com | MISS |
| /faq | googlebot | 2026-09-24T18:48:34Z | 200 | 0.76 | 139054 | true | 19/19 | 0 | https://www.mayaallan.com/faq | MISS |
| /faq | bingbot | 2026-09-24T18:48:34Z | 200 | 0.32 | 138724 | true | 19/19 | 0 | https://www.mayaallan.com/faq | MISS |
| /faq | gptbot | 2026-09-24T18:48:35Z | 200 | 0.43 | 139054 | true | 19/19 | 0 | https://www.mayaallan.com/faq | MISS |
| /faq | claudebot | 2026-09-24T18:48:35Z | 200 | 1.09 | 139054 | true | 19/19 | 0 | https://www.mayaallan.com/faq | MISS |
| /faq | perplexitybot | 2026-09-24T18:48:35Z | 200 | 0.32 | 140287 | false | 3/19 | 0 | https://www.mayaallan.com/faq | MISS |
| /faq | facebook | 2026-09-24T18:48:35Z | 200 | 0.36 | 138724 | true | 19/19 | 0 | https://www.mayaallan.com/faq | MISS |
| /faq | chrome | 2026-09-24T18:48:35Z | 200 | 0.33 | 140287 | false | 3/19 | 0 | https://www.mayaallan.com/faq | MISS |
| /faq | audit | 2026-09-24T18:48:36Z | 200 | 0.75 | 140287 | false | 3/19 | 0 | https://www.mayaallan.com/faq | MISS |
| /media | googlebot | 2026-09-24T18:48:36Z | 200 | 0.70 | 58137 | false | 3/22 | 1 | https://www.mayaallan.com/media | MISS |
| /media | bingbot | 2026-09-24T18:48:36Z | 200 | 0.29 | 56624 | true | 22/22 | 1 | https://www.mayaallan.com/media | MISS |
| /media | gptbot | 2026-09-24T18:48:36Z | 200 | 0.28 | 56861 | true | 22/22 | 1 | https://www.mayaallan.com/media | MISS |
| /media | claudebot | 2026-09-24T18:48:36Z | 200 | 0.45 | 58137 | false | 3/22 | 1 | https://www.mayaallan.com/media | MISS |
| /media | perplexitybot | 2026-09-24T18:48:36Z | 200 | 0.27 | 56904 | true | 22/22 | 1 | https://www.mayaallan.com/media | MISS |
| /media | facebook | 2026-09-24T18:48:36Z | 200 | 0.28 | 56624 | true | 22/22 | 1 | https://www.mayaallan.com/media | MISS |
| /media | chrome | 2026-09-24T18:48:36Z | 200 | 0.31 | 58137 | false | 3/22 | 1 | https://www.mayaallan.com/media | MISS |
| /media | audit | 2026-09-24T18:48:36Z | 200 | 0.34 | 56904 | true | 22/22 | 1 | https://www.mayaallan.com/media | MISS |
| /privacy | googlebot | 2026-09-24T18:48:36Z | 200 | 0.56 | 51386 | true | 16/16 | 0 | https://www.mayaallan.com/privacy | MISS |
| /privacy | bingbot | 2026-09-24T18:48:37Z | 200 | 0.26 | 51079 | true | 16/16 | 0 | https://www.mayaallan.com/privacy | MISS |
| /privacy | gptbot | 2026-09-24T18:48:37Z | 200 | 0.29 | 51386 | true | 16/16 | 0 | https://www.mayaallan.com/privacy | MISS |
| /privacy | claudebot | 2026-09-24T18:48:37Z | 200 | 0.27 | 52619 | false | 3/16 | 0 | https://www.mayaallan.com/privacy | MISS |
| /privacy | perplexitybot | 2026-09-24T18:48:37Z | 200 | 0.32 | 51386 | true | 16/16 | 0 | https://www.mayaallan.com/privacy | MISS |
| /privacy | facebook | 2026-09-24T18:48:37Z | 200 | 0.34 | 51079 | true | 16/16 | 0 | https://www.mayaallan.com/privacy | MISS |
| /privacy | chrome | 2026-09-24T18:48:37Z | 200 | 0.27 | 52619 | false | 3/16 | 0 | https://www.mayaallan.com/privacy | MISS |
| /privacy | audit | 2026-09-24T18:48:37Z | 200 | 0.39 | 52619 | false | 3/16 | 0 | https://www.mayaallan.com/privacy | MISS |

## Per-page crawl table

via = BFS depth or sitemap-only / hreflang-target; t = curl time_total; inbound = distinct other crawled pages linking with &lt;a href&gt;.

| # | URL | via | read UTC | status | chain | final | t s | KB | X-Robots-Tag | meta robots | canonical | title (len) | desc len | h1 | lang | JSON-LD @types | og:title | og:image (status) | hreflang | words | inbound |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | / | 0 | 2026-09-24T18:48:20Z | 200 | 200 | = | 0.76 | 88 | - | robots=index, follow + googlebot=index, follow | self | Maya Allan — Author of the Psilocybin Integration Guide (55) | 152 | 1 | en ltr | WebSite+Person+Organization | yes | /opengraph-image (200) | 0 | 708 | 39 |
| 2 | /books | 1 | 2026-09-24T18:48:21Z | 200 | 200 | = | 0.44 | 45 | - | robots=index, follow + googlebot=index, follow | self | Books \| Maya Allan (18, after head) | 207 (after head) | 1 | en ltr | WebSite+Person+Organization+BreadcrumbList | yes | /opengraph-image (200) | 0 | 128 | 39 |
| 3 | /belief-inquiry | 1 | 2026-09-24T18:48:21Z | 200 | 200 | = | 0.37 | 37 | - | robots=index, follow + googlebot=index, follow | self | Belief Inquiry — A Curious Exploration of Limiting Beli... (71, after head) | 179 (after head) | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 202 | 39 |
| 4 | /nervous-system-reset | 1 | 2026-09-24T18:48:21Z | 200 | 200 | = | 0.42 | 36 | - | robots=index, follow + googlebot=index, follow | self | Free Nervous System Reset — Calm Anxiety, Release Tensi... (91) | 222 | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 183 | 38 |
| 5 | /integration-reflection | 1 | 2026-09-24T18:48:21Z | 200 | 200 | = | 0.38 | 36 | - | robots=index, follow + googlebot=index, follow | self | Integration Tool — Help a New Insight or Experience Lan... (69) | 178 | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 203 | 38 |
| 6 | /media | 1 | 2026-09-24T18:48:22Z | 200 | 200 | = | 0.37 | 56 | - | robots=index, follow + googlebot=index, follow | self | Media \| Maya Allan (18) | 100 | 1 | en ltr | WebSite+Person+Organization | yes | /media/opengraph-image (200) | 0 | 81 | 39 |
| 7 | /events | 1 | 2026-09-24T18:48:22Z | 200 | 200 | = | 0.25 | 40 | - | robots=index, follow + googlebot=index, follow | self | Events \| Maya Allan (19) | 56 | 1 | en ltr | WebSite+Person+Organization | yes | /events/opengraph-image (200) | 0 | 87 | 39 |
| 8 | /about | 1 | 2026-09-24T18:48:22Z | 200 | 200 | = | 0.34 | 47 | - | robots=index, follow + googlebot=index, follow | self | About \| Maya Allan (18) | 164 | 1 | en ltr | WebSite+Person+Organization+FAQPage+BreadcrumbList | yes | /opengraph-image (200) | 0 | 287 | 39 |
| 9 | /contact | 1 | 2026-09-24T18:48:22Z | 200 | 200 | = | 0.25 | 30 | - | robots=index, follow + googlebot=index, follow | self | Contact \| Maya Allan (20) | 76 | 1 | en ltr | WebSite+Person+Organization | yes | /opengraph-image (200) | 0 | 95 | 39 |
| 10 | /books/psilocybin-integration-guide | 1 | 2026-09-24T18:48:22Z | 200 | 200 | = | 0.35 | 94 | - | robots=index, follow + googlebot=index, follow | self | Psilocybin Integration Guide - 40 Real Psychedelic Expe... (75, after head) | 369 (after head) | 1 | en ltr | WebSite+Person+Organization+Book+BreadcrumbList | yes | /books/psilocybin-integration-guide/opengraph-image (200) | 0 | 789 | 13 |
| 11 | /privacy | 1 | 2026-09-24T18:48:22Z | 200 | 200 | = | 0.42 | 50 | - | robots=index, follow | self | Privacy Policy \| Maya Allan (27) | 133 | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 1260 | 39 |
| 12 | /integration-journal | 1 | 2026-09-24T18:48:22Z | 200 | 200 | = | 0.53 | 55 | - | robots=index, follow + googlebot=index, follow | self | Free Integration Journal — 7-Day PDF Template \| Maya Al... (58) | 224 | 1 | en ltr | WebSite+Person+Organization+BreadcrumbList+FAQPage+SoftwareApplication | yes | NONE | 0 | 685 | 39 |
| 13 | /methods | 1 | 2026-09-24T18:48:22Z | 200 | 200 | = | 0.31 | 40 | - | robots=index, follow + googlebot=index, follow | self | Methods & Attributions \| Maya Allan (35) | 209 | 1 | en ltr | WebSite+Person+Organization | yes | /opengraph-image (200) | 0 | 482 | 39 |
| 14 | /blog | 1 | 2026-09-24T18:48:22Z | 200 | 200 | = | 0.29 | 37 | - | robots=index, follow + googlebot=index, follow | self | Writing — Belief work, nervous-system regulation, integ... (74) | 196 | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 276 | 39 |
| 15 | /scenarios | 1 | 2026-09-24T18:48:23Z | 200 | 200 | = | 0.29 | 35 | - | robots=index, follow + googlebot=index, follow | self | Psilocybin Journey Scenarios — Practical Navigation Gui... (70) | 238 | 1 | en ltr | WebSite+Person+Organization+BreadcrumbList+CollectionPage+Article | yes | NONE | 0 | 193 | 39 |
| 16 | /glossary | 1 | 2026-09-24T18:48:23Z | 200 | 200 | = | 0.29 | 182 | - | robots=index, follow + googlebot=index, follow | self | Psilocybin & Integration Glossary \| Maya Allan (46, after head) | 340 (after head) | 1 | en ltr | WebSite+Person+Organization+DefinedTermSet+BreadcrumbList | yes | NONE | 0 | 2673 | 39 |
| 17 | /faq | 1 | 2026-09-24T18:48:23Z | 200 | 200 | = | 0.27 | 137 | - | robots=index, follow + googlebot=index, follow | self | Reader Questions — Psilocybin Integration Guide \| Maya ... (60, after head) | 364 (after head) | 1 | en ltr | WebSite+Person+Organization+FAQPage+BreadcrumbList | yes | NONE | 0 | 2501 | 39 |
| 18 | /terms | 1 | 2026-09-24T18:48:23Z | 200 | 200 | = | 0.31 | 48 | - | robots=index, follow | self | Terms of Service \| Maya Allan (29, after head) | 134 (after head) | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 1044 | 39 |
| 19 | /refunds | 1 | 2026-09-24T18:48:23Z | 200 | 200 | = | 0.27 | 37 | - | robots=index, follow | self | Refund Policy \| Maya Allan (26) | 95 | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 524 | 39 |
| 20 | /blog/psilocybin-integration-research | 2 | 2026-09-24T18:48:23Z | 200 | 200 | = | 0.34 | 87 | - | robots=index, follow + googlebot=index, follow | self | Integration after psilocybin: what the memory research ... (97) | 183 | 1 | en ltr | WebSite+Person+Organization+Article | yes | NONE | 0 | 2963 | 5 |
| 21 | /scenarios/ego-dissolution | 2 | 2026-09-24T18:48:23Z | 200 | 200 | = | 0.44 | 99 | - | robots=index, follow + googlebot=index, follow | self | What does ego dissolution feel like during a psilocybin... (77) | 242 | 1 | en ltr | WebSite+Person+Organization+Article+WebPage+CreativeWorkSeries+BreadcrumbList | yes | NONE | 0 | 3279 | 5 |
| 22 | /legal | 2 | 2026-09-24T18:48:23Z | 200 | 200 | = | 0.25 | 33 | - | robots=index, follow | self | Educational Disclaimer \| Maya Allan (35, after head) | 147 (after head) | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 264 | 3 |
| 23 | /practices | 2 | 2026-09-24T18:48:23Z | 200 | 200 | = | 0.32 | 44 | - | robots=index, follow + googlebot=index, follow | self | Practices — Belief Inquiry, Nervous System Reset, Integ... (106) | 191 | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 257 | 1 |
| 24 | /blog/affirmations-vs-integration | 2 | 2026-09-24T18:48:24Z | 200 | 200 | = | 0.28 | 61 | - | robots=index, follow + googlebot=index, follow | self | The difference between an affirmation and an integratio... (90) | 110 | 1 | en ltr | WebSite+Person+Organization+Article | yes | NONE | 0 | 1469 | 1 |
| 25 | /blog/inherited-beliefs-grandmother-marriage | 2 | 2026-09-24T18:48:24Z | 200 | 200 | = | 0.40 | 65 | - | robots=index, follow + googlebot=index, follow | self | How your grandmother's fear shows up in your marriage \|... (66) | 90 | 1 | en ltr | WebSite+Person+Organization+Article | yes | NONE | 0 | 1687 | 1 |
| 26 | /blog/curiosity-over-judgment-ifs | 2 | 2026-09-24T18:48:24Z | 200 | 200 | = | 0.28 | 58 | - | robots=index, follow + googlebot=index, follow | self | Curiosity over judgment: the IFS move that changes how ... (96) | 136 | 1 | en ltr | WebSite+Person+Organization+Article | yes | NONE | 0 | 1386 | 1 |
| 27 | /blog/audit-is-the-wrong-word | 2 | 2026-09-24T18:48:24Z | 200 | 200 | = | 0.33 | 58 | - | robots=index, follow + googlebot=index, follow | self | Why 'audit' is the wrong word for belief work \| Maya Al... (58) | 128 | 1 | en ltr | WebSite+Person+Organization+Article | yes | NONE | 0 | 1328 | 1 |
| 28 | /integration | 3 | 2026-09-24T18:48:24Z | 200 | 308&gt;200 | /integration-reflection | 0.32 | 36 | - | robots=index, follow + googlebot=index, follow | self | Integration Tool — Help a New Insight or Experience Lan... (69) | 178 | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 203 | 38 |
| 29 | /reset | 3 | 2026-09-24T18:48:24Z | 200 | 308&gt;200 | /nervous-system-reset | 0.53 | 36 | - | robots=index, follow + googlebot=index, follow | self | Free Nervous System Reset — Calm Anxiety, Release Tensi... (91) | 222 | 1 | en ltr | WebSite+Person+Organization | yes | NONE | 0 | 183 | 38 |
| 30 | /es | sitemap-only | 2026-09-24T18:48:25Z | 200 | 200 | = | 0.26 | 35 | - | robots=index, follow + googlebot=index, follow | self | Guía con los pies en la tierra para la integración de l... (104, after head) | 117 (after head) | 1 | es ltr | WebSite+Person+Organization | yes | NONE | 7 | 221 | 0 |
| 31 | /pt | sitemap-only | 2026-09-24T18:48:25Z | 200 | 200 | = | 0.34 | 35 | - | robots=index, follow + googlebot=index, follow | self | Orientação fundamentada para a integração da psilocibin... (92, after head) | 120 (after head) | 1 | pt ltr | WebSite+Person+Organization | yes | NONE | 7 | 208 | 0 |
| 32 | /de | sitemap-only | 2026-09-24T18:48:25Z | 200 | 200 | = | 0.25 | 35 | - | robots=index, follow + googlebot=index, follow | self | Fundierte Begleitung für Psilocybin-Integration und inn... (79, after head) | 135 (after head) | 1 | de ltr | WebSite+Person+Organization | yes | NONE | 7 | 182 | 0 |
| 33 | /fr | sitemap-only | 2026-09-24T18:48:25Z | 200 | 200 | = | 0.29 | 34 | - | robots=index, follow + googlebot=index, follow | self | Un accompagnement ancré pour l'intégration de la psiloc... (98) | 119 | 1 | fr ltr | WebSite+Person+Organization | yes | NONE | 7 | 198 | 0 |
| 34 | /he | sitemap-only | 2026-09-24T18:48:25Z | 200 | 200 | = | 0.27 | 35 | - | robots=index, follow + googlebot=index, follow | self | ליווי מבוסס ושקול לאינטגרציה של פסילוסיבין ולעבודה הפני... (72) | 85 | 1 | he rtl | WebSite+Person+Organization | yes | NONE | 7 | 163 | 0 |
| 35 | /es/about | sitemap-only | 2026-09-24T18:48:25Z | 200 | 200 | = | 0.27 | 34 | - | robots=index, follow + googlebot=index, follow | self | Sobre Maya Allan \| Maya Allan (29) | 124 | 1 | es ltr | WebSite+Person+Organization | yes | NONE | 7 | 204 | 1 |
| 36 | /pt/about | sitemap-only | 2026-09-24T18:48:25Z | 200 | 200 | = | 0.45 | 35 | - | robots=index, follow + googlebot=index, follow | self | Sobre Maya Allan \| Maya Allan (29, after head) | 108 (after head) | 1 | pt ltr | WebSite+Person+Organization | yes | NONE | 7 | 202 | 1 |
| 37 | /de/about | sitemap-only | 2026-09-24T18:48:25Z | 200 | 200 | = | 0.23 | 35 | - | robots=index, follow + googlebot=index, follow | self | Über Maya Allan \| Maya Allan (28, after head) | 116 (after head) | 1 | de ltr | WebSite+Person+Organization | yes | NONE | 7 | 179 | 1 |
| 38 | /fr/about | sitemap-only | 2026-09-24T18:48:25Z | 200 | 200 | = | 0.28 | 34 | - | robots=index, follow + googlebot=index, follow | self | À propos de Maya Allan \| Maya Allan (35) | 119 | 1 | fr ltr | WebSite+Person+Organization | yes | NONE | 7 | 204 | 1 |
| 39 | /he/about | sitemap-only | 2026-09-24T18:48:26Z | 200 | 200 | = | 0.27 | 36 | - | robots=index, follow + googlebot=index, follow | self | אודות מאיה אלן \| Maya Allan (27, after head) | 81 (after head) | 1 | he rtl | WebSite+Person+Organization | yes | NONE | 7 | 173 | 1 |
| 40 | /media/Mushroom-Healing | sitemap-only | 2026-09-24T18:48:26Z | 200 | 200 | = | 0.38 | 35 | - | robots=index, follow + googlebot=index, follow | self | Mushroom Healing \| Maya Allan (29, after head) | 19 (after head) | 1 | en ltr | WebSite+Person+Organization+ImageObject | yes | /media/Mushroom-Healing/opengraph-image (200) | 0 | 84 | 0 |