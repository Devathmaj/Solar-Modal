type ResetListener = () => void

let listener: ResetListener | null = null

export function subscribeToReset(callback: ResetListener) {
  listener = callback
  return () => {
    if (listener === callback) listener = null
  }
}

export function triggerReset() {
  listener?.()
}
