import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
    color: "#2C3440",
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
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0F172A",
  },
  sessionMeta: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0F172A",
    marginTop: 20,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 11,
    color: "#2C3440",
  },
  userQuote: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#1E293B",
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: "#3B82F6",
    marginBottom: 6,
  },
  assistantText: {
    fontSize: 11,
    color: "#334155",
    marginBottom: 8,
  },
  blankSpaceBox: {
    marginTop: 10,
    height: 160,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 6,
  },
  promptItem: {
    fontSize: 11,
    color: "#334155",
    marginBottom: 6,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    fontSize: 8,
    color: "#64748B",
    lineHeight: 1.4,
  },
})

export type PdfMessage = {
  role: "user" | "assistant"
  text: string
}

export type PdfProps = {
  tool: "reset" | "belief_inquiry" | "integration"
  messages: PdfMessage[]
  sessionDate: string
}

const TOOL_DISPLAY = {
  reset: "Nervous System Reset",
  belief_inquiry: "Belief Inquiry",
  integration: "Integration",
} as const

const TOOL_SECTION_LABELS = {
  reset: "The state you explored",
  belief_inquiry: "The belief you explored",
  integration: "The shift you explored",
} as const

const JOURNALING_PROMPTS = {
  reset: [
    "What did your body feel like when you started, and what feels different now?",
    "What helps you remember that your nervous system knows how to do this?",
  ],
  belief_inquiry: [
    "When this belief comes up again, what might you say to it now?",
    "Whose voice does this belief carry — and is that voice still one you want to follow?",
  ],
  integration: [
    "What's the anchor you named, and how will you return to it?",
    "What small moment this week could be a place to practice holding both?",
  ],
} as const

export function SessionPdf(props: PdfProps) {
  const { tool, messages, sessionDate } = props
  const firstUserMessage = messages.find((m) => m.role === "user")?.text ?? ""
  const assistantReflections = messages.filter((m) => m.role === "assistant").slice(0, 6)
  const prompts = JOURNALING_PROMPTS[tool]
  const toolName = TOOL_DISPLAY[tool]

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brandMark}>Maya Allan</Text>
          <Text style={styles.title}>{toolName}</Text>
          <Text style={styles.sessionMeta}>
            Session recorded {new Date(sessionDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{TOOL_SECTION_LABELS[tool]}</Text>
        <Text style={styles.userQuote}>{firstUserMessage || "(no content)"}</Text>

        <Text style={styles.sectionTitle}>Key reflections</Text>
        {assistantReflections.map((m, i) => (
          <Text key={i} style={styles.assistantText}>
            {m.text}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Journaling prompts</Text>
        {prompts.map((p, i) => (
          <Text key={i} style={styles.promptItem}>
            {i + 1}. {p}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Your notes</Text>
        <View style={styles.blankSpaceBox} />

        <View style={styles.footer} fixed>
          <Text>
            This document is a record of a reflective conversation. It is not medical,
            psychological, or therapeutic advice. If you are in crisis, contact the
            988 Suicide &amp; Crisis Lifeline — call or text 988.
          </Text>
          <Text style={{ marginTop: 4 }}>
            © Maya Allan — mayaallan.com — Payment processed via PayPal.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
