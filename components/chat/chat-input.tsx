import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import {
  IconBolt,
  IconCirclePlus,
  IconPlayerStopFilled,
  IconSend
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Input } from "../ui/input"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { ChatCommandInput } from "./chat-command-input"
import { ChatFilesDisplay } from "./chat-files-display"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { useChatHistoryHandler } from "./chat-hooks/use-chat-history"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { useSelectFileHandler } from "./chat-hooks/use-select-file-handler"
import { DemoUsageNotice } from "./demo-usage-notice"

interface ChatInputProps {}

export const ChatInput: FC<ChatInputProps> = ({}) => {
  const { t } = useTranslation()

  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const [isTyping, setIsTyping] = useState<boolean>(false)

  const {
    isAssistantPickerOpen,
    focusAssistant,
    setFocusAssistant,
    userInput,
    chatMessages,
    isGenerating,
    selectedPreset,
    selectedAssistant,
    focusPrompt,
    setFocusPrompt,
    focusFile,
    focusTool,
    setFocusTool,
    isToolPickerOpen,
    isPromptPickerOpen,
    setIsPromptPickerOpen,
    isFilePickerOpen,
    setFocusFile,
    chatSettings,
    selectedTools,
    setSelectedTools,
    assistantImages
  } = useContext(ChatbotUIContext)

  const {
    chatInputRef,
    handleSendMessage,
    handleStopMessage,
    handleFocusChatInput
  } = useChatHandler()

  const { handleInputChange } = usePromptAndCommand()

  const { filesToAccept, handleSelectDeviceFile } = useSelectFileHandler()

  const {
    setNewMessageContentToNextUserMessage,
    setNewMessageContentToPreviousUserMessage
  } = useChatHistoryHandler()

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => {
      handleFocusChatInput()
    }, 200)
  }, [selectedPreset, selectedAssistant])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isTyping && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      setIsPromptPickerOpen(false)
      handleSendMessage(userInput, chatMessages, false)
    }

    if (
      isPromptPickerOpen ||
      isFilePickerOpen ||
      isToolPickerOpen ||
      isAssistantPickerOpen
    ) {
      if (
        event.key === "Tab" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault()
        if (isPromptPickerOpen) setFocusPrompt(!focusPrompt)
        if (isFilePickerOpen) setFocusFile(!focusFile)
        if (isToolPickerOpen) setFocusTool(!focusTool)
        if (isAssistantPickerOpen) setFocusAssistant(!focusAssistant)
      }
    }

    if (event.key === "ArrowUp" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToPreviousUserMessage()
    }

    if (event.key === "ArrowDown" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToNextUserMessage()
    }

    if (
      isAssistantPickerOpen &&
      (event.key === "Tab" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown")
    ) {
      event.preventDefault()
      setFocusAssistant(!focusAssistant)
    }
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const imagesAllowed = LLM_LIST.find(
      llm => llm.modelId === chatSettings?.model
    )?.imageInput

    const items = event.clipboardData.items
    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        if (!imagesAllowed) {
          toast.error(
            `Images are not supported for this model. Use models like GPT-4 Vision instead.`
          )
          return
        }
        const file = item.getAsFile()
        if (!file) return
        handleSelectDeviceFile(file)
      }
    }
  }

  return (
    <>
      <DemoUsageNotice />

      <div className="flex flex-col flex-wrap justify-center gap-2">
        <ChatFilesDisplay />

        {selectedTools &&
          selectedTools.map((tool, index) => (
            <div
              key={index}
              className="flex justify-center"
              onClick={() =>
                setSelectedTools(
                  selectedTools.filter(
                    selectedTool => selectedTool.id !== tool.id
                  )
                )
              }
            >
              <div className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1 font-mono text-xs text-purple-600 hover:bg-purple-500/20 dark:text-purple-300">
                <IconBolt size={14} />
                <span>{tool.name}</span>
              </div>
            </div>
          ))}

        {selectedAssistant && (
          <div className="mx-auto flex w-fit items-center space-x-2 rounded-lg border border-zinc-200/90 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-900/80">
            {selectedAssistant.image_path && (
              <Image
                className="rounded object-cover"
                src={
                  assistantImages.find(
                    img => img.path === selectedAssistant.image_path
                  )?.base64 || ""
                }
                width={20}
                height={20}
                alt={selectedAssistant.name}
              />
            )}
            <span className="font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Talking to{" "}
              <strong className="text-zinc-900 dark:text-white">
                {selectedAssistant.name}
              </strong>
            </span>
          </div>
        )}
      </div>

      <div className="relative mt-3 flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-zinc-200/90 bg-white/80 shadow-lg shadow-zinc-950/5 backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/60 dark:shadow-black/40">
        <div className="absolute bottom-[72px] left-0 max-h-[300px] w-full overflow-auto rounded-xl">
          <ChatCommandInput />
        </div>

        <>
          <IconCirclePlus
            className="absolute bottom-3 left-3 size-7 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
            size={28}
            onClick={() => fileInputRef.current?.click()}
          />

          <Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            onChange={e => {
              if (!e.target.files) return
              handleSelectDeviceFile(e.target.files[0])
            }}
            accept={filesToAccept}
          />
        </>

        <TextareaAutosize
          textareaRef={chatInputRef}
          className="text-md flex w-full resize-none rounded-md border-none bg-transparent px-12 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
          placeholder={t(
            `Ask anything. Type @ for assistants, / for prompts, # for files, ! for tools`
          )}
          onValueChange={handleInputChange}
          value={userInput}
          minRows={1}
          maxRows={18}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
        />

        <div className="absolute bottom-3 right-3">
          {isGenerating ? (
            <button
              type="button"
              onClick={handleStopMessage}
              className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <IconPlayerStopFilled size={14} className="animate-pulse" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!userInput}
              onClick={() => {
                if (!userInput) return
                handleSendMessage(userInput, chatMessages, false)
              }}
              className={cn(
                "flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-white transition-[background-color,opacity] dark:bg-white dark:text-zinc-950",
                !userInput
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-zinc-800 dark:hover:bg-zinc-200"
              )}
            >
              <IconSend size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
