import { useState, useEffect, useRef } from 'react'
import './PerspectiveLoader.css'

// The real bar is SCALE times wider than the viewport window.
// When "zoomed in" we sit at the filled end — so 80% of the window looks filled.
// When "zoomed out" we see the full bar in 3D and realise we're at 4% total.
const SCALE = 20

export default function PerspectiveLoader() {
  const [phase, setPhase] = useState('idle') // idle | filling | revealing | revealed
  const [fill, setFill] = useState(0)        // 0-100, percent of the viewport window
  const timerRef = useRef(null)

  function startLoading() {
    setPhase('filling')
    setFill(0)
  }

  useEffect(() => {
    if (phase !== 'filling') return
    timerRef.current = setInterval(() => {
      setFill(f => {
        if (f >= 80) {
          clearInterval(timerRef.current)
          // Brief pause then zoom out
          setTimeout(() => setPhase('revealing'), 400)
          setTimeout(() => setPhase('revealed'), 1600)
          return f
        }
        return f + 0.9
      })
    }, 30)
    return () => clearInterval(timerRef.current)
  }, [phase])

  function reset() {
    clearInterval(timerRef.current)
    setPhase('idle')
    setFill(0)
  }

  // The bar element is SCALE × the container width.
  // fill% of the viewport window = fill/SCALE % of the real bar.
  const realProgress = (fill / SCALE).toFixed(1)

  const isRevealing = phase === 'revealing' || phase === 'revealed'

  return (
    <div className="pl-scene">
      <p className="pl-status">
        {phase === 'idle' && 'Click to load'}
        {phase === 'filling' && `LOADING... ${Math.round(fill)}%`}
        {phase === 'revealing' && `LOADING... ${Math.round(fill)}%`}
        {phase === 'revealed' && `LOADING... ${realProgress}%`}
      </p>

      <div className={`pl-viewport${isRevealing ? ' pl-viewport--revealed' : ''}`}>
        {/* The actual bar is SCALE x the viewport width */}
        <div className="pl-track">
          {/* Fill sits at right-hand end so the filled portion aligns with viewport in zoomed mode */}
          <div
            className="pl-fill"
            style={{ width: `${fill / SCALE * 100}%` }}
          />
        </div>
      </div>

      <div className="pl-actions">
        {phase === 'idle' && (
          <button className="pl-btn" onClick={startLoading}>Start loading</button>
        )}
        {phase === 'revealed' && (
          <button className="pl-btn pl-btn--reset" onClick={reset}>↺ Try again</button>
        )}
      </div>
    </div>
  )
}
