import { getDemoModels } from "@/lib/server/demo"
import { createResponse } from "@/lib/server/server-utils"

export const dynamic = "force-dynamic"

// Which providers the server can serve without the user's own key.
// Only the rate-limited demo providers (OpenAI / Google) qualify; every other
// provider needs a key saved in Profile Settings.
export async function GET() {
  const demoModels = getDemoModels()

  const isUsingEnvKeyMap: Record<string, boolean> = {
    openai: Boolean(demoModels.openai),
    google: Boolean(demoModels.google)
  }

  return createResponse({ isUsingEnvKeyMap, demoModels }, 200)
}
