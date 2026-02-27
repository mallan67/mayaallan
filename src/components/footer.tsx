import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy pt-16 pb-10 text-white">
      <div className="max-w-[1160px] mx-auto px-5 md:px-9">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-10 md:gap-12 pb-10 mb-8 border-b border-white/10 text-center md:text-left">
          {/* Brand Column */}
          <div className="mb-2 md:mb-0">
            <p className="font-sans text-lg font-bold tracking-[0.06em] uppercase mb-4">
              MAYA<span className="text-gold">ALLAN</span>
            </p>
            <p className="text-[0.88rem] text-white/70 max-w-[340px] leading-[1.7] mx-auto md:mx-0 font-serif italic">
              Author, speaker, and wellness advocate. Writing about self-agency, inner clarity, and the practical work of coming home to yourself.
            </p>
          </div>

          {/* Explore Column */}
          <div>
            <h4 className="font-sans text-[0.72rem] font-bold tracking-[0.12em] uppercase text-gold mb-5">
              Explore
            </h4>
            <nav className="flex flex-col gap-1">
              <Link href="/books" className="text-[0.95rem] text-white/70 hover:text-white py-1.5 transition-colors">
                Books
              </Link>
              <Link href="/events" className="text-[0.95rem] text-white/70 hover:text-white py-1.5 transition-colors">
                Events
              </Link>
              <Link href="/media" className="text-[0.95rem] text-white/70 hover:text-white py-1.5 transition-colors">
                Media
              </Link>
              <Link href="/about" className="text-[0.95rem] text-white/70 hover:text-white py-1.5 transition-colors">
                About
              </Link>
            </nav>
          </div>

          {/* Info Column */}
          <div>
            <h4 className="font-sans text-[0.72rem] font-bold tracking-[0.12em] uppercase text-gold mb-5">
              Info
            </h4>
            <nav className="flex flex-col gap-1">
              <Link href="/contact" className="text-[0.95rem] text-white/70 hover:text-white py-1.5 transition-colors">
                Contact
              </Link>
              <Link href="/legal#privacy" className="text-[0.95rem] text-white/70 hover:text-white py-1.5 transition-colors">
                Privacy
              </Link>
              <Link href="/legal#terms" className="text-[0.95rem] text-white/70 hover:text-white py-1.5 transition-colors">
                Terms
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[0.78rem] text-white/35">
          <span>&copy; {currentYear} Maya Allan. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
