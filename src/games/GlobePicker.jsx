import { useEffect, useRef, useState } from 'react'
import { geoOrthographic, geoPath, geoGraticule, geoContains } from 'd3-geo'
import { feature } from 'topojson-client'
import worldData from 'world-atlas/countries-110m.json'
import { COUNTRY_NAMES } from './countryNames'
import './GlobePicker.css'

const W = 380
const H = 380
const R = 170

const countriesGeo = feature(worldData, worldData.objects.countries)

const PALETTE = [
  '#e8a838','#4da6c8','#b05cc8','#5cb85c','#e85c5c',
  '#5c8ee8','#e8785c','#5cbf8a','#c85c8e','#8e8e5c',
  '#5cc8c8','#c8a85c','#8e5cc8','#5c8e8e','#c85c5c',
]
const colorMap = {}
countriesGeo.features.forEach((f, i) => {
  colorMap[f.id] = PALETTE[i % PALETTE.length]
})

export default function GlobePicker() {
  const canvasRef = useRef(null)
  const rotRef = useRef(0)
  const mousePosRef = useRef(null)
  const dartRef = useRef(null)
  const rafRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [thrown, setThrown] = useState(false)

  function makeProjection() {
    return geoOrthographic()
      .scale(R)
      .translate([W / 2, H / 2])
      .rotate([rotRef.current, -20, 0])
  }

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const proj = makeProjection()
    const path = geoPath(proj, ctx)
    const graticule = geoGraticule()

    ctx.clearRect(0, 0, W, H)

    // Ocean
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, R, 0, Math.PI * 2)
    ctx.fillStyle = '#d4ecff'
    ctx.fill()

    // Countries
    countriesGeo.features.forEach(f => {
      ctx.beginPath()
      path(f)
      ctx.fillStyle = colorMap[f.id] || '#bbb'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'
      ctx.lineWidth = 0.6
      ctx.stroke()
    })

    // Graticule
    ctx.beginPath()
    path(graticule())
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Globe border
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, R, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Dart
    if (dartRef.current) {
      drawDart(ctx, dartRef.current.x, dartRef.current.y)
    }

    // Crosshair (only when not thrown)
    const mp = mousePosRef.current
    if (mp && !dartRef.current) {
      const dx = mp.x - W / 2, dy = mp.y - H / 2
      if (dx * dx + dy * dy <= R * R) drawCrosshair(ctx, mp.x, mp.y)
    }
  }

  function drawDart(ctx, x, y) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.PI / 4) // angled like image

    // Shaft
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -32)
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 2.5
    ctx.stroke()

    // Tip
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, 6)
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 2
    ctx.stroke()

    // Flights (feathers)
    ctx.beginPath()
    ctx.moveTo(0, -22)
    ctx.lineTo(-9, -36)
    ctx.lineTo(0, -28)
    ctx.closePath()
    ctx.fillStyle = '#e74c3c'
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(0, -22)
    ctx.lineTo(9, -36)
    ctx.lineTo(0, -28)
    ctx.closePath()
    ctx.fillStyle = '#c0392b'
    ctx.fill()

    ctx.restore()
  }

  function drawCrosshair(ctx, x, y) {
    const s = 18
    ctx.save()
    ctx.strokeStyle = 'rgba(0,0,0,0.65)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 2])
    ctx.beginPath()
    ctx.moveTo(x - s, y); ctx.lineTo(x + s, y)
    ctx.moveTo(x, y - s); ctx.lineTo(x, y + s)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  useEffect(() => {
    const loop = () => {
      if (!dartRef.current) rotRef.current = (rotRef.current - 0.25) % 360
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  function canvasCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height),
    }
  }

  function findCountry(x, y) {
    const proj = makeProjection()
    const coords = proj.invert([x, y])
    if (!coords) return null
    for (const f of countriesGeo.features) {
      if (geoContains(f, coords)) return f
    }
    return null
  }

  function handleClick(e) {
    const { x, y } = canvasCoords(e)
    const dx = x - W / 2, dy = y - H / 2
    if (dx * dx + dy * dy > R * R) return

    const hit = findCountry(x, y)
    dartRef.current = { x, y }
    setSelected(hit ? (COUNTRY_NAMES[hit.id] || `Country #${hit.id}`) : 'Ocean')
    setThrown(true)
  }

  function handleMouseMove(e) {
    if (dartRef.current) return
    mousePosRef.current = canvasCoords(e)
  }

  function handleMouseLeave() {
    mousePosRef.current = null
  }

  function handleReset() {
    dartRef.current = null
    mousePosRef.current = null
    setSelected(null)
    setThrown(false)
  }

  return (
    <div className="gp-wrap">
      <div className="gp-header">
        <span className="gp-label">Country<span className="gp-asterisk">*</span></span>
        <div className="gp-dropdown">
          <span className={selected ? '' : 'gp-placeholder'}>{selected || 'select country'}</span>
          <span className="gp-arrow">▾</span>
        </div>
      </div>
      <div className="gp-globe-wrap">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`gp-canvas${thrown ? '' : ' gp-canvas--aim'}`}
        />
        {thrown && (
          <button className="gp-reset" onClick={handleReset}>↺ Retry</button>
        )}
      </div>
    </div>
  )
}
