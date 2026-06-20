import { useState } from 'react'
import './PianoPassword.css'

const WHITE_W = 34
const WHITE_H = 140
const BLACK_W = 20
const BLACK_H = 88
const OCTAVES = [3, 4, 5]

const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const WHITE_NOTES = ['C','D','E','F','G','A','B']
// Index of the white key immediately to the LEFT of each black key
const BLACK_LEFT = { 'C#': 0, 'D#': 1, 'F#': 3, 'G#': 4, 'A#': 5 }

function buildKeys(octaves) {
  const whites = [], blacks = []
  octaves.forEach((oct, oi) => {
    const baseX = oi * WHITE_NOTES.length * WHITE_W
    let wi = 0
    CHROMATIC.forEach(n => {
      const id = `${n}${oct}`
      if (!n.includes('#')) {
        whites.push({ id, label: `${n}${oct}`, x: baseX + wi * WHITE_W })
        wi++
      } else {
        const leftEdge = baseX + (BLACK_LEFT[n] + 1) * WHITE_W
        blacks.push({ id, label: `${n}${oct}`, x: leftEdge - BLACK_W / 2 })
      }
    })
  })
  return { whites, blacks }
}

const { whites, blacks } = buildKeys(OCTAVES)
const BOARD_W = OCTAVES.length * WHITE_NOTES.length * WHITE_W

function passwordString(pressed) {
  const order = [...whites, ...blacks]
  return order
    .filter(k => pressed.has(k.id))
    .map(k => k.id)
    .join(' ')
}

function validate(pressed) {
  const pwd = [...pressed].join('')
  return [
    { label: 'At least 3 notes',                ok: pressed.size >= 3 },
    { label: 'Uppercase letter (A–G)',           ok: /[A-G]/.test(pwd) },
    { label: 'Number (octave)',                  ok: /[0-9]/.test(pwd) },
    { label: 'Special character (#)',            ok: pwd.includes('#') },
    // The impossible one — note names have no lowercase letters
    { label: 'Lowercase letter',                 ok: /[a-z]/.test(pwd) },
    // Bonus escalating impossibility
    { label: 'Must form a valid triad',
      ok: false,
      always: true },
  ]
}

export default function PianoPassword() {
  const [pressed, setPressed] = useState(new Set())
  const [showReqs, setShowReqs] = useState(false)
  const [attempts, setAttempts] = useState(0)

  function toggle(id) {
    setPressed(p => {
      const n = new Set(p)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function handleSubmit() {
    setShowReqs(true)
    setAttempts(a => a + 1)
  }

  const pwd = passwordString(pressed)
  const reqs = validate(pressed)

  // After a few attempts, add extra impossible requirements
  const extraReqs = attempts >= 2 ? [
    { label: 'No parallel octaves', ok: false },
  ] : []
  const extraReqs2 = attempts >= 4 ? [
    { label: 'Must resolve to tonic', ok: false },
  ] : []

  const allReqs = [...reqs, ...extraReqs, ...extraReqs2]

  return (
    <div className="pp-scene">
      <div className="pp-header">
        <span className="pp-label">Please input password using keyboard below:</span>
        <div className="pp-field">
          {pwd || <span className="pp-ph">—</span>}
        </div>
      </div>

      <div className="pp-board-wrap">
        <div className="pp-board" style={{ width: BOARD_W, height: WHITE_H }}>
          {whites.map(k => (
            <div
              key={k.id}
              className={`pp-key pp-key--white${pressed.has(k.id) ? ' pp-key--lit' : ''}`}
              style={{ left: k.x, width: WHITE_W - 2, height: WHITE_H }}
              onClick={() => toggle(k.id)}
              title={k.label}
            >
              <span className="pp-key-label">{k.label}</span>
            </div>
          ))}
          {blacks.map(k => (
            <div
              key={k.id}
              className={`pp-key pp-key--black${pressed.has(k.id) ? ' pp-key--lit' : ''}`}
              style={{ left: k.x, width: BLACK_W, height: BLACK_H }}
              onClick={() => toggle(k.id)}
              title={k.label}
            />
          ))}
        </div>
      </div>

      <button
        className="pp-submit"
        onClick={handleSubmit}
        disabled={pressed.size === 0}
      >
        submit
      </button>

      {showReqs && (
        <div className="pp-reqs">
          <p className="pp-reqs-title">Password must contain:</p>
          <ul>
            {allReqs.map((r, i) => (
              <li key={i} className={r.ok ? 'req-ok' : 'req-fail'}>
                <span className="req-icon">{r.ok ? '✓' : '✗'}</span>
                {r.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
