import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// =============================================================================
// Integration Journal PDF — the "build a tool, get a link" play.
// =============================================================================
// Generates a 7-day customized integration journal as a downloadable PDF.
// User picks a journey phase + intention; the PDF includes phase-specific
// daily prompts, blank space for handwriting, and book attribution.
//
// Why: free, useful, branded downloadable resources earn links from forums,
// Reddit threads, Substacks, retreat-center resource pages, integration
// circles — exactly the off-site mentions the AEO research shows matter
// 3x more than backlinks for AI citation.
// =============================================================================

export type JourneyPhase = "preparation" | "journey" | "integration" | "shadow-work"

export interface JournalOptions {
  phase: JourneyPhase
  intention?: string
  journeyDate?: string
}

const PHASE_LABELS: Record<JourneyPhase, { title: string; description: string }> = {
  preparation: {
    title: "Preparation Journal",
    description: "Seven days before a psilocybin journey — clarifying intention, set and setting, what you're bringing to the medicine.",
  },
  journey: {
    title: "Journey Companion",
    description: "For the day of and the few days surrounding a psilocybin experience — anchoring practices and immediate post-journey capture.",
  },
  integration: {
    title: "Integration Journal",
    description: "Seven days after a psilocybin experience — meaning-making, embodiment, translating insight into life.",
  },
  "shadow-work": {
    title: "Shadow Work Journal",
    description: "Seven days of guided self-inquiry following a journey that surfaced difficult material — held with care.",
  },
}

const PROMPTS: Record<JourneyPhase, string[]> = {
  preparation: [
    "What am I bringing to this journey? (state of body, state of mind, state of heart, in this moment)",
    "What is the deepest question I want the medicine to help me sit with? Not what I want it to answer — what I want to sit with.",
    "What unfinished business or unspoken truth is most present in my life right now?",
    "Who or what is supporting me into this — and who or what am I leaving unattended? Name both.",
    "What part of me is afraid of this journey? Let it speak. Don't argue.",
    "What would feel like a true 'yes' to this experience? What would feel like a true 'no'? Listen for both.",
    "Tomorrow's eve: a single sentence intention. Not a goal. An orientation.",
  ],
  journey: [
    "Day before: my body says, my mind says, my heart says — write each.",
    "Morning of: how I want to enter. Three words.",
    "Within an hour of returning: the most-true thing I can write without editing.",
    "Next morning: what is still here that wasn't here before?",
    "Day after: what feels tender — physically, emotionally, relationally?",
    "Three days after: what insight is starting to feel actionable? What still feels too big to hold?",
    "Week after: looking back — what was the gift, what was the warning, what was the invitation?",
  ],
  integration: [
    "What is the truest thing the journey said to me? Not the most dramatic — the most true.",
    "What pattern of mine became visible during the experience? Where does it show up in my life now?",
    "What did the journey ask me to stop doing? What did it ask me to start?",
    "Who would I need to be to live what I saw? What is one small step toward becoming that person, today?",
    "What part of the experience am I tempted to dismiss as 'just the medicine'? What if I took it seriously instead?",
    "Where in my body does the memory of the experience live? Notice without explaining.",
    "Looking back at the week: what has shifted? What hasn't? Both are information.",
  ],
  "shadow-work": [
    "What did the journey show me that I would prefer not to have seen? Don't analyze yet — just name it.",
    "When I look at that material, what age do I feel? Who or what is that younger self protecting?",
    "What was being protected by the pattern I saw? How did the protection serve me when I needed it?",
    "If the difficult material were a part of me speaking, what would it want me to know? Write the part's voice.",
    "What does that part need from me now — not to fix it, but to be in relationship with it?",
    "Who in my life would I trust to hold this with me? Have I told them?",
    "Closing day: what is one act of integration I can make — internal or external — that honors what I saw?",
  ],
}

const COMMON_CLOSING = [
  "One sentence about what shifted this week:",
  "One sentence about what remains tender:",
  "One sentence I want to remember:",
]

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
    color: "#2C3440",
  },
  coverPage: {
    padding: 56,
    fontFamily: "Helvetica",
    color: "#2C3440",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  coverBrand: {
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#3B82F6",
    marginBottom: 20,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: 16,
  },
  coverSubtitle: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 40,
    maxWidth: 380,
    lineHeight: 1.5,
  },
  coverIntention: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#1E293B",
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 16,
    paddingRight: 16,
    borderTopWidth: 1,
    borderTopColor: "#D6E8FA",
    borderBottomWidth: 1,
    borderBottomColor: "#D6E8FA",
    maxWidth: 420,
    marginBottom: 40,
  },
  coverFooter: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 60,
    lineHeight: 1.6,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#D6E8FA",
    paddingBottom: 18,
    marginBottom: 28,
  },
  brandMark: {
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#3B82F6",
    marginBottom: 6,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
  },
  dayMeta: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 6,
  },
  promptIntro: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 28,
    marginBottom: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  promptText: {
    fontSize: 12,
    color: "#1E293B",
    marginBottom: 16,
    lineHeight: 1.5,
  },
  ruledLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#CBD5E1",
    marginBottom: 22,
    marginTop: 22,
  },
  closingPage: {
    padding: 56,
    fontFamily: "Helvetica",
    color: "#2C3440",
  },
  closingTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: 20,
  },
  closingPrompt: {
    fontSize: 11,
    color: "#475569",
    marginTop: 24,
    marginBottom: 14,
  },
  footer: {
    position: "absolute",
    bottom: 36,
    left: 56,
    right: 56,
    fontSize: 8,
    color: "#94A3B8",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
  },
})

export function IntegrationJournalDocument({ phase, intention, journeyDate }: JournalOptions) {
  const { title, description } = PHASE_LABELS[phase]
  const prompts = PROMPTS[phase]

  return (
    <Document title={title} author="Maya Allan" subject="Integration Journal" creator="mayaallan.com">
      {/* Cover */}
      <Page size="LETTER" style={styles.coverPage}>
        <Text style={styles.coverBrand}>Maya Allan · mayaallan.com</Text>
        <Text style={styles.coverTitle}>{title}</Text>
        <Text style={styles.coverSubtitle}>{description}</Text>
        {intention && (
          <Text style={styles.coverIntention}>&ldquo;{intention}&rdquo;</Text>
        )}
        <Text style={styles.coverFooter}>
          A free companion to{"\n"}Psilocybin Integration Guide{"\n"}by Maya Allan{"\n\n"}
          {journeyDate ? `Journey: ${journeyDate}` : ""}
        </Text>
      </Page>

      {/* 7 day pages */}
      {prompts.map((prompt, i) => (
        <Page key={i} size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.brandMark}>Day {i + 1} of 7</Text>
            <Text style={styles.dayTitle}>{title}</Text>
            <Text style={styles.dayMeta}>Quiet time. No phone. No correction. Write what comes.</Text>
          </View>

          <Text style={styles.promptIntro}>Today&apos;s prompt</Text>
          <Text style={styles.promptText}>{prompt}</Text>

          {/* Ruled writing space — render lines proportional to a full page */}
          {Array.from({ length: 18 }).map((_, lineIdx) => (
            <View key={lineIdx} style={styles.ruledLine} />
          ))}

          <Text style={styles.footer}>
            Maya Allan · mayaallan.com/scenarios · Adapted from Psilocybin Integration Guide
          </Text>
        </Page>
      ))}

      {/* Closing page */}
      <Page size="LETTER" style={styles.closingPage}>
        <Text style={styles.brandMark}>Closing</Text>
        <Text style={styles.closingTitle}>The end of seven days</Text>
        <Text style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>
          Three sentences. Don&apos;t overthink them. The truth that wants to be written usually
          comes when you stop trying to write the important one.
        </Text>

        {COMMON_CLOSING.map((p, i) => (
          <View key={i}>
            <Text style={styles.closingPrompt}>{p}</Text>
            <View style={styles.ruledLine} />
            <View style={styles.ruledLine} />
          </View>
        ))}

        <Text style={{ ...styles.footer, position: "relative", marginTop: 40 }}>
          If this journal was useful, the full method is in Psilocybin Integration Guide —{"\n"}
          40 real scenarios with detailed navigation. mayaallan.com/books/psilocybin-integration-guide
        </Text>
      </Page>
    </Document>
  )
}
