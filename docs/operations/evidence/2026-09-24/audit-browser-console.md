# Audit evidence — REAL BROWSER + CONSOLE (lens ids `ui-`)

| Field | Value |
|---|---|
| Site | https://www.mayaallan.com (canonical host) |
| Lens | Real browser + console, desktop 1366x900 and mobile 390x844 |
| UTC window | 2026-09-24T18:18:42Z to 2026-09-24T18:38:14Z (browser closed 18:38Z); file written ~18:45Z in chunks (Bash tool rejected one large command) |
| Browser | Playwright MCP, Chromium, request UA `Chrome/153.0.0.0` Windows (request headers of POST /api/marketing/event, 18:20:59Z) |
| Deployment served | Every audited page loaded chunks with `?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4` = the production deployment named in the task |
| Sources (all live) | Playwright MCP (navigate, evaluate, console_messages, network_requests, network_request, click, resize, wait_for, close); `curl` GET to the site domains (piped only); `gh api` (PR #57 metadata, branch ref); Vercel MCP `get_project` (prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y, team_kZQh5NYLyrOKqffK0r9EXf4E) |
| Not used | Repository source files, local files, scratchpad, Gmail/Drive, logins, form submits, /api/cron, /api/admin, /api/indexnow |
| Clicks made | Cookie banner Accept/Reject, footer "Cookie preferences", mobile "Open menu", one menu link, one page link, one journal radio (client-side). No Buy/PayPal/Subscribe/Send/Download/AI clicks. |

## 0. Verdict

The site itself runs cleanly in a real browser. Across 26 desktop and 24 mobile page loads there were **0 JavaScript errors, 0 hydration errors, 0 CSP violations, 0 failed network requests, 0 broken visible images, 0 images missing alt, and 0 horizontal overflow**. The only console output is a mobile "preload not used" warning for the book cover, plus the expected 404 on the 404 test page. What fails is measurement and conversion, not code. **Visitors are counted only after they click "Accept all".** Anyone who rejects or ignores the banner produces no pageview and no visitor record. The only exception is one anonymous `book_viewed` event on the book page. Vercel Web Analytics is also reported as not enabled (orchestrator fact, 17:48Z), and PR #57 is still open and unmerged (checked live 18:38:14Z). So "who looks / who clicks" is almost invisible. On the book page, the Buy button sits 3.3 screens down on desktop and 5.7 screens down on mobile. Several indexed pages in the main navigation are empty or thin (Events, Media, Scenarios).