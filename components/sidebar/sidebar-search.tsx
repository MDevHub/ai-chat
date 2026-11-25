import { ContentType } from "@/types"
import { IconSearch } from "@tabler/icons-react"
import { FC } from "react"
import { Input } from "../ui/input"

interface SidebarSearchProps {
  contentType: ContentType
  searchTerm: string
  setSearchTerm: Function
}

export const SidebarSearch: FC<SidebarSearchProps> = ({
  contentType,
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="relative">
      <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
      <Input
        className="h-8 rounded-lg border-zinc-200 bg-zinc-50/70 pl-8 pr-3 text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:placeholder:text-zinc-500"
        placeholder={`Search ${contentType}...`}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
    </div>
  )
}
