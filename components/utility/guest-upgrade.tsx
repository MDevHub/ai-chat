import { supabase } from "@/lib/supabase/browser-client"
import { IconUserPlus } from "@tabler/icons-react"
import { FC, FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"

/** True when the current Supabase session is an anonymous (guest) user. */
export const useIsGuest = () => {
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setIsGuest(Boolean(data.user?.is_anonymous)))

    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setIsGuest(Boolean(session?.user?.is_anonymous))
    )
    return () => data.subscription.unsubscribe()
  }, [])

  return isGuest
}

/**
 * Lets a guest keep their chats by attaching an email to the anonymous user.
 * Supabase links the identity in place (same user id, same data); after the
 * confirmation link they land on /login/password to choose a password.
 */
export const GuestUpgrade: FC = () => {
  const isGuest = useIsGuest()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")

  if (!isGuest) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("sending")

    const { error } = await supabase.auth.updateUser(
      { email },
      {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/login/password`
      }
    )

    if (error) {
      toast.error(error.message)
      setStatus("idle")
      return
    }

    setStatus("sent")
  }

  return (
    <div className="mx-6 mt-4 rounded-xl border border-sky-500/25 bg-sky-500/[0.06] p-3.5">
      <div className="flex items-center gap-2 font-mono text-xs font-semibold text-sky-700 dark:text-sky-300">
        <IconUserPlus size={14} />
        You&apos;re using a guest session
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
        Add your email to keep your chats and settings. Logging out of a guest
        session loses access to them.
      </p>

      {status === "sent" ? (
        <p className="mt-2.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          Check {email} for a confirmation link, then choose a password.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-2.5 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email"
            className="h-8 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-950"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="h-8 shrink-0 rounded-lg bg-zinc-900 px-3 text-[11px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {status === "sending" ? "Sending…" : "Save account"}
          </button>
        </form>
      )}
    </div>
  )
}
