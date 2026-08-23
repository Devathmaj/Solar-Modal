import { useEffect } from 'react'
import { bindHoverLabel, hideHoverLabel } from './bodyHover'
import { getWorldSnapshot, subscribeWorld } from './worldState'

/**
 * Cursor-following "Visit <body>" pill. Hidden whenever the camera leaves
 * idle state (a visit begins) so it never lingers over a transition.
 */
export function BodyHoverLabel() {
  useEffect(() => {
    const unsubscribe = subscribeWorld(() => {
      if (getWorldSnapshot().phase !== 'idle') hideHoverLabel()
    })
    return unsubscribe
  }, [])

  return (
    <div
      ref={bindHoverLabel}
      className="body-hover-label"
      aria-hidden
    />
  )
}
