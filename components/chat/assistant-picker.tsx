import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"

interface AssistantPickerProps {}

export const AssistantPicker: FC<AssistantPickerProps> = ({}) => {
  const {
    assistants,
    assistantImages,
    focusAssistant,
    atCommand,
    isAssistantPickerOpen,
    setIsAssistantPickerOpen
  } = useContext(ChatbotUIContext)

  const { handleSelectAssistant } = usePromptAndCommand()

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (focusAssistant && itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusAssistant])

  const filteredAssistants = assistants.filter(assistant =>
    assistant.name.toLowerCase().includes(atCommand.toLowerCase())
  )

  const handleOpenChange = (isOpen: boolean) => {
    setIsAssistantPickerOpen(isOpen)
  }

  const callSelectAssistant = (assistant: Tables<"assistants">) => {
    handleSelectAssistant(assistant)
    handleOpenChange(false)
  }

  const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        callSelectAssistant(filteredAssistants[index])
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredAssistants.length - 1
      ) {
        e.preventDefault()
        itemsRef.current[0]?.focus()
      } else if (e.key === "ArrowUp" && !e.shiftKey && index === 0) {
        e.preventDefault()
        itemsRef.current[itemsRef.current.length - 1]?.focus()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex =
          index - 1 >= 0 ? index - 1 : itemsRef.current.length - 1
        itemsRef.current[prevIndex]?.focus()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1 < itemsRef.current.length ? index + 1 : 0
        itemsRef.current[nextIndex]?.focus()
      }
    }

  return (
    <>
      {isAssistantPickerOpen && (
        <div className="flex flex-col space-y-1 rounded-2xl border border-zinc-200/90 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95">
          {filteredAssistants.length === 0 ? (
            <div className="flex h-12 cursor-pointer items-center justify-center font-mono text-xs italic text-zinc-400">
              No matching assistants.
            </div>
          ) : (
            <>
              {filteredAssistants.map((item, index) => (
                <div
                  key={item.id}
                  ref={ref => {
                    itemsRef.current[index] = ref
                  }}
                  tabIndex={0}
                  className="flex cursor-pointer items-center rounded-xl p-2.5 transition-colors hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none dark:hover:bg-zinc-800/80 dark:focus:bg-zinc-800/80"
                  onClick={() =>
                    callSelectAssistant(item as Tables<"assistants">)
                  }
                  onKeyDown={getKeyDownHandler(index)}
                >
                  {item.image_path ? (
                    <Image
                      src={
                        assistantImages.find(
                          image => image.path === item.image_path
                        )?.url || ""
                      }
                      alt={item.name}
                      width={28}
                      height={28}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 text-sky-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-sky-400">
                      <IconRobotFace size={16} />
                    </div>
                  )}

                  <div className="ml-3 flex flex-col">
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </div>
                    <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      {item.description || "No description."}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  )
}
