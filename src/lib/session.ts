import { getIronSession, type IronSession } from "iron-session"
import { cookies } from "next/headers"

export type AdminSession = IronSession<{
  adminId?: string
  isLoggedIn?: boolean
}>

function getSessionOptions() {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required")
  }

  return {
    password: sessionSecret,
    cookieName: "mayaallan_admin_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      httpOnly: true,
      path: "/",
    },
  }
}

export async function getAdminSession() {
  return getIronSession(await cookies(), getSessionOptions()) as Promise<AdminSession>
}

export const getSession = getAdminSession

export async function isAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return !!(session.adminId || session.isLoggedIn)
}
