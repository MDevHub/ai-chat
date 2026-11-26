"use client"

import { SubmitButton } from "@/components/ui/submit-button"
import { signInAsGuest } from "@/lib/auth/guest-actions"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  IconArrowRight,
  IconTerminal2,
  IconSun,
  IconMoon,
  IconSparkles
} from "@tabler/icons-react"

const PROMPTS = [
  "Generate a type-safe SST v3 stack with AWS Lambda & DynamoDB...",
  "Refactor this React hook for optimistic real-time state updates...",
  "Summarize architectural tradeoffs across these 12 PDF specs...",
  "Build a streaming AI agent with tool-calling & memory..."
]

export default function HomePage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [promptIndex, setPromptIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Live typewriter loop
  useEffect(() => {
    const currentFullText = PROMPTS[promptIndex]
    const typingSpeed = isDeleting ? 22 : 42

    const timeout = setTimeout(() => {
      if (!isDeleting && displayedText.length < currentFullText.length) {
        setDisplayedText(currentFullText.slice(0, displayedText.length + 1))
      } else if (
        !isDeleting &&
        displayedText.length === currentFullText.length
      ) {
        setTimeout(() => setIsDeleting(true), 1800)
      } else if (isDeleting && displayedText.length > 0) {
        setDisplayedText(currentFullText.slice(0, displayedText.length - 1))
      } else if (isDeleting && displayedText.length === 0) {
        setIsDeleting(false)
        setPromptIndex(prev => (prev + 1) % PROMPTS.length)
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting, promptIndex])

  const isDark = resolvedTheme === "dark"

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-[#0a0a0c] dark:text-zinc-100">
      {/* Subtle Center Radial Focus Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[120px] dark:bg-sky-400/[0.08]" />

      {/* Minimal Top Navigation */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between p-6">
        <div className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
          <IconTerminal2 className="size-5 text-sky-500" />
          <span>mdev.ai</span>
        </div>

        <div className="flex items-center gap-2.5">
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle Theme"
              className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/80 text-zinc-600 backdrop-blur-md hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
            >
              {isDark ? (
                <IconSun className="size-4" />
              ) : (
                <IconMoon className="size-4" />
              )}
            </button>
          )}

          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white/80 px-3.5 text-xs font-medium text-zinc-700 backdrop-blur-md hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80 dark:hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Center Minimalist Terminal Hero */}
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/70 px-3 py-1 font-mono text-[11px] text-zinc-600 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span>v2.0 • Multi-LLM Workspace</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Think faster. Ship cleaner.
        </h1>

        <p className="mt-3 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          A distraction-free AI command center for code, research, and custom
          assistants.
        </p>

        {/* Live Auto-Typing Terminal Box */}
        <div className="mt-8 w-full rounded-2xl border border-zinc-200/90 bg-white/80 p-4 text-left shadow-xl shadow-zinc-950/5 backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/60 dark:shadow-black/50">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>
            <span className="font-mono text-[11px] text-zinc-400">
              prompt://workspace
            </span>
          </div>

          <div className="flex min-h-[52px] items-center gap-2.5 font-mono text-xs sm:text-sm">
            <span className="select-none font-bold text-sky-500">&gt;</span>
            <p className="text-zinc-800 dark:text-zinc-200">
              {displayedText}
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-sky-500 align-middle" />
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <IconSparkles className="size-3.5 text-sky-500" />
              <span>GPT-4o • Claude 3.5 • Gemini • Local Ollama</span>
            </div>

            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <span>Launch Chat</span>
              <IconArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* One-click guest access for visitors / recruiters */}
        <form action={signInAsGuest} className="mt-4">
          <SubmitButton
            variant="ghost"
            className="h-auto px-2 py-1 font-mono text-xs text-zinc-500 underline-offset-4 hover:bg-transparent hover:text-sky-600 hover:underline dark:text-zinc-400 dark:hover:text-sky-400"
          >
            or try it instantly as a guest — no sign-up →
          </SubmitButton>
        </form>
      </main>

      <footer className="relative z-10 py-6 text-center font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
        Built by MDevHub
      </footer>
    </div>
  )
}
