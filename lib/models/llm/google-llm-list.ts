import { LLM } from "@/types"

const GOOGLE_PLATORM_LINK = "https://ai.google.dev/"

// Google Models -----------------------------

// Gemini 3.5 Flash-Lite
const GEMINI_3_5_FLASH_LITE: LLM = {
  modelId: "gemini-3.5-flash-lite",
  modelName: "Gemini 3.5 Flash-Lite",
  provider: "google",
  hostedId: "gemini-3.5-flash-lite",
  platformLink: GOOGLE_PLATORM_LINK,
  imageInput: true
}

export const GOOGLE_LLM_LIST: LLM[] = [GEMINI_3_5_FLASH_LITE]
