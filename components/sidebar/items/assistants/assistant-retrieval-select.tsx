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
  IconBooks,
  IconChevronDown,
  IconCircleCheckFilled
} from "@tabler/icons-react"
import { FileIcon } from "lucide-react"
import { FC, useContext, useEffect, useRef, useState } from "react"

interface AssistantRetrievalSelectProps {
  selectedAssistantRetrievalItems: Tables<"files">[] | Tables<"collections">[]
  onAssistantRetrievalItemsSelect: (
    item: Tables<"files"> | Tables<"collections">
  ) => void
}

export const AssistantRetrievalSelect: FC<AssistantRetrievalSelectProps> = ({
  selectedAssistantRetrievalItems,
  onAssistantRetrievalItemsSelect
}) => {
  const { files, collections } = useContext(ChatbotUIContext)

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

  const handleItemSelect = (item: Tables<"files"> | Tables<"collections">) => {
    onAssistantRetrievalItemsSelect(item)
  }

  if (!files || !collections) return null

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
          <span>{selectedAssistantRetrievalItems.length} files selected</span>
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
          placeholder="Search files..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
        />

        {selectedAssistantRetrievalItems
          .filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(item => (
            <AssistantRetrievalItemOption
              key={item.id}
              contentType={
                item.hasOwnProperty("type") ? "files" : "collections"
              }
              item={item as Tables<"files"> | Tables<"collections">}
              selected={selectedAssistantRetrievalItems.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === item.id
              )}
              onSelect={handleItemSelect}
            />
          ))}

        {files
          .filter(
            file =>
              !selectedAssistantRetrievalItems.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === file.id
              ) && file.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(file => (
            <AssistantRetrievalItemOption
              key={file.id}
              item={file}
              contentType="files"
              selected={selectedAssistantRetrievalItems.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === file.id
              )}
              onSelect={handleItemSelect}
            />
          ))}

        {collections
          .filter(
            collection =>
              !selectedAssistantRetrievalItems.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === collection.id
              ) && collection.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(collection => (
            <AssistantRetrievalItemOption
              key={collection.id}
              contentType="collections"
              item={collection}
              selected={selectedAssistantRetrievalItems.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === collection.id
              )}
              onSelect={handleItemSelect}
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface AssistantRetrievalOptionItemProps {
  contentType: "files" | "collections"
  item: Tables<"files"> | Tables<"collections">
  selected: boolean
  onSelect: (item: Tables<"files"> | Tables<"collections">) => void
}

const AssistantRetrievalItemOption: FC<AssistantRetrievalOptionItemProps> = ({
  contentType,
  item,
  selected,
  onSelect
}) => {
  return (
    <div
      className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
      onClick={() => onSelect(item)}
    >
      <div className="flex grow items-center truncate">
        {contentType === "files" ? (
          <div className="mr-2 shrink-0 text-zinc-500">
            <FileIcon type={(item as Tables<"files">).type} size={16} />
          </div>
        ) : (
          <div className="mr-2 shrink-0 text-zinc-500">
            <IconBooks size={16} />
          </div>
        )}

        <div className="truncate font-medium">{item.name}</div>
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
