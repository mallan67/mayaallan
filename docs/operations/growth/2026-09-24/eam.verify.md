# Adversarial review: engineering-as-marketing (eam), 2026-09-24

**Reviewed:** `docs/operations/growth/2026-09-24/03-engineering-as-marketing.md` at commit `170bf0f3e95a` (committed 18:44:53Z; commit metadata read live 18:53:14Z).
**Checks per tactic:**
- (a) recency;
- (b) real evidence (numbers, case, study) versus opinion or vendor hype;
- (c) rehash of what this site already did without results, checked against live GitHub PR, commit and issue metadata of `mallan67/mayaallan`;
- (d) fit for a solo author with a near-zero audience and psychedelic-content restrictions.

A tactic that fails any check gets keep=false. Useful parts of a dropped tactic are moved into a kept one, as the table states.
All times are UTC on 2026-09-24. No app source files, local files, forms or logins were used.

## Verdict
- **Kept (4):** eam-00, eam-01, eam-07, eam-06, each with the changes below.
- **Dropped (7):** eam-02, eam-03, eam-04, eam-05, eam-08, eam-09, eam-10.
- **Order:**
  1. eam-00 (days).
  2. eam-01 and eam-07 in **one** code PR.
  3. eam-06 (owner) starts the same week.

  eam-06 is the only kept tactic that brings new people. Without it, eam-01 and eam-07 capture a share of roughly zero visitors.

## Errors in the lens (fix before acting on it)
1. **The eam-07 claim "AI tools have no /books link in their SSR HTML" is false.** A live GET at 18:47:47Z found `href="/books"` twice (nav and footer) on each of `/belief-inquiry`, `/nervous-system-reset` and `/integration-reflection`. What is missing is a link to the book itself: none of the three pages contains `href="/books/psilocybin-integration-guide"`. By comparison, the scenario page has 3 such links and the glossary has 1 (18:48:05Z).
2. **The lens leaves out the tools' existing paid exit.** Live `/practices` (18:47:47Z): "No signup. Save a session as a PDF for $9.99 if you want to keep it." Commit `1f9413b` (2026-05-11) added this: "Save for $9.99 ... names the format (PDF) and delivery (email)". Two consequences:
   - eam-01's "email a copy of the reflection" gives that paid product away for free.
   - eam-07's $9.99 book CTA competes with it at the same moment. The book is also $9.99; the live book page shows the price 5 times (18:48:05Z).
3. **The HubSpot AI Search Grader is not an example of "results with no form, then an offer".** The live page (18:49:40Z) says "No Account Required", but it carries a HubSpot form modal: `data-form-title="Unlock Your Report" data-form-description="All fields are required."` (`data-modal-id="llm-grader-form"`). The report is gated behind that form. Its fields are rendered by JavaScript, so which fields it asks for is UNVERIFIED. "No account" does not mean "no email".
4. **eam-00 step 2 rebuilds events that already exist.**
   - PR #12 (merged 2026-05-13) already records `book_viewed`, `checkout_started`, `purchase_completed`, `newsletter_subscribed` and `contact_submitted`, and writes attribution to `orders`.
   - Commit `2e559a0` (2026-04-20), "Wire analytics events into three chat components", already added tool events.
   - Vercel's pricing doc (last_updated 2026-08-25, read ~18:52Z) shows Custom Events as **"-" on Hobby** (Pro includes them, with 2 properties). UTM parameters are **only on Pro with Web Analytics Plus**. If the April tool events call `@vercel/analytics` `track()` on a Hobby team, they record nothing. The project's plan was not read (UNVERIFIED).