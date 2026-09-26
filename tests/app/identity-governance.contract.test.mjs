/**
 * Identity / metadata governance contracts (fix/identity-metadata-governance-2026-09-05).
 *
 * Maya's canonical public identity lives in code (src/lib/identity.ts:
 * AUTHOR_NAME, AUTHOR_BIO, AUTHOR_JOB_TITLE, AUTHOR_PROFILES). These tests
 * pin the surfaces that used to drift from it:
 *   - Contact positioning ("speaking engagements" → press / collaborations /
 *     reader inquiries);
 *   - Home and About render the canonical name/bio, not site_settings;
 *   - Admin Settings can no longer overwrite the public author name/bio
 *     (the author PHOTO stays editable);
 *   - the unclaimed X handle is not attributed on the root layout or the
 *     book page (the frozen scenario page is a known temporary exception).
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
const contact = read("../../src/app/contact/page.tsx")
const contactClient = read("../../src/app/contact/contactClient.tsx")
const layout = read("../../src/app/layout.tsx")
const bookPage = read("../../src/app/books/[slug]/page.tsx")
const identity = read("../../src/lib/identity.ts")
const home = read("../../src/app/page.tsx")
const about = read("../../src/app/about/page.tsx")
const adminSettingsUi = read("../../src/app/admin/settings/page.tsx")
const adminSettingsApi = read("../../src/app/api/admin/settings/route.ts")
const scenarioPage = read("../../src/app/scenarios/[slug]/page.tsx")

const FORBIDDEN_POSITIONING = /\b(speaker|speaking|wellness advocate|therapist|facilitator|coach|clinician|healer|psychedelic practitioner|lived[- ]experience)\b/i

// ---------------------------------------------------------------------------
// A. Contact positioning
// ---------------------------------------------------------------------------

test("Contact metadata contains no 'speaking engagements' and no forbidden positioning", () => {
  assert.doesNotMatch(contact, /speaking engagements/i)
  assert.doesNotMatch(contact, FORBIDDEN_POSITIONING)
  assert.doesNotMatch(contactClient, FORBIDDEN_POSITIONING)
})

test("Contact description, Open Graph description and Twitter description all use the approved wording", () => {
  const approved = /press, collaborations, or reader inquiries/
  const descriptions = [...contact.matchAll(/description:\s*"([^"]*)"/g)].map((m) => m[1])
  assert.equal(descriptions.length, 3, "page description + openGraph.description + twitter.description")
  for (const d of descriptions) assert.match(d, approved)
  // Visible form copy on the same surface uses the same positioning.
  assert.match(contactClient, /press, collaborations, or reader inquiries/)
})

// ---------------------------------------------------------------------------
// C. Unclaimed X handle — non-frozen surfaces only
// ---------------------------------------------------------------------------

test("root layout no longer attributes the unclaimed @mayaallan handle, but keeps the X card", () => {
  assert.doesNotMatch(layout, /@mayaallan/)
  assert.match(layout, /twitter:\s*\{[\s\S]*?card:\s*"summary_large_image"[\s\S]*?images:/)
})

test("book metadata no longer attributes the unclaimed @mayaallan handle, but keeps the X card", () => {
  assert.doesNotMatch(bookPage, /@mayaallan/)
  assert.match(bookPage, /twitter:\s*\{[\s\S]*?card:\s*"summary_large_image"[\s\S]*?images:\s*\[twitterImageUrl\]/)
})

test("identity.ts still does NOT publish the unclaimed X profile", () => {
  const live = identity.split(/\r?\n/).filter((l) => /^\s*"https:\/\/x\.com\//.test(l))
  assert.deepEqual(live, [], "no uncommented x.com entry in AUTHOR_PROFILES")
  assert.match(identity, /\/\/\s*"https:\/\/x\.com\/mayaallan"/, "the claim-or-remove reminder is still there")
})

test("FROZEN EXCEPTION: the scenario page is untouched and still carries the handle (remove after the indexing experiment)", () => {
  // Deliberate guard so the frozen /scenarios/ego-dissolution surface is not
  // edited during the experiment. Delete this test when the freeze lifts.
  assert.match(scenarioPage, /@mayaallan/)
})

// ---------------------------------------------------------------------------
// B. Canonical author bio governance
// ---------------------------------------------------------------------------

test("identity.ts contains the one approved author bio and rejects prior variants", () => {
  assert.match(identity, /Deep inner clarity is a fundamental human birthright/)
  assert.match(identity, /no one can do this inner work for us/)
  assert.match(identity, /This is practical, grounded work: self-knowledge and radical acceptance/)
  assert.match(identity, /explorer of consciousness—not an authority, but a provider of information/)
  assert.doesNotMatch(identity, /no one can heal us but ourselves/)
  assert.doesNotMatch(identity, /True healing is a practical, grounded process/)
  assert.doesNotMatch(identity, /Maya Allan is an author and educator focused on psilocybin integration/)
})

test("Home renders AUTHOR_BIO and never reads author_bio from site_settings", () => {
  assert.match(home, /\bAUTHOR_BIO\b/)
  assert.match(home, /\{AUTHOR_BIO\}/)
  assert.doesNotMatch(home, /author_bio|authorBio/)
  assert.match(home, /\.select\("author_photo_url"\)/)
})

test("About renders AUTHOR_BIO and never reads author_bio from site_settings", () => {
  assert.match(about, /\bAUTHOR_BIO\b/)
  assert.match(about, /\{AUTHOR_BIO\}/)
  assert.doesNotMatch(about, /author_bio|authorBio/)
  assert.match(about, /\.select\("author_photo_url"\)/)
})

test("Admin Settings shows the canonical bio read-only and cannot submit another version", () => {
  assert.match(adminSettingsUi, /Canonical Author Bio/)
  assert.match(adminSettingsUi, /\{AUTHOR_BIO\}/)
  assert.doesNotMatch(adminSettingsUi, /name="authorName"|name="authorBio"/)
  assert.doesNotMatch(adminSettingsUi, /authorName:\s*String\(|authorBio:\s*String\(/)
  assert.match(adminSettingsUi, /label="Author Photo"/)
})

test("Admin Settings API does not accept, expose, or write alternate author bio fields", () => {
  const schema = adminSettingsApi.slice(adminSettingsApi.indexOf("const SettingsSchema"), adminSettingsApi.indexOf("export async function GET"))
  assert.doesNotMatch(schema, /^\s*(authorName|authorBio)\s*:/m)
  const write = adminSettingsApi.slice(adminSettingsApi.indexOf("const settingsData"), adminSettingsApi.indexOf("updated_at:"))
  assert.doesNotMatch(write, /^\s*(author_name|author_bio)\s*:/m)
  assert.doesNotMatch(adminSettingsApi, /authorName:\s*row\.author_name|authorBio:\s*row\.author_bio/)
})
