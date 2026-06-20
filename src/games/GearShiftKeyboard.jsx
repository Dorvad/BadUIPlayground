import { useState } from 'react'
import './GearShiftKeyboard.css'

// Layout based on the gear-selector diagram: two columns, 6×6 each
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

export default function GearShiftKeyboard() {
  const [text, setText] = useState('')

  function handleKey(k) {
    if (k === '⌫') {
      setText(t => t.slice(0, -1))
    } else if (k === '⏎') {
      setText(t => t + '\n')
    } else {
      setText(t => t + k)
    }
  }

  function renderGrid(grid) {
    return (
      <div className="gear-grid">
        {grid.map((row, ri) =>
          row.map((key, ci) => {
            const isBackspace = key === '⌫'
            const isEnter = key === '⏎'
            const isEmpty = key === ' '
            return (
              <button
                key={`${ri}-${ci}`}
                className={`gear-key${isBackspace ? ' gear-key--back' : ''}${isEnter ? ' gear-key--enter' : ''}${isEmpty ? ' gear-key--space' : ''}`}
                onClick={() => handleKey(key)}
                style={{ gridColumn: ci + 1, gridRow: ri + 1 }}
                aria-label={isBackspace ? 'backspace' : isEnter ? 'enter' : key === ' ' ? 'space' : key}
              >
                {isEmpty ? '' : key}
              </button>
            )
          })
        )}
        {/* Connecting lines via SVG overlay */}
        <svg className="gear-lines" aria-hidden="true">
          {grid.map((row, ri) =>
            row.map((_, ci) => {
              const x = ci * 52 + 22
              const y = ri * 52 + 22
              const lines = []
              if (ci < row.length - 1) lines.push(
                <line key={`h-${ri}-${ci}`} x1={x} y1={y} x2={x + 52} y2={y} stroke="#444" strokeWidth="1.5" />
              )
              if (ri < grid.length - 1) lines.push(
                <line key={`v-${ri}-${ci}`} x1={x} y1={y} x2={x} y2={y + 52} stroke="#444" strokeWidth="1.5" />
              )
              return lines
            })
          )}
        </svg>
      </div>
    )
  }

  return (
    <div className="gear-keyboard">
      <div className="gear-label">TYPE</div>
      <div className="gear-columns">
        {renderGrid(LEFT)}
        <div className="gear-divider" />
        {renderGrid(RIGHT)}
      </div>
      <div className="gear-output">
        {text || <span className="gear-placeholder">Start typing…</span>}
      </div>
    </div>
  )
}
