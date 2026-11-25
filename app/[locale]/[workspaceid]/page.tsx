"use client"

import { ChatbotUIContext } from "@/context/context"
import {
  IconArrowRight,
  IconFileText,
  IconMessagePlus,
  IconPrompt,
  IconRobot,
  IconTerminal2
} from "@tabler/icons-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useContext } from "react"

export default function WorkspacePage() {
  const params = useParams()
  const workspaceId = params.workspaceid as string

  const { selectedWorkspace, chats, assistants, files, prompts } =
    useContext(ChatbotUIContext)

  const stats = [
    { label: "Chats", value: chats.length, icon: IconMessagePlus },
    { label: "Assistants", value: assistants.length, icon: IconRobot },
    { label: "Files", value: files.length, icon: IconFileText },
    { label: "Prompts", value: prompts.length, icon: IconPrompt }
  ]

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-50 px-6 text-zinc-900 dark:bg-[#0a0a0c] dark:text-zinc-100">
      {/* Subtle Center Radial Focus Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[120px] dark:bg-sky-400/[0.08]" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Workspace Card */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white/80 p-6 shadow-xl shadow-zinc-950/5 backdrop-blur-xl sm:p-8 dark:border-zinc-800/90 dark:bg-zinc-900/60 dark:shadow-black/50">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <IconTerminal2 className="size-4 text-sky-500" />
              <span>mdev.ai</span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {selectedWorkspace?.is_home ? "Home Workspace" : "Workspace"}
            </span>
          </div>

          <div className="mt-5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {selectedWorkspace?.name || "Workspace"}
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 sm:text-sm dark:text-zinc-400">
              {selectedWorkspace?.description ||
                "Select a session from the sidebar or launch a new prompt thread."}
            </p>
          </div>

          {/* Quick Telemetry Grid */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {stats.map(stat => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/40"
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="font-mono text-[11px]">{stat.label}</span>
                    <Icon className="size-3.5 text-sky-500" />
                  </div>
                  <div className="mt-1.5 font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {stat.value}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Primary Action */}
          <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
            <span className="font-mono text-[11px] text-zinc-400">
              {selectedWorkspace?.default_model || "Ready"}
            </span>

            <Link
              href={`/${workspaceId}/chat`}
              className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <span>Open Chat</span>
              <IconArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
