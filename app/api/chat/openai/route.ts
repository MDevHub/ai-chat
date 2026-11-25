import {
  ChatRouteError,
  DEMO_MAX_OUTPUT_TOKENS,
  demoHeaders,
  resolveChatCredentials
} from "@/lib/server/demo"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    const { apiKey, organization, demo } = await resolveChatCredentials(
      "openai",
      profile,
      request,
      messages
    )

    const openai = new OpenAI({ apiKey, organization })

    // Demo requests always run on the cheap demo model with a capped reply
    const model = demo?.model ?? chatSettings.model

    const response = await openai.chat.completions.create({
      model: model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      max_tokens: demo
        ? DEMO_MAX_OUTPUT_TOKENS
        : model === "gpt-4-vision-preview" || model === "gpt-4o"
          ? 4096
          : null,
      stream: true
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream, { headers: demoHeaders(demo) })
  } catch (error: any) {
    if (error instanceof ChatRouteError) return error.toResponse()

    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
