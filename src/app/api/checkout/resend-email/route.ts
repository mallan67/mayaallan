/**
 * POST /api/checkout/resend-email
 *
 * "Didn't get my email" recovery path for the /checkout/success page.
 *
 * Threat model:
 *   - User: the buyer who just paid and is staring at /checkout/success.
 *     They have the orderId in the URL. They click "Resend my email."
 *   - Attacker A: scraping orderIds from leaked logs / share screenshots,
 *     trying to discover whether a given orderId exists in our DB
 *     (existence-enumeration).
 *   - Attacker B: trying to resend the download email to themselves by
 *     supplying a custom recipient. This is BLOCKED structurally: we
 *     never accept a user-supplied email — the email always goes to the
 *     address already on the order row.
 *
 * Defenses:
 *   - Same-origin CSRF guard. The button on /checkout/success is the only
 *     legitimate caller; cross-origin POSTs are rejected.
 *   - Strict rate limit per IP (3 / hour). Slows enumeration.
 *   - We respond identically for "order not found" and "order found but
 *     no token yet" — both 200 with "resent: true". Whatever the actual
 *     state, the attacker learns nothing.
 *   - Resend uses the existing token row (never mints a new one) so a
 *     compromised admin can't redirect the link.
 */
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { siteUrl } from "@/lib/site-url"
import { emailDomain, sanitizeResendError } from "@/lib/safe-log"
import { alertAdmin } from "@/lib/alert-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RecoverBody = {
  orderId?: unknown
}

function validateOrderId(value: unknown): string | null {
  // PayPal order IDs are 10-32 alphanumeric/underscore-safe strings.
  if (typeof value !== "string") return null
  if (value.length < 10 || value.length > 80) return null
  if (!/^[A-Za-z0-9_]+$/.test(value)) return null
  return value
}

export async function POST(req: Request) {
  // CSRF first — only /checkout/success may call this.
  // assertAdminSameOrigin enforces an Origin/Referer allowlist; the
  // helper isn't admin-specific despite the name.
  const guard = assertAdminSameOrigin(req)
  if (!guard.ok) return guard.response

  // Rate limit: 3 attempts per IP per hour. Resending an email to the
  // same buyer 3× in an hour covers genuine "my spam folder is broken"
  // cases; beyond that, the customer needs human support.
  const ip = getClientIp(req)
  const limit = rateLimit({
    scope: "checkout-resend-email",
    ip,
    windowMs: 60 * 60 * 1000,
    maxAttempts: 3,
    lockoutMs: 60 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please contact support." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 3600) } },
    )
  }

  const body = (await req.json().catch(() => null)) as RecoverBody | null
  const orderId = validateOrderId(body?.orderId)
  if (!orderId) {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 })
  }

  // Find the order by paypal_order_id.
  const { data: order } = await supabaseAdmin
    .from(Tables.orders)
    .select("id, email, customer_name, book_id")
    .eq("paypal_order_id", orderId)
    .maybeSingle()

  // Constant-response: regardless of whether the order exists or has
  // a token, we tell the user "we tried." Real result is in the log.
  if (!order) {
    console.log("[checkout-resend-email] no-order-for-id", { orderId: orderId.slice(0, 8) })
    return NextResponse.json({ resent: true })
  }

  // Pull the download token + book (need title + ebook_file_url for the
  // email body). If either is missing, we still 200 — the underlying
  // state will eventually heal through the webhook flow.
  const [{ data: token }, { data: book }] = await Promise.all([
    supabaseAdmin
      .from(Tables.downloadTokens)
      .select("token, expires_at, max_downloads")
      .eq("order_id", order.id)
      .maybeSingle(),
    supabaseAdmin
      .from(Tables.books)
      .select("title, ebook_file_url")
      .eq("id", order.book_id)
      .maybeSingle(),
  ])

  if (!token || !book || !book.ebook_file_url) {
    console.log("[checkout-resend-email] no-token-or-book", {
      orderId: orderId.slice(0, 8),
      hasToken: !!token,
      hasBook: !!book,
    })
    return NextResponse.json({ resent: true })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    await alertAdmin({
      severity: "error",
      subject: "Resend-email: RESEND_API_KEY missing",
      body: "Buyer clicked 'resend email' but RESEND_API_KEY is not configured.",
      dedupKey: "resend-email:no-api-key",
    })
    return NextResponse.json({ resent: true })
  }

  const resend = new Resend(resendKey)
  const downloadUrl = `${siteUrl()}/download/${token.token}`
  const greeting = order.customer_name ? `Hi ${order.customer_name.split(" ")[0]}` : "Hi"
  const expiry = new Date(token.expires_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  })
  const escape = (s: string) =>
    s.replace(/[<>&"']/g, (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]!),
    )

  try {
    const { error } = await resend.emails.send({
      from: "Maya Allan <maya@mayaallan.com>",
      replyTo: process.env.SUPPORT_REPLY_TO || "hello@mayaallan.com",
      to: order.email,
      subject: `Your download link (resent) — ${book.title}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; line-height: 1.55; color: #14110d;">
          <p>${escape(greeting)},</p>
          <p>You asked us to resend your download link for <strong>${escape(book.title)}</strong>. Here it is:</p>
          <p style="margin: 32px 0;">
            <a href="${downloadUrl}"
               style="display: inline-block; padding: 14px 32px; background: #0A0A0D; color: white; text-decoration: none; border-radius: 999px; font-weight: 600;">
              Download ${escape(book.title)}
            </a>
          </p>
          <p style="font-size: 13px; color: #6B665E;">
            Valid for up to <strong>${token.max_downloads ?? 5} downloads</strong>; expires <strong>${expiry}</strong>.
          </p>
          <p style="margin-top: 32px;">With care,<br/>Maya</p>
        </div>
      `,
    })
    if (error) {
      console.error("[checkout-resend-email] send failed:", sanitizeResendError(error))
      // Don't surface the failure to the client — they shouldn't know
      // whether the order exists. Alert the operator instead.
      await alertAdmin({
        severity: "warning",
        subject: "Resend-email: send failed",
        body: "A buyer-triggered resend failed at the Resend layer.",
        details: {
          orderId: orderId.slice(0, 12),
          recipientDomain: emailDomain(order.email),
          resendError: sanitizeResendError(error),
        },
        dedupKey: "resend-email:send-failed",
      })
    }
  } catch (err) {
    console.error("[checkout-resend-email] threw:", err)
  }

  return NextResponse.json({ resent: true })
}
