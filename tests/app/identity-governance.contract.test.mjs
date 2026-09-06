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
// B. Canonical author name / bio governance
// ---------------------------------------------------------------------------

const DB_IDENTITY_TOKENS = /author_name|author_bio|authorName|authorBio/

test("Home renders canonical AUTHOR_NAME / AUTHOR_BIO and reads only the author photo from site_settings", () => {
  assert.match(home, /import\s*\{[^}]*\bAUTHOR_NAME\b[^}]*\}\s*from\s*"@\/lib\/identity"/)
  assert.match(home, /import\s*\{[^}]*\bAUTHOR_BIO\b[^}]*\}\s*from\s*"@\/lib\/identity"/)
  assert.doesNotMatch(home, DB_IDENTITY_TOKENS)
  assert.match(home, /\.select\("author_photo_url"\)/)
  assert.match(home, /\{AUTHOR_BIO\}/)
  assert.match(home, /\{AUTHOR_NAME\}/)
})

test("About renders canonical AUTHOR_NAME / AUTHOR_BIO and reads only the author photo from site_settings", () => {
  assert.match(about, /import\s*\{[^}]*\bAUTHOR_NAME\b[^}]*\}\s*from\s*"@\/lib\/identity"/)
  assert.match(about, /import\s*\{[^}]*\bAUTHOR_BIO\b[^}]*\}\s*from\s*"@\/lib\/identity"/)
  assert.doesNotMatch(about, DB_IDENTITY_TOKENS)
  assert.match(about, /\.select\("(id, )?author_photo_url"\)/)
  assert.match(about, /\{AUTHOR_BIO\}/)
  assert.match(about, /<h1[^>]*>\s*\{AUTHOR_NAME\}/)
  assert.match(about, /generateAuthorSchema\(\s*SITE_URL,\s*AUTHOR_BIO/)
  assert.match(about, /About \$\{AUTHOR_NAME\}/)
})

test("Admin Settings UI no longer presents author name/bio as editable, and never sends them", () => {
  assert.doesNotMatch(adminSettingsUi, /name="authorName"/)
  assert.doesNotMatch(adminSettingsUi, /name="authorBio"/)
  assert.doesNotMatch(adminSettingsUi, /authorName:\s*String\(/)
  assert.doesNotMatch(adminSettingsUi, /authorBio:\s*String\(/)
  // Author photo remains editable exactly as before.
  assert.match(adminSettingsUi, /label="Author Photo"/)
  assert.match(adminSettingsUi, /authorPhotoUrl:\s*authorPhotoUrl \|\| ""/)
})

test("Admin Settings API no longer accepts or writes author name/bio; the photo column is still written", () => {
  const schema = adminSettingsApi.slice(adminSettingsApi.indexOf("const SettingsSchema"), adminSettingsApi.indexOf("export async function GET"))
  // Key definitions only (an explanatory comment may still name the fields).
  assert.doesNotMatch(schema, /^\s*(authorName|authorBio)\s*:/m)
  assert.match(schema, /authorPhotoUrl:\s*optionalHttpsUrl/)
  const write = adminSettingsApi.slice(adminSettingsApi.indexOf("const settingsData"), adminSettingsApi.indexOf("updated_at:"))
  assert.doesNotMatch(write, /^\s*(author_name|author_bio)\s*:/m)
  assert.match(write, /author_photo_url:\s*data\.authorPhotoUrl/)
  // The wire shape no longer advertises the fields either.
  assert.doesNotMatch(adminSettingsApi, /authorName:\s*row\.author_name|authorBio:\s*row\.author_bio/)
})
