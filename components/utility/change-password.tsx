"use client"

import { supabase } from "@/lib/supabase/browser-client"
import { IconTerminal2 } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { FC, useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { toast } from "sonner"

interface ChangePasswordProps {}

export const ChangePassword: FC<ChangePasswordProps> = () => {
  const router = useRouter()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    if (!newPassword) return toast.info("Please enter your new password.")
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match.")
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (error) {
      return toast.error(error.message)
    }

    toast.success("Password changed successfully.")
    return router.push("/login")
  }

  return (
    <Dialog open={true}>
      <DialogContent className="w-full max-w-sm rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/95">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="mb-1 flex items-center gap-2 font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <IconTerminal2 className="size-4 text-sky-500" />
            <span>mdev.ai</span>
          </div>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Update Password
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Enter and confirm a new password for your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              New Password
            </Label>
            <Input
              id="password"
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3.5 text-sm focus-visible:ring-1 focus-visible:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-950/50"
              placeholder="••••••••"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3.5 text-sm focus-visible:ring-1 focus-visible:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-950/50"
              placeholder="••••••••"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleResetPassword}
            disabled={loading}
            className="h-10 w-full rounded-lg bg-zinc-900 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {loading ? "Updating..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
