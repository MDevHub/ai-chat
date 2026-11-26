"use client"

import { Sidebar } from "@/components/sidebar/sidebar"
import { SidebarSwitcher } from "@/components/sidebar/sidebar-switcher"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import useHotkey from "@/lib/hooks/use-hotkey"
import { cn } from "@/lib/utils"
import { ContentType } from "@/types"
import { IconChevronCompactLeft, IconFileUpload } from "@tabler/icons-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import { useSelectFileHandler } from "../chat/chat-hooks/use-select-file-handler"
import { CommandK } from "../utility/command-k"
import {
  DashboardContext,
  MOBILE_QUERY,
  isMobileViewport
} from "./dashboard-context"

export const SIDEBAR_WIDTH = 340

interface DashboardProps {
  children: React.ReactNode
}

export const Dashboard: FC<DashboardProps> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabValue = searchParams.get("tab") || "chats"

  const { handleSelectDeviceFile } = useSelectFileHandler()

  const [contentType, setContentType] = useState<ContentType>(
    tabValue as ContentType
  )
  // null = not yet hydrated: CSS defaults to closed on mobile, open on desktop
  const [showSidebar, setShowSidebar] = useState<boolean | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY)

    const sync = () => {
      setIsMobile(media.matches)
      // Mobile always starts closed; desktop restores the saved preference
      setShowSidebar(
        media.matches ? false : localStorage.getItem("showSidebar") !== "false"
      )
    }

    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  const mobileOpen = showSidebar === true
  const desktopOpen = showSidebar !== false
  const isOpen = isMobile ? mobileOpen : desktopOpen

  // Keep hidden sidebar content out of the tab order and accessibility tree
  useEffect(() => {
    sidebarRef.current?.toggleAttribute("inert", !isOpen)
  }, [isOpen])

  const closeSidebarOnMobile = useCallback(() => {
    if (isMobileViewport()) setShowSidebar(false)
  }, [])

  const onFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const files = event.dataTransfer.files
    const file = files[0]

    if (file) {
      handleSelectDeviceFile(file)
    }

    setIsDragging(false)
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleToggleSidebar = useCallback(() => {
    const mobile = isMobileViewport()

    setShowSidebar(prevState => {
      const next = mobile ? prevState !== true : prevState === false
      // Only persist the desktop preference; mobile always starts closed
      if (!mobile) localStorage.setItem("showSidebar", String(next))
      return next
    })
  }, [])

  useHotkey("s", handleToggleSidebar)

  return (
    <DashboardContext.Provider
      value={{
        sidebarState: showSidebar,
        toggleSidebar: handleToggleSidebar,
        closeSidebarOnMobile
      }}
    >
      <div
        className="flex h-dvh w-full overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-[#0a0a0c] dark:text-zinc-100"
        style={
          { "--sidebar-width": `${SIDEBAR_WIDTH}px` } as React.CSSProperties
        }
      >
        <CommandK />

        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={handleToggleSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar: floating drawer on mobile, docked on desktop */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[min(var(--sidebar-width),calc(100vw_-_3rem))] transition-transform duration-200 ease-out",
            "md:relative md:inset-auto md:z-auto md:shrink-0 md:translate-x-0 md:transition-[width]",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            desktopOpen ? "md:w-[var(--sidebar-width)]" : "md:w-0"
          )}
        >
          <div
            ref={sidebarRef}
            aria-hidden={!isOpen}
            className={cn(
              "size-full overflow-hidden border-r border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950",
              "md:bg-transparent md:shadow-none md:dark:bg-transparent",
              mobileOpen && "shadow-xl",
              !desktopOpen && "md:border-none"
            )}
          >
            <Tabs
              className="flex h-full w-[min(var(--sidebar-width),calc(100vw_-_3rem))] bg-white/70 md:w-[var(--sidebar-width)] dark:bg-zinc-950/70"
              value={contentType}
              onValueChange={tabValue => {
                setContentType(tabValue as ContentType)
                router.replace(`${pathname}?tab=${tabValue}`)
              }}
            >
              <SidebarSwitcher onContentTypeChange={setContentType} />

              <Sidebar contentType={contentType} showSidebar={isOpen} />
            </Tabs>
          </div>

          {/* Collapse: centered on the sidebar's right border, only while open.
              When closed, <SidebarOpenButton /> in the chat header takes over. */}
          <Button
            className={cn(
              "absolute left-full top-1/2 z-50 size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg border border-zinc-200/80 bg-white text-zinc-500 shadow-sm hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100",
              !mobileOpen && "hidden",
              desktopOpen ? "md:inline-flex" : "md:hidden"
            )}
            variant="ghost"
            size="icon"
            onClick={handleToggleSidebar}
            aria-label="Close sidebar"
          >
            <IconChevronCompactLeft size={16} />
          </Button>
        </div>

        {/* Main Content Area (flex-1 min-w-0 prevents horizontal overflow) */}
        <div
          className="relative flex h-full min-w-0 flex-1 flex-col bg-zinc-50/50 dark:bg-[#0a0a0c]"
          onDrop={onFileDrop}
          onDragOver={onDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          {isDragging ? (
            <div className="flex h-full items-center justify-center bg-zinc-950/70 p-6 backdrop-blur-md">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-sky-500/60 bg-zinc-900/90 px-10 py-8 text-center shadow-2xl">
                <div className="flex size-11 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400">
                  <IconFileUpload className="size-5" />
                </div>
                <div className="font-mono text-sm font-medium text-zinc-100">
                  Drop file to attach to context
                </div>
                <div className="font-mono text-xs text-zinc-400">
                  Supports PDF, Markdown, CSV, TXT, and code files
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </DashboardContext.Provider>
  )
}
