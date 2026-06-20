import { useState } from 'react'
import './MusicCaptcha.css'

const QUESTIONS = [
  'Select all images where adding a decrescendo would enhance the musicality of the piece without being interpreted as an overly heavy-handed metaphor within the thematic context.',
  'Select all passages where the harmonic tension resolves in a way that Schoenberg would consider "sufficiently non-tonal yet emotionally sincere."',
  'Identify images where the rhythmic phrasing implies a counterpoint that Baroque composers would recognize but find mildly offensive.',
  'Select all scores where the interplay between the leading tone and subdominant implies emotional ambiguity without explicitly violating voice-leading conventions.',
]

const LINE_GAP = 7   // px between staff lines
const STAFF_TOP = 8  // y of topmost staff line

// Staff position 0 = top line, 8 = bottom line; every integer = one step (line or space)
function posY(p) { return STAFF_TOP + p * (LINE_GAP / 2) }

function SheetMusicThumbnail({ seed }) {
  const W = 130, H = 58

  // 8 notes per thumbnail, positions 0–8 on the staff
  const noteCount = 7 + (seed % 3)
  const notes = Array.from({ length: noteCount }, (_, i) => {
    const pos = (Math.abs(seed * 31 + i * 17 + i * i * 5)) % 9
    const x = 30 + i * ((W - 36) / (noteCount - 1))
    const y = posY(pos)
    const stemUp = pos >= 4           // low notes → stem up
    const sx = stemUp ? x + 3.5 : x - 3.5
    const sy = stemUp ? y - 20 : y + 20
    const beamed = i % 2 === 0 && i + 1 < noteCount  // pair up even notes
    return { x, y, sx, sy, stemUp, beamed, pos }
  })

  // Pick one of 3 time signatures deterministically
  const timeSig = ['4','3','6'][(seed % 3)]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="score-svg">
      {/* Staff lines */}
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="1" y1={STAFF_TOP + i * LINE_GAP} x2={W-1} y2={STAFF_TOP + i * LINE_GAP}
          stroke="#111" strokeWidth="0.8" />
      ))}

      {/* Treble clef */}
      <text x="1" y={STAFF_TOP + 26} fontSize="34" fontFamily="serif" fill="#111"
        dominantBaseline="middle" style={{ userSelect:'none' }}>𝄞</text>

      {/* Time signature */}
      <text x="20" y={STAFF_TOP + 8}  fontSize="9" fontFamily="serif" fill="#111" textAnchor="middle">{timeSig}</text>
      <text x="20" y={STAFF_TOP + 22} fontSize="9" fontFamily="serif" fill="#111" textAnchor="middle">4</text>

      {/* Barline at midpoint */}
      <line x1={W/2} y1={STAFF_TOP} x2={W/2} y2={STAFF_TOP + LINE_GAP * 4}
        stroke="#111" strokeWidth="1" />

      {/* Stems */}
      {notes.map((n, i) => (
        <line key={`s${i}`} x1={n.sx} y1={n.y} x2={n.sx} y2={n.sy}
          stroke="#111" strokeWidth="1" />
      ))}

      {/* Beams between paired notes with same stem direction */}
      {notes.map((n, i) => {
        if (!n.beamed) return null
        const next = notes[i + 1]
        if (n.stemUp !== next.stemUp) return null
        return (
          <line key={`b${i}`} x1={n.sx} y1={n.sy} x2={next.sx} y2={next.sy}
            stroke="#111" strokeWidth="3" strokeLinecap="round" />
        )
      })}

      {/* Note heads */}
      {notes.map((n, i) => (
        <ellipse key={`n${i}`} cx={n.x} cy={n.y} rx="3.8" ry="2.7" fill="#111"
          transform={`rotate(-15 ${n.x} ${n.y})`} />
      ))}
    </svg>
  )
}

export default function MusicCaptcha() {
  const [checked, setChecked] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [attempt, setAttempt] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [showGrid, setShowGrid] = useState(false)
  const [error, setError] = useState('')

  function toggle(i) {
    setSelected(s => {
      const n = new Set(s)
      n.has(i) ? n.delete(i) : n.add(i)
      return n
    })
  }

  function handleCheck() {
    setChecked(true)
    setShowGrid(true)
    setSelected(new Set())
    setError('')
  }

  function handleVerify() {
    setAttempt(a => a + 1)
    setQIdx(q => (q + 1) % QUESTIONS.length)
    setSelected(new Set())
    setError(
      attempt === 0
        ? 'Please select all matching images.'
        : attempt === 1
        ? 'Incorrect. Please try again.'
        : attempt === 2
        ? 'These selections are inconsistent with accepted music theory. Please try again.'
        : 'Too many failed attempts. Please complete an audio challenge instead.'
    )
  }

  return (
    <div className="captcha-wrap">
      {!showGrid ? (
        <div className="captcha-box captcha-check">
          <label className="captcha-checkbox-row">
            <div
              className={`captcha-checkbox${checked ? ' captcha-checkbox--checked' : ''}`}
              onClick={handleCheck}
              role="checkbox"
              aria-checked={checked}
              tabIndex={0}
              onKeyDown={e => e.key === ' ' && handleCheck()}
            >
              {checked && <div className="captcha-checkmark" />}
            </div>
            <span>I'm not a robot</span>
          </label>
          <div className="captcha-logo">
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
              <path d="M32 4 L60 56 L4 56 Z" fill="#4285F4" />
              <path d="M32 18 L50 50 H14 Z" fill="#fff" opacity="0.3" />
            </svg>
            <span className="captcha-brand">reCAPTCHA</span>
            <span className="captcha-sub">Privacy · Terms</span>
          </div>
        </div>
      ) : (
        <div className="captcha-box captcha-grid-box">
          <div className="captcha-question">{QUESTIONS[qIdx]}</div>
          <div className="captcha-grid">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className={`captcha-cell${selected.has(i) ? ' captcha-cell--selected' : ''}`}
                onClick={() => toggle(i)}
              >
                <SheetMusicThumbnail seed={i * 17 + qIdx * 31} />
                {selected.has(i) && <div className="captcha-cell-check">✓</div>}
              </div>
            ))}
          </div>
          {error && <p className="captcha-error">{error}</p>}
          <div className="captcha-actions">
            <button className="captcha-skip" onClick={() => { setQIdx(q => (q + 1) % QUESTIONS.length); setSelected(new Set()); setError('') }}>
              ↻ Get new challenge
            </button>
            <button className="captcha-verify" onClick={handleVerify}>VERIFY</button>
          </div>
        </div>
      )}
    </div>
  )
}
