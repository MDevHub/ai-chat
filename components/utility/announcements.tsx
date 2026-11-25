import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Announcement } from "@/types/announcement"
import { IconExternalLink, IconSpeakerphone } from "@tabler/icons-react"
import { FC, useEffect, useState } from "react"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"

interface AnnouncementsProps {}

export const Announcements: FC<AnnouncementsProps> = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    const storedAnnouncements = localStorage.getItem("announcements")
    let parsedAnnouncements: Announcement[] = storedAnnouncements
      ? JSON.parse(storedAnnouncements)
      : []
    setAnnouncements(parsedAnnouncements)
  }, [])

  const unreadCount = announcements.filter(a => !a.read).length

  const markAsRead = (id: string) => {
    const updated = announcements.map(a =>
      a.id === id ? { ...a, read: true } : a
    )
    setAnnouncements(updated)
    localStorage.setItem("announcements", JSON.stringify(updated))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
          <IconSpeakerphone size={SIDEBAR_ICON_SIZE - 2} />
          {unreadCount > 0 && (
            <div className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-sky-500 font-mono text-[9px] text-white">
              {unreadCount}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 rounded-2xl border border-zinc-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95"
        side="top"
      >
        <div className="space-y-3">
          <div className="font-mono text-sm font-semibold tracking-tight">
            Updates
          </div>
          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            {announcements.length === 0 ? (
              <div className="font-mono text-zinc-400">
                You are all caught up!
              </div>
            ) : (
              announcements.map(a => (
                <div
                  key={a.id}
                  className="rounded-xl border border-zinc-200/80 p-3 dark:border-zinc-800"
                >
                  <div className="font-semibold">{a.title}</div>
                  <div className="mt-1 text-[11px] text-zinc-500">
                    {a.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
