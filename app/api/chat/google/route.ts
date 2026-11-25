import {
  ChatRouteError,
  DEMO_MAX_OUTPUT_TOKENS,
  demoHeaders,
  resolveChatCredentials
} from "@/lib/server/demo"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    const { apiKey, demo } = await resolveChatCredentials(
      "google",
      profile,
      request,
      messages
    )

    const genAI = new GoogleGenerativeAI(apiKey)
    // Demo requests always run on the cheap demo model with a capped reply
    const googleModel = genAI.getGenerativeModel({
      model: demo?.model ?? chatSettings.model
    })

    const lastMessage = messages.pop()

    const chat = googleModel.startChat({
      history: messages,
      generationConfig: {
        temperature: chatSettings.temperature,
        ...(demo && { maxOutputTokens: DEMO_MAX_OUTPUT_TOKENS })
      }
    })

    const response = await chat.sendMessageStream(lastMessage.parts)

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response.stream) {
          const chunkText = chunk.text()
          controller.enqueue(encoder.encode(chunkText))
        }
        controller.close()
      }
    })

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain", ...demoHeaders(demo) }
    })
  } catch (error: any) {
    if (error instanceof ChatRouteError) return error.toResponse()

    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Google Gemini API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("api key not valid")) {
      errorMessage =
        "Google Gemini API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
