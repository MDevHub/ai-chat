import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { IconBell } from "@tabler/icons-react"
import { FC } from "react"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"

interface AlertsProps {}

export const Alerts: FC<AlertsProps> = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
          <IconBell size={SIDEBAR_ICON_SIZE} />
          {1 > 0 && (
            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] text-white">
              1
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 rounded-2xl border border-zinc-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95"
        align="start"
      >
        <div className="font-mono text-xs text-zinc-500">
          No new system alerts
        </div>
      </PopoverContent>
    </Popover>
  )
}
