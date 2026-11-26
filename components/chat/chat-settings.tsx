import { ChatbotUIContext } from "@/context/context"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { LLMID, ModelProvider } from "@/types"
import { IconAdjustmentsHorizontal } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { ChatSettingsForm } from "../ui/chat-settings-form"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface ChatSettingsProps {}

export const ChatSettings: FC<ChatSettingsProps> = ({}) => {
  useHotkey("i", () => handleClick())

  const {
    chatSettings,
    setChatSettings,
    models,
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels
  } = useContext(ChatbotUIContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (buttonRef.current) {
      buttonRef.current.click()
    }
  }

  useEffect(() => {
    if (!chatSettings) return

    setChatSettings({
      ...chatSettings,
      temperature: Math.min(
        chatSettings.temperature,
        CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_TEMPERATURE || 1
      ),
      contextLength: Math.min(
        chatSettings.contextLength,
        CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_CONTEXT_LENGTH || 4096
      )
    })
  }, [chatSettings?.model])

  // If the selected hosted model isn't available (no user key and no demo key
  // for its provider, e.g. a GPT default when only Gemini is configured),
  // fall back to the first model that can actually be used.
  useEffect(() => {
    if (!chatSettings || availableHostedModels.length === 0) return

    const isHostedModel = LLM_LIST.some(m => m.modelId === chatSettings.model)
    if (!isHostedModel) return // custom / local / OpenRouter: leave alone

    const isAvailable = availableHostedModels.some(
      m => m.modelId === chatSettings.model
    )
    if (isAvailable) return

    setChatSettings({
      ...chatSettings,
      model: availableHostedModels[0].modelId
    })
  }, [chatSettings?.model, availableHostedModels])

  if (!chatSettings) return null

  const allModels = [
    ...models.map(model => ({
      modelId: model.model_id as LLMID,
      modelName: model.name,
      provider: "custom" as ModelProvider,
      hostedId: model.id,
      platformLink: "",
      imageInput: false
    })),
    ...availableHostedModels,
    ...availableLocalModels,
    ...availableOpenRouterModels
  ]

  const fullModel = allModels.find(llm => llm.modelId === chatSettings.model)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="ghost"
          className="h-9 min-w-0 max-w-full gap-2 rounded-lg border border-zinc-200/80 bg-white/80 px-3 font-mono text-xs text-zinc-700 shadow-sm backdrop-blur-md hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <span className="min-w-0 truncate sm:max-w-[220px] lg:max-w-[320px]">
            {fullModel?.modelName || chatSettings.model}
          </span>
          <IconAdjustmentsHorizontal
            size={16}
            className="shrink-0 text-zinc-400"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[min(320px,calc(100vw_-_1.5rem))] rounded-2xl border border-zinc-200/90 bg-white/95 p-5 shadow-xl backdrop-blur-xl sm:w-[380px] md:w-[440px] dark:border-zinc-800/90 dark:bg-zinc-900/95"
        align="end"
      >
        <ChatSettingsForm
          chatSettings={chatSettings}
          onChangeChatSettings={setChatSettings}
        />
      </PopoverContent>
    </Popover>
  )
}
