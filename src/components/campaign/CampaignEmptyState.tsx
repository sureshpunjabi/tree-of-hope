'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import ScrollReveal from '@/components/ui/ScrollReveal'
import MagneticButton from '@/components/ui/MagneticButton'

/**
 * A beautiful animated empty state for the campaigns page.
 * Features a procedurally drawn sapling that grows on mount,
 * with gentle floating leaves and an inviting CTA.
 */
export default function CampaignEmptyState() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctxOrNull = canvas.getContext('2d')
    if (!ctxOrNull) return
    const ctx = ctxOrNull

    const W = 280
    const H = 320
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    // Animation state
    let growth = 0 // 0 to 1
    let frame = 0

    // Sapling structure
    const TRUNK_X = W / 2
    const TRUNK_BOTTOM = H - 40
    const TRUNK_HEIGHT = 120
    const TRUNK_WIDTH = 6

    // Leaf positions (relative to trunk top)
    const leaves = [
      { x: 0, y: 0, size: 18, hue: 132, delay: 0.4 },
      { x: -22, y: 12, size: 15, hue: 140, delay: 0.5 },
      { x: 18, y: 8, size: 16, hue: 125, delay: 0.55 },
      { x: -12, y: -8, size: 14, hue: 148, delay: 0.6 },
      { x: 14, y: -4, size: 13, hue: 135, delay: 0.65 },
      { x: -30, y: 22, size: 12, hue: 142, delay: 0.7 },
      { x: 26, y: 20, size: 13, hue: 128, delay: 0.72 },
      { x: -8, y: -16, size: 11, hue: 138, delay: 0.75 },
      { x: 8, y: -14, size: 12, hue: 145, delay: 0.78 },
    ]

    // Floating particles
    const particles: { x: number; y: number; size: number; speed: number; opacity: number; hue: number }[] = []
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 2 + Math.random() * 3,
        speed: 0.15 + Math.random() * 0.25,
        opacity: 0.15 + Math.random() * 0.2,
        hue: 120 + Math.random() * 40,
      })
    }

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3)
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = frame * 0.012
      growth = Math.min(t, 1)

      // Draw shadow
      if (growth > 0.1) {
        const shadowAlpha = Math.min((growth - 0.1) * 0.15, 0.06)
        ctx.save()
        ctx.beginPath()
        ctx.ellipse(TRUNK_X, TRUNK_BOTTOM + 12, 30 * growth, 6 * growth, 0, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`
        ctx.fill()
        ctx.restore()
      }

      // Draw trunk (grows upward)
      if (growth > 0) {
        const trunkGrowth = easeOutCubic(Math.min(growth / 0.4, 1))
        const currentHeight = TRUNK_HEIGHT * trunkGrowth
        const topY = TRUNK_BOTTOM - currentHeight

        // Trunk gradient
        const grad = ctx.createLinearGradient(TRUNK_X, TRUNK_BOTTOM, TRUNK_X, topY)
        grad.addColorStop(0, '#6D4C3A')
        grad.addColorStop(1, '#8B6F5E')

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(TRUNK_X - TRUNK_WIDTH / 2 - 1, TRUNK_BOTTOM)
        ctx.quadraticCurveTo(TRUNK_X - TRUNK_WIDTH / 2 - 0.5, topY + currentHeight * 0.3, TRUNK_X - TRUNK_WIDTH / 2 + 1, topY)
        ctx.lineTo(TRUNK_X + TRUNK_WIDTH / 2 - 1, topY)
        ctx.quadraticCurveTo(TRUNK_X + TRUNK_WIDTH / 2 + 0.5, topY + currentHeight * 0.3, TRUNK_X + TRUNK_WIDTH / 2 + 1, TRUNK_BOTTOM)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()

        // Small branches
        if (growth > 0.35) {
          const branchAlpha = Math.min((growth - 0.35) * 4, 1)
          ctx.save()
          ctx.strokeStyle = `rgba(109, 76, 58, ${branchAlpha * 0.8})`
          ctx.lineWidth = 2
          ctx.lineCap = 'round'

          // Left branch
          ctx.beginPath()
          ctx.moveTo(TRUNK_X - 1, topY + 20)
          ctx.quadraticCurveTo(TRUNK_X - 18, topY + 8, TRUNK_X - 28, topY + 16)
          ctx.stroke()

          // Right branch
          ctx.beginPath()
          ctx.moveTo(TRUNK_X + 1, topY + 14)
          ctx.quadraticCurveTo(TRUNK_X + 16, topY + 2, TRUNK_X + 24, topY + 12)
          ctx.stroke()
          ctx.restore()
        }
      }

      // Draw leaves
      const trunkTop = TRUNK_BOTTOM - TRUNK_HEIGHT * easeOutCubic(Math.min(growth / 0.4, 1))
      leaves.forEach((leaf) => {
        if (growth < leaf.delay) return
        const leafGrowth = easeOutCubic(Math.min((growth - leaf.delay) / 0.25, 1))
        if (leafGrowth <= 0) return

        const sway = Math.sin(t * 1.5 + leaf.x * 0.1) * 2
        const lx = TRUNK_X + leaf.x + sway
        const ly = trunkTop + leaf.y + Math.sin(t * 1.2 + leaf.y * 0.1) * 1.5
        const s = leaf.size * leafGrowth

        // Leaf shape
        ctx.save()
        ctx.translate(lx, ly)
        ctx.rotate((Math.sin(t + leaf.delay * 10) * 0.15))
        ctx.beginPath()
        ctx.moveTo(0, -s * 0.6)
        ctx.bezierCurveTo(s * 0.5, -s * 0.5, s * 0.5, s * 0.3, 0, s * 0.6)
        ctx.bezierCurveTo(-s * 0.5, s * 0.3, -s * 0.5, -s * 0.5, 0, -s * 0.6)
        ctx.closePath()

        const leafGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s)
        leafGrad.addColorStop(0, `hsla(${leaf.hue}, 55%, 52%, ${leafGrowth * 0.9})`)
        leafGrad.addColorStop(1, `hsla(${leaf.hue}, 45%, 42%, ${leafGrowth * 0.7})`)
        ctx.fillStyle = leafGrad
        ctx.fill()

        // Leaf vein
        ctx.beginPath()
        ctx.moveTo(0, -s * 0.4)
        ctx.lineTo(0, s * 0.4)
        ctx.strokeStyle = `hsla(${leaf.hue}, 40%, 38%, ${leafGrowth * 0.3})`
        ctx.lineWidth = 0.5
        ctx.stroke()

        ctx.restore()
      })

      // Floating particles
      particles.forEach((p) => {
        if (growth < 0.6) return
        p.y -= p.speed
        p.x += Math.sin(frame * 0.02 + p.y * 0.01) * 0.3
        if (p.y < -10) {
          p.y = H + 10
          p.x = Math.random() * W
        }
        const alpha = p.opacity * Math.min((growth - 0.6) * 3, 1)
        ctx.save()
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 40%, 60%, ${alpha})`
        ctx.fill()
        ctx.restore()
      })

      frame++
      if (growth < 1 || true) {
        requestAnimationFrame(draw)
      }
    }

    draw()
  }, [])

  return (
    <div className="text-center py-10 md:py-16">
      <ScrollReveal>
        <div className="flex justify-center mb-8">
          <canvas
            ref={canvasRef}
            className="opacity-90"
            style={{ width: 280, height: 320 }}
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={600}>
        <h2
          className="text-[clamp(1.75rem,4vw,2.75rem)] font-semibold text-[var(--color-text)] mb-3 tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          The first tree is waiting.
        </h2>
      </ScrollReveal>

      <ScrollReveal delay={750}>
        <p className="text-[15px] text-[var(--color-text-muted)] leading-[1.65] max-w-sm mx-auto mb-8">
          No active campaigns yet. When someone plants a tree, it will appear here — growing, gathering leaves, building a circle of care.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={900}>
        <MagneticButton strength={0.08} className="inline-block">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3 px-8 rounded-full text-[14px] transition-all duration-500 tracking-[0.01em] hover:shadow-lg hover:shadow-[var(--color-hope)]/20 hover:scale-[1.02]"
          >
            Be the first to plant
          </Link>
        </MagneticButton>
      </ScrollReveal>
    </div>
  )
}
