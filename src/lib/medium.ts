const MEDIUM_API_BASE = "https://api.medium.com/v1"

export type MediumPost = {
  title: string
  contentFormat: "html" | "markdown"
  content: string
  tags?: string[]
  canonicalUrl?: string
  publishStatus?: "public" | "draft" | "unlisted"
  license?: "all-rights-reserved"
}

export type MediumPostResponse = {
  id: string
  title: string
  authorId: string
  url: string
  canonicalUrl?: string
  publishStatus: string
  publishedAt?: number
  license?: string
  licenseUrl?: string
  tags?: string[]
}

type MediumUser = {
  id: string
  username: string
  name: string
  url: string
  imageUrl?: string
}

function ensureEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

async function mediumFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = ensureEnv("MEDIUM_INTEGRATION_TOKEN")
  const res = await fetch(`${MEDIUM_API_BASE}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Accept-Charset": "utf-8",
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "<no body>")
    throw new Error(`Medium API ${res.status}: ${text}`)
  }
  const json = (await res.json()) as { data: T }
  return json.data
}

export async function getAuthenticatedUser(): Promise<MediumUser> {
  return mediumFetch<MediumUser>("/me", { method: "GET" })
}

export async function publishPost(post: MediumPost): Promise<MediumPostResponse> {
  const user = await getAuthenticatedUser()
  return mediumFetch<MediumPostResponse>(`/users/${user.id}/posts`, {
    method: "POST",
    body: JSON.stringify({
      title: post.title,
      contentFormat: post.contentFormat,
      content: post.content,
      tags: post.tags?.slice(0, 5),
      canonicalUrl: post.canonicalUrl,
      publishStatus: post.publishStatus ?? "draft",
      license: post.license ?? "all-rights-reserved",
    }),
  })
}
