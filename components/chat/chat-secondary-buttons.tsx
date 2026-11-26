import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { IconInfoCircle, IconMessagePlus } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { WithTooltip } from "../ui/with-tooltip"

interface ChatSecondaryButtonsProps {}

export const ChatSecondaryButtons: FC<ChatSecondaryButtonsProps> = ({}) => {
  const { selectedChat } = useContext(ChatbotUIContext)

  const { handleNewChat } = useChatHandler()

  return (
    <>
      {selectedChat && (
        <div className="flex items-center gap-1.5">
          <WithTooltip
            delayDuration={200}
            display={
              <div className="space-y-1 p-1 font-mono text-xs">
                <div className="font-semibold text-zinc-200">
                  Chat Session Info
                </div>
                <div className="text-zinc-400">Model: {selectedChat.model}</div>
                <div className="text-zinc-400">
                  Temp: {selectedChat.temperature}
                </div>
                <div className="text-zinc-400">
                  Context: {selectedChat.context_length}
                </div>
              </div>
            }
            trigger={
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/80 text-zinc-500 shadow-sm backdrop-blur-md hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
              >
                <IconInfoCircle size={16} />
              </button>
            }
          />

          <WithTooltip
            delayDuration={200}
            display={<div className="font-mono text-xs">Start a new chat</div>}
            trigger={
              <button
                type="button"
                onClick={handleNewChat}
                className="flex size-8 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/80 text-zinc-500 shadow-sm backdrop-blur-md hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
              >
                <IconMessagePlus size={16} />
              </button>
            }
          />
        </div>
      )}
    </>
  )
}
