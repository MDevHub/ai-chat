import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"

interface PromptPickerProps {}

export const PromptPicker: FC<PromptPickerProps> = ({}) => {
  const {
    prompts,
    isPromptPickerOpen,
    setIsPromptPickerOpen,
    focusPrompt,
    slashCommand
  } = useContext(ChatbotUIContext)

  const { handleSelectPrompt } = usePromptAndCommand()

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  const [promptVariables, setPromptVariables] = useState<
    {
      promptId: string
      name: string
      value: string
    }[]
  >([])
  const [showPromptVariables, setShowPromptVariables] = useState(false)

  useEffect(() => {
    if (focusPrompt && itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusPrompt])

  const [isTyping, setIsTyping] = useState(false)

  const filteredPrompts = prompts.filter(prompt =>
    prompt.name.toLowerCase().includes(slashCommand.toLowerCase())
  )

  const handleOpenChange = (isOpen: boolean) => {
    setIsPromptPickerOpen(isOpen)
  }

  const callSelectPrompt = (prompt: Tables<"prompts">) => {
    const regex = /\{\{.*?\}\}/g
    const matches = prompt.content.match(regex)

    if (matches) {
      const newPromptVariables = matches.map(match => ({
        promptId: prompt.id,
        name: match.replace(/\{\{|\}\}/g, ""),
        value: ""
      }))

      setPromptVariables(newPromptVariables)
      setShowPromptVariables(true)
    } else {
      handleSelectPrompt(prompt)
      handleOpenChange(false)
    }
  }

  const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        callSelectPrompt(filteredPrompts[index])
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredPrompts.length - 1
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

  const handleSubmitPromptVariables = () => {
    const newPromptContent = promptVariables.reduce(
      (prevContent, variable) =>
        prevContent.replace(
          new RegExp(`\\{\\{${variable.name}\\}\\}`, "g"),
          variable.value
        ),
      prompts.find(prompt => prompt.id === promptVariables[0].promptId)
        ?.content || ""
    )

    const newPrompt: any = {
      ...prompts.find(prompt => prompt.id === promptVariables[0].promptId),
      content: newPromptContent
    }

    handleSelectPrompt(newPrompt)
    handleOpenChange(false)
    setShowPromptVariables(false)
    setPromptVariables([])
  }

  const handleCancelPromptVariables = () => {
    setShowPromptVariables(false)
    setPromptVariables([])
  }

  const handleKeydownPromptVariables = (
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (!isTyping && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitPromptVariables()
    }
  }

  return (
    <>
      {isPromptPickerOpen && (
        <div className="flex flex-col space-y-1 rounded-2xl border border-zinc-200/90 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95">
          {showPromptVariables ? (
            <Dialog
              open={showPromptVariables}
              onOpenChange={setShowPromptVariables}
            >
              <DialogContent
                onKeyDown={handleKeydownPromptVariables}
                className="w-full max-w-sm rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95"
              >
                <DialogHeader className="text-left">
                  <DialogTitle className="text-base font-semibold">
                    Enter Prompt Variables
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-2 space-y-4">
                  {promptVariables.map((variable, index) => (
                    <div key={index} className="space-y-1.5">
                      <Label className="font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {variable.name}
                      </Label>

                      <TextareaAutosize
                        placeholder={`Value for ${variable.name}...`}
                        value={variable.value}
                        onValueChange={value => {
                          const newPromptVariables = [...promptVariables]
                          newPromptVariables[index].value = value
                          setPromptVariables(newPromptVariables)
                        }}
                        minRows={2}
                        maxRows={4}
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-950/50"
                        onCompositionStart={() => setIsTyping(true)}
                        onCompositionEnd={() => setIsTyping(false)}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelPromptVariables}
                    className="h-9 rounded-lg border-zinc-200 bg-transparent font-mono text-xs dark:border-zinc-800"
                  >
                    Cancel
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleSubmitPromptVariables}
                    className="h-9 rounded-lg bg-zinc-900 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Submit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : filteredPrompts.length === 0 ? (
            <div className="flex h-12 cursor-pointer items-center justify-center font-mono text-xs italic text-zinc-400">
              No matching prompts.
            </div>
          ) : (
            filteredPrompts.map((prompt, index) => (
              <div
                key={prompt.id}
                ref={ref => {
                  itemsRef.current[index] = ref
                }}
                tabIndex={0}
                className="flex cursor-pointer flex-col rounded-xl p-2.5 transition-colors hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none dark:hover:bg-zinc-800/80 dark:focus:bg-zinc-800/80"
                onClick={() => callSelectPrompt(prompt)}
                onKeyDown={getKeyDownHandler(index)}
              >
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {prompt.name}
                </div>
                <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {prompt.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}
