import { onOpenProfileSettings } from "@/lib/demo-usage-store"
import { ChatbotUIContext } from "@/context/context"
import {
  PROFILE_CONTEXT_MAX,
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_USERNAME_MAX,
  PROFILE_USERNAME_MIN
} from "@/db/limits"
import { updateProfile } from "@/db/profile"
import { uploadProfileImage } from "@/db/storage/profile-images"
import { exportLocalStorageAsJSON } from "@/lib/export-old-data"
import { fetchOpenRouterModels } from "@/lib/models/fetch-models"
import { LLM_LIST_MAP } from "@/lib/models/llm/llm-list"
import { supabase } from "@/lib/supabase/browser-client"
import { cn } from "@/lib/utils"
import { OpenRouterLLM } from "@/types"
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconFileDownload,
  IconLoader2,
  IconLogout,
  IconTerminal2,
  IconUser
} from "@tabler/icons-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FC, useCallback, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Button } from "../ui/button"
import ImagePicker from "../ui/image-picker"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { LimitDisplay } from "../ui/limit-display"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { WithTooltip } from "../ui/with-tooltip"
import { GuestUpgrade } from "./guest-upgrade"
import { ThemeSwitcher } from "./theme-switcher"

interface ProfileSettingsProps {}

const inputClass =
  "h-9 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-950/50"

const labelClass =
  "font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400"

export const ProfileSettings: FC<ProfileSettingsProps> = ({}) => {
  const {
    profile,
    setProfile,
    envKeyMap,
    setAvailableHostedModels,
    setAvailableOpenRouterModels,
    availableOpenRouterModels
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)

  // Lets the free-demo banner open this sheet directly
  useEffect(() => onOpenProfileSettings(() => setIsOpen(true)), [])

  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [usernameAvailable, setUsernameAvailable] = useState(true)
  const [loadingUsername, setLoadingUsername] = useState(false)
  const [profileImageSrc, setProfileImageSrc] = useState(
    profile?.image_url || ""
  )
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileInstructions, setProfileInstructions] = useState(
    profile?.profile_context || ""
  )

  const [useAzureOpenai, setUseAzureOpenai] = useState(
    profile?.use_azure_openai
  )
  const [openaiAPIKey, setOpenaiAPIKey] = useState(
    profile?.openai_api_key || ""
  )
  const [openaiOrgID, setOpenaiOrgID] = useState(
    profile?.openai_organization_id || ""
  )
  const [azureOpenaiAPIKey, setAzureOpenaiAPIKey] = useState(
    profile?.azure_openai_api_key || ""
  )
  const [azureOpenaiEndpoint, setAzureOpenaiEndpoint] = useState(
    profile?.azure_openai_endpoint || ""
  )
  const [azureOpenai35TurboID, setAzureOpenai35TurboID] = useState(
    profile?.azure_openai_35_turbo_id || ""
  )
  const [azureOpenai45TurboID, setAzureOpenai45TurboID] = useState(
    profile?.azure_openai_45_turbo_id || ""
  )
  const [azureOpenai45VisionID, setAzureOpenai45VisionID] = useState(
    profile?.azure_openai_45_vision_id || ""
  )
  const [azureEmbeddingsID, setAzureEmbeddingsID] = useState(
    profile?.azure_openai_embeddings_id || ""
  )
  const [anthropicAPIKey, setAnthropicAPIKey] = useState(
    profile?.anthropic_api_key || ""
  )
  const [googleGeminiAPIKey, setGoogleGeminiAPIKey] = useState(
    profile?.google_gemini_api_key || ""
  )
  const [mistralAPIKey, setMistralAPIKey] = useState(
    profile?.mistral_api_key || ""
  )
  const [groqAPIKey, setGroqAPIKey] = useState(profile?.groq_api_key || "")
  const [perplexityAPIKey, setPerplexityAPIKey] = useState(
    profile?.perplexity_api_key || ""
  )
  const [openrouterAPIKey, setOpenrouterAPIKey] = useState(
    profile?.openrouter_api_key || ""
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
    return
  }

  const handleSave = async () => {
    if (!profile) return
    let profileImageUrl = profile.image_url
    let profileImagePath = ""

    if (profileImageFile) {
      const { path, url } = await uploadProfileImage(profile, profileImageFile)
      profileImageUrl = url ?? profileImageUrl
      profileImagePath = path
    }

    const updatedProfile = await updateProfile(profile.id, {
      ...profile,
      display_name: displayName,
      username,
      profile_context: profileInstructions,
      image_url: profileImageUrl,
      image_path: profileImagePath,
      openai_api_key: openaiAPIKey,
      openai_organization_id: openaiOrgID,
      anthropic_api_key: anthropicAPIKey,
      google_gemini_api_key: googleGeminiAPIKey,
      mistral_api_key: mistralAPIKey,
      groq_api_key: groqAPIKey,
      perplexity_api_key: perplexityAPIKey,
      use_azure_openai: useAzureOpenai,
      azure_openai_api_key: azureOpenaiAPIKey,
      azure_openai_endpoint: azureOpenaiEndpoint,
      azure_openai_35_turbo_id: azureOpenai35TurboID,
      azure_openai_45_turbo_id: azureOpenai45TurboID,
      azure_openai_45_vision_id: azureOpenai45VisionID,
      azure_openai_embeddings_id: azureEmbeddingsID,
      openrouter_api_key: openrouterAPIKey
    })

    setProfile(updatedProfile)
    toast.success("Profile updated!")
    setIsOpen(false)
  }

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout | null
    return (...args: any[]) => {
      const later = () => {
        if (timeout) clearTimeout(timeout)
        func(...args)
      }
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      if (!username) return
      if (
        username.length < PROFILE_USERNAME_MIN ||
        username.length > PROFILE_USERNAME_MAX
      ) {
        setUsernameAvailable(false)
        return
      }
      const usernameRegex = /^[a-zA-Z0-9_]+$/
      if (!usernameRegex.test(username)) {
        setUsernameAvailable(false)
        toast.error("Username must be letters, numbers, or underscores only.")
        return
      }
      setLoadingUsername(true)
      const response = await fetch(`/api/username/available`, {
        method: "POST",
        body: JSON.stringify({ username })
      })
      const data = await response.json()
      setUsernameAvailable(data.isAvailable)
      if (username === profile?.username) setUsernameAvailable(true)
      setLoadingUsername(false)
    }, 500),
    []
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") buttonRef.current?.click()
  }

  if (!profile) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {profile.image_url ? (
          <Image
            className="size-8 cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-75"
            src={`${profile.image_url}?v=${encodeURIComponent(profile.updated_at ?? "")}`}
            height={32}
            width={32}
            alt={"Profile"}
          />
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="size-8 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <IconUser size={18} />
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        className="flex w-full flex-col justify-between border-r border-zinc-200/80 bg-white/95 p-0 backdrop-blur-xl sm:max-w-[460px] dark:border-zinc-800/80 dark:bg-zinc-950/95"
        side="left"
        onKeyDown={handleKeyDown}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b border-zinc-100 px-6 pb-4 pt-5 text-left dark:border-zinc-800/80">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                <IconTerminal2 className="size-3.5 text-sky-500" />
                <span>mdev.ai / settings</span>
              </div>

              <Button
                tabIndex={-1}
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="h-7 gap-1.5 rounded-lg border-zinc-200 bg-transparent px-2.5 font-mono text-[11px] text-rose-600 hover:bg-rose-500/10 dark:border-zinc-800 dark:text-rose-400"
              >
                <IconLogout size={14} />
                <span>Logout</span>
              </Button>
            </div>
            <SheetTitle className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              User Settings
            </SheetTitle>
          </SheetHeader>

          <GuestUpgrade />

          <Tabs
            defaultValue="profile"
            className="flex min-h-0 flex-1 flex-col px-6 py-4"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
              <TabsTrigger
                value="profile"
                className="rounded-lg font-mono text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-800"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="keys"
                className="rounded-lg font-mono text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-800"
              >
                API Keys
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto py-4">
              <TabsContent className="mt-0 space-y-4" value="profile">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className={labelClass}>Username</Label>
                    <span
                      className={`font-mono text-[10px] font-semibold uppercase ${username === profile.username ? "text-zinc-400" : usernameAvailable ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {username === profile.username
                        ? "Current"
                        : usernameAvailable
                          ? "Available"
                          : "Unavailable"}
                    </span>
                  </div>

                  <div className="relative">
                    <Input
                      className={inputClass}
                      placeholder="Username..."
                      value={username}
                      onChange={e => {
                        setUsername(e.target.value)
                        checkUsernameAvailability(e.target.value)
                      }}
                      minLength={PROFILE_USERNAME_MIN}
                      maxLength={PROFILE_USERNAME_MAX}
                    />

                    {username !== profile.username && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {loadingUsername ? (
                          <IconLoader2 className="size-4 animate-spin text-zinc-400" />
                        ) : usernameAvailable ? (
                          <IconCircleCheckFilled className="size-4 text-emerald-500" />
                        ) : (
                          <IconCircleXFilled className="size-4 text-rose-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <LimitDisplay
                    used={username.length}
                    limit={PROFILE_USERNAME_MAX}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClass}>Profile Image</Label>
                  <ImagePicker
                    src={profileImageSrc}
                    image={profileImageFile}
                    height={64}
                    width={64}
                    onSrcChange={setProfileImageSrc}
                    onImageChange={setProfileImageFile}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClass}>Chat Display Name</Label>
                  <Input
                    className={inputClass}
                    placeholder="Your Name"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    maxLength={PROFILE_DISPLAY_NAME_MAX}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClass}>
                    AI Context & Instructions
                  </Label>
                  <TextareaAutosize
                    value={profileInstructions}
                    onValueChange={setProfileInstructions}
                    placeholder="What would you like the AI to know about you?"
                    minRows={4}
                    maxRows={8}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-950/50"
                  />
                  <LimitDisplay
                    used={profileInstructions.length}
                    limit={PROFILE_CONTEXT_MAX}
                  />
                </div>
              </TabsContent>

              <TabsContent className="mt-0 space-y-4" value="keys">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className={labelClass}>
                      {useAzureOpenai ? "Azure OpenAI Key" : "OpenAI API Key"}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-6 rounded-md border-zinc-200 bg-zinc-100/70 px-2 font-mono text-[10px] dark:border-zinc-800 dark:bg-zinc-800"
                      onClick={() => setUseAzureOpenai(!useAzureOpenai)}
                    >
                      {useAzureOpenai
                        ? "Use Standard OpenAI"
                        : "Use Azure OpenAI"}
                    </Button>
                  </div>
                  <Input
                    className={inputClass}
                    placeholder="sk-..."
                    type="password"
                    value={useAzureOpenai ? azureOpenaiAPIKey : openaiAPIKey}
                    onChange={e =>
                      useAzureOpenai
                        ? setAzureOpenaiAPIKey(e.target.value)
                        : setOpenaiAPIKey(e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClass}>Anthropic API Key</Label>
                  <Input
                    className={inputClass}
                    placeholder="sk-ant-..."
                    type="password"
                    value={anthropicAPIKey}
                    onChange={e => setAnthropicAPIKey(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClass}>Google Gemini API Key</Label>
                  <Input
                    className={inputClass}
                    placeholder="AIza..."
                    type="password"
                    value={googleGeminiAPIKey}
                    onChange={e => setGoogleGeminiAPIKey(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClass}>OpenRouter API Key</Label>
                  <Input
                    className={inputClass}
                    placeholder="sk-or-..."
                    type="password"
                    value={openrouterAPIKey}
                    onChange={e => setOpenrouterAPIKey(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClass}>Groq API Key</Label>
                  <Input
                    className={inputClass}
                    placeholder="gsk_..."
                    type="password"
                    value={groqAPIKey}
                    onChange={e => setGroqAPIKey(e.target.value)}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <WithTooltip
              display={
                <div className="font-mono text-xs">Export data as JSON</div>
              }
              trigger={
                <button
                  type="button"
                  onClick={exportLocalStorageAsJSON}
                  className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/80 text-zinc-500 shadow-sm hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  <IconFileDownload size={16} />
                </button>
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-9 rounded-lg border-zinc-200 bg-transparent px-4 font-mono text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
            >
              Cancel
            </Button>

            <Button
              ref={buttonRef}
              onClick={handleSave}
              className="h-9 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
