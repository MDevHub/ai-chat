"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ChatbotUIContext } from "@/context/context"
import { getAssistantWorkspacesByWorkspaceId } from "@/db/assistants"
import { getChatsByWorkspaceId } from "@/db/chats"
import { getCollectionWorkspacesByWorkspaceId } from "@/db/collections"
import { getFileWorkspacesByWorkspaceId } from "@/db/files"
import { getFoldersByWorkspaceId } from "@/db/folders"
import { getModelWorkspacesByWorkspaceId } from "@/db/models"
import { getPresetWorkspacesByWorkspaceId } from "@/db/presets"
import { getPromptWorkspacesByWorkspaceId } from "@/db/prompts"
import { getAssistantImageFromStorage } from "@/db/storage/assistant-images"
import { getToolWorkspacesByWorkspaceId } from "@/db/tools"
import { getWorkspaceById } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { supabase } from "@/lib/supabase/browser-client"
import { LLMID } from "@/types"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ReactNode, useContext, useEffect, useState } from "react"
import Loading from "../loading"

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter()

  const params = useParams()
  const searchParams = useSearchParams()
  const workspaceId = params.workspaceid as string

  const {
    setChatSettings,
    setAssistants,
    setAssistantImages,
    setChats,
    setCollections,
    setFolders,
    setFiles,
    setPresets,
    setPrompts,
    setTools,
    setModels,
    setSelectedWorkspace,
    setSelectedChat,
    setChatMessages,
    setUserInput,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay
  } = useContext(ChatbotUIContext)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        return router.push("/login")
      }

      if (!isMounted) return

      setUserInput("")
      setChatMessages([])
      setSelectedChat(null)

      setIsGenerating(false)
      setFirstTokenReceived(false)

      setChatFiles([])
      setChatImages([])
      setNewMessageFiles([])
      setNewMessageImages([])
      setShowFilesDisplay(false)

      await fetchWorkspaceData(workspaceId)
    })()

    return () => {
      isMounted = false
    }
  }, [workspaceId])

  const fetchWorkspaceData = async (workspaceId: string) => {
    setLoading(true)

    const [
      workspace,
      assistantData,
      chats,
      collectionData,
      folders,
      fileData,
      presetData,
      promptData,
      toolData,
      modelData
    ] = await Promise.all([
      getWorkspaceById(workspaceId),
      getAssistantWorkspacesByWorkspaceId(workspaceId),
      getChatsByWorkspaceId(workspaceId),
      getCollectionWorkspacesByWorkspaceId(workspaceId),
      getFoldersByWorkspaceId(workspaceId),
      getFileWorkspacesByWorkspaceId(workspaceId),
      getPresetWorkspacesByWorkspaceId(workspaceId),
      getPromptWorkspacesByWorkspaceId(workspaceId),
      getToolWorkspacesByWorkspaceId(workspaceId),
      getModelWorkspacesByWorkspaceId(workspaceId)
    ])

    setSelectedWorkspace(workspace)
    setAssistants(assistantData.assistants)
    setChats(chats)
    setCollections(collectionData.collections)
    setFolders(folders)
    setFiles(fileData.files)
    setPresets(presetData.presets)
    setPrompts(promptData.prompts)
    setTools(toolData.tools)
    setModels(modelData.models)

    setChatSettings({
      model: (searchParams.get("model") ||
        workspace?.default_model ||
        "gpt-4-1106-preview") as LLMID,
      prompt:
        workspace?.default_prompt ||
        "You are a friendly, helpful AI assistant.",
      temperature: workspace?.default_temperature ?? 0.5,
      contextLength: workspace?.default_context_length ?? 4096,
      includeProfileContext: workspace?.include_profile_context ?? true,
      includeWorkspaceInstructions:
        workspace?.include_workspace_instructions ?? true,
      embeddingsProvider:
        (workspace?.embeddings_provider as "openai" | "local") || "openai"
    })

    setLoading(false)

    // Assistant avatars are non-critical: load them after the UI is interactive
    // so slow networks don't block the whole workspace on image downloads.
    const loadedImages = await Promise.all(
      assistantData.assistants.map(async assistant => {
        if (!assistant.image_path) {
          return {
            assistantId: assistant.id,
            path: assistant.image_path,
            base64: "",
            url: ""
          }
        }

        const url =
          (await getAssistantImageFromStorage(assistant.image_path)) || ""

        if (!url) {
          return {
            assistantId: assistant.id,
            path: assistant.image_path,
            base64: "",
            url: ""
          }
        }

        let base64 = ""
        try {
          const response = await fetch(url)
          base64 = await convertBlobToBase64(await response.blob())
        } catch {
          // Fall back to the default assistant icon if the image can't load
        }

        return {
          assistantId: assistant.id,
          path: assistant.image_path,
          base64,
          url
        }
      })
    )

    setAssistantImages(loadedImages)
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="flex h-dvh w-full min-w-0 max-w-none self-stretch bg-zinc-50 text-zinc-900 dark:bg-[#0a0a0c] dark:text-zinc-100">
      <Dashboard>{children}</Dashboard>
    </div>
  )
}
