"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect, useCallback } from "react"
import { Send, RotateCcw, HeartPulse } from "lucide-react"
import type { UIMessage } from "ai"

const resetTransport = new DefaultChatTransport({
  api: "/api/chat?tool=reset",
})

const STARTER_PROMPTS = [
  "My body feels tense and I can't relax",
  "I feel shut down and disconnected",
  "I'm overwhelmed and need to calm down",
]

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export function ResetChat() {
  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport: resetTransport,
  })

  const [input, setInput] = useState("")
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLInputElement>(null)

  const isStreaming = status === "streaming" || status === "submitted"

  // Auto-scroll only the messages container (not the page)
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container && messages.length > 0) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages, status])

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

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Messages Area ──────────────────────────────────── */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 min-h-0">
        {/* Empty state with starter prompts */}
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-6">
              <HeartPulse className="w-7 h-7 text-violet-400" />
            </div>
            <p className="text-charcoal-soft text-center text-sm sm:text-base leading-relaxed max-w-md mb-8">
              Start by describing how your body feels right now, or choose a prompt below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleStarterClick(prompt)}
                  className="px-4 py-3 rounded-xl border border-[#E8ECF0] bg-white text-charcoal-soft text-sm
                    hover:bg-violet-50 hover:border-violet-400/25 hover:text-charcoal transition-all text-left sm:text-center"
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
                    ? "bg-violet-400 text-white rounded-br-md"
                    : "bg-white border border-[#E8ECF0] text-charcoal-body rounded-bl-md shadow-sm"
                }`}
              >
                {message.role === "assistant" && (
                  <span className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-violet-400 block mb-2">
                    Reset
                  </span>
                )}
                <div className="text-sm sm:text-[0.92rem] leading-[1.8] whitespace-pre-wrap">
                  {text}
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#E8ECF0] rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
              <span className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-violet-400 block mb-2">
                Reset
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400/30 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-violet-400/30 animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-violet-400/30 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
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

      {/* ── Input Area ─────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[#E8ECF0] px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            ref={textareaRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe how your body feels..."
            disabled={isStreaming}
            className="flex-1 bg-white border border-[#E0E4E8] rounded-xl px-4 py-3 h-11
              text-charcoal text-sm sm:text-base placeholder:text-charcoal-soft/40
              focus:outline-none focus:border-violet-400/40 focus:ring-1 focus:ring-violet-400/15
              disabled:opacity-50 transition-colors"
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

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 max-w-3xl mx-auto">
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-charcoal-soft/60 hover:text-charcoal-mid text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start Over
            </button>
          )}
          <p className="text-charcoal-soft/50 text-xs text-center sm:text-right sm:ml-auto">
            This is not therapy. If you need support, please reach out to a licensed professional.
          </p>
        </div>
      </div>
    </div>
  )
}
