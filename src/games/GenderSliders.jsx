import { useState, useCallback } from 'react'
import './GenderSliders.css'

export default function GenderSliders() {
  const [man, setMan] = useState(72)
  const [woman, setWoman] = useState(45)
  const [submitMsg, setSubmitMsg] = useState('')

  // When you drag one slider, the other one also moves—but not in any logical direction
  const handleMan = useCallback((e) => {
    const v = Number(e.target.value)
    setMan(v)
    // Woman slider drifts randomly when man changes
    setWoman(w => Math.min(100, Math.max(0, w + (Math.random() - 0.45) * 8)))
  }, [])

  const handleWoman = useCallback((e) => {
    const v = Number(e.target.value)
    setWoman(v)
    setMan(m => Math.min(100, Math.max(0, m + (Math.random() - 0.45) * 8)))
  }, [])

  function handleSubmit() {
    const total = Math.round(man + woman)
    if (total === 100) {
      setSubmitMsg('Values must not add up to 100. Please adjust.')
    } else if (man > woman) {
      setSubmitMsg('Man value cannot exceed Woman value. Please correct.')
    } else if (woman > man) {
      setSubmitMsg('Woman value cannot exceed Man value. Please correct.')
    } else {
      setSubmitMsg('Invalid combination. Please try again.')
    }
  }

  return (
    <div className="gender-form">
      <p className="gender-heading">Please select your gender</p>

      <div className="gender-sliders">
        <SliderRow label="Man" value={man} onChange={handleMan} />
        <SliderRow label="Woman" value={woman} onChange={handleWoman} />
      </div>

      <div className="gender-footer">
        <button className="gender-submit" onClick={handleSubmit}>
          Confirm
        </button>
        {submitMsg && <p className="gender-error">{submitMsg}</p>}
      </div>
    </div>
  )
}

function SliderRow({ label, value, onChange }) {
  return (
    <div className="slider-row">
      <span className="slider-label">{label}</span>
      <div className="slider-track-wrap">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(value)}
          onChange={onChange}
          className="slider-input"
        />
      </div>
      <span className="slider-value">{Math.round(value)}%</span>
    </div>
  )
}
