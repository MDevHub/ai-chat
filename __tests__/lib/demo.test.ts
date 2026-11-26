/**
 * @jest-environment node
 */
import { ChatRouteError, resolveChatCredentials } from "@/lib/server/demo"

// No Supabase service credentials -> the in-memory limiter is used
jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn() }))

const ENV = { ...process.env }

const profile = (overrides: Record<string, unknown> = {}) =>
  ({
    user_id: `user-${Math.random()}`,
    openai_api_key: null,
    google_gemini_api_key: null,
    openai_organization_id: null,
    ...overrides
  }) as any

const req = (ip: string) =>
  new Request("http://localhost/api/chat/openai", {
    method: "POST",
    headers: { "x-forwarded-for": `${ip}, 10.0.0.1` }
  })

const messages = [{ role: "user", content: "hi" }]

const expectRouteError = async (p: Promise<unknown>, status: number) => {
  const error: any = await p.catch(e => e)
  expect(error).toBeInstanceOf(ChatRouteError)
  expect(error.status).toBe(status)
  return error as ChatRouteError
}

beforeEach(() => {
  process.env = { ...ENV }
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.DEMO_ENABLED
  delete process.env.DEMO_DAILY_LIMIT
  process.env.OPENAI_API_KEY = "sk-server"
  process.env.GOOGLE_GEMINI_API_KEY = "g-server"
})

afterAll(() => {
  process.env = ENV
})

describe("resolveChatCredentials", () => {
  it("uses the user's own key with no limit", async () => {
    const p = profile({
      openai_api_key: "sk-mine",
      openai_organization_id: "org-me"
    })
    for (let i = 0; i < 10; i++) {
      const creds = await resolveChatCredentials(
        "openai",
        p,
        req("1.1.1.1"),
        messages
      )
      expect(creds).toEqual({
        apiKey: "sk-mine",
        organization: "org-me",
        demo: null
      })
    }
  })

  it("falls back to the server key on the cheap demo model, 5 per day", async () => {
    const p = profile()
    const remaining: number[] = []
    for (let i = 0; i < 5; i++) {
      const creds = await resolveChatCredentials(
        "openai",
        p,
        req("2.2.2.2"),
        messages
      )
      expect(creds.apiKey).toBe("sk-server")
      expect(creds.demo?.model).toBe("gpt-4o-mini")
      remaining.push(creds.demo!.remaining)
    }
    expect(remaining).toEqual([4, 3, 2, 1, 0])

    const error = await expectRouteError(
      resolveChatCredentials("openai", p, req("2.2.2.2"), messages),
      429
    )
    const body = await error.toResponse().json()
    expect(body).toMatchObject({
      code: "DEMO_LIMIT_REACHED",
      limit: 5,
      remaining: 0
    })
  })

  it("limits per IP across accounts and per account across IPs", async () => {
    const limit = 2
    process.env.DEMO_DAILY_LIMIT = String(limit)

    // Same IP, new accounts
    for (let i = 0; i < limit; i++) {
      await resolveChatCredentials(
        "google",
        profile(),
        req("3.3.3.3"),
        messages
      )
    }
    await expectRouteError(
      resolveChatCredentials("google", profile(), req("3.3.3.3"), messages),
      429
    )

    // Same account, new IPs
    const p = profile()
    for (let i = 0; i < limit; i++) {
      await resolveChatCredentials("google", p, req(`4.4.4.${i}`), messages)
    }
    await expectRouteError(
      resolveChatCredentials("google", p, req("4.4.4.99"), messages),
      429
    )
  })

  it("requires the user's key when no server key is configured", async () => {
    delete process.env.OPENAI_API_KEY
    await expectRouteError(
      resolveChatCredentials("openai", profile(), req("5.5.5.5"), messages),
      401
    )
  })

  it("can be switched off with DEMO_ENABLED=false", async () => {
    process.env.DEMO_ENABLED = "false"
    await expectRouteError(
      resolveChatCredentials("google", profile(), req("6.6.6.6"), messages),
      401
    )
  })

  it("rejects oversized demo requests without consuming quota", async () => {
    process.env.DEMO_DAILY_LIMIT = "1"
    const p = profile()
    const huge = [{ role: "user", content: "x".repeat(60_000) }]

    await expectRouteError(
      resolveChatCredentials("openai", p, req("7.7.7.7"), huge),
      413
    )
    const creds = await resolveChatCredentials(
      "openai",
      p,
      req("7.7.7.7"),
      messages
    )
    expect(creds.demo?.remaining).toBe(0)
  })
})
