import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FC } from "react"
import { Button } from "../ui/button"

interface APIStepProps {
  openaiAPIKey: string
  openaiOrgID: string
  azureOpenaiAPIKey: string
  azureOpenaiEndpoint: string
  azureOpenai35TurboID: string
  azureOpenai45TurboID: string
  azureOpenai45VisionID: string
  azureOpenaiEmbeddingsID: string
  anthropicAPIKey: string
  googleGeminiAPIKey: string
  mistralAPIKey: string
  groqAPIKey: string
  perplexityAPIKey: string
  useAzureOpenai: boolean
  openrouterAPIKey: string
  onOpenrouterAPIKeyChange: (value: string) => void
  onOpenaiAPIKeyChange: (value: string) => void
  onOpenaiOrgIDChange: (value: string) => void
  onAzureOpenaiAPIKeyChange: (value: string) => void
  onAzureOpenaiEndpointChange: (value: string) => void
  onAzureOpenai35TurboIDChange: (value: string) => void
  onAzureOpenai45TurboIDChange: (value: string) => void
  onAzureOpenai45VisionIDChange: (value: string) => void
  onAzureOpenaiEmbeddingsIDChange: (value: string) => void
  onAnthropicAPIKeyChange: (value: string) => void
  onGoogleGeminiAPIKeyChange: (value: string) => void
  onMistralAPIKeyChange: (value: string) => void
  onGroqAPIKeyChange: (value: string) => void
  onPerplexityAPIKeyChange: (value: string) => void
  onUseAzureOpenaiChange: (value: boolean) => void
}

const inputClass =
  "h-9 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 font-mono text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:placeholder:text-zinc-600"

const labelClass =
  "font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400"

export const APIStep: FC<APIStepProps> = ({
  openaiAPIKey,
  openaiOrgID,
  azureOpenaiAPIKey,
  azureOpenaiEndpoint,
  azureOpenai35TurboID,
  azureOpenai45TurboID,
  azureOpenai45VisionID,
  azureOpenaiEmbeddingsID,
  anthropicAPIKey,
  googleGeminiAPIKey,
  mistralAPIKey,
  groqAPIKey,
  perplexityAPIKey,
  openrouterAPIKey,
  useAzureOpenai,
  onOpenaiAPIKeyChange,
  onOpenaiOrgIDChange,
  onAzureOpenaiAPIKeyChange,
  onAzureOpenaiEndpointChange,
  onAzureOpenai35TurboIDChange,
  onAzureOpenai45TurboIDChange,
  onAzureOpenai45VisionIDChange,
  onAzureOpenaiEmbeddingsIDChange,
  onAnthropicAPIKeyChange,
  onGoogleGeminiAPIKeyChange,
  onMistralAPIKeyChange,
  onGroqAPIKeyChange,
  onPerplexityAPIKeyChange,
  onUseAzureOpenaiChange,
  onOpenrouterAPIKeyChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className={labelClass}>
            {useAzureOpenai ? "Azure OpenAI API Key" : "OpenAI API Key"}
          </Label>

          <Button
            type="button"
            variant="outline"
            className="h-6 rounded-md border-zinc-200 bg-zinc-100/70 px-2.5 font-mono text-[10px] text-zinc-600 hover:bg-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={() => onUseAzureOpenaiChange(!useAzureOpenai)}
          >
            {useAzureOpenai ? "Use Standard OpenAI" : "Use Azure OpenAI"}
          </Button>
        </div>

        <Input
          className={inputClass}
          placeholder={useAzureOpenai ? "Azure key..." : "sk-..."}
          type="password"
          value={useAzureOpenai ? azureOpenaiAPIKey : openaiAPIKey}
          onChange={e =>
            useAzureOpenai
              ? onAzureOpenaiAPIKeyChange(e.target.value)
              : onOpenaiAPIKeyChange(e.target.value)
          }
        />
      </div>

      <div className="space-y-3 border-l border-zinc-200 pl-3.5 dark:border-zinc-800">
        {useAzureOpenai ? (
          <>
            <div className="space-y-1">
              <Label className={labelClass}>Azure OpenAI Endpoint</Label>
              <Input
                className={inputClass}
                placeholder="https://your-endpoint.openai.azure.com"
                type="password"
                value={azureOpenaiEndpoint}
                onChange={e => onAzureOpenaiEndpointChange(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className={labelClass}>
                Azure OpenAI GPT-3.5 Turbo ID
              </Label>
              <Input
                className={inputClass}
                placeholder="Deployment ID"
                type="password"
                value={azureOpenai35TurboID}
                onChange={e => onAzureOpenai35TurboIDChange(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className={labelClass}>
                Azure OpenAI GPT-4.5 Turbo ID
              </Label>
              <Input
                className={inputClass}
                placeholder="Deployment ID"
                type="password"
                value={azureOpenai45TurboID}
                onChange={e => onAzureOpenai45TurboIDChange(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className={labelClass}>
                Azure OpenAI GPT-4.5 Vision ID
              </Label>
              <Input
                className={inputClass}
                placeholder="Deployment ID"
                type="password"
                value={azureOpenai45VisionID}
                onChange={e => onAzureOpenai45VisionIDChange(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className={labelClass}>Azure OpenAI Embeddings ID</Label>
              <Input
                className={inputClass}
                placeholder="Deployment ID"
                type="password"
                value={azureOpenaiEmbeddingsID}
                onChange={e => onAzureOpenaiEmbeddingsIDChange(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <Label className={labelClass}>OpenAI Organization ID</Label>
            <Input
              className={inputClass}
              placeholder="org-... (optional)"
              type="password"
              value={openaiOrgID}
              onChange={e => onOpenaiOrgIDChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className={labelClass}>Anthropic API Key</Label>
        <Input
          className={inputClass}
          placeholder="sk-ant-..."
          type="password"
          value={anthropicAPIKey}
          onChange={e => onAnthropicAPIKeyChange(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className={labelClass}>Google Gemini API Key</Label>
        <Input
          className={inputClass}
          placeholder="AIza..."
          type="password"
          value={googleGeminiAPIKey}
          onChange={e => onGoogleGeminiAPIKeyChange(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className={labelClass}>OpenRouter API Key</Label>
        <Input
          className={inputClass}
          placeholder="sk-or-..."
          type="password"
          value={openrouterAPIKey}
          onChange={e => onOpenrouterAPIKeyChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className={labelClass}>Groq</Label>
          <Input
            className={inputClass}
            placeholder="gsk_..."
            type="password"
            value={groqAPIKey}
            onChange={e => onGroqAPIKeyChange(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>Mistral</Label>
          <Input
            className={inputClass}
            placeholder="API Key"
            type="password"
            value={mistralAPIKey}
            onChange={e => onMistralAPIKeyChange(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>Perplexity</Label>
          <Input
            className={inputClass}
            placeholder="pplx-..."
            type="password"
            value={perplexityAPIKey}
            onChange={e => onPerplexityAPIKeyChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
