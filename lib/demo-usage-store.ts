"use client"

import { useSyncExternalStore } from "react"
import { DEMO_HEADERS, DEMO_LIMIT_ERROR_CODE, DemoStatus } from "./demo-config"

// Tiny client store for the free demo tier: remaining messages + limit state.
// Kept outside ChatbotUIContext so updates only re-render the demo notice.

interface DemoUsageState {
  /** null until we know (status fetched or a demo response seen) */
  remaining: number | null
  limit: number | null
  /** model the server actually used for the last demo reply */
  model: string | null
  limitReached: boolean
}

let state: DemoUsageState = {
  remaining: null,
  limit: null,
  model: null,
  limitReached: false
}

const listeners = new Set<() => void>()

const setState = (patch: Partial<DemoUsageState>) => {
  state = { ...state, ...patch }
  listeners.forEach(l => l())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => state
const getServerSnapshot = () => state

export const useDemoUsage = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

export const applyDemoStatus = (status: DemoStatus, model?: string) =>
  setState({
    remaining: status.remaining,
    limit: status.limit,
    model: model ?? state.model,
    limitReached: status.enabled && status.remaining <= 0
  })

/** Read demo headers off a successful chat response. */
export const trackDemoResponse = (response: Response) => {
  const remaining = response.headers.get(DEMO_HEADERS.remaining)
  if (remaining === null) return // user's own key: nothing to track

  setState({
    remaining: Number(remaining),
    limit: Number(response.headers.get(DEMO_HEADERS.limit)),
    model: response.headers.get(DEMO_HEADERS.model),
    limitReached: Number(remaining) <= 0
  })
}

/** True (and store updated) if an error body is the demo-limit 429. */
export const trackDemoLimitError = (
  status: number,
  body: { code?: string; limit?: number }
) => {
  if (status !== 429 || body.code !== DEMO_LIMIT_ERROR_CODE) return false
  setState({
    remaining: 0,
    limit: body.limit ?? state.limit,
    limitReached: true
  })
  return true
}

// ---- "Open Profile Settings" request, so the demo banner can open the sheet

const openListeners = new Set<() => void>()

export const requestOpenProfileSettings = () => openListeners.forEach(l => l())

export const onOpenProfileSettings = (listener: () => void) => {
  openListeners.add(listener)
  return () => {
    openListeners.delete(listener)
  }
}
