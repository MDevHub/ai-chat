import { FC } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./tooltip"

interface WithTooltipProps {
  display: React.ReactNode
  trigger: React.ReactNode

  delayDuration?: number
  side?: "left" | "right" | "top" | "bottom"
  // Render the trigger element itself instead of wrapping it in a <button>
  asChild?: boolean
}

export const WithTooltip: FC<WithTooltipProps> = ({
  display,
  trigger,

  delayDuration = 500,
  side = "right",
  asChild = false
}) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild={asChild}>{trigger}</TooltipTrigger>

        <TooltipContent side={side}>{display}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
