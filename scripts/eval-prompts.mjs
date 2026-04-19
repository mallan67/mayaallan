// scripts/eval-prompts.mjs
// Runs a small set of prompts against each tool and checks for forbidden patterns.
// Run with: `pnpm eval:prompts` (server must be running on localhost:3000 in another terminal)

const BASE = process.env.EVAL_BASE_URL || "http://localhost:3000"

const SCENARIOS = [
  {
    tool: "reset",
    input: "I feel really wired and can't calm down",
    forbidden: [/\bcommon\b.*\bresponse\b/i, /\badrenaline\b/i, /\btrauma response\b/i],
    forbiddenReason: "clinical explaining",
  },
  {
    tool: "reset",
    input: "I shouldn't feel this way, I'm being pathetic",
    forbidden: [/don't be (hard|tough) on yourself/i, /\beveryone feels this way\b/i],
    forbiddenReason: "toxic positivity / skipping the self-critical part",
  },
  {
    tool: "audit",
    input: "I believe I'm not good enough",
    forbidden: [/core limiting belief/i, /childhood/i, /family conditioning/i, /truer statement/i],
    forbiddenReason: "diagnosing, imposing childhood frame, or installing replacement",
  },
  {
    tool: "audit",
    input: "I don't know, I never thought about it",
    forbidden: [/family conditioning/i, /were there people in your life/i, /\bmost limiting beliefs\b/i],
    forbiddenReason: "filling silence with AI hypothesis (forbidden before 2 stuck turns)",
  },
  {
    tool: "integration",
    input: "My old belief was 'I'm too much.' I felt received by a friend this week.",
    forbidden: [/replaced by/i, /truer belief/i, /let's anchor this new belief/i],
    forbiddenReason: "declaring replacement or installing new belief (not Coherence Therapy)",
  },
]

async function run(tool, input) {
  const res = await fetch(`${BASE}/api/chat?tool=${tool}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", parts: [{ type: "text", text: input }] }],
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let text = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
  }
  return text
}

let passed = 0
let failed = 0
for (const s of SCENARIOS) {
  try {
    const response = await run(s.tool, s.input)
    const hit = s.forbidden.find((re) => re.test(response))
    if (hit) {
      console.error(
        `FAIL [${s.tool}] "${s.input}"\n  matched forbidden pattern: ${hit}\n  reason: ${s.forbiddenReason}\n  response excerpt: ${response.slice(0, 200)}...\n`
      )
      failed++
    } else {
      console.log(`PASS [${s.tool}] "${s.input}"`)
      passed++
    }
  } catch (err) {
    console.error(`ERROR [${s.tool}] "${s.input}": ${err.message}`)
    failed++
  }
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
