"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect, useCallback } from "react"
import { Send, RotateCcw, ListChecks, Printer } from "lucide-react"
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

const inquiryTransport = new DefaultChatTransport({
  api: "/api/chat?tool=belief_inquiry",
})

const STARTER_PROMPTS = [
  "I want to explore a belief about myself with curiosity",
  "I noticed a pattern I didn't consciously choose",
  "I want to wonder about something I was taught growing up",
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

export function InquiryChat() {
  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport: inquiryTransport,
  })

  const [input, setInput] = useState("")
  const [sessionComplete, setSessionComplete] = useState(false)
  const [userRequestedExport, setUserRequestedExport] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLInputElement>(null)

  const TOOL: AnalyticsTool = "belief_inquiry"
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

  // Auto-scroll only the messages container (not the page)
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container && messages.length > 0) {
      container.scrollTop = container.scrollHeight
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isRateLimited = error?.message?.includes("Daily limit reached")

  const userTurns = messages.filter((m) => m.role === "user").length

  // Detect [SESSION_COMPLETE] marker in any assistant message — latch true on first sight.
  useEffect(() => {
    if (sessionComplete) return
    const hit = messages.some(
      (m) => m.role === "assistant" && getRawMessageText(m).includes(SESSION_COMPLETE_MARKER)
    )
    if (hit) setSessionComplete(true)
  }, [messages, sessionComplete])

  // Safety fallback: surface the CTA at 15 turns even if the model never emits the marker.
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
    <div className="flex flex-col h-full min-h-0">
      {/* ── Messages Area ──────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-atomic="false"
        aria-label="Belief Inquiry conversation"
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-5 min-h-0"
      >
        {/* Empty state with starter prompts */}
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center py-4 sm:py-20">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-liquid-blue-wash items-center justify-center mb-6">
              <ListChecks className="w-7 h-7 text-liquid-blue" />
            </div>
            <p className="text-charcoal-mid text-center text-[0.9rem] sm:text-base leading-relaxed max-w-md mb-4 sm:mb-8">
              Tell me a belief you&apos;d like to get curious about, or choose a prompt below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleStarterClick(prompt)}
                  className="px-4 py-3 rounded-xl border border-[#D0D4D8] bg-white text-charcoal-mid font-medium text-[0.85rem] sm:text-sm rounded-2xl
                    hover:bg-[#F0F7FF]/60 hover:border-liquid-blue/20 hover:text-charcoal hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all text-left sm:text-center"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const text = getMessageText(message)
          if (!text) return null
          return (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${
                  message.role === "user"
                    ? "bg-liquid-blue text-white rounded-br-md"
                    : "bg-white/90 border border-[#E8ECF0]/50 text-charcoal rounded-bl-md shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                }`}
              >
                {message.role === "assistant" && (
                  <span className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-liquid-blue block mb-2">
                    Belief Inquiry
                  </span>
                )}
                <div className="text-[0.88rem] sm:text-[0.92rem] leading-[1.8] whitespace-pre-wrap font-normal">
                  {text}
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {status === "submitted" && (
          <div className="flex justify-start" role="status" aria-label="Assistant is typing">
            <div className="bg-white/90 border border-[#E8ECF0]/50 rounded-2xl rounded-bl-md px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <span className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-liquid-blue block mb-2">
                Belief Inquiry
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-liquid-blue/30 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-liquid-blue/30 animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-liquid-blue/30 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="flex justify-center" role="alert">
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-600 text-sm text-center max-w-md">
              {isRateLimited
                ? "Daily limit reached. Come back tomorrow."
                : "Something went wrong. Please try again."}
            </div>
          </div>
        )}

        {showExportCta && (
          <ExportCta tool={TOOL} messages={exportMessages} />
        )}

        <SessionFeedback tool={TOOL} userTurnCount={userTurns} />

      </div>

      {/* ── Input Area ─────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[#E8ECF0]/40 px-4 sm:px-6 pt-1.5 sm:pt-3 pb-1 sm:pb-3">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            ref={textareaRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            aria-label="Your message"
            disabled={isStreaming}
            className="flex-1 bg-white border border-[#B8BCC0] rounded-2xl px-4 py-3 h-12
              text-charcoal text-[0.9rem] sm:text-base placeholder:text-charcoal-soft
              focus:outline-none focus-visible:border-liquid-blue focus-visible:ring-2 focus-visible:ring-liquid-blue focus-visible:ring-offset-2
              disabled:opacity-50 transition-colors shadow-sm"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-liquid-blue flex items-center justify-center
              text-white font-bold hover:bg-liquid-blue-bright transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 mt-2 sm:mt-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-charcoal-mid hover:text-charcoal text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start Over
              </button>
            )}
            {messages.length > 0 && !showExportCta && (
              <button
                onClick={() => setUserRequestedExport(true)}
                className="flex items-center gap-2 text-charcoal-mid hover:text-liquid-blue text-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print this session — $9.99
              </button>
            )}
          </div>
          <p className="text-charcoal-mid text-xs text-right ml-auto">
            This is not therapy. If you need support, please reach out to a licensed professional.
          </p>
        </div>
      </div>
    </div>
  )
}
