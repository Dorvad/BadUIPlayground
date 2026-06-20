import { useState } from 'react'
import './MusicCaptcha.css'

const QUESTIONS = [
  'Select all images where adding a decrescendo would enhance the musicality of the piece without being interpreted as an overly heavy-handed metaphor within the thematic context.',
  'Select all passages where the harmonic tension resolves in a way that Schoenberg would consider "sufficiently non-tonal yet emotionally sincere."',
  'Identify images where the rhythmic phrasing implies a counterpoint that Baroque composers would recognize but find mildly offensive.',
  'Select all scores where the interplay between the leading tone and subdominant implies emotional ambiguity without explicitly violating voice-leading conventions.',
]

// Generate fake sheet music SVGs
function SheetMusicThumbnail({ seed }) {
  const lines = [0, 8, 16, 24, 32]
  const notes = Array.from({ length: 12 }, (_, i) => ({
    x: 12 + i * 10,
    y: 4 + ((seed * 7 + i * 13) % 36),
    beam: i % 3 === 0,
  }))

  return (
    <svg viewBox="0 0 130 52" xmlns="http://www.w3.org/2000/svg" className="score-svg">
      {/* Staff lines */}
      {lines.map(y => (
        <line key={y} x1="2" y1={y + 8} x2="128" y2={y + 8} stroke="#111" strokeWidth="0.7" />
      ))}
      {/* Time sig */}
      <text x="4" y="22" fontSize="14" fill="#111" fontFamily="serif">4</text>
      <text x="4" y="34" fontSize="14" fill="#111" fontFamily="serif">4</text>
      {/* Notes */}
      {notes.map((n, i) => (
        <g key={i}>
          <ellipse cx={n.x + 18} cy={n.y + 10} rx="3.5" ry="2.5" fill="#111" transform={`rotate(-15 ${n.x + 18} ${n.y + 10})`} />
          <line x1={n.x + 21} y1={n.y + 10} x2={n.x + 21} y2={n.y - 10} stroke="#111" strokeWidth="0.8" />
          {n.beam && i + 1 < notes.length && (
            <line x1={n.x + 21} y1={n.y - 10} x2={notes[i + 1]?.x + 39} y2={notes[i + 1]?.y - 10} stroke="#111" strokeWidth="1.5" />
          )}
        </g>
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
