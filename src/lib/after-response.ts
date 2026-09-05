/**
 * Post-response work registration.
 *
 * Route handlers used to fire `transporter.sendMail(...)` and return the HTTP
 * response without awaiting the promise. On Vercel a function may be frozen
 * or torn down once the response is sent, so that email was not guaranteed to
 * go out. `after()` from `next/server` (Vercel's `waitUntil` underneath) is the
 * supported way to keep the function alive until registered work settles.
 *
 * This wrapper keeps the routes testable: the platform `after` is injected, and
 * the wrapper guarantees the registered task never rejects — a failed send is
 * routed to `onError` (logging + admin alert in the routes), and a failure
 * inside `onError` itself is logged rather than lost.
 *
 * Dependency-free on purpose (no `@/` imports, no next/server) so
 * tests/lib/after-response.test.mjs runs under plain Node.
 */

export type AfterFn = (task: () => Promise<void> | void) => void

export function runAfterResponse(
  after: AfterFn,
  work: () => Promise<unknown>,
  onError: (err: unknown) => Promise<void> | void,
): void {
  // Deliberately NOT wrapped in try/catch: if `after()` throws (called outside
  // a request scope), the caller must see it. Falling back to a detached
  // promise here would silently recreate the fire-and-forget defect.
  after(async () => {
    try {
      await work()
    } catch (err) {
      try {
        await onError(err)
      } catch (handlerErr) {
        console.error("[after-response] error handler threw:", handlerErr, "original error:", err)
      }
    }
  })
}
