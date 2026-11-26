import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"
import { signInAsGuest } from "@/lib/auth/guest-actions"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/supabase/types"
import { createServerClient } from "@supabase/ssr"
import { get } from "@vercel/edge-config"
import { IconArrowLeft, IconTerminal2 } from "@tabler/icons-react"
import { Metadata } from "next"
import { cookies, headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Sign In • mdev.ai"
}

export default async function Login({
  searchParams
}: {
  searchParams: { message: string }
}) {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )
  const session = (await supabase.auth.getSession()).data.session

  if (session) {
    const { data: homeWorkspace, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_home", true)
      .single()

    if (!homeWorkspace) {
      throw new Error(error.message)
    }

    return redirect(`/${homeWorkspace.id}/chat`)
  }

  const signIn = async (formData: FormData) => {
    "use server"

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return redirect(`/login?message=${error.message}`)
    }

    const { data: homeWorkspace, error: homeWorkspaceError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", data.user.id)
      .eq("is_home", true)
      .single()

    if (!homeWorkspace) {
      throw new Error(
        homeWorkspaceError?.message || "An unexpected error occurred"
      )
    }

    return redirect(`/${homeWorkspace.id}/chat`)
  }

  const getEnvVarOrEdgeConfigValue = async (name: string) => {
    "use server"
    if (process.env.EDGE_CONFIG) {
      return await get<string>(name)
    }

    return process.env[name]
  }

  const signUp = async (formData: FormData) => {
    "use server"

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const emailDomainWhitelistPatternsString = await getEnvVarOrEdgeConfigValue(
      "EMAIL_DOMAIN_WHITELIST"
    )
    const emailDomainWhitelist = emailDomainWhitelistPatternsString?.trim()
      ? emailDomainWhitelistPatternsString?.split(",")
      : []
    const emailWhitelistPatternsString =
      await getEnvVarOrEdgeConfigValue("EMAIL_WHITELIST")
    const emailWhitelist = emailWhitelistPatternsString?.trim()
      ? emailWhitelistPatternsString?.split(",")
      : []

    if (emailDomainWhitelist.length > 0 || emailWhitelist.length > 0) {
      const domainMatch = emailDomainWhitelist?.includes(email.split("@")[1])
      const emailMatch = emailWhitelist?.includes(email)
      if (!domainMatch && !emailMatch) {
        return redirect(
          `/login?message=Email ${email} is not allowed to sign up.`
        )
      }
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {}
    })

    if (error) {
      console.error(error)
      return redirect(`/login?message=${error.message}`)
    }

    return redirect("/setup")
  }

  const handleResetPassword = async (formData: FormData) => {
    "use server"

    const origin = headers().get("origin")
    const email = formData.get("email") as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/login/password`
    })

    if (error) {
      return redirect(`/login?message=${error.message}`)
    }

    return redirect("/login?message=Check email to reset password")
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-50 px-6 text-zinc-900 dark:bg-[#0a0a0c] dark:text-zinc-100">
      {/* Subtle Center Radial Focus Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[120px] dark:bg-sky-400/[0.08]" />

      {/* Top Back Navigation */}
      <div className="absolute left-6 top-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white/80 px-3 py-1.5 font-mono text-xs text-zinc-600 backdrop-blur-md hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
        >
          <IconArrowLeft className="size-3.5" />
          <span>Back</span>
        </Link>
      </div>

      {/* Main Auth Container */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <IconTerminal2 className="size-5 text-sky-500" />
          </div>
          <h1 className="font-mono text-lg font-semibold tracking-tight">
            mdev.ai
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Authenticate to access your workspace
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white/80 p-6 shadow-xl shadow-zinc-950/5 backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/60 dark:shadow-black/50">
          <form className="flex w-full flex-col" action={signIn}>
            <Label
              className="mb-1.5 font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400"
              htmlFor="email"
            >
              Email
            </Label>
            <Input
              className="mb-4 h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3.5 text-sm placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:placeholder:text-zinc-600"
              name="email"
              type="email"
              placeholder="you@domain.com"
              required
            />

            <div className="mb-1.5 flex items-center justify-between">
              <Label
                className="font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400"
                htmlFor="password"
              >
                Password
              </Label>
              <button
                type="submit"
                formAction={handleResetPassword}
                formNoValidate
                className="font-mono text-[11px] text-zinc-500 hover:text-sky-500 dark:text-zinc-400 dark:hover:text-sky-400"
              >
                Forgot password?
              </button>
            </div>
            <Input
              className="mb-6 h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3.5 text-sm placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:placeholder:text-zinc-600"
              type="password"
              name="password"
              placeholder="••••••••"
            />

            <SubmitButton className="mb-2.5 h-10 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
              Sign In
            </SubmitButton>

            <SubmitButton
              formAction={signUp}
              className="h-10 rounded-lg border border-zinc-200 bg-transparent px-4 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100/70 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
            >
              Create Account
            </SubmitButton>

            <div className="my-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              or
              <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <SubmitButton
              formAction={signInAsGuest}
              formNoValidate
              className="h-10 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 text-xs font-medium text-sky-700 hover:bg-sky-500/15 dark:text-sky-300"
            >
              Try the demo as a guest — no sign-up
            </SubmitButton>

            {searchParams?.message && (
              <div className="mt-4 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3.5 py-2.5 text-center font-mono text-xs text-sky-700 dark:text-sky-300">
                {searchParams.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
