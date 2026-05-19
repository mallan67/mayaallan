"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

// =============================================================================
// CopyButton — tiny clipboard-copy button for the AEO error panel.
// =============================================================================
// Shows a copy icon, swaps to a check icon for 1.5 seconds on success.
// Designed to be small and unobtrusive — sits inline next to the error label.
// =============================================================================

interface CopyButtonProps {
  text: string
  /** Optional label override for screen readers. */
  ariaLabel?: string
}

export function CopyButton({ text, ariaLabel = "Copy to clipboard" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Older browsers / permission denied — fall back to a one-shot prompt
      // so the user can still copy manually.
      window.prompt("Copy:", text)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? "Copied" : ariaLabel}
      title={copied ? "Copied!" : "Copy"}
      className="inline-flex items-center justify-center p-1 rounded hover:bg-slate-200/60 transition-colors text-slate-500 hover:text-slate-800"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  )
}
