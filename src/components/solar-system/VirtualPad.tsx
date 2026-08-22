import { useEffect, useState } from 'react'
import {
  pressMovementKey,
  releaseAllMovementKeys,
  releaseMovementKey,
} from './movementInput'
import { triggerReset } from './cameraReset'

const DPAD_BUTTONS: Array<{ code: string; glyph: string; positionClass: string }> = [
  { code: 'KeyW', glyph: '▲', positionClass: 'vpad-up' },
  { code: 'KeyA', glyph: '◀', positionClass: 'vpad-left' },
  { code: 'KeyS', glyph: '▼', positionClass: 'vpad-down' },
  { code: 'KeyD', glyph: '▶', positionClass: 'vpad-right' },
]

const ELEVATION_BUTTONS: Array<{ code: string; glyph: string; label: string }> = [
  { code: 'KeyE', glyph: 'E', label: 'Ascend' },
  { code: 'KeyQ', glyph: 'Q', label: 'Descend' },
]

function PadButton({
  code,
  glyph,
  positionClass,
  label,
}: {
  code: string
  glyph: string
  positionClass: string
  label?: string
}) {
  const [held, setHeld] = useState(false)

  const release = () => {
    releaseMovementKey(code)
    setHeld(false)
  }

  return (
    <button
      type="button"
      aria-label={label ?? `Move ${code.replace('Key', '')}`}
      title={label}
      className={`vpad-btn ${positionClass}${held ? ' vpad-held' : ''}`}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        pressMovementKey(code)
        setHeld(true)
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      {glyph}
    </button>
  )
}

export function VirtualPad() {
  const [visible, setVisible] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900),
  )

  useEffect(() => {
    const handleBlur = () => releaseAllMovementKeys()
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('blur', handleBlur)
      releaseAllMovementKeys()
    }
  }, [])

  return (
    <>
      <button
        type="button"
        aria-label="Toggle movement controls"
        aria-pressed={visible}
        className="vpad-toggle"
        onClick={() => setVisible((value) => !value)}
      >
        ✥
      </button>
      <button
        type="button"
        aria-label="Reset camera to default view"
        title="Reset view (right-click)"
        className="vpad-reset"
        onClick={() => triggerReset()}
      >
        ⟲
      </button>
      {visible && (
        <div className="vpad">
          <div className="vpad-dpad">
            {DPAD_BUTTONS.map((button) => (
              <PadButton key={button.code} {...button} />
            ))}
          </div>
          <div className="vpad-vstack">
            {ELEVATION_BUTTONS.map((button) => (
              <PadButton key={button.code} code={button.code} glyph={button.glyph} positionClass="vpad-stack" />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
