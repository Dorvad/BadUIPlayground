import { useState } from 'react'
import './WeightyLogin.css'

export default function WeightyLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginMsg, setLoginMsg] = useState('')

  const chars = username.length
  // Rotation accelerates non-linearly as the field gets "heavier"
  const rotation = Math.min(chars * chars * 0.18, 95)
  const sinkY = Math.min(chars * 4, 140)

  function handleLogin(e) {
    e.preventDefault()
    if (rotation > 60) {
      setLoginMsg("Can't log in — your username fell off the form.")
    } else if (username && password) {
      setLoginMsg('Logged in!')
    } else {
      setLoginMsg('Please fill in all fields.')
    }
  }

  return (
    <div className="wl-scene">
      <form className="wl-form" onSubmit={handleLogin} noValidate>
        <div className="wl-field-slot">
          <div
            className="wl-field-wrap"
            style={{
              transform: `rotate(${rotation}deg) translateY(${sinkY * 0.3}px)`,
              transformOrigin: '16px center',
            }}
          >
            <input
              className="wl-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => { setUsername(e.target.value); setLoginMsg('') }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="wl-field-slot wl-field-slot--password">
          <input
            className="wl-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setLoginMsg('') }}
          />
        </div>

        {loginMsg && <p className="wl-msg">{loginMsg}</p>}

        <button type="submit" className="wl-btn">Login</button>
      </form>
    </div>
  )
}
