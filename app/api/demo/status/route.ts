import { getDemoStatus } from "@/lib/server/demo"
import { getServerProfile } from "@/lib/server/server-chat-helpers"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// Remaining free demo messages for this visitor (does not consume one)
export async function GET(request: Request) {
  try {
    const profile = await getServerProfile()
    const status = await getDemoStatus(request, profile.user_id)
    return Response.json(status, {
      headers: { "Cache-Control": "no-store" }
    })
  } catch (error: any) {
    return Response.json(
      { message: error.message || "Unable to load demo status" },
      { status: 401 }
    )
  }
}
