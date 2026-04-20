"use client"

import { useState, useEffect } from "react"
import {
  trackSessionFeedback,
  type AnalyticsTool,
  type FeedbackRating,
} from "@/lib/analytics"

type Props = {
  tool: AnalyticsTool
  userTurnCount: number
}

const SHOW_EVERY_N = 3
const COUNTER_KEY = "mayaallan:session_feedback_counter"

export function SessionFeedback({ tool, userTurnCount }: Props) {
  const [shown, setShown] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (shown || dismissed) return
    if (userTurnCount < 6) return

    if (typeof window === "undefined") return
    const currentCount = Number(window.sessionStorage.getItem(COUNTER_KEY) ?? "0") + 1
    window.sessionStorage.setItem(COUNTER_KEY, String(currentCount))
    if (currentCount % SHOW_EVERY_N === 0) {
      setShown(true)
    } else {
      setDismissed(true)
    }
  }, [userTurnCount, shown, dismissed])

  if (!shown || dismissed) return null

  const record = (rating: FeedbackRating) => {
    trackSessionFeedback(tool, rating)
    setDismissed(true)
  }

  return (
    <div className="mx-4 sm:mx-6 my-3 p-4 rounded-xl border border-[#E8ECF0] bg-white/70">
      <p className="text-charcoal-mid text-sm mb-3 text-center">
        How did this session feel?
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => record("grounded")}
          className="px-3 py-1.5 rounded-lg bg-[#F0F7FF]/70 hover:bg-[#F0F7FF] text-charcoal text-sm transition-colors"
        >
          ✨ Grounded
        </button>
        <button
          onClick={() => record("uncertain")}
          className="px-3 py-1.5 rounded-lg bg-[#F0F7FF]/70 hover:bg-[#F0F7FF] text-charcoal text-sm transition-colors"
        >
          🤔 Uncertain
        </button>
        <button
          onClick={() => record("not_for_me")}
          className="px-3 py-1.5 rounded-lg bg-[#F0F7FF]/70 hover:bg-[#F0F7FF] text-charcoal text-sm transition-colors"
        >
          ✋ Not for me
        </button>
        <button
          onClick={() => record("skip")}
          className="px-3 py-1.5 rounded-lg text-charcoal-soft hover:text-charcoal-mid text-xs transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
