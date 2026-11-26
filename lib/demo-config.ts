// Shared (client + server) shape of the free demo tier. No secrets here.

export type DemoProvider = "openai" | "google"

export const DEMO_PROVIDERS: DemoProvider[] = ["openai", "google"]

export const DEMO_DEFAULT_LIMIT = 5

/** Cheap, fast models used when a visitor chats on the server's key. */
export const DEMO_DEFAULT_MODELS: Record<DemoProvider, string> = {
  openai: "gpt-4o-mini",
  google: "gemini-3.5-flash-lite"
}

/** Profile column holding the user's own key for each demo provider. */
export const DEMO_PROFILE_KEY = {
  openai: "openai_api_key",
  google: "google_gemini_api_key"
} as const

export const DEMO_LIMIT_ERROR_CODE = "DEMO_LIMIT_REACHED"

export const DEMO_HEADERS = {
  limit: "X-Demo-Limit",
  remaining: "X-Demo-Remaining",
  model: "X-Demo-Model"
} as const

/** Shape returned by GET /api/demo/status and exposed to the client. */
export interface DemoStatus {
  enabled: boolean
  limit: number
  remaining: number
  /** provider -> model the demo will use; only providers with a server key */
  models: Partial<Record<DemoProvider, string>>
}

export const isDemoProvider = (provider: string): provider is DemoProvider =>
  (DEMO_PROVIDERS as string[]).includes(provider)
