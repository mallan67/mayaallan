"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect, useCallback } from "react"
import { Send, RotateCcw, Sparkles } from "lucide-react"
import type { UIMessage } from "ai"
import {
  trackToolViewed,
  trackToolStarted,
  trackTurnReached,
  trackSessionCompleted,
  trackTimeToFirstMessage,
  type AnalyticsTool,
} from "@/lib/analytics"

const integrationTransport = new DefaultChatTransport({
  api: "/api/chat?tool=integration",
})

const STARTER_PROMPTS = [
  "I had an insight that doesn't fit my old pattern",
  "Something shifted in me and I want to let it land",
  "I want to hold a new experience alongside an old belief",
]

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export function IntegrationChat() {
  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport: integrationTransport,
  })

  const [input, setInput] = useState("")
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLInputElement>(null)

  const TOOL: AnalyticsTool = "integration"
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

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-5 min-h-0">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center py-4 sm:py-20">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-liquid-blue-wash items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-liquid-blue" />
            </div>
            <p className="text-charcoal-mid text-center text-[0.9rem] sm:text-base leading-relaxed max-w-md mb-4 sm:mb-8">
              Tell me about a shift you want to help land, or choose a prompt below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleStarterClick(prompt)}
                  className="px-4 py-3 rounded-xl border border-[#D0D4D8] bg-white text-charcoal-mid font-medium text-[0.85rem] sm:text-sm rounded-2xl hover:bg-[#F0F7FF]/60 hover:border-liquid-blue/20 hover:text-charcoal hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all text-left sm:text-center"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

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
                    Integration
                  </span>
                )}
                <div className="text-[0.88rem] sm:text-[0.92rem] leading-[1.8] whitespace-pre-wrap font-normal">
                  {text}
                </div>
              </div>
            </div>
          )
        })}

        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="bg-white/90 border border-[#E8ECF0]/50 rounded-2xl rounded-bl-md px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <span className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-liquid-blue block mb-2">
                Integration
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-liquid-blue/30 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-liquid-blue/30 animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-liquid-blue/30 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-600 text-sm text-center max-w-md">
              {isRateLimited
                ? "Daily limit reached. Come back tomorrow."
                : "Something went wrong. Please try again."}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E8ECF0]/40 px-4 sm:px-6 pt-1.5 sm:pt-3 pb-1 sm:pb-3">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            ref={textareaRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what you're integrating..."
            disabled={isStreaming}
            className="flex-1 bg-white border border-[#B8BCC0] rounded-2xl px-4 py-3 h-12 text-charcoal text-[0.9rem] sm:text-base placeholder:text-charcoal-soft focus:outline-none focus:border-liquid-blue/50 focus:ring-2 focus:ring-liquid-blue/15 disabled:opacity-50 transition-colors shadow-sm"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-liquid-blue flex items-center justify-center text-white font-bold hover:bg-liquid-blue-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 mt-2 sm:mt-3 max-w-3xl mx-auto">
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-charcoal-soft/60 hover:text-charcoal-mid text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start Over
            </button>
          )}
          <p className="hidden sm:block text-charcoal-soft/50 text-xs text-right ml-auto">
            This is not therapy. If you need support, please reach out to a licensed professional.
          </p>
        </div>
      </div>
    </div>
  )
}
