import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-slate-600">
            © {currentYear} Maya Allan. All rights reserved.
          </p>

          {/* Footer Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/legal/privacy"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
