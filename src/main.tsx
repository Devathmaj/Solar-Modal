import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// @react-three/fiber 9.7.0 still constructs the THREE.Clock deprecated in three
// r183; filter that single upstream warning until fiber switches to THREE.Timer.
const originalWarn = console.warn.bind(console)
console.warn = (...args: unknown[]) => {
  if (
    args.some(
      (arg) => typeof arg === 'string' && arg.includes('Please use THREE.Timer instead'),
    )
  ) {
    return
  }
  originalWarn(...args)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
