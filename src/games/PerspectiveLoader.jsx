import { useState, useEffect, useRef } from 'react'
import './PerspectiveLoader.css'

const SCALE = 20  // real bar is 20× longer — at "80%" we're actually at 4%

// Draw the bar in isometric cabinet projection on canvas
function draw3D(canvas, fillPct) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)

  const M = 10          // margin
  const BW = W - M * 2  // bar width in pixels
  const BH = 36         // bar height (front face)
  const D = 18          // depth (top face height)
  const ANG = Math.PI / 6  // 30° slant angle
  const SX = Math.cos(ANG) * D   // horizontal shift for depth ≈ 15.6
  const SY = Math.sin(ANG) * D   // vertical shift for depth = 9
  const FW = Math.max(1, Math.round(BW * fillPct / 100))

  const x0 = M
  const y0 = M + SY  // top of front face

  // ── helpers for the 4 corner points of a face ──
  // Front face corners: (x0, y0) → (x0+BW, y0) → (x0+BW, y0+BH) → (x0, y0+BH)
  // Top face corners:   front-top-left → front-top-right → back-top-right → back-top-left
  //                     where back = front shifted by (+SX, -SY)

  function face(pts, fill, stroke) {
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
    ctx.closePath()
    if (fill) { ctx.fillStyle = fill; ctx.fill() }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke() }
  }

  // ── FULL BAR (empty/background part) ──
  // Front face
  face([
    [x0,      y0     ], [x0 + BW, y0     ],
    [x0 + BW, y0 + BH], [x0,      y0 + BH],
  ], '#232328', '#454550')

  // Top face
  face([
    [x0,           y0     ], [x0 + BW,           y0     ],
    [x0 + BW + SX, y0 - SY], [x0 + SX,            y0 - SY],
  ], '#2c2c34', '#454550')

  // Right-end face
  face([
    [x0 + BW,      y0     ], [x0 + BW + SX, y0 - SY     ],
    [x0 + BW + SX, y0 - SY + BH], [x0 + BW, y0 + BH],
  ], '#111116', '#454550')

  // ── FILL (green portion) ──
  if (FW > 0) {
    // Front face fill
    face([
      [x0,      y0     ], [x0 + FW, y0     ],
      [x0 + FW, y0 + BH], [x0,      y0 + BH],
    ], '#2ecc71', null)

    // Top face fill
    face([
      [x0,           y0     ], [x0 + FW,           y0     ],
      [x0 + FW + SX, y0 - SY], [x0 + SX,            y0 - SY],
    ], '#1a7a42', null)

    // Fill right-end face (the step between filled and empty)
    face([
      [x0 + FW,      y0     ], [x0 + FW + SX, y0 - SY     ],
      [x0 + FW + SX, y0 - SY + BH], [x0 + FW, y0 + BH],
    ], '#16602f', '#2ecc71')
  }

  // ── RE-DRAW OUTLINES on top ──
  // Front face border
  face([
    [x0,      y0     ], [x0 + BW, y0     ],
    [x0 + BW, y0 + BH], [x0,      y0 + BH],
  ], null, '#555')
  // Top border
  face([
    [x0,           y0     ], [x0 + BW,           y0     ],
    [x0 + BW + SX, y0 - SY], [x0 + SX,            y0 - SY],
  ], null, '#555')
  // Right-end border
  face([
    [x0 + BW,      y0     ], [x0 + BW + SX, y0 - SY     ],
    [x0 + BW + SX, y0 - SY + BH], [x0 + BW, y0 + BH],
  ], null, '#555')
}

export default function PerspectiveLoader() {
  const [phase, setPhase] = useState('idle')
  const [fill, setFill] = useState(0)
  const timerRef = useRef(null)
  const canvasRef = useRef(null)

  const realPct = fill / SCALE

  useEffect(() => {
    if (phase !== 'filling') return
    timerRef.current = setInterval(() => {
      setFill(f => {
        if (f >= 80) {
          clearInterval(timerRef.current)
          setTimeout(() => setPhase('revealing'), 300)
          setTimeout(() => setPhase('revealed'), 1400)
          return f
        }
        return Math.min(f + 0.9, 80)
      })
    }, 30)
    return () => clearInterval(timerRef.current)
  }, [phase])

  // Redraw canvas whenever phase or fill changes
  useEffect(() => {
    if (!canvasRef.current) return
    if (phase === 'revealing' || phase === 'revealed') {
      draw3D(canvasRef.current, realPct)
    }
  }, [phase, fill])

  function reset() {
    clearInterval(timerRef.current)
    setPhase('idle')
    setFill(0)
  }

  return (
    <div className="pl-scene">
      <p className="pl-label">
        {phase === 'idle'      && 'Click to load'}
        {phase === 'filling'   && `LOADING... ${Math.round(fill)}%`}
        {phase === 'revealing' && `LOADING... ${Math.round(fill)}%`}
        {phase === 'revealed'  && `LOADING... ${realPct.toFixed(1)}%`}
      </p>

      {/* Flat 2D bar */}
      {(phase === 'idle' || phase === 'filling') && (
        <div className="pl-flat">
          <div className="pl-track">
            <div className="pl-fill-2d" style={{ width: `${fill}%` }} />
          </div>
        </div>
      )}

      {/* 3D isometric canvas */}
      {(phase === 'revealing' || phase === 'revealed') && (
        <canvas
          ref={canvasRef}
          className="pl-canvas"
          width={500}
          height={66}
        />
      )}

      <div className="pl-actions">
        {phase === 'idle' && (
          <button className="pl-btn" onClick={() => { setPhase('filling'); setFill(0) }}>
            Start loading
          </button>
        )}
        {phase === 'revealed' && (
          <button className="pl-btn" onClick={reset}>↺ Try again</button>
        )}
      </div>
    </div>
  )
}
