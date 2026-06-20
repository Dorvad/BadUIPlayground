import { useState, useEffect, useRef, useCallback } from 'react'
import './FanUnsubscribe.css'

export default function FanUnsubscribe() {
  const [btnX, setBtnX] = useState(40)  // % from left
  const [btnY, setBtnY] = useState(50)  // % from top
  const [clicked, setClicked] = useState(false)
  const [fanSpeed, setFanSpeed] = useState(1)
  const animRef = useRef(null)
  const containerRef = useRef(null)

  // Button drifts left slowly due to wind
  useEffect(() => {
    if (clicked) return
    const tick = () => {
      setBtnX(x => {
        const next = x - 0.04 * fanSpeed
        return next < 5 ? 95 : next  // wrap around when blown off screen
      })
      setBtnY(y => y + (Math.sin(Date.now() / 800) * 0.05))
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [clicked, fanSpeed])

  const handleMouseEnter = useCallback(() => {
    // Button tries to escape upward and accelerates left when hovered
    setBtnY(y => Math.max(10, y - 15 - Math.random() * 10))
    setBtnX(x => Math.max(5, x - 8 - Math.random() * 6))
    setFanSpeed(s => Math.min(s + 0.5, 4))
  }, [])

  function handleClick() {
    setClicked(true)
    setTimeout(() => setClicked(false), 2000)
  }

  return (
    <div className="fan-scene" ref={containerRef}>
      {/* Wavy wind lines */}
      <div className="fan-waves" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="fan-wave" style={{ '--delay': `${i * 0.18}s`, '--top': `${10 + i * 12}%` }} />
        ))}
      </div>

      {/* Unsubscribe button floating in wind */}
      {!clicked ? (
        <button
          className="fan-btn"
          style={{ left: `${btnX}%`, top: `${btnY}%` }}
          onMouseEnter={handleMouseEnter}
          onClick={handleClick}
        >
          Unsubscribe
        </button>
      ) : (
        <div className="fan-success">You did it! 🎉</div>
      )}

      {/* Fan on the right */}
      <div className="fan-body" aria-label="Electric fan">
        <div className="fan-cage">
          <div className="fan-rotor" style={{ animationDuration: `${1 / fanSpeed}s` }}>
            <div className="fan-blade fan-blade-1" />
            <div className="fan-blade fan-blade-2" />
            <div className="fan-blade fan-blade-3" />
          </div>
          <div className="fan-hub" />
          {/* Cage lines */}
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="fan-cage-line" style={{ transform: `rotate(${i * 22.5}deg)` }} />
          ))}
        </div>
        <div className="fan-stand" />
        <div className="fan-base" />
      </div>
    </div>
  )
}
