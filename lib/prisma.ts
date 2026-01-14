// lib/prisma.ts
import "server-only"

/**
 * Prisma shim:
 * - If @prisma/client is installed, use a real PrismaClient (singleton in dev).
 * - If not, export a Proxy that throws on usage (so builds pass, and runtime errors are explicit).
 */

type AnyPrisma = any

function createMissingPrismaProxy(): AnyPrisma {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          "Prisma is not configured. You removed/disabled the DB layer, but code is still calling prisma.*. " +
            "Either install Prisma (@prisma/client + generated client) or refactor these pages/routes to not use prisma."
        )
      },
    }
  )
}

let prisma: AnyPrisma

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client")

  const globalForPrisma = globalThis as unknown as { prisma?: AnyPrisma }

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ["error"],
    })

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
} catch {
  prisma = createMissingPrismaProxy()
}

export { prisma }
