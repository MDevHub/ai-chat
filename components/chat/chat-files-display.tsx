import { ChatbotUIContext } from "@/context/context"
import { getFileFromStorage } from "@/db/storage/files"
import useHotkey from "@/lib/hooks/use-hotkey"
import { cn } from "@/lib/utils"
import { ChatFile, MessageImage } from "@/types"
import {
  IconCircleFilled,
  IconFileFilled,
  IconFileTypeCsv,
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileTypeTxt,
  IconJson,
  IconLoader2,
  IconMarkdown,
  IconX
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useState } from "react"
import { Button } from "../ui/button"
import { FilePreview } from "../ui/file-preview"
import { WithTooltip } from "../ui/with-tooltip"
import { ChatRetrievalSettings } from "./chat-retrieval-settings"

interface ChatFilesDisplayProps {}

export const ChatFilesDisplay: FC<ChatFilesDisplayProps> = ({}) => {
  useHotkey("f", () => setShowFilesDisplay(prev => !prev))
  useHotkey("e", () => setUseRetrieval(prev => !prev))

  const {
    files,
    newMessageImages,
    setNewMessageImages,
    newMessageFiles,
    setNewMessageFiles,
    setShowFilesDisplay,
    showFilesDisplay,
    chatFiles,
    chatImages,
    setChatImages,
    setChatFiles,
    setUseRetrieval
  } = useContext(ChatbotUIContext)

  const [selectedFile, setSelectedFile] = useState<ChatFile | null>(null)
  const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const messageImages = [
    ...newMessageImages.filter(
      image =>
        !chatImages.some(chatImage => chatImage.messageId === image.messageId)
    )
  ]

  const combinedChatFiles = [
    ...newMessageFiles.filter(
      file => !chatFiles.some(chatFile => chatFile.id === file.id)
    ),
    ...chatFiles
  ]

  const combinedMessageFiles = [...messageImages, ...combinedChatFiles]

  const getLinkAndView = async (file: ChatFile) => {
    const fileRecord = files.find(f => f.id === file.id)

    if (!fileRecord) return

    const link = await getFileFromStorage(fileRecord.file_path)
    window.open(link, "_blank")
  }

  return showFilesDisplay && combinedMessageFiles.length > 0 ? (
    <>
      {showPreview && selectedImage && (
        <FilePreview
          type="image"
          item={selectedImage}
          isOpen={showPreview}
          onOpenChange={(isOpen: boolean) => {
            setShowPreview(isOpen)
            setSelectedImage(null)
          }}
        />
      )}

      {showPreview && selectedFile && (
        <FilePreview
          type="file"
          item={selectedFile}
          isOpen={showPreview}
          onOpenChange={(isOpen: boolean) => {
            setShowPreview(isOpen)
            setSelectedFile(null)
          }}
        />
      )}

      <div className="space-y-2">
        <div className="flex w-full items-center justify-center">
          <Button
            variant="outline"
            className="h-8 gap-2 rounded-lg border-zinc-200 bg-white/80 px-3 font-mono text-xs text-zinc-700 shadow-sm backdrop-blur-md hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={() => setShowFilesDisplay(false)}
          >
            <RetrievalToggle />
            <span>Hide files</span>
            <div onClick={e => e.stopPropagation()}>
              <ChatRetrievalSettings />
            </div>
          </Button>
        </div>

        <div className="overflow-auto">
          <div className="flex gap-2 overflow-auto pt-1">
            {messageImages.map((image, index) => (
              <div
                key={index}
                className="relative flex h-14 cursor-pointer items-center space-x-4 rounded-xl border border-zinc-200 bg-white/70 p-1 backdrop-blur-md transition-opacity hover:opacity-75 dark:border-zinc-800 dark:bg-zinc-900/70"
              >
                <Image
                  className="rounded-lg object-cover"
                  style={{
                    minWidth: "48px",
                    minHeight: "48px",
                    maxHeight: "48px",
                    maxWidth: "48px"
                  }}
                  src={image.base64}
                  alt="File image"
                  width={48}
                  height={48}
                  onClick={() => {
                    setSelectedImage(image)
                    setShowPreview(true)
                  }}
                />

                <button
                  type="button"
                  className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-rose-400"
                  onClick={e => {
                    e.stopPropagation()
                    setNewMessageImages(
                      newMessageImages.filter(
                        f => f.messageId !== image.messageId
                      )
                    )
                    setChatImages(
                      chatImages.filter(f => f.messageId !== image.messageId)
                    )
                  }}
                >
                  <IconX size={12} />
                </button>
              </div>
            ))}

            {combinedChatFiles.map((file, index) =>
              file.id === "loading" ? (
                <div
                  key={index}
                  className="relative flex h-14 items-center space-x-3 rounded-xl border border-zinc-200 bg-white/70 px-3.5 py-2.5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70"
                >
                  <div className="rounded-lg bg-sky-500/10 p-2 text-sky-500">
                    <IconLoader2 className="size-4 animate-spin" />
                  </div>
                  <div className="truncate text-xs font-medium">
                    <div className="truncate text-zinc-900 dark:text-zinc-100">
                      {file.name}
                    </div>
                    <div className="truncate font-mono text-[10px] text-zinc-400">
                      {file.type}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={file.id}
                  className="relative flex h-14 cursor-pointer items-center space-x-3 rounded-xl border border-zinc-200 bg-white/70 px-3.5 py-2.5 backdrop-blur-md transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700"
                  onClick={() => getLinkAndView(file)}
                >
                  <div className="rounded-lg bg-sky-500/10 p-2 text-sky-500">
                    {(() => {
                      let fileExtension = file.type.includes("/")
                        ? file.type.split("/")[1]
                        : file.type

                      switch (fileExtension) {
                        case "pdf":
                          return <IconFileTypePdf size={16} />
                        case "markdown":
                          return <IconMarkdown size={16} />
                        case "txt":
                          return <IconFileTypeTxt size={16} />
                        case "json":
                          return <IconJson size={16} />
                        case "csv":
                          return <IconFileTypeCsv size={16} />
                        case "docx":
                          return <IconFileTypeDocx size={16} />
                        default:
                          return <IconFileFilled size={16} />
                      }
                    })()}
                  </div>

                  <div className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    <div className="truncate">{file.name}</div>
                  </div>

                  <button
                    type="button"
                    className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-rose-400"
                    onClick={e => {
                      e.stopPropagation()
                      setNewMessageFiles(
                        newMessageFiles.filter(f => f.id !== file.id)
                      )
                      setChatFiles(chatFiles.filter(f => f.id !== file.id))
                    }}
                  >
                    <IconX size={12} />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  ) : (
    combinedMessageFiles.length > 0 && (
      <div className="flex w-full items-center justify-center space-x-2">
        <Button
          variant="outline"
          className="h-8 gap-2 rounded-lg border-zinc-200 bg-white/80 px-3 font-mono text-xs text-zinc-700 shadow-sm backdrop-blur-md hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
          onClick={() => setShowFilesDisplay(true)}
        >
          <RetrievalToggle />
          <span>
            View {combinedMessageFiles.length} file
            {combinedMessageFiles.length > 1 ? "s" : ""}
          </span>
          <div onClick={e => e.stopPropagation()}>
            <ChatRetrievalSettings />
          </div>
        </Button>
      </div>
    )
  )
}

const RetrievalToggle = ({}) => {
  const { useRetrieval, setUseRetrieval } = useContext(ChatbotUIContext)

  return (
    <div className="flex items-center">
      <WithTooltip
        delayDuration={0}
        side="top"
        display={
          <div className="font-mono text-xs">
            {useRetrieval
              ? "File retrieval active. Click to disable."
              : "Click to enable file retrieval."}
          </div>
        }
        trigger={
          <IconCircleFilled
            className={cn(
              "cursor-pointer transition-colors",
              useRetrieval
                ? "text-emerald-500 hover:text-emerald-400"
                : "text-rose-500 hover:text-rose-400"
            )}
            size={12}
            onClick={e => {
              e.stopPropagation()
              setUseRetrieval(prev => !prev)
            }}
          />
        }
      />
    </div>
  )
}
