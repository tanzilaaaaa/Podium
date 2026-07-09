import { useEffect, useRef } from 'react'

/**
 * Fluid ink cursor — canvas 2D, blue/violet family
 * Creates smooth fluid trails that follow the cursor
 */
export default function SplashCursor() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Fluid trail points
    const trails = []
    const MAX_TRAILS = 6
    const TRAIL_LENGTH = 80

    // Initialize trails at center
    for (let i = 0; i < MAX_TRAILS; i++) {
      trails.push({
        points: [],
        hue: 220 + i * 20,
        width: 2 + i * 1.5,
        lag: 1 + i * 0.5,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })
    }

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2

    function onMouseMove(e) {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', onMouseMove)

    let raf
    let frame = 0

    function draw() {
      raf = requestAnimationFrame(draw)
      frame++

      // Fade old trails
      ctx.fillStyle = 'rgba(240, 240, 240, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Clear fully (transparent)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update each trail
      trails.forEach((trail, i) => {
        // Lag: each trail follows mouse with different speed
        trail.x += (mouseX - trail.x) / (trail.lag + i * 2)
        trail.y += (mouseY - trail.y) / (trail.lag + i * 2)

        trail.points.push({ x: trail.x, y: trail.y })
        if (trail.points.length > TRAIL_LENGTH) {
          trail.points.shift()
        }

        if (trail.points.length < 2) return

        // Draw smooth curve through points
        for (let j = 1; j < trail.points.length; j++) {
          const t = j / trail.points.length
          const alpha = t * t * 0.6
          const width = trail.width * t

          ctx.beginPath()
          ctx.moveTo(trail.points[j - 1].x, trail.points[j - 1].y)
          ctx.lineTo(trail.points[j].x, trail.points[j].y)
          ctx.strokeStyle = `hsla(${trail.hue + Math.sin(frame * 0.02 + i) * 20}, 80%, 60%, ${alpha})`
          ctx.lineWidth = width
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.stroke()
        }

        // Draw glowing blob at head
        const head = trail.points[trail.points.length - 1]
        if (head) {
          const grad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, trail.width * 3)
          grad.addColorStop(0, `hsla(${trail.hue}, 90%, 70%, 0.8)`)
          grad.addColorStop(1, `hsla(${trail.hue}, 80%, 50%, 0)`)
          ctx.beginPath()
          ctx.arc(head.x, head.y, trail.width * 3, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()
        }
      })
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    />
  )
}
