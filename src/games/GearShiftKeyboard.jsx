import { useState, useRef, useEffect } from 'react'
import './GearShiftKeyboard.css'

const LEFT = [
  ['K','L','-','B','N','x'],
  ['S','P','0','Y','?','R'],
  ['Z','b','⌫','T',' ','7'],
  ['X','f',"'",'!','i','U'],
  ['n','k','t','W','_','V'],
  ['l','e','A','M','9','C'],
]

const RIGHT = [
  ['r','m','Q','D','2','j'],
  ['p','5',',','g','3','s'],
  ['⏎','J','v','6','8','a'],
  ['w','y','q','z','u','h'],
  ['o','c','E','F','4','H'],
  ['.','I','d','O','l','G'],
]

const ROWS = 6, COLS = 6
const KEY = 30   // circle diameter
const GAP = 6    // gap between circles
const CS = KEY + GAP  // 36 — center-to-center spacing
const HK = KEY / 2   // 15 — circle radius
const DIV = 20   // gap width between the two halves
const KNOB_R = HK + 5  // gear knob is slightly bigger

const GRID_W = HK + (COLS - 1) * CS + HK  // 30 + 5*36 = 210
const GRID_H = HK + (ROWS - 1) * CS + HK  // 210
const SVG_W = GRID_W + DIV + GRID_W        // 440
const SVG_H = GRID_H                        // 210

function cellCenter(row, col, side) {
  const xOff = side === 'right' ? GRID_W + DIV : 0
  return { x: xOff + HK + col * CS, y: HK + row * CS }
}

// Flat list of all 72 positions for nearest-snap
const ALL = []
for (let r = 0; r < ROWS; r++)
  for (let c = 0; c < COLS; c++) {
    ALL.push({ row: r, col: c, side: 'left',  ...cellCenter(r, c, 'left') })
    ALL.push({ row: r, col: c, side: 'right', ...cellCenter(r, c, 'right') })
  }

function nearest(px, py) {
  return ALL.reduce((best, p) => {
    const d = (p.x - px) ** 2 + (p.y - py) ** 2
    return d < best.d ? { ...p, d } : best
  }, { ...ALL[0], d: Infinity })
}

function getLetter(row, col, side) {
  return (side === 'left' ? LEFT : RIGHT)[row][col]
}

export default function GearShiftKeyboard() {
  const [text, setText] = useState('')
  const [pos, setPos] = useState({ row: 2, col: 2, side: 'left' })
  const [dragXY, setDragXY] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const svgRef = useRef(null)
  const infoRef = useRef(null)

  const letter = getLetter(pos.row, pos.col, pos.side)
  const knobAt = dragXY ?? cellCenter(pos.row, pos.col, pos.side)

  function handleType() {
    if (letter === '⌫') setText(t => t.slice(0, -1))
    else if (letter === '⏎') setText(t => t + '\n')
    else setText(t => t + (letter === ' ' ? ' ' : letter))
  }

  function startDrag(clientX, clientY) {
    const rect = svgRef.current.getBoundingClientRect()
    infoRef.current = {
      left: rect.left, top: rect.top,
      scaleX: SVG_W / rect.width, scaleY: SVG_H / rect.height,
    }
    setIsDragging(true)
    setDragXY(cellCenter(pos.row, pos.col, pos.side))
  }

  function onKnobMouseDown(e) { e.preventDefault(); startDrag(e.clientX, e.clientY) }
  function onKnobTouchStart(e) { e.preventDefault(); const t = e.touches[0]; startDrag(t.clientX, t.clientY) }

  useEffect(() => {
    if (!isDragging || !infoRef.current) return
    const { left, top, scaleX, scaleY } = infoRef.current

    function toSVG(cx, cy) {
      return { x: (cx - left) * scaleX, y: (cy - top) * scaleY }
    }

    function onMove(e) { const p = toSVG(e.clientX, e.clientY); setDragXY(p) }
    function onTouchMove(e) { const t = e.touches[0]; setDragXY(toSVG(t.clientX, t.clientY)) }

    function finalize(cx, cy) {
      const { x, y } = toSVG(cx, cy)
      const n = nearest(x, y)
      setPos({ row: n.row, col: n.col, side: n.side })
      setDragXY(null)
      setIsDragging(false)
    }
    function onUp(e) { finalize(e.clientX, e.clientY) }
    function onTouchEnd(e) { const t = e.changedTouches[0]; finalize(t.clientX, t.clientY) }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isDragging])

  function renderHalf(grid, side) {
    const els = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const { x, y } = cellCenter(r, c, side)
        const key = grid[r][c]
        const isBack = key === '⌫'
        const isEnter = key === '⏎'

        if (c < COLS - 1) els.push(
          <line key={`${side}-h-${r}-${c}`} x1={x} y1={y} x2={cellCenter(r, c+1, side).x} y2={y}
            stroke="#383840" strokeWidth="1.5" />
        )
        if (r < ROWS - 1) els.push(
          <line key={`${side}-v-${r}-${c}`} x1={x} y1={y} x2={x} y2={cellCenter(r+1, c, side).y}
            stroke="#383840" strokeWidth="1.5" />
        )

        els.push(
          <g key={`${side}-n-${r}-${c}`}>
            <circle cx={x} cy={y} r={HK}
              fill={isBack ? '#4a1515' : isEnter ? '#154a2a' : '#232328'}
              stroke={isBack ? '#8b2020' : isEnter ? '#206a3a' : '#454550'}
              strokeWidth="1.5" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fill={isBack ? '#ff7070' : isEnter ? '#3bffa0' : '#bbb'}
              fontSize="9" fontFamily="monospace"
              style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {key === '⌫' ? '←' : key === '⏎' ? '↵' : key === ' ' ? '' : key}
            </text>
          </g>
        )
      }
    }
    return els
  }

  const labelText = letter === '⌫' ? '← backspace'
    : letter === '⏎' ? '↵ enter'
    : letter === ' ' ? '· space'
    : `"${letter}"`

  return (
    <div className="gear-wrap">
      {/* TYPE button row */}
      <div className="gear-controls">
        <button className="gear-type-btn" onClick={handleType}>
          TYPE
        </button>
        <span className="gear-current">{labelText}</span>
      </div>

      {/* The gear diagram */}
      <div className="gear-svg-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          height={SVG_H}
          style={{ maxWidth: '100%', display: 'block', overflow: 'visible', touchAction: 'none' }}
        >
          {/* Divider */}
          <line x1={GRID_W + DIV/2} y1={0} x2={GRID_W + DIV/2} y2={SVG_H}
            stroke="#333" strokeWidth="2" />

          {renderHalf(LEFT, 'left')}
          {renderHalf(RIGHT, 'right')}

          {/* Gear knob */}
          <circle
            cx={knobAt.x} cy={knobAt.y} r={KNOB_R}
            fill="#111115" stroke={isDragging ? '#888' : '#666'} strokeWidth="2.5"
            onMouseDown={onKnobMouseDown}
            onTouchStart={onKnobTouchStart}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', transition: isDragging ? 'none' : 'cx 0.15s ease, cy 0.15s ease' }}
          />
          {/* Knob centre dot */}
          <circle cx={knobAt.x} cy={knobAt.y} r={3}
            fill="#555" style={{ pointerEvents: 'none' }} />
        </svg>
      </div>

      <div className="gear-output">
        {text || <span className="gear-placeholder">Drag the gear, then press TYPE</span>}
      </div>
    </div>
  )
}
