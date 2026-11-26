"use client"

import { ChatHelp } from "@/components/chat/chat-help"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatSettings } from "@/components/chat/chat-settings"
import { ChatUI } from "@/components/chat/chat-ui"
import { QuickSettings } from "@/components/chat/quick-settings"
import { SidebarOpenButton } from "@/components/sidebar/sidebar-open-button"
import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import {
  IconCode,
  IconFileAnalytics,
  IconSparkles,
  IconTerminal2
} from "@tabler/icons-react"
import { useContext } from "react"

const STARTER_PROMPTS = [
  {
    label: "Architect System",
    prompt:
      "Design a scalable, type-safe backend architecture with rate limiting, caching, and clean error boundaries.",
    icon: IconCode
  },
  {
    label: "Debug & Optimize",
    prompt:
      "Review the following code for performance bottlenecks, race conditions, and edge-case bugs:",
    icon: IconSparkles
  },
  {
    label: "Analyze Docs",
    prompt:
      "Extract key technical specifications, tradeoffs, and action items from my attached files.",
    icon: IconFileAnalytics
  }
]

export default function ChatPage() {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const { chatMessages, setUserInput, selectedWorkspace } =
    useContext(ChatbotUIContext)

  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  const handleSelectStarter = (prompt: string) => {
    setUserInput(prompt)
    handleFocusChatInput()
  }

  return (
    <>
      {chatMessages.length === 0 ? (
        <div className="relative flex h-full flex-col items-center justify-between overflow-y-auto overflow-x-hidden px-3 sm:px-4">
          {/* Subtle Center Radial Glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[min(580px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.07] blur-[120px] dark:bg-sky-400/[0.06]" />

          {/* Top Bar Controls */}
          <div className="relative z-10 flex w-full items-center justify-between gap-2 pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarOpenButton />
              <QuickSettings />
            </div>

            <div className="flex min-w-0 justify-end">
              <ChatSettings />
            </div>
          </div>

          {/* Center Terminal Empty State */}
          <div className="relative z-10 my-auto flex w-full max-w-2xl flex-col items-center py-6 text-center">
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-zinc-200/90 bg-white/80 shadow-sm backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-900/80">
              <IconTerminal2 className="size-5 text-sky-500" />
            </div>

            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/70 px-2.5 py-0.5 font-mono text-[11px] text-zinc-500 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>{selectedWorkspace?.name || "mdev.ai"}</span>
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
              What are we building?
            </h2>
            <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
              Select a model above, attach context files, or start with a quick
              prompt below.
            </p>

            {/* Starter Prompt Chips */}
            <div className="mt-6 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3">
              {STARTER_PROMPTS.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelectStarter(item.prompt)}
                    className="group flex flex-col items-start rounded-xl border border-zinc-200/80 bg-white/70 p-3.5 text-left backdrop-blur-md transition-colors hover:border-sky-500/40 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-sky-500/40 dark:hover:bg-zinc-900/90"
                  >
                    <div className="mb-2 flex items-center gap-1.5 font-mono text-xs font-medium text-zinc-800 group-hover:text-sky-600 dark:text-zinc-200 dark:group-hover:text-sky-400">
                      <Icon className="size-3.5 text-sky-500" />
                      <span>{item.label}</span>
                    </div>
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {item.prompt}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bottom Input Dock */}
          <div className="relative z-10 w-full max-w-[800px] pb-3 sm:px-2 sm:pb-6 lg:max-w-[700px] xl:max-w-[800px]">
            <ChatInput />
            <div className="mt-2 hidden flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[10px] text-zinc-400 sm:flex dark:text-zinc-500">
              <span>⌘K Command Menu</span>
              <span>•</span>
              <span>⌘⇧S Toggle Sidebar</span>
              <span>•</span>
              <span>⌘⇧O New Thread</span>
            </div>
          </div>

          <div className="absolute bottom-2 right-2 z-10 hidden md:block lg:bottom-4 lg:right-4">
            <ChatHelp />
          </div>
        </div>
      ) : (
        <ChatUI />
      )}
    </>
  )
}
