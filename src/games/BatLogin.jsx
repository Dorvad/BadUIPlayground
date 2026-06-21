import { useState, useRef } from 'react'
import './BatLogin.css'

const TRIGGER_DIST = 110

function randPos() {
  return {
    x: 12 + Math.random() * 76,
    y: 20 + Math.random() * 60,
  }
}

function BatSVG() {
  return (
    <svg viewBox="0 0 30 124" width="22" height="88">
      {/* Knob */}
      <ellipse cx="15" cy="120" rx="9" ry="4" fill="#7a4f2a" />
      {/* Handle */}
      <rect x="13" y="76" width="4" height="47" rx="2" fill="#9b6535" />
      {/* Taper */}
      <path d="M13,76 L9,32 L21,32 L17,76 Z" fill="#b07840" />
      {/* Barrel */}
      <ellipse cx="15" cy="26" rx="12" ry="26" fill="#c49050" />
      {/* Highlight */}
      <ellipse cx="11" cy="17" rx="4.5" ry="9" fill="#d4a868" opacity="0.55" />
      {/* Grain lines */}
      <line x1="15" y1="4" x2="15" y2="110" stroke="#8a5828" strokeWidth="0.6" opacity="0.35" />
    </svg>
  )
}

export default function BatLogin() {
  const [pos, setPos]         = useState({ x: 50, y: 68 })
  const [swinging, setSwinging] = useState(false)
  const [swats, setSwats]     = useState(0)
  const coolRef  = useRef(false)
  const groupRef = useRef(null)

  function trigger() {
    if (coolRef.current) return
    coolRef.current = true
    setSwinging(true)
    setSwats(s => s + 1)
    setTimeout(() => setPos(randPos()), 210)
    setTimeout(() => { setSwinging(false); coolRef.current = false }, 700)
  }

  function handleMouseMove(e) {
    if (coolRef.current || !groupRef.current) return
    const r = groupRef.current.getBoundingClientRect()
    if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < TRIGGER_DIST) {
      trigger()
    }
  }

  function handleTouchMove(e) {
    if (coolRef.current || !groupRef.current) return
    const t = e.touches[0]
    const r = groupRef.current.getBoundingClientRect()
    if (Math.hypot(t.clientX - (r.left + r.width / 2), t.clientY - (r.top + r.height / 2)) < TRIGGER_DIST) {
      e.preventDefault()
      trigger()
    }
  }

  return (
    <div className="bl-scene" onMouseMove={handleMouseMove} onTouchMove={handleTouchMove}>
      <div className="bl-fields">
        <input className="bl-input" type="text"     placeholder="Username" autoComplete="off" spellCheck={false} />
        <input className="bl-input" type="password" placeholder="Password" />
      </div>

      <div
        ref={groupRef}
        className="bl-group"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      >
        <div className={`bl-bat-wrap ${swinging ? 'bl-bat-wrap--swing' : ''}`}>
          <BatSVG />
        </div>
        <button className="bl-btn" onClick={e => e.preventDefault()}>Login</button>
      </div>

      {swats > 0 && (
        <p className="bl-tally">Swatted {swats} time{swats !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
