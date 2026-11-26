import { ChatbotUIContext } from "@/context/context"
import { IconAdjustmentsHorizontal, IconTerminal2 } from "@tabler/icons-react"
import { FC, useContext, useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog"
import { Label } from "../ui/label"
import { Slider } from "../ui/slider"
import { WithTooltip } from "../ui/with-tooltip"

interface ChatRetrievalSettingsProps {}

export const ChatRetrievalSettings: FC<ChatRetrievalSettingsProps> = ({}) => {
  const { sourceCount, setSourceCount } = useContext(ChatbotUIContext)

  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div>
          <WithTooltip
            delayDuration={0}
            side="top"
            display={
              <div className="font-mono text-xs">
                Adjust retrieval settings.
              </div>
            }
            trigger={
              <IconAdjustmentsHorizontal
                className="cursor-pointer text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                size={16}
              />
            }
          />
        </div>
      </DialogTrigger>

      <DialogContent className="w-full max-w-sm rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="mb-1 flex items-center gap-2 font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <IconTerminal2 className="size-4 text-sky-500" />
            <span>mdev.ai</span>
          </div>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Retrieval Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Source Count
              </Label>
              <span className="font-mono text-xs font-semibold text-sky-500">
                {sourceCount} chunks
              </span>
            </div>

            <Slider
              value={[sourceCount]}
              onValueChange={values => {
                setSourceCount(values[0])
              }}
              min={1}
              max={10}
              step={1}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-9 w-full rounded-lg bg-zinc-900 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Save & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
