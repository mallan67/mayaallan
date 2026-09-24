# Live crawl audit, part 3 (lens FULL LIVE CRAWL, ids crawl-)

UTC window 2026-09-24T18:45:44Z to 2026-09-24T18:46:13Z; live sources and method as in `docs/operations/evidence/2026-09-24/audit-crawl.md`.

## Asset checks

| # | asset | kind | read UTC | HEAD status (GET fallback) | content-type | content-length | referenced by |
|---|---|---|---|---|---|---|---|
| 1 | /opengraph-image | og:image,twitter:image | 2026-09-24T18:45:52Z | 200 | image/png | - | 24 pages (first /) |
| 2 | /media/opengraph-image | og:image | 2026-09-24T18:45:52Z | 200 | image/png | - | 1 pages (first /media) |
| 3 | /media/twitter-image | twitter:image | 2026-09-24T18:45:52Z | 200 | image/png | - | 1 pages (first /media) |
| 4 | /events/opengraph-image | og:image | 2026-09-24T18:45:52Z | 200 | image/png | - | 1 pages (first /events) |
| 5 | /events/twitter-image | twitter:image | 2026-09-24T18:45:52Z | 200 | image/png | - | 1 pages (first /events) |
| 6 | /books/psilocybin-integration-guide/opengraph-image | og:image | 2026-09-24T18:45:52Z | 200 | image/png | - | 1 pages (first /books/psilocybin-integration-guide) |
| 7 | /books/psilocybin-integration-guide/twitter-image | twitter:image | 2026-09-24T18:45:52Z | 200 | image/png | - | 1 pages (first /books/psilocybin-integration-guide) |
| 8 | /media/Mushroom-Healing/opengraph-image | og:image | 2026-09-24T18:45:52Z | 200 | image/png | - | 1 pages (first /media/Mushroom-Healing) |
| 9 | /media/Mushroom-Healing/twitter-image | twitter:image | 2026-09-24T18:45:53Z | 200 | image/png | - | 1 pages (first /media/Mushroom-Healing) |
| 10 | /_next/image?url=https%3A%2F%2Fyaqhbuvjnaq0ur0v.public.blob.vercel-storage.com%2Fuploads%2F1771580739166-1.jpg... | img,img-srcset | 2026-09-24T18:45:53Z | 200 | image/jpeg | 328114 | 1 pages (first /) |
| 11 | /_next/image?url=https%3A%2F%2Fyaqhbuvjnaq0ur0v.public.blob.vercel-storage.com%2Fuploads%2F1769090164128-Psilo... | img,img-srcset | 2026-09-24T18:45:53Z | 200 | image/jpeg | 71675 | 3 pages (first /) |
| 12 | /_next/image?url=https%3A%2F%2Fyaqhbuvjnaq0ur0v.public.blob.vercel-storage.com%2Fuploads%2F1771580739166-1.jpg... | img,img-srcset | 2026-09-24T18:45:53Z | 200 | image/jpeg | 27214 | 2 pages (first /) |
| 13 | /_next/static/chunks/ac184285d4e67ed8.css?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | link:stylesheet | 2026-09-24T18:45:53Z | 200 | text/css | - | 40 pages (first /) |
| 14 | /_next/static/chunks/c4ecf25eb9152f1c.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | link:preload,script | 2026-09-24T18:45:53Z | 200 | application/javascript | - | 40 pages (first /) |
| 15 | yaqhbuvjnaq0ur0v.public.blob.vercel-storage.com/uploads/1769102188323-icon.jpg | link:icon,link:apple-touch-icon | 2026-09-24T18:45:53Z | 200 | image/jpeg | 13564 | 40 pages (first /) |
| 16 | /_next/static/chunks/ccda296e04f568d7.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:53Z | 200 | application/javascript | - | 40 pages (first /) |
| 17 | /_next/static/chunks/f31c7b58e0d8dfa2.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:53Z | 200 | application/javascript | - | 40 pages (first /) |
| 18 | /_next/static/chunks/3eaea37ed79c23a0.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:53Z | 200 | application/javascript | - | 40 pages (first /) |
| 19 | /_next/static/chunks/cf5f64e3eb8dd740.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:53Z | 200 | application/javascript | - | 40 pages (first /) |
| 20 | /_next/static/chunks/turbopack-8de396b5b8a85fea.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:53Z | 200 | application/javascript | - | 40 pages (first /) |
| 21 | /_next/static/chunks/a17b574932eaff36.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:53Z | 200 | application/javascript | 282 | 40 pages (first /) |
| 22 | /_next/static/chunks/188f885d6144154e.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:53Z | 200 | application/javascript | - | 40 pages (first /) |
| 23 | /_next/static/chunks/7cd472e1e900d943.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 40 pages (first /) |
| 24 | /_next/static/chunks/312c5210c9c35dc5.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 40 pages (first /) |
| 25 | /_next/static/chunks/ea2d562f45bd7a1c.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 40 pages (first /) |
| 26 | /_next/static/chunks/bc55967f7a3249cb.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 1 pages (first /) |
| 27 | /_next/static/chunks/a6dad97d9634a72d.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 40 pages (first /) |
| 28 | /_next/static/chunks/aa07822276307c7c.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 1 pages (first /books) |
| 29 | /_next/static/chunks/93b33527075b290f.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 1 pages (first /belief-inquiry) |
| 30 | /_next/static/chunks/9a7cf34cbe809fe3.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 5 pages (first /belief-inquiry) |
| 31 | /_next/static/chunks/a3a5de630bb5e7f8.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 2 pages (first /nervous-system-reset) |
| 32 | /_next/static/chunks/c97ba6bd6836d1ee.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 2 pages (first /integration-reflection) |
| 33 | /_next/image?url=https%3A%2F%2Fyaqhbuvjnaq0ur0v.public.blob.vercel-storage.com%2Fuploads%2F1769091542638-mushr... | img,img-srcset | 2026-09-24T18:45:54Z | 200 | image/png | 625157 | 2 pages (first /media) |
| 34 | /_next/static/chunks/aa7ae9b96dde66c3.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 2 pages (first /media) |
| 35 | /_next/static/chunks/5b913796abf4513b.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 2 pages (first /about) |
| 36 | /_next/static/chunks/001ea6f2792f6797.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 1 pages (first /contact) |
| 37 | /_next/static/chunks/fc986f8dd4b371e4.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 1 pages (first /books/psilocybin-integration-guide) |
| 38 | /_next/static/chunks/5bcaff4db7d4d1ce.js?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 | script | 2026-09-24T18:45:54Z | 200 | application/javascript | - | 1 pages (first /integration-journal) |