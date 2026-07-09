"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect, useCallback } from "react"
import { Send, RotateCcw, HeartPulse, Printer } from "lucide-react"
import type { UIMessage } from "ai"
import {
  trackToolViewed,
  trackToolStarted,
  trackTurnReached,
  trackSessionCompleted,
  trackTimeToFirstMessage,
  type AnalyticsTool,
} from "@/lib/analytics"
import { ExportCta } from "@/components/ExportCta"
import { SessionFeedback } from "@/components/SessionFeedback"

const resetTransport = new DefaultChatTransport({
  api: "/api/chat?tool=reset",
})

const STARTER_PROMPTS = [
  "My body feels tense and I can't relax",
  "I feel shut down and disconnected",
  "I'm overwhelmed and need to calm down",
]

const SESSION_COMPLETE_MARKER = "[SESSION_COMPLETE]"

function getRawMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
}

function getMessageText(message: UIMessage): string {
  return getRawMessageText(message).replace(SESSION_COMPLETE_MARKER, "").trim()
}

export function ResetChat() {
  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport: resetTransport,
  })

  const [input, setInput] = useState("")
  const [sessionComplete, setSessionComplete] = useState(false)
  const [userRequestedExport, setUserRequestedExport] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const TOOL: AnalyticsTool = "reset"
  const viewedTrackedRef = useRef(false)
  const startedTrackedRef = useRef(false)
  const pageLoadTimeRef = useRef(Date.now())
  const turnThresholdsFiredRef = useRef<Set<number>>(new Set())
  const completedTrackedRef = useRef(false)

  const isStreaming = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (!viewedTrackedRef.current) {
      trackToolViewed(TOOL)
      viewedTrackedRef.current = true
    }
  }, [])

  // Keep the newest message in view on the natural-scrolling page.
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container && messages.length > 0) {
      // Scroll the PAGE (not an inner box) to the latest message, unless the
      // user has scrolled up to read back.
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 240
      if (nearBottom) window.scrollTo({ top: document.documentElement.scrollHeight })
    }

    const userMessages = messages.filter((m) => m.role === "user").length

    if (userMessages > 0 && !startedTrackedRef.current) {
      trackToolStarted(TOOL)
      trackTimeToFirstMessage(TOOL, Date.now() - pageLoadTimeRef.current)
      startedTrackedRef.current = true
    }

    const assistantMessages = messages.filter((m) => m.role === "assistant").length
    const turns = Math.min(userMessages, assistantMessages)
    ;[3, 6, 10].forEach((threshold) => {
      if (turns >= threshold && !turnThresholdsFiredRef.current.has(threshold)) {
        trackTurnReached(TOOL, threshold as 3 | 6 | 10)
        turnThresholdsFiredRef.current.add(threshold)
      }
    })
  }, [messages, status])

  useEffect(() => {
    return () => {
      const userMessages = messages.filter((m) => m.role === "user").length
      if (userMessages >= 6 && !completedTrackedRef.current) {
        trackSessionCompleted(TOOL, userMessages)
        completedTrackedRef.current = true
      }
    }
  }, [messages])

  // Reset textarea height after sending
  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = ""
    }
  }, [input])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput("")
    sendMessage({ text })
  }, [input, isStreaming, sendMessage])

  // Auto-grow the composer as a longer entry is written, up to a comfortable cap.
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`
  }, [])

  const handleStarterClick = useCallback(
    (prompt: string) => {
      setInput("")
      sendMessage({ text: prompt })
    },
    [sendMessage]
  )

  const handleReset = useCallback(() => {
    setMessages([])
    setInput("")
  }, [setMessages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // A plain Enter inserts a new line so longer reflective entries can be
    // written and reviewed. Cmd/Ctrl+Enter (or the Send button) submits.
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const isRateLimited = error?.message?.includes("Daily limit reached")

  const userTurns = messages.filter((m) => m.role === "user").length

  useEffect(() => {
    if (sessionComplete) return
    const hit = messages.some(
      (m) => m.role === "assistant" && getRawMessageText(m).includes(SESSION_COMPLETE_MARKER)
    )
    if (hit) setSessionComplete(true)
  }, [messages, sessionComplete])

  const fallbackThresholdReached = userTurns >= 15
  const showExportCta =
    (sessionComplete || userRequestedExport || fallbackThresholdReached) && !isStreaming

  const exportMessages = messages
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      text: getMessageText(m),
    }))
    .filter((m) => m.text.length > 0)

  return (
    <div>
      {/* ── Messages Area ──────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-atomic="false"
        aria-label="Nervous System Reset conversation"
        className="px-4 sm:px-6 pt-4 sm:pt-6 pb-16 sm:pb-20 space-y-5 sm:space-y-6"
      >
        {/* Empty state with starter prompts */}
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center py-4 sm:py-20">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-violet-50 items-center justify-center mb-6">
              <HeartPulse className="w-7 h-7 text-violet-400" />
            </div>
            <p className="text-charcoal-mid text-center text-[0.9rem] sm:text-base leading-relaxed max-w-md mb-4 sm:mb-8">
              Start by describing how your body feels right now, or choose a prompt below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleStarterClick(prompt)}
                  className="px-4 py-3 rounded-xl border border-[#D0D4D8] bg-white text-charcoal-mid font-medium text-[0.85rem] sm:text-sm rounded-2xl
                    hover:bg-violet-50/60 hover:border-violet-400/20 hover:text-charcoal hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all text-left sm:text-center"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages — journal-style reflection cards */}
        {messages.map((message) => {
          const text = getMessageText(message)
          if (!text) return null
          const isUser = message.role === "user"
          return (
            <article
              key={message.id}
              className={`rounded-2xl border px-5 py-5 sm:px-7 sm:py-6 ${
                isUser
                  ? "bg-violet-400/[0.07] border-violet-400/15"
                  : "bg-white border-[#E8ECF0] shadow-[0_1px_3px_rgba(0,0,0,0.03)] select-none"
              }`}
            >
              <span
                className={`text-[0.62rem] font-bold tracking-[0.14em] uppercase block mb-2.5 ${
                  isUser ? "text-violet-400/80" : "text-violet-500"
                }`}
              >
                {isUser ? "Your reflection" : "Guided response"}
              </span>
              <div className="text-[0.95rem] sm:text-base leading-[1.85] whitespace-pre-wrap text-charcoal">
                {text}
              </div>
            </article>
          )
        })}

        {/* Typing indicator */}
        {status === "submitted" && (
          <article className="rounded-2xl border border-[#E8ECF0] bg-white px-5 py-5 sm:px-7 sm:py-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] select-none" role="status" aria-label="Reflecting">
            <span className="text-[0.62rem] font-bold tracking-[0.14em] uppercase text-violet-500 block mb-2.5">
              Guided response
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400/30 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-violet-400/30 animate-pulse [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-violet-400/30 animate-pulse [animation-delay:300ms]" />
            </div>
          </article>
        )}

        {/* Error display */}
        {error && (
          <div className="flex justify-center" role="alert">
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-600 text-sm text-center max-w-md">
              {isRateLimited ? (
                "Daily limit reached. Come back tomorrow."
              ) : (
                <>
                  Something went wrong. Please try again.
                  <span className="block mt-1 text-xs text-red-500/80">
                    Reference: {Date.now().toString(36).slice(-6)}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {showExportCta && (
          <ExportCta tool={TOOL} messages={exportMessages} />
        )}

        <SessionFeedback tool={TOOL} userTurnCount={userTurns} />

      </div>

      {/* ── Input Area ─────────────────────────────────────── */}
      <div className="sticky bottom-0 z-20 border-t border-[#E8ECF0]/40 bg-white/95 backdrop-blur-sm px-4 sm:px-6 pt-1.5 sm:pt-3 pb-2 sm:pb-3">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you are feeling in your body or nervous system..."
            aria-label="Your message"
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-white border border-[#B8BCC0] rounded-2xl px-4 py-3 min-h-[96px] max-h-[220px] resize-none overflow-y-auto
              text-charcoal text-[0.95rem] sm:text-base leading-relaxed placeholder:text-charcoal-soft
              focus:outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/15
              disabled:opacity-50 transition-colors shadow-sm"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-violet-400 flex items-center justify-center
              text-white font-bold hover:bg-violet-500 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Small, calm helper — reinforces "space to write" without a copy affordance. */}
        <p className="text-[0.68rem] text-charcoal-mid/50 mt-1.5 mb-0.5 max-w-3xl mx-auto px-1">
          Take your time — write as much as you need.<span className="hidden sm:inline"> Press ⌘/Ctrl + Enter to send.</span>
        </p>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 mt-2 sm:mt-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-charcoal-soft/60 hover:text-charcoal-mid text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start Over
              </button>
            )}
            {/* Minimum-turn gate: paid export requires at least 3 user turns.
                Below that, the export route rejects with "Conversation too
                short". Hidden until then so $9.99 doesn't taunt users. */}
            {userTurns >= 3 && !showExportCta && (
              <button
                onClick={() => setUserRequestedExport(true)}
                className="flex items-center gap-2 text-charcoal-soft/60 hover:text-violet-600 text-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print this session — $9.99
              </button>
            )}
          </div>
          {/* Safety disclaimer — visible on every viewport. Was previously
              `hidden sm:block`, which hid the legal-safety message on mobile
              (where most users actually visit). Even compressed, the line
              has to be reachable: "this is not therapy" is the core
              boundary for the tool. */}
          <p className="text-charcoal-soft/50 text-[0.65rem] sm:text-xs text-right ml-auto">
            This is not therapy. If you need support, please reach out to a licensed professional.
          </p>
        </div>
      </div>
    </div>
  )
}
