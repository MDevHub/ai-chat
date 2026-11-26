import { createContext, useContext } from "react"

interface DashboardContextValue {
  // null = not yet hydrated (CSS default: closed on mobile, open on desktop)
  sidebarState: boolean | null
  toggleSidebar: () => void
  closeSidebarOnMobile: () => void
}

export const DashboardContext = createContext<DashboardContextValue>({
  sidebarState: null,
  toggleSidebar: () => {},
  closeSidebarOnMobile: () => {}
})

export const useDashboard = () => useContext(DashboardContext)

export const MOBILE_QUERY = "(max-width: 767px)"

export const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
