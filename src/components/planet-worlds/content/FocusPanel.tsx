import { useEffect } from 'react'
import { BODY_CONTENT } from '../../../content/data'
import {
  closeFocus,
  stepFocus,
  useFocusSnapshot,
} from './contentFocus'

/**
 * Glass detail panel for the focused content item. Lives in the DOM layer
 * (outside the Canvas); slides in from the right. Esc closes, ←/→ navigate.
 */
export function FocusPanel() {
  const focus = useFocusSnapshot()

  const active = Boolean(focus.worldId && focus.itemId)

  useEffect(() => {
    if (!active) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFocus()
      else if (event.key === 'ArrowRight') stepFocus(1)
      else if (event.key === 'ArrowLeft') stepFocus(-1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [active])

  if (!focus.worldId || !focus.itemId) return null

  const content = BODY_CONTENT[focus.worldId]
  const items = content.items
  const index = items.findIndex((candidate) => candidate.id === focus.itemId)
  const item = items[index]
  if (!item) return null

  return (
    <aside className={`focus-panel${active ? ' focus-panel-open' : ''}`}>
      <div className="fp-top">
        <span className="fp-index">
          {index + 1} / {items.length}
        </span>
        <button type="button" className="fp-close" onClick={() => closeFocus()} aria-label="Close">
          ✕
        </button>
      </div>

      <h2 className="fp-title">{item.title}</h2>
      {item.subtitle && <div className="fp-subtitle">{item.subtitle}</div>}

      <div className="fp-chips">
        {item.period && <span className="fp-chip fp-chip-period">{item.period}</span>}
        {item.tags?.map((tag) => (
          <span key={tag} className="fp-chip">
            {tag}
          </span>
        ))}
      </div>

      <div className="fp-body">
        {item.description.map((paragraph, paragraphIndex) => (
          <p key={paragraphIndex}>{paragraph}</p>
        ))}
      </div>

      {item.link && (
        <a className="fp-link" href={item.link.href} onClick={(event) => event.preventDefault()}>
          {item.link.label} ↗
        </a>
      )}

      <div className="fp-nav">
        <button type="button" onClick={() => stepFocus(-1)}>
          ← Prev
        </button>
        <button type="button" onClick={() => stepFocus(1)}>
          Next →
        </button>
      </div>
    </aside>
  )
}
