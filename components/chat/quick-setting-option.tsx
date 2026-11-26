import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { Tables } from "@/supabase/types"
import { IconCircleCheckFilled, IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { FC } from "react"
import { ModelIcon } from "../models/model-icon"
import { DropdownMenuItem } from "../ui/dropdown-menu"

interface QuickSettingOptionProps {
  contentType: "presets" | "assistants"
  isSelected: boolean
  item: Tables<"presets"> | Tables<"assistants">
  onSelect: () => void
  image: string
}

export const QuickSettingOption: FC<QuickSettingOptionProps> = ({
  contentType,
  isSelected,
  item,
  onSelect,
  image
}) => {
  const modelDetails = LLM_LIST.find(model => model.modelId === item.model)

  return (
    <DropdownMenuItem
      tabIndex={0}
      className="flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
      onSelect={onSelect}
    >
      <div className="flex items-center gap-2.5 truncate">
        <div className="shrink-0">
          {contentType === "presets" ? (
            <ModelIcon
              provider={modelDetails?.provider || "custom"}
              width={20}
              height={20}
            />
          ) : image ? (
            <Image
              className="rounded-md object-cover"
              src={image}
              alt="Assistant"
              width={20}
              height={20}
            />
          ) : (
            <div className="flex size-5 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 text-sky-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-sky-400">
              <IconRobotFace size={12} />
            </div>
          )}
        </div>

        <div className="flex flex-col truncate">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {item.name}
          </span>
          {item.description && (
            <span className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
              {item.description}
            </span>
          )}
        </div>
      </div>

      {isSelected && (
        <IconCircleCheckFilled size={16} className="shrink-0 text-sky-500" />
      )}
    </DropdownMenuItem>
  )
}
