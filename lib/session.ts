import { getIronSession, type IronSession } from "iron-session"
import { cookies } from "next/headers"

export type AdminSession = IronSession<{ 
  adminId?: string
  isLoggedIn?: boolean
}>

// Get session secret - allow build to succeed without env vars
const sessionSecret = process.env.SESSION_SECRET || "build-time-placeholder-secret-32chars"

export const sessionOptions = {
  password: sessionSecret,
  cookieName: "mayaallan_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    httpOnly: true,
    path: "/",
  },
}

export async function getAdminSession() {
  return getIronSession(await cookies(), sessionOptions) as Promise<AdminSession>
}

export const getSession = getAdminSession

export async function isAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return !!(session.adminId || session.isLoggedIn)
}
