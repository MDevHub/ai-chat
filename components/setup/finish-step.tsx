import { IconCheck } from "@tabler/icons-react"
import { FC } from "react"

interface FinishStepProps {
  displayName: string
}

export const FinishStep: FC<FinishStepProps> = ({ displayName }) => {
  const firstName = displayName.trim().split(" ")[0]

  return (
    <div className="flex flex-col items-start space-y-3 py-2">
      <div className="flex size-9 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
        <IconCheck className="size-5" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Welcome to mdev.ai{firstName ? `, ${firstName}` : ""}.
        </h3>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Your profile and workspace keys are configured. You can update API
          keys or switch models anytime inside workspace settings.
        </p>
      </div>
    </div>
  )
}
