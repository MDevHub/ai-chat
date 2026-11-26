import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconBolt } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"

interface ToolPickerProps {}

export const ToolPicker: FC<ToolPickerProps> = ({}) => {
  const {
    tools,
    focusTool,
    toolCommand,
    isToolPickerOpen,
    setIsToolPickerOpen
  } = useContext(ChatbotUIContext)

  const { handleSelectTool } = usePromptAndCommand()

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (focusTool && itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusTool])

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(toolCommand.toLowerCase())
  )

  const handleOpenChange = (isOpen: boolean) => {
    setIsToolPickerOpen(isOpen)
  }

  const callSelectTool = (tool: Tables<"tools">) => {
    handleSelectTool(tool)
    handleOpenChange(false)
  }

  const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        callSelectTool(filteredTools[index])
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredTools.length - 1
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
      {isToolPickerOpen && (
        <div className="flex flex-col space-y-1 rounded-2xl border border-zinc-200/90 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95">
          {filteredTools.length === 0 ? (
            <div className="flex h-12 cursor-pointer items-center justify-center font-mono text-xs italic text-zinc-400">
              No matching tools.
            </div>
          ) : (
            <>
              {filteredTools.map((item, index) => (
                <div
                  key={item.id}
                  ref={ref => {
                    itemsRef.current[index] = ref
                  }}
                  tabIndex={0}
                  className="flex cursor-pointer items-center rounded-xl p-2.5 transition-colors hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none dark:hover:bg-zinc-800/80 dark:focus:bg-zinc-800/80"
                  onClick={() => callSelectTool(item as Tables<"tools">)}
                  onKeyDown={getKeyDownHandler(index)}
                >
                  <div className="flex size-7 items-center justify-center rounded-md border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <IconBolt size={16} />
                  </div>

                  <div className="ml-3 flex flex-col truncate">
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
