import useHotkey from "@/lib/hooks/use-hotkey"
import { renderHook } from "@testing-library/react"

const press = (init: KeyboardEventInit) =>
  window.dispatchEvent(new KeyboardEvent("keydown", init))

describe("useHotkey", () => {
  it("fires on ⌘⇧S whether the browser reports 's' or 'S'", () => {
    const cb = jest.fn()
    renderHook(() => useHotkey("s", cb))

    press({ key: "s", code: "KeyS", metaKey: true, shiftKey: true })
    press({ key: "S", code: "KeyS", metaKey: true, shiftKey: true })

    expect(cb).toHaveBeenCalledTimes(2)
  })

  it("matches shifted symbols by physical key (⌘⇧/ reports '?')", () => {
    const cb = jest.fn()
    renderHook(() => useHotkey("/", cb))

    press({ key: "?", code: "Slash", metaKey: true, shiftKey: true })

    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("ignores missing modifiers and auto-repeat", () => {
    const cb = jest.fn()
    renderHook(() => useHotkey("s", cb))

    press({ key: "s", code: "KeyS", metaKey: true })
    press({ key: "s", code: "KeyS", shiftKey: true })
    press({
      key: "S",
      code: "KeyS",
      metaKey: true,
      shiftKey: true,
      repeat: true
    })

    expect(cb).not.toHaveBeenCalled()
  })

  it("always calls the latest callback", () => {
    const first = jest.fn()
    const second = jest.fn()
    const { rerender } = renderHook(({ cb }) => useHotkey("s", cb), {
      initialProps: { cb: first }
    })
    rerender({ cb: second })

    press({ key: "S", code: "KeyS", metaKey: true, shiftKey: true })

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})
