import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import {
  IconBolt,
  IconChevronDown,
  IconCircleCheckFilled
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"

interface AssistantToolSelectProps {
  selectedAssistantTools: Tables<"tools">[]
  onAssistantToolsSelect: (tool: Tables<"tools">) => void
}

export const AssistantToolSelect: FC<AssistantToolSelectProps> = ({
  selectedAssistantTools,
  onAssistantToolsSelect
}) => {
  const { tools } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleToolSelect = (tool: Tables<"tools">) => {
    onAssistantToolsSelect(tool)
  }

  if (!tools) return null

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          className="flex h-9 w-full items-center justify-between rounded-lg border-zinc-200 bg-zinc-50/50 px-3 font-mono text-xs text-zinc-700 hover:bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <span>{selectedAssistantTools.length} tools selected</span>
          <IconChevronDown className="size-3.5 text-zinc-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        style={{ width: triggerRef.current?.offsetWidth }}
        className="space-y-1.5 rounded-xl border-zinc-200/90 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95"
        align="start"
      >
        <Input
          ref={inputRef}
          className="h-8 rounded-lg border-zinc-200 bg-zinc-50/70 px-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-950/70"
          placeholder="Search tools..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
        />

        {selectedAssistantTools
          .filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(tool => (
            <AssistantToolItem
              key={tool.id}
              tool={tool}
              selected={selectedAssistantTools.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === tool.id
              )}
              onSelect={handleToolSelect}
            />
          ))}

        {tools
          .filter(
            tool =>
              !selectedAssistantTools.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === tool.id
              ) && tool.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(tool => (
            <AssistantToolItem
              key={tool.id}
              tool={tool}
              selected={selectedAssistantTools.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === tool.id
              )}
              onSelect={handleToolSelect}
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface AssistantToolItemProps {
  tool: Tables<"tools">
  selected: boolean
  onSelect: (tool: Tables<"tools">) => void
}

const AssistantToolItem: FC<AssistantToolItemProps> = ({
  tool,
  selected,
  onSelect
}) => {
  return (
    <div
      className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
      onClick={() => onSelect(tool)}
    >
      <div className="flex grow items-center truncate">
        <div className="mr-2 shrink-0 text-zinc-500">
          <IconBolt size={16} />
        </div>

        <div className="truncate font-medium">{tool.name}</div>
      </div>

      {selected && (
        <IconCircleCheckFilled
          size={16}
          className="ml-2 shrink-0 text-sky-500"
        />
      )}
    </div>
  )
}
