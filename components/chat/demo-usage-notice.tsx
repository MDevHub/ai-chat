import { ChatbotUIContext } from "@/context/context"
import { DEMO_PROFILE_KEY, DemoStatus, isDemoProvider } from "@/lib/demo-config"
import {
  applyDemoStatus,
  requestOpenProfileSettings,
  useDemoUsage
} from "@/lib/demo-usage-store"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import { IconKey, IconSparkles } from "@tabler/icons-react"
import { FC, useContext, useEffect } from "react"

/**
 * Shown above the chat input while the visitor is on the free demo key:
 * a subtle "3/5 free demo messages left", or a banner once the limit is hit.
 */
export const DemoUsageNotice: FC = () => {
  const { profile, chatSettings } = useContext(ChatbotUIContext)
  const { remaining, limit, model, limitReached } = useDemoUsage()

  const provider = LLM_LIST.find(
    m => m.modelId === chatSettings?.model
  )?.provider

  const isDemo =
    !!profile &&
    !!provider &&
    isDemoProvider(provider) &&
    !profile[DEMO_PROFILE_KEY[provider]] &&
    !(provider === "openai" && profile.use_azure_openai)

  // Load today's remaining count once, so the indicator shows before the first send
  useEffect(() => {
    if (!isDemo || remaining !== null) return

    const controller = new AbortController()
    fetch("/api/demo/status", { signal: controller.signal })
      .then(res => (res.ok ? res.json() : null))
      .then((status: DemoStatus | null) => {
        if (status?.enabled && provider && isDemoProvider(provider)) {
          applyDemoStatus(status, status.models[provider])
        }
      })
      .catch(() => {})

    return () => controller.abort()
  }, [isDemo, remaining, provider])

  if (!isDemo || remaining === null || limit === null) return null

  const modelName = LLM_LIST.find(m => m.modelId === model)?.modelName

  if (limitReached) {
    return (
      <div
        role="status"
        className="mx-auto mb-2 flex w-full flex-col items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-50/90 px-3.5 py-2.5 text-xs text-amber-900 backdrop-blur-md sm:flex-row sm:items-center dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200"
      >
        <IconKey size={16} className="hidden shrink-0 sm:block" />
        <p className="min-w-0 flex-1 leading-relaxed">
          You&apos;ve used your {limit} free demo messages. Add your own API key
          in Profile Settings for unlimited access.
        </p>
        <button
          type="button"
          onClick={requestOpenProfileSettings}
          className="shrink-0 rounded-lg bg-amber-900 px-3 py-1.5 font-mono text-[11px] font-medium text-amber-50 hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100"
        >
          Open Profile Settings
        </button>
      </div>
    )
  }

  return (
    <div className="mb-1.5 flex items-center justify-center gap-1.5 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
      <IconSparkles size={12} className="text-sky-500" />
      <span>
        <span
          className={cn(
            "font-medium",
            remaining <= 1
              ? "text-amber-600 dark:text-amber-400"
              : "text-zinc-700 dark:text-zinc-200"
          )}
        >
          {remaining}/{limit}
        </span>{" "}
        free demo messages left{modelName && ` · ${modelName}`}
      </span>
      <span aria-hidden>·</span>
      <button
        type="button"
        onClick={requestOpenProfileSettings}
        className="underline-offset-2 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
      >
        Use your own key
      </button>
    </div>
  )
}
