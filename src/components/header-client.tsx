"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  label: string
  href: string
}

interface HeaderClientProps {
  navItems: NavItem[]
}

export function HeaderClient({ navItems }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMenuOpen])

  return (
    <>
      {/* Gold gradient top bar */}
      <div className="h-[3px] bg-gradient-to-r from-gold to-liquid-blue" />

      <header className="sticky top-0 z-50 w-full glass-header">
        <div className="max-w-[1160px] mx-auto px-5 md:px-9">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo */}
            <Link
              href="/"
              className="font-sans text-[1.1rem] font-bold tracking-[0.06em] uppercase text-white"
            >
              MAYA<span className="text-gold">ALLAN</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-2 text-[0.82rem] font-medium rounded-md transition-all tracking-[0.02em]
                    ${pathname === link.href
                      ? "text-white bg-white/10"
                      : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <line x1="4" y1="7" x2="18" y2="7" />
                    <line x1="4" y1="12" x2="18" y2="12" />
                    <line x1="4" y1="17" x2="18" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div className="fixed top-0 right-0 bottom-0 w-[300px] bg-navy z-50 md:hidden shadow-[-8px_0_40px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between h-[68px] px-6 border-b border-white/10">
                  <span className="font-sans text-base font-semibold text-white">Menu</span>
                  <button
                    type="button"
                    className="flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-white/60 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                      <line x1="4" y1="4" x2="14" y2="14" />
                      <line x1="14" y1="4" x2="4" y2="14" />
                    </svg>
                  </button>
                </div>

                {/* Menu Links */}
                <nav className="flex-1 overflow-y-auto py-5 px-4 flex flex-col gap-0.5">
                  {navItems.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`
                        flex items-center px-4 py-3.5 text-base font-medium rounded-lg transition-colors
                        ${pathname === link.href
                          ? "text-white bg-white/10"
                          : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                        }
                      `}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  )
}
