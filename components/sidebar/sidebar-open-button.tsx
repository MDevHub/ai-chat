import { useDashboard } from "@/components/ui/dashboard-context"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { cn } from "@/lib/utils"
import { IconLayoutSidebarLeftExpand } from "@tabler/icons-react"
import { FC } from "react"

interface SidebarOpenButtonProps {
  className?: string
}

/** Header button that reopens the sidebar; renders only while it is closed. */
export const SidebarOpenButton: FC<SidebarOpenButtonProps> = ({
  className
}) => {
  const { sidebarState, toggleSidebar } = useDashboard()

  // Open: the sidebar's own collapse button is shown instead
  if (sidebarState === true) return null

  return (
    <WithTooltip
      delayDuration={300}
      side="bottom"
      asChild
      display={<div className="font-mono text-xs">Open sidebar (⌘⇧S)</div>}
      trigger={
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/80 text-zinc-500 shadow-sm backdrop-blur-md hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100",
            // Before hydration the sidebar is open on desktop, so only show on mobile
            sidebarState === null && "md:hidden",
            className
          )}
        >
          <IconLayoutSidebarLeftExpand size={18} />
        </button>
      }
    />
  )
}
