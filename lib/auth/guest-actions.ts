"use server"

import { getDemoModels } from "@/lib/server/demo"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const fail = (message: string) =>
  redirect(`/login?message=${encodeURIComponent(message)}`)

/**
 * One-click guest access: creates an anonymous Supabase user (the
 * create_profile_and_workspace trigger gives it a profile + Home workspace),
 * skips onboarding, and drops the visitor straight into chat on the free demo.
 */
export async function signInAsGuest() {
  if (process.env.GUEST_ACCESS_ENABLED === "false") {
    return fail("Guest access is turned off. Please create an account.")
  }

  const supabase = createClient(cookies())

  const { data, error } = await supabase.auth.signInAnonymously()

  if (error || !data.user) {
    console.error("[guest] anonymous sign-in failed", error)
    return fail(
      "Guest access is unavailable right now. Please create an account instead."
    )
  }

  const userId = data.user.id

  // Guests skip the setup wizard (username / API key steps)
  await supabase
    .from("profiles")
    .update({ has_onboarded: true, display_name: "Guest" })
    .eq("user_id", userId)

  const { data: homeWorkspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("user_id", userId)
    .eq("is_home", true)
    .single()

  if (!homeWorkspace) {
    return fail("Couldn't prepare your guest workspace. Please try again.")
  }

  // The workspace trigger defaults to an OpenAI model; point guests at a model
  // the demo can actually serve (e.g. Gemini when only a Gemini key is set).
  const demoModel = Object.values(getDemoModels())[0]
  if (demoModel) {
    await supabase
      .from("workspaces")
      .update({ default_model: demoModel })
      .eq("id", homeWorkspace.id)
  }

  return redirect(`/${homeWorkspace.id}/chat`)
}
