import { getIronSession, type IronSession } from "iron-session"
import { cookies } from "next/headers"

export type AdminSession = IronSession<{ 
  adminId?: string
  isLoggedIn?: boolean
}>

export const sessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_for_demo",
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
