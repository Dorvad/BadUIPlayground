import { useState, useEffect, useRef } from 'react'
import './VolumeSelector.css'

const CX = 140, CY = 158, R = 115
const MIN_DEG = -65, MAX_DEG = 65, ANG_RANGE = 130

function toRad(d) { return d * Math.PI / 180 }

// Our angle system: 0 = needle pointing straight up, ±65 = extremes
// Maps to SVG angle: svgDeg = 270 + myDeg
function arcPt(myDeg, r = R) {
  const a = toRad(270 + myDeg)
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }
}

function arcPath(r, startDeg, endDeg) {
  const s = arcPt(startDeg, r)
  const e = arcPt(endDeg, r)
  const large = (endDeg - startDeg) > 180 ? 1 : 0
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}

function angToPct(deg) {
  return Math.round(((deg - MIN_DEG) / ANG_RANGE) * 100)
}

// Colour zone boundaries (in our degrees)
const GREEN_END  = MIN_DEG + ANG_RANGE * 0.60  // 60%
const YELLOW_END = MIN_DEG + ANG_RANGE * 0.82  // 82%

const TICKS = Array.from({ length: 11 }, (_, i) => ({
  pct: i * 10,
  deg: MIN_DEG + (i / 10) * ANG_RANGE,
}))

export default function VolumeSelector() {
  const [angle, setAngle]   = useState(MIN_DEG)
  const [power, setPower]   = useState(0)
  const [phase, setPhase]   = useState('idle')   // idle | charging | moving | done
  const [volume, setVolume] = useState(null)

  const rafRef    = useRef(null)
  const physRef   = useRef({ angle: MIN_DEG, vel: 0 })
  const chargeRef = useRef(null)
  const powerRef  = useRef(0)

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    clearInterval(chargeRef.current)
  }, [])

  function startCharge() {
    if (phase !== 'idle') return
    setPhase('charging')
    powerRef.current = 0
    setPower(0)
    chargeRef.current = setInterval(() => {
      powerRef.current = Math.min(powerRef.current + 0.011, 1)
      setPower(powerRef.current)
    }, 16)
  }

  function doLaunch() {
    if (phase !== 'charging') return
    clearInterval(chargeRef.current)
    const p = powerRef.current
    powerRef.current = 0
    setPower(0)
    setPhase('moving')
    physRef.current = { angle: MIN_DEG, vel: p * 7.8 }
    setAngle(MIN_DEG)
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(step)
  }

  function step() {
    const s = physRef.current
    s.vel *= 0.971
    s.angle += s.vel

    if (s.angle >= MAX_DEG) {
      s.angle = MAX_DEG
      s.vel = -Math.abs(s.vel) * 0.62
    }
    if (s.angle <= MIN_DEG) {
      s.angle = MIN_DEG
      s.vel = Math.abs(s.vel) * 0.62
    }

    setAngle(s.angle)

    if (Math.abs(s.vel) < 0.07) {
      s.vel = 0
      setPhase('done')
      return
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function confirm() {
    setVolume(angToPct(physRef.current.angle))
    setPhase('idle')
    physRef.current = { angle: MIN_DEG, vel: 0 }
    setAngle(MIN_DEG)
  }

  function relaunch() {
    setPhase('idle')
    physRef.current = { angle: MIN_DEG, vel: 0 }
    setAngle(MIN_DEG)
  }

  const pct = angToPct(angle)
  const tip = arcPt(angle, R - 4)

  return (
    <div className="vs-wrap">
      <svg viewBox="0 0 280 175" className="vs-svg">
        {/* Colour arc zones */}
        <path d={arcPath(R, MIN_DEG, GREEN_END)}  stroke="#3dba6e" strokeWidth="9" fill="none" />
        <path d={arcPath(R, GREEN_END, YELLOW_END)} stroke="#f5c518" strokeWidth="9" fill="none" />
        <path d={arcPath(R, YELLOW_END, MAX_DEG)} stroke="#e84040" strokeWidth="9" fill="none" />

        {/* Background track */}
        <path d={arcPath(R, MIN_DEG, MAX_DEG)} stroke="#222" strokeWidth="4" fill="none" opacity="0.6" />

        {/* Tick marks + labels */}
        {TICKS.map(({ pct: t, deg }) => {
          const outer = arcPt(deg, R + 7)
          const inner = arcPt(deg, R - 7)
          const label = arcPt(deg, R - 22)
          const major = t % 25 === 0
          return (
            <g key={t}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke="#aaa" strokeWidth={major ? 1.8 : 0.9} />
              {major && (
                <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle"
                  fill="#777" fontSize="9" fontFamily="monospace">{t}</text>
              )}
            </g>
          )
        })}

        {/* Needle */}
        <line x1={CX} y1={CY} x2={tip.x} y2={tip.y}
          stroke="#ff3b3b" strokeWidth="2.5" strokeLinecap="round" />

        {/* Pivot */}
        <circle cx={CX} cy={CY} r="7" fill="#333" />
        <circle cx={CX} cy={CY} r="3" fill="#666" />

        {/* Value readout */}
        <text x={CX} y={CY - 38} textAnchor="middle" fill="#e0e0e0"
          fontSize="22" fontFamily="monospace" fontWeight="bold">
          {pct}%
        </text>

        {/* Labels */}
        {volume !== null && (
          <text x={CX} y={CY - 16} textAnchor="middle" fill="#3dba6e"
            fontSize="9" fontFamily="monospace">SET</text>
        )}
      </svg>

      {/* Power bar */}
      <div className="vs-power-wrap">
        <div className="vs-power-track">
          <div className="vs-power-fill" style={{ width: `${power * 100}%` }} />
        </div>
        <span className="vs-power-label">POWER</span>
      </div>

      {/* Controls */}
      <div className="vs-controls">
        {(phase === 'idle') && (
          <button className="vs-launch"
            onMouseDown={startCharge}
            onMouseUp={doLaunch}
            onMouseLeave={doLaunch}
            onTouchStart={e => { e.preventDefault(); startCharge() }}
            onTouchEnd={e => { e.preventDefault(); doLaunch() }}
          >
            HOLD TO LAUNCH
          </button>
        )}
        {phase === 'charging' && (
          <button className="vs-launch vs-launch--charging"
            onMouseUp={doLaunch}
            onMouseLeave={doLaunch}
            onTouchEnd={e => { e.preventDefault(); doLaunch() }}
          >
            RELEASE!
          </button>
        )}
        {phase === 'moving' && (
          <div className="vs-hint">Settling…</div>
        )}
        {phase === 'done' && (
          <div className="vs-done-row">
            <button className="vs-confirm" onClick={confirm}>✓ Set {pct}%</button>
            <button className="vs-relaunch" onClick={relaunch}>↺ Again</button>
          </div>
        )}
      </div>

      {volume !== null && (
        <p className="vs-result">Volume: <strong>{volume}%</strong></p>
      )}
    </div>
  )
}
