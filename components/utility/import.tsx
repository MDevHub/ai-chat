import { ChatbotUIContext } from "@/context/context"
import { createAssistants } from "@/db/assistants"
import { createChats } from "@/db/chats"
import { createCollections } from "@/db/collections"
import { createFiles } from "@/db/files"
import { createPresets } from "@/db/presets"
import { createPrompts } from "@/db/prompts"
import { createTools } from "@/db/tools"
import { IconTerminal2, IconUpload, IconX } from "@tabler/icons-react"
import { FC, useContext, useRef, useState } from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog"
import { Input } from "../ui/input"

interface ImportProps {}

export const Import: FC<ImportProps> = ({}) => {
  const {
    profile,
    selectedWorkspace,
    setChats,
    setPresets,
    setPrompts,
    setFiles,
    setCollections,
    setAssistants,
    setTools
  } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [importList, setImportList] = useState<Array<Record<string, any>>>([])
  const [importCounts, setImportCounts] = useState<{
    chats: number
    presets: number
    prompts: number
    files: number
    collections: number
    assistants: number
    tools: number
  }>({
    chats: 0,
    presets: 0,
    prompts: 0,
    files: 0,
    collections: 0,
    assistants: 0,
    tools: 0
  })

  const stateUpdateFunctions = {
    chats: setChats,
    presets: setPresets,
    prompts: setPrompts,
    files: setFiles,
    collections: setCollections,
    assistants: setAssistants,
    tools: setTools
  }

  const handleSelectFiles = async (e: any) => {
    const filePromises = Array.from(e.target.files).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = event => {
          try {
            const data = JSON.parse(event.target?.result as string)
            resolve(Array.isArray(data) ? data : [data])
          } catch (error) {
            reject(error)
          }
        }
        reader.readAsText(file as Blob)
      })
    })

    try {
      const results = await Promise.all(filePromises)
      const flatResults = results.flat()
      let uniqueResults: Array<Record<string, any>> = []
      setImportList(prevState => {
        const newState = [...prevState, ...flatResults]
        uniqueResults = Array.from(
          new Set(newState.map(item => JSON.stringify(item)))
        ).map(item => JSON.parse(item))
        return uniqueResults
      })

      setImportCounts(prevCounts => {
        const countTypes = [
          "chats",
          "presets",
          "prompts",
          "files",
          "collections",
          "assistants"
        ]
        const newCounts: any = { ...prevCounts }
        countTypes.forEach(type => {
          newCounts[type] = uniqueResults.filter(
            item => item.contentType === type
          ).length
        })
        return newCounts
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveItem = (item: any) => {
    setImportList(prev => prev.filter(prevItem => prevItem !== item))
    setImportCounts(prev => {
      const newCounts: any = { ...prev }
      newCounts[item.contentType] -= 1
      return newCounts
    })
  }

  const handleCancel = () => {
    setImportList([])
    setImportCounts({
      chats: 0,
      presets: 0,
      prompts: 0,
      files: 0,
      collections: 0,
      assistants: 0,
      tools: 0
    })
    setIsOpen(false)
  }

  const handleSaveData = async () => {
    if (!profile) return
    if (!selectedWorkspace) return

    const saveData: any = {
      chats: [],
      presets: [],
      prompts: [],
      files: [],
      collections: [],
      assistants: [],
      tools: []
    }

    importList.forEach(item => {
      const { contentType, ...itemWithoutContentType } = item
      itemWithoutContentType.user_id = profile.user_id
      itemWithoutContentType.workspace_id = selectedWorkspace.id
      saveData[contentType].push(itemWithoutContentType)
    })

    const createdItems = {
      chats: await createChats(saveData.chats),
      presets: await createPresets(saveData.presets, selectedWorkspace.id),
      prompts: await createPrompts(saveData.prompts, selectedWorkspace.id),
      files: await createFiles(saveData.files, selectedWorkspace.id),
      collections: await createCollections(
        saveData.collections,
        selectedWorkspace.id
      ),
      assistants: await createAssistants(
        saveData.assistants,
        selectedWorkspace.id
      ),
      tools: await createTools(saveData.tools, selectedWorkspace.id)
    }

    Object.keys(createdItems).forEach(key => {
      const typedKey = key as keyof typeof stateUpdateFunctions
      stateUpdateFunctions[typedKey]((prevItems: any) => [
        ...prevItems,
        ...createdItems[typedKey]
      ])
    })

    toast.success("Data imported successfully!")
    handleCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      buttonRef.current?.click()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        aria-label="Import Data"
      >
        <IconUpload size={SIDEBAR_ICON_SIZE} />
      </button>

      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            className="w-full max-w-md rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95"
            onKeyDown={handleKeyDown}
          >
            <DialogHeader className="space-y-1.5 text-left">
              <div className="mb-1 flex items-center gap-2 font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <IconTerminal2 className="size-4 text-sky-500" />
                <span>mdev.ai</span>
              </div>
              <DialogTitle className="text-base font-semibold tracking-tight">
                Import Data
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Import workspace data from JSON files.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {importList.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Badge className="font-mono text-[10px]">
                        {item.contentType.slice(0, -1).toUpperCase()}
                      </Badge>
                      <div className="truncate text-xs">{item.name}</div>
                    </div>
                    <Button
                      className="size-6 p-0 text-zinc-400 hover:text-rose-600"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item)}
                    >
                      <IconX size={14} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="font-mono text-xs text-zinc-500">
                {Object.entries(importCounts).map(([key, value]) =>
                  value > 0 ? (
                    <div key={key}>
                      {key}: {value}
                    </div>
                  ) : null
                )}
              </div>

              <Input
                ref={inputRef}
                type="file"
                onChange={handleSelectFiles}
                accept=".json"
                multiple
                className="h-9 rounded-lg border-zinc-200 bg-zinc-50/50 text-xs dark:border-zinc-800 dark:bg-zinc-950/50"
              />
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-9 rounded-lg border-zinc-200 bg-transparent px-4 font-mono text-xs dark:border-zinc-800"
              >
                Cancel
              </Button>

              <Button
                ref={buttonRef}
                onClick={handleSaveData}
                disabled={importList.length === 0}
                className="h-9 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Save Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
