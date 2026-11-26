import { ContentType } from "@/types"
import { FC } from "react"
import { TabsTrigger } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"

interface SidebarSwitchItemProps {
  contentType: ContentType
  icon: React.ReactNode
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitchItem: FC<SidebarSwitchItemProps> = ({
  contentType,
  icon,
  onContentTypeChange
}) => {
  return (
    <WithTooltip
      display={
        <div className="font-mono text-xs">
          {contentType[0].toUpperCase() + contentType.substring(1)}
        </div>
      }
      trigger={
        <TabsTrigger
          className="flex size-9 items-center justify-center rounded-lg p-0 text-zinc-500 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900 data-[state=active]:bg-white data-[state=active]:text-sky-600 data-[state=active]:shadow-sm dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-sky-400"
          value={contentType}
          onClick={() => onContentTypeChange(contentType as ContentType)}
        >
          {icon}
        </TabsTrigger>
      }
    />
  )
}
