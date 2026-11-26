import { cn } from "@/lib/utils"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { forwardRef, useEffect, useState } from "react"
import { Button } from "../ui/button"

const ICON_SIZE = 18

interface ThemeSwitcherProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "rail"
}

export const ThemeSwitcher = forwardRef<HTMLButtonElement, ThemeSwitcherProps>(
  ({ variant = "default", className, onClick, ...props }, ref) => {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // resolvedTheme is unknown during SSR; avoid a hydration icon mismatch
    useEffect(() => setMounted(true), [])

    const isDark = mounted && resolvedTheme === "dark"

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const next = isDark ? "light" : "dark"
      localStorage.setItem("theme", next)
      setTheme(next)
      onClick?.(e)
    }

    return (
      <Button
        ref={ref}
        {...props}
        className={cn(
          variant === "rail"
            ? "size-9 rounded-lg p-0 text-zinc-500 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
            : "size-8 rounded-lg border border-zinc-200 bg-white/80 p-0 text-zinc-500 shadow-sm hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white",
          className
        )}
        variant="ghost"
        size="icon"
        onClick={handleClick}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      >
        {isDark ? <IconMoon size={ICON_SIZE} /> : <IconSun size={ICON_SIZE} />}
      </Button>
    )
  }
)

ThemeSwitcher.displayName = "ThemeSwitcher"
