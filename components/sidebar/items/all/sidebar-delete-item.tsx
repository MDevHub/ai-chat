import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { ChatbotUIContext } from "@/context/context"
import { deleteAssistant } from "@/db/assistants"
import { deleteChat } from "@/db/chats"
import { deleteCollection } from "@/db/collections"
import { deleteFile } from "@/db/files"
import { deleteModel } from "@/db/models"
import { deletePreset } from "@/db/presets"
import { deletePrompt } from "@/db/prompts"
import { deleteFileFromStorage } from "@/db/storage/files"
import { deleteTool } from "@/db/tools"
import { Tables } from "@/supabase/types"
import { ContentType, DataItemType } from "@/types"
import { IconTrash } from "@tabler/icons-react"
import { FC, useContext, useRef, useState } from "react"

interface SidebarDeleteItemProps {
  item: DataItemType
  contentType: ContentType
}

export const SidebarDeleteItem: FC<SidebarDeleteItemProps> = ({
  item,
  contentType
}) => {
  const {
    setChats,
    setPresets,
    setPrompts,
    setFiles,
    setCollections,
    setAssistants,
    setTools,
    setModels
  } = useContext(ChatbotUIContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [showDialog, setShowDialog] = useState(false)

  const deleteFunctions = {
    chats: async (chat: Tables<"chats">) => {
      await deleteChat(chat.id)
    },
    presets: async (preset: Tables<"presets">) => {
      await deletePreset(preset.id)
    },
    prompts: async (prompt: Tables<"prompts">) => {
      await deletePrompt(prompt.id)
    },
    files: async (file: Tables<"files">) => {
      await deleteFileFromStorage(file.file_path)
      await deleteFile(file.id)
    },
    collections: async (collection: Tables<"collections">) => {
      await deleteCollection(collection.id)
    },
    assistants: async (assistant: Tables<"assistants">) => {
      await deleteAssistant(assistant.id)
      setChats(prevState =>
        prevState.filter(chat => chat.assistant_id !== assistant.id)
      )
    },
    tools: async (tool: Tables<"tools">) => {
      await deleteTool(tool.id)
    },
    models: async (model: Tables<"models">) => {
      await deleteModel(model.id)
    }
  }

  const stateUpdateFunctions = {
    chats: setChats,
    presets: setPresets,
    prompts: setPrompts,
    files: setFiles,
    collections: setCollections,
    assistants: setAssistants,
    tools: setTools,
    models: setModels
  }

  const handleDelete = async () => {
    const deleteFunction = deleteFunctions[contentType]
    const setStateFunction = stateUpdateFunctions[contentType]

    if (!deleteFunction || !setStateFunction) return

    await deleteFunction(item as any)

    setStateFunction((prevItems: any) =>
      prevItems.filter((prevItem: any) => prevItem.id !== item.id)
    )

    setShowDialog(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      buttonRef.current?.click()
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-1.5 rounded-lg px-3 font-mono text-xs text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
        >
          <IconTrash className="size-3.5" />
          <span>Delete</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        onKeyDown={handleKeyDown}
        className="w-full max-w-sm rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95"
      >
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Delete {contentType.slice(0, -1)}
          </DialogTitle>

          <DialogDescription className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Are you sure you want to permanently delete{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {item.name}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setShowDialog(false)}
            className="h-9 rounded-lg border-zinc-200 bg-transparent px-4 font-mono text-xs dark:border-zinc-800"
          >
            Cancel
          </Button>

          <Button
            ref={buttonRef}
            variant="destructive"
            onClick={handleDelete}
            className="h-9 rounded-lg px-4 text-xs font-semibold"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
