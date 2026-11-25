// Server-only: hybrid key resolution (BYOK first, rate-limited server key fallback).
// Edge-compatible (Web Crypto + supabase-js over fetch).

import {
  DEMO_DEFAULT_LIMIT,
  DEMO_DEFAULT_MODELS,
  DEMO_HEADERS,
  DEMO_LIMIT_ERROR_CODE,
  DEMO_PROFILE_KEY,
  DEMO_PROVIDERS,
  DemoProvider,
  DemoStatus
} from "@/lib/demo-config"
import { Tables } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"

/** Output cap per demo reply, to bound cost. */
export const DEMO_MAX_OUTPUT_TOKENS = 1024
/** Rough input cap (~12k tokens). Also rejects inline images on the demo key. */
const DEMO_MAX_INPUT_CHARS = 48_000

const PROVIDER_LABEL: Record<DemoProvider, string> = {
  openai: "OpenAI",
  google: "Google Gemini"
}

export interface DemoUsage {
  model: string
  limit: number
  remaining: number
}

export interface ChatCredentials {
  apiKey: string
  organization?: string | null
  /** null when the user's own key is used (unlimited) */
  demo: DemoUsage | null
}

/** An error that maps directly to an HTTP response. */
export class ChatRouteError extends Error {
  constructor(
    public status: number,
    message: string,
    public extra: Record<string, unknown> = {}
  ) {
    super(message)
  }

  toResponse() {
    return new Response(
      JSON.stringify({ message: this.message, ...this.extra }),
      { status: this.status, headers: { "Content-Type": "application/json" } }
    )
  }
}

// ---------------------------------------------------------------- config

const isDemoEnabled = () => process.env.DEMO_ENABLED !== "false"

const getDemoLimit = () => {
  const parsed = parseInt(process.env.DEMO_DAILY_LIMIT || "", 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEMO_DEFAULT_LIMIT
}

const getServerKey = (provider: DemoProvider) =>
  provider === "openai"
    ? process.env.OPENAI_API_KEY
    : process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY

const getDemoModel = (provider: DemoProvider) =>
  (provider === "openai"
    ? process.env.DEMO_OPENAI_MODEL
    : process.env.DEMO_GOOGLE_MODEL) || DEMO_DEFAULT_MODELS[provider]

/** provider -> demo model, for providers that have a server key configured */
export const getDemoModels = (): DemoStatus["models"] => {
  if (!isDemoEnabled()) return {}
  return Object.fromEntries(
    DEMO_PROVIDERS.filter(p => getServerKey(p)).map(p => [p, getDemoModel(p)])
  )
}

// ---------------------------------------------------------------- limiter

const getClientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "unknown"

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  )
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

/** Rate-limit subjects: the hashed IP (never stored raw) and the user id. */
const getSubjects = async (request: Request, userId: string) => {
  const salt =
    process.env.DEMO_IP_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  return [`ip:${await sha256(salt + getClientIp(request))}`, `user:${userId}`]
}

const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// Per-instance fallback for when the database limiter is unavailable (e.g. the
// migration hasn't been applied). Not shared across serverless instances.
const memoryUsage = new Map<string, { day: string; count: number }>()
const today = () => new Date().toISOString().slice(0, 10)

const memoryCount = (subjects: string[]) =>
  Math.max(
    0,
    ...subjects.map(s => {
      const entry = memoryUsage.get(s)
      return entry?.day === today() ? entry.count : 0
    })
  )

const memoryConsume = (subjects: string[], limit: number) => {
  if (memoryCount(subjects) >= limit) return null
  for (const s of subjects) {
    const entry = memoryUsage.get(s)
    const count = entry?.day === today() ? entry.count : 0
    memoryUsage.set(s, { day: today(), count: count + 1 })
  }
  return memoryCount(subjects)
}

let warnedFallback = false
const warnFallback = (error: unknown) => {
  if (warnedFallback) return
  warnedFallback = true
  console.warn(
    "[demo] Database rate limiter unavailable, using in-memory fallback. " +
      "Apply supabase/migrations/20261125000000_add_demo_usage.sql.",
    error
  )
}

/** Returns today's count after consuming one message, or null if over limit. */
const consumeDemoMessage = async (subjects: string[], limit: number) => {
  const admin = getAdminClient()
  if (admin) {
    const { data, error } = await admin.rpc("consume_demo_message", {
      p_subjects: subjects,
      p_limit: limit
    })
    if (!error) return data as number | null
    warnFallback(error)
  }
  return memoryConsume(subjects, limit)
}

const readDemoUsage = async (subjects: string[]) => {
  const admin = getAdminClient()
  if (admin) {
    const { data, error } = await admin.rpc("get_demo_usage", {
      p_subjects: subjects
    })
    if (!error) return (data as number) ?? 0
    warnFallback(error)
  }
  return memoryCount(subjects)
}

// ---------------------------------------------------------------- public API

/**
 * Resolve which key a chat request should use.
 * - User saved their own key  -> use it, no limit.
 * - Otherwise, server key set -> cheap demo model, DEMO_DAILY_LIMIT/day per IP and per user.
 * Throws ChatRouteError (401 / 413 / 429) when the request can't proceed.
 */
export async function resolveChatCredentials(
  provider: DemoProvider,
  profile: Tables<"profiles">,
  request: Request,
  messages: unknown
): Promise<ChatCredentials> {
  const ownKey = profile[DEMO_PROFILE_KEY[provider]]
  if (ownKey) {
    return {
      apiKey: ownKey,
      organization:
        provider === "openai" ? profile.openai_organization_id : undefined,
      demo: null
    }
  }

  const serverKey = getServerKey(provider)
  if (!isDemoEnabled() || !serverKey) {
    throw new ChatRouteError(
      401,
      `${PROVIDER_LABEL[provider]} API Key not found. Please set it in your profile settings.`
    )
  }

  // Check size before consuming quota so a rejected request doesn't cost a message
  if (JSON.stringify(messages).length > DEMO_MAX_INPUT_CHARS) {
    throw new ChatRouteError(
      413,
      "This conversation is too long for the free demo (images aren't supported either). Start a new chat, or add your own API key in Profile Settings."
    )
  }

  const limit = getDemoLimit()
  const used = await consumeDemoMessage(
    await getSubjects(request, profile.user_id),
    limit
  )

  if (used === null) {
    throw new ChatRouteError(
      429,
      `You've used your ${limit} free demo messages for today. Add your own API key in Profile Settings for unlimited access.`,
      { code: DEMO_LIMIT_ERROR_CODE, limit, remaining: 0 }
    )
  }

  return {
    apiKey: serverKey,
    organization:
      provider === "openai"
        ? process.env.OPENAI_ORGANIZATION_ID ||
          process.env.NEXT_PUBLIC_OPENAI_ORGANIZATION_ID
        : undefined,
    demo: {
      model: getDemoModel(provider),
      limit,
      remaining: Math.max(0, limit - used)
    }
  }
}

/** Headers that let the client show "3/5 free demo messages left". */
export const demoHeaders = (demo: DemoUsage | null): Record<string, string> =>
  demo
    ? {
        [DEMO_HEADERS.limit]: String(demo.limit),
        [DEMO_HEADERS.remaining]: String(demo.remaining),
        [DEMO_HEADERS.model]: demo.model,
        "Access-Control-Expose-Headers": Object.values(DEMO_HEADERS).join(", ")
      }
    : {}

/** Current demo status for this visitor, without consuming a message. */
export async function getDemoStatus(
  request: Request,
  userId: string
): Promise<DemoStatus> {
  const models = getDemoModels()
  const limit = getDemoLimit()
  const enabled = Object.keys(models).length > 0

  if (!enabled) return { enabled, limit, remaining: 0, models }

  const used = await readDemoUsage(await getSubjects(request, userId))
  return { enabled, limit, remaining: Math.max(0, limit - used), models }
}
