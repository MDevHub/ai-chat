import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { IconLoader2, IconSend, IconTerminal2 } from "@tabler/icons-react"
import { FC, useContext, useState } from "react"
import { Dialog, DialogContent } from "../ui/dialog"
import { TextareaAutosize } from "../ui/textarea-autosize"

interface CommandKProps {}

export const CommandK: FC<CommandKProps> = ({}) => {
  useHotkey("k", () => setIsOpen(prevState => !prevState))

  const { profile } = useContext(ChatbotUIContext)

  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")

  const handleCommandK = async () => {
    setLoading(true)

    const response = await fetch("/api/command", {
      method: "POST",
      body: JSON.stringify({ input: value })
    })

    const data = await response.json()

    setContent(data.content)
    setLoading(false)
    setValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleCommandK()
    }
  }

  if (!profile) return null

  return (
    isOpen && (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          onKeyDown={handleKeyDown}
          className="w-full max-w-lg rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95"
        >
          {profile.openai_api_key ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 font-mono text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                <IconTerminal2 className="size-4 text-sky-500" />
                <span>mdev.ai / command palette</span>
              </div>

              {content && (
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5 text-xs text-zinc-800 dark:text-zinc-200">
                  {content}
                </div>
              )}

              <div className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                <div>&gt; turn dark mode on</div>
                <div>&gt; find my sql chat</div>
                <div>&gt; i need a new assistant</div>
              </div>

              <div className="relative flex items-center rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/50">
                <TextareaAutosize
                  className="flex w-full resize-none border-none bg-transparent px-3.5 py-3 text-xs placeholder:text-zinc-400 focus-visible:outline-none dark:placeholder:text-zinc-500"
                  placeholder="Ask command or generate prompt..."
                  value={value}
                  onValueChange={setValue}
                  minRows={1}
                  maxRows={4}
                />
                <div className="absolute bottom-2.5 right-3">
                  {loading ? (
                    <IconLoader2 className="size-4 animate-spin text-zinc-400" />
                  ) : (
                    <button
                      type="button"
                      onClick={handleCommandK}
                      className="flex size-6 items-center justify-center rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                      <IconSend size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              Add your OpenAI API key in profile settings to unlock Command K.
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  )
}
