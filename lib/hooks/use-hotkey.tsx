import { useEffect, useRef } from "react"

// Physical key codes for the non-letter keys we bind. Shift changes event.key
// ("/" -> "?", ";" -> ":", "s" -> "S" in some browsers), so match on event.code.
const SPECIAL_CODES: Record<string, string> = {
  "/": "Slash",
  ";": "Semicolon",
  Backspace: "Backspace"
}

const keyToCode = (key: string) =>
  /^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : SPECIAL_CODES[key]

/** Fires `callback` on ⌘⇧ + `key`. */
const useHotkey = (key: string, callback: () => void): void => {
  // Keep the latest callback without re-binding the listener every render
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const code = keyToCode(key)

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!event.metaKey || !event.shiftKey || event.repeat) return

      const matches =
        (code !== undefined && event.code === code) ||
        event.key.toLowerCase() === key.toLowerCase()

      if (matches) {
        event.preventDefault()
        callbackRef.current()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [key])
}

export default useHotkey
