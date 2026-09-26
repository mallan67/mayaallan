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
// B. Author bio restoration / governance
// ---------------------------------------------------------------------------

test("Home reads the preserved author bio from site_settings", () => {
  assert.match(home, /author_bio/)
  assert.match(home, /authorInfo\.authorBio/)
  assert.match(home, /\.select\("author_name, author_bio, author_photo_url"\)/)
})

test("About reads the preserved author bio from site_settings", () => {
  assert.match(about, /author_bio/)
  assert.match(about, /author\.authorBio/)
  assert.match(about, /\.select\("id, author_name, author_bio, author_photo_url"\)/)
})

test("Admin Settings exposes author name and bio for owner-controlled editing", () => {
  assert.match(adminSettingsUi, /name="authorName"/)
  assert.match(adminSettingsUi, /name="authorBio"/)
  assert.match(adminSettingsUi, /authorName:\s*String\(/)
  assert.match(adminSettingsUi, /authorBio:\s*String\(/)
  assert.match(adminSettingsUi, /label="Author Photo"/)
})

test("Admin Settings API accepts and writes author name/bio", () => {
  const schema = adminSettingsApi.slice(adminSettingsApi.indexOf("const SettingsSchema"), adminSettingsApi.indexOf("export async function GET"))
  assert.match(schema, /^\s*authorName\s*:/m)
  assert.match(schema, /^\s*authorBio\s*:/m)
  const write = adminSettingsApi.slice(adminSettingsApi.indexOf("const settingsData"), adminSettingsApi.indexOf("updated_at:"))
  assert.match(write, /^\s*author_name\s*:/m)
  assert.match(write, /^\s*author_bio\s*:/m)
  assert.match(adminSettingsApi, /authorName:\s*row\.author_name/)
  assert.match(adminSettingsApi, /authorBio:\s*row\.author_bio/)
})
