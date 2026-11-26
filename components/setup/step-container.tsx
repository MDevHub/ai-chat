import { Button } from "@/components/ui/button"
import {
  IconArrowLeft,
  IconArrowRight,
  IconTerminal2
} from "@tabler/icons-react"
import { FC, useRef } from "react"

export const SETUP_STEP_COUNT = 3

interface StepContainerProps {
  stepDescription: string
  stepNum: number
  stepTitle: string
  onShouldProceed: (shouldProceed: boolean) => void
  children?: React.ReactNode
  showBackButton?: boolean
  showNextButton?: boolean
}

export const StepContainer: FC<StepContainerProps> = ({
  stepDescription,
  stepNum,
  stepTitle,
  onShouldProceed,
  children,
  showBackButton = false,
  showNextButton = true
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (buttonRef.current) {
        buttonRef.current.click()
      }
    }
  }

  return (
    <div
      className="relative z-10 flex max-h-[calc(100vh-48px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/80 shadow-xl shadow-zinc-950/5 backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/60 dark:shadow-black/50"
      onKeyDown={handleKeyDown}
    >
      {/* Top Progress Bar */}
      <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800/80">
        <div
          className="h-full bg-sky-500 transition-[width] duration-300"
          style={{ width: `${(stepNum / SETUP_STEP_COUNT) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="border-b border-zinc-100 px-6 pb-4 pt-5 dark:border-zinc-800/80">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-tight text-zinc-700 dark:text-zinc-300">
            <IconTerminal2 className="size-4 text-sky-500" />
            <span>mdev.ai</span>
          </div>

          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
            Step {stepNum} / {SETUP_STEP_COUNT}
          </span>
        </div>

        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {stepTitle}
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {stepDescription}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {children}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800/80 dark:bg-zinc-950/30">
        <div>
          {showBackButton && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onShouldProceed(false)}
              className="h-9 gap-1.5 rounded-lg border-zinc-200 bg-transparent px-3.5 font-mono text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
            >
              <IconArrowLeft className="size-3.5" />
              <span>Back</span>
            </Button>
          )}
        </div>

        <div>
          {showNextButton && (
            <Button
              ref={buttonRef}
              type="button"
              size="sm"
              onClick={() => onShouldProceed(true)}
              className="group h-9 gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <span>
                {stepNum === SETUP_STEP_COUNT ? "Launch Workspace" : "Continue"}
              </span>
              <IconArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
