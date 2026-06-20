import { useState } from 'react'
import './WeightyLogin.css'

export default function WeightyLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginMsg, setLoginMsg] = useState('')

  const uChars = username.length
  const pChars = password.length
  const uRotation = Math.min(uChars * uChars * 0.18, 95)
  const pRotation = Math.min(pChars * pChars * 0.18, 95)

  function handleLogin(e) {
    e.preventDefault()
    if (uRotation > 60 && pRotation > 60) {
      setLoginMsg("Both fields fell off the form.")
    } else if (uRotation > 60) {
      setLoginMsg("Can't log in — your username fell off the form.")
    } else if (pRotation > 60) {
      setLoginMsg("Can't log in — your password fell off the form.")
    } else if (username && password) {
      setLoginMsg('Logged in!')
    } else {
      setLoginMsg('Please fill in all fields.')
    }
  }

  return (
    <div className="wl-scene">
      <form className="wl-form" onSubmit={handleLogin} noValidate>
        {/* Username — pivots from left, falls clockwise */}
        <div className="wl-field-slot">
          <div
            className="wl-field-wrap"
            style={{
              transform: `rotate(${uRotation}deg)`,
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

        {/* Password — pivots from right, falls counter-clockwise */}
        <div className="wl-field-slot">
          <div
            className="wl-field-wrap"
            style={{
              transform: `rotate(${-pRotation}deg)`,
              transformOrigin: 'calc(100% - 16px) center',
            }}
          >
            <input
              className="wl-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setLoginMsg('') }}
            />
          </div>
        </div>

        {loginMsg && <p className="wl-msg">{loginMsg}</p>}

        <button type="submit" className="wl-btn">Login</button>
      </form>
    </div>
  )
}
