import useHotkey from "@/lib/hooks/use-hotkey"
import {
  IconBrandGithub,
  IconBrandX,
  IconHelpCircle,
  IconQuestionMark,
  IconTerminal2
} from "@tabler/icons-react"
import Link from "next/link"
import { FC, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Announcements } from "../utility/announcements"

interface ChatHelpProps {}

export const ChatHelp: FC<ChatHelpProps> = ({}) => {
  useHotkey("/", () => setIsOpen(prevState => !prevState))

  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Help & Shortcuts"
          className="flex size-8 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/80 text-zinc-500 shadow-sm backdrop-blur-md hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
        >
          <IconQuestionMark size={16} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border border-zinc-200/90 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <IconTerminal2 className="size-4 text-sky-500" />
            <span>mdev.ai shortcuts</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Announcements />
            <Link
              className="text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
              href="https://github.com/MDevHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandGithub size={16} />
            </Link>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1.5 bg-zinc-100 dark:bg-zinc-800" />

        <div className="space-y-0.5 font-mono text-xs">
          <DropdownMenuItem className="flex justify-between rounded-lg px-2 py-1.5">
            <span className="text-zinc-600 dark:text-zinc-400">Show Help</span>
            <span className="text-zinc-400">⌘⇧/</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex justify-between rounded-lg px-2 py-1.5">
            <span className="text-zinc-600 dark:text-zinc-400">New Chat</span>
            <span className="text-zinc-400">⌘⇧O</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex justify-between rounded-lg px-2 py-1.5">
            <span className="text-zinc-600 dark:text-zinc-400">Focus Chat</span>
            <span className="text-zinc-400">⌘⇧L</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex justify-between rounded-lg px-2 py-1.5">
            <span className="text-zinc-600 dark:text-zinc-400">
              Toggle Files
            </span>
            <span className="text-zinc-400">⌘⇧F</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex justify-between rounded-lg px-2 py-1.5">
            <span className="text-zinc-600 dark:text-zinc-400">
              Toggle Sidebar
            </span>
            <span className="text-zinc-400">⌘⇧S</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
