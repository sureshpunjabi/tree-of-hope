'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/* ─── Types ────────────────────────────────────────── */
interface Branch {
  startX: number; startY: number; endX: number; endY: number;
  cpX: number; cpY: number; // control point for organic curves
  width: number; depth: number; angle: number; length: number;
  progress: number; children: Branch[]; leaves: Leaf[];
  barkSeed: number; // unique seed for bark texture
}

interface Leaf {
  x: number; y: number; baseX: number; baseY: number;
  size: number; color: string; highlight: string; shadowColor: string;
  rotation: number; opacity: number;
  swayPhase: number; swayFreq: number;
  depthLayer: number; // 0=back 1=mid 2=front
  glowAmt: number;
  shape: number; // 0-3 different leaf shapes
  supporterName?: string;
}

interface FallingLeaf {
  x: number; y: number; vx: number; vy: number;
  rotation: number; rotSpeed: number;
  size: number; color: string; opacity: number; life: number;
}

interface Firefly {
  x: number; y: number; baseX: number; baseY: number;
  phase: number; speed: number; radius: number; brightness: number;
}

interface CondensationDrop {
  x: number; y: number; size: number; speed: number; opacity: number;
  angle: number;
}

/* ─── Richer Palette — wider range from deep forest to spring ─── */
const COLORS = [
  { fill: '#1B4332', hi: '#2D6A4F', sh: '#0B2918' }, // deep forest
  { fill: '#264F36', hi: '#40916C', sh: '#142B1E' }, // dark evergreen
  { fill: '#2D6A4F', hi: '#52B788', sh: '#1B4332' }, // forest
  { fill: '#3A7D5B', hi: '#6BC18F', sh: '#245040' }, // rich green
  { fill: '#4A8C5E', hi: '#7DC99A', sh: '#2E5C3C' }, // medium green
  { fill: '#5B9A4A', hi: '#8ED47A', sh: '#3E6C32' }, // fresh green
  { fill: '#6DB85A', hi: '#A0DC8E', sh: '#4A8040' }, // bright green
  { fill: '#82C46E', hi: '#B5E8A0', sh: '#5A9050' }, // spring green
  { fill: '#90C978', hi: '#BDE8A5', sh: '#6AAA58' }, // light sage
  { fill: '#7CB342', hi: '#AED581', sh: '#558B2F' }, // lime-green
  { fill: '#8BC34A', hi: '#C5E1A5', sh: '#689F38' }, // chartreuse
  { fill: '#A5D68C', hi: '#D4EDBA', sh: '#7AB868' }, // pale spring
];

const NAMES = [
  'James', 'Mom', 'Rachel', 'David & Ana', 'Coach Williams',
  'Priya', 'Marcus', 'The Nguyens', 'Elena', 'Dr. Mehta',
  'Anonymous', 'Sophie & Tom', 'Alex', 'Grandma Rose',
];

export default function InteractiveTree() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const treeRef = useRef<Branch | null>(null);
  const mouseRef = useRef({ x: -999, y: -999, vx: 0, vy: 0, prevX: -999, prevY: -999 });
  const animRef = useRef(0);
  const leavesRef = useRef<Leaf[]>([]);
  const fallingRef = useRef<FallingLeaf[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const dropsRef = useRef<CondensationDrop[]>([]);
  const hoveredRef = useRef<Leaf | null>(null);
  const grownRef = useRef(false);
  const nameIdx = useRef(0);
  const lastFallTime = useRef(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);

  /* ─── Build organic fractal tree ─────────────── */
  const buildBranch = useCallback((
    x: number, y: number, angle: number, len: number, w: number, depth: number
  ): Branch => {
    // More organic jitter — S-curve branches
    const jitter = (Math.random() - 0.5) * (depth < 2 ? 0.12 : 0.22);
    const endAngle = angle + jitter;
    const ex = x + Math.cos(endAngle) * len;
    const ey = y + Math.sin(endAngle) * len;

    // Organic control point — offset perpendicular to branch direction
    const perpAngle = endAngle + Math.PI / 2;
    const cpOffset = (Math.random() - 0.5) * len * (depth < 2 ? 0.15 : 0.3);
    const midX = (x + ex) / 2 + Math.cos(perpAngle) * cpOffset;
    const midY = (y + ey) / 2 + Math.sin(perpAngle) * cpOffset;

    const b: Branch = {
      startX: x, startY: y, endX: ex, endY: ey,
      cpX: midX, cpY: midY,
      width: w, depth, angle: endAngle, length: len, progress: 0,
      children: [], leaves: [],
      barkSeed: Math.random() * 1000,
    };

    if (depth < 7 && len > 10) {
      // Fewer children for more elegant, airy structure
      const n = depth < 2 ? 2 + (Math.random() > 0.7 ? 1 : 0) :
                depth < 4 ? 2 + (Math.random() > 0.5 ? 1 : 0) :
                Math.random() > 0.4 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const spread = depth < 2 ? 0.3 + Math.random() * 0.3 :
                       depth < 4 ? 0.25 + Math.random() * 0.4 :
                       0.2 + Math.random() * 0.5;
        const off = n === 1 ? (Math.random() - 0.5) * 0.6 :
                    n === 2 ? (i === 0 ? -spread : spread) :
                    (i === 0 ? -spread : i === 1 ? spread : (Math.random() - 0.5) * 0.4);
        const decay = 0.58 + Math.random() * 0.17;
        b.children.push(buildBranch(ex, ey, endAngle + off, len * decay, w * 0.62, depth + 1));
      }
    }

    // Leaves — fewer per branch for airiness, but more varied
    if (depth >= 3) {
      const count = depth >= 6 ? 3 + Math.floor(Math.random() * 3) :
                    depth >= 4 ? 2 + Math.floor(Math.random() * 3) :
                    1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const sp = depth >= 5 ? 25 : 20;
        const lx = ex + (Math.random() - 0.5) * sp * 2.5;
        const ly = ey + (Math.random() - 0.5) * sp * 2;
        const c = COLORS[Math.floor(Math.random() * COLORS.length)];
        const leaf: Leaf = {
          x: lx, y: ly, baseX: lx, baseY: ly,
          size: 7 + Math.random() * 9 + (depth >= 5 ? 3 : 0),
          color: c.fill, highlight: c.hi, shadowColor: c.sh,
          rotation: Math.random() * Math.PI * 2,
          opacity: 0.75 + Math.random() * 0.25,
          swayPhase: Math.random() * Math.PI * 2,
          swayFreq: 0.0008 + Math.random() * 0.0008,
          depthLayer: depth >= 6 ? 2 : depth >= 4 ? 1 : 0,
          glowAmt: 0,
          shape: Math.floor(Math.random() * 4),
          supporterName: NAMES[nameIdx.current % NAMES.length],
        };
        nameIdx.current++;
        b.leaves.push(leaf);
        leavesRef.current.push(leaf);
      }
    }
    return b;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = 560, H = 620;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    leavesRef.current = [];
    fallingRef.current = [];
    nameIdx.current = 0;
    // Slightly shorter trunk, wider base for bonsai feel
    treeRef.current = buildBranch(W / 2, H - 95, -Math.PI / 2 + (Math.random() - 0.5) * 0.08, 120, 22, 0);

    // Dome geometry — taller, more elegant proportions
    const DX = W / 2, DBY = H - 72, DRX = 210, DRY = 290;

    // Fireflies
    firefliesRef.current = [];
    for (let i = 0; i < 10; i++) {
      firefliesRef.current.push({
        x: DX, y: DBY - 150,
        baseX: DX - 120 + Math.random() * 240,
        baseY: DBY - 50 - Math.random() * 220,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0002 + Math.random() * 0.0004,
        radius: 20 + Math.random() * 35,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }

    // Condensation drops
    dropsRef.current = [];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI * 0.15 - Math.random() * Math.PI * 0.5;
      dropsRef.current.push({
        x: DX + Math.cos(a) * DRX * 0.96,
        y: DBY + Math.sin(a) * DRY * 0.96,
        size: 1.2 + Math.random() * 1.8,
        speed: 0.012 + Math.random() * 0.015,
        opacity: 0.1 + Math.random() * 0.12,
        angle: a,
      });
    }

    // ── Mouse tracking ──
    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const sx = W / r.width, sy = H / r.height;
      const nx = (e.clientX - r.left) * sx, ny = (e.clientY - r.top) * sy;
      mouseRef.current.vx = nx - mouseRef.current.x;
      mouseRef.current.vy = ny - mouseRef.current.y;
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = nx; mouseRef.current.y = ny;
    };
    const onLeave = () => { mouseRef.current.x = -999; mouseRef.current.y = -999; setTooltip(null); };
    const onTouch = (e: TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const t = e.touches[0];
      if (t) {
        const sx = W / r.width, sy = H / r.height;
        mouseRef.current.x = (t.clientX - r.left) * sx;
        mouseRef.current.y = (t.clientY - r.top) * sy;
      }
    };

    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('touchstart', onTouch, { passive: true });

    /* ─── DRAW: Wooden base + soil ─────────────── */
    const drawBase = () => {
      ctx.save();
      const baseW = DRX * 2 + 40, baseH = 28;
      const bx = DX - baseW / 2;

      // Ground shadow
      ctx.beginPath();
      ctx.ellipse(DX, DBY + baseH + 8, baseW / 2 + 15, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fill();

      // Wooden base — warm walnut gradient
      const bg = ctx.createLinearGradient(bx, DBY, bx, DBY + baseH);
      bg.addColorStop(0, '#A0866A');
      bg.addColorStop(0.2, '#8A7058');
      bg.addColorStop(0.5, '#7A6248');
      bg.addColorStop(0.8, '#6A5238');
      bg.addColorStop(1, '#5A4230');
      ctx.beginPath();
      ctx.roundRect(bx, DBY, baseW, baseH, [6, 6, 10, 10]);
      ctx.fillStyle = bg; ctx.fill();

      // Top rim highlight
      ctx.beginPath();
      ctx.roundRect(bx + 5, DBY, baseW - 10, 3, [3, 3, 0, 0]);
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();

      // Wood grain lines
      ctx.strokeStyle = 'rgba(90,60,30,0.08)';
      ctx.lineWidth = 0.5;
      for (let gy = DBY + 6; gy < DBY + baseH - 4; gy += 3.5) {
        ctx.beginPath();
        ctx.moveTo(bx + 8, gy);
        ctx.bezierCurveTo(bx + baseW * 0.3, gy + 1, bx + baseW * 0.7, gy - 0.5, bx + baseW - 8, gy);
        ctx.stroke();
      }

      // Soil mound
      ctx.beginPath();
      ctx.ellipse(DX, DBY - 2, DRX - 20, 20, 0, 0, Math.PI * 2);
      const sg = ctx.createRadialGradient(DX, DBY - 2, 0, DX, DBY - 2, DRX - 20);
      sg.addColorStop(0, 'rgba(85,65,45,0.35)');
      sg.addColorStop(0.5, 'rgba(85,65,45,0.2)');
      sg.addColorStop(1, 'rgba(85,65,45,0.02)');
      ctx.fillStyle = sg; ctx.fill();

      // Moss patches — scattered organic shapes
      const mossColors = ['rgba(60,90,50,0.2)', 'rgba(70,100,55,0.18)', 'rgba(80,110,60,0.15)'];
      for (let gx = DX - 100; gx < DX + 100; gx += 12 + Math.random() * 16) {
        ctx.fillStyle = mossColors[Math.floor(Math.random() * mossColors.length)];
        ctx.beginPath();
        const gy = DBY - 6 + Math.random() * 5;
        ctx.ellipse(gx, gy, 3 + Math.random() * 5, 1.5 + Math.random() * 2, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Small pebbles
      ctx.fillStyle = 'rgba(130,115,95,0.25)';
      [[DX - 55, DBY - 7, 3.2], [DX + 50, DBY - 5, 2.8], [DX - 20, DBY - 3, 2],
       [DX + 75, DBY - 6, 2.5], [DX - 85, DBY - 5, 1.8], [DX + 20, DBY - 4, 2.5]].forEach(([px, py, pr]) => {
        ctx.beginPath(); ctx.ellipse(px, py, pr, pr * 0.65, 0.3, 0, Math.PI * 2); ctx.fill();
      });

      ctx.restore();
    };

    /* ─── DRAW: Branch with bark texture ──────── */
    const drawBranch = (b: Branch, t: number) => {
      if (b.progress <= 0) return;
      const p = Math.min(b.progress, 1);

      // Interpolate end position based on growth progress
      const ceX = b.startX + (b.endX - b.startX) * p;
      const ceY = b.startY + (b.endY - b.startY) * p;
      const cpX = b.startX + (b.cpX - b.startX) * p;
      const cpY = b.startY + (b.cpY - b.startY) * p;

      // Gentle wind sway
      const mv = mouseRef.current;
      const rawWind = mv.x > 0 ? (mv.vx || 0) * 0.0003 * b.depth : 0;
      const windForce = Math.max(-2.5, Math.min(2.5, rawWind));
      const ambientSway = Math.sin(t * 0.0006 + b.depth * 0.8 + b.barkSeed) * b.depth * 0.15;
      const totalSway = ambientSway + windForce * 1.5;

      const swayedCpX = cpX + totalSway * 0.5;
      const swayedEndX = ceX + totalSway;

      const lineW = Math.max(1, b.width * p);

      // ── Bark colors — warmer, more varied
      const warmth = Math.sin(b.barkSeed) * 10;
      const darkR = Math.max(35, 70 - b.depth * 4 + warmth);
      const darkG = Math.max(25, 48 - b.depth * 3 + warmth * 0.5);
      const darkB = Math.max(18, 35 - b.depth * 2);

      const lightR = darkR + 30;
      const lightG = darkG + 20;
      const lightB = darkB + 15;

      // ── Draw thick branches with tapered stroke ──
      if (b.depth < 5 && lineW > 1.5) {
        // Shadow
        ctx.beginPath();
        ctx.moveTo(b.startX + 1, b.startY + 1);
        ctx.quadraticCurveTo(swayedCpX + 1, cpY + 1, swayedEndX + 1, ceY + 1);
        ctx.strokeStyle = `rgba(20,15,10,0.12)`;
        ctx.lineWidth = lineW + 2;
        ctx.lineCap = 'round'; ctx.stroke();

        // Main bark
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.quadraticCurveTo(swayedCpX, cpY, swayedEndX, ceY);
        ctx.strokeStyle = `rgb(${darkR},${darkG},${darkB})`;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round'; ctx.stroke();

        // Light side highlight (left)
        if (lineW > 3) {
          ctx.beginPath();
          ctx.moveTo(b.startX - lineW * 0.15, b.startY);
          ctx.quadraticCurveTo(swayedCpX - lineW * 0.15, cpY, swayedEndX - lineW * 0.15, ceY);
          ctx.strokeStyle = `rgba(${lightR},${lightG},${lightB},0.3)`;
          ctx.lineWidth = Math.max(1, lineW * 0.25);
          ctx.stroke();
        }

        // Dark side (right)
        if (lineW > 4) {
          ctx.beginPath();
          ctx.moveTo(b.startX + lineW * 0.2, b.startY);
          ctx.quadraticCurveTo(swayedCpX + lineW * 0.2, cpY, swayedEndX + lineW * 0.2, ceY);
          ctx.strokeStyle = `rgba(${darkR - 20},${darkG - 15},${darkB - 10},0.2)`;
          ctx.lineWidth = Math.max(0.8, lineW * 0.2);
          ctx.stroke();
        }

        // Bark texture — tiny knots and lines on thick branches
        if (b.depth < 3 && lineW > 6) {
          ctx.save();
          ctx.strokeStyle = `rgba(40,28,18,0.1)`;
          ctx.lineWidth = 0.5;
          const segs = Math.floor(b.length / 12);
          for (let i = 1; i < segs && i < 8; i++) {
            const frac = i / segs;
            const bx = b.startX + (swayedEndX - b.startX) * frac;
            const by = b.startY + (ceY - b.startY) * frac;
            ctx.beginPath();
            ctx.moveTo(bx - lineW * 0.3, by);
            ctx.lineTo(bx + lineW * 0.3, by + 1);
            ctx.stroke();
          }
          ctx.restore();
        }
      } else {
        // Thin twigs — simpler
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.quadraticCurveTo(swayedCpX, cpY, swayedEndX, ceY);
        ctx.strokeStyle = `rgba(${darkR},${darkG},${darkB},${0.5 + p * 0.5})`;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round'; ctx.stroke();
      }

      // Draw leaves once branch is 65% grown
      if (b.progress > 0.65) {
        const lp = Math.min((b.progress - 0.65) / 0.35, 1);
        b.leaves.forEach(leaf => drawLeaf(leaf, t, lp, windForce));
      }

      if (p >= 0.25) b.children.forEach(c => drawBranch(c, t));
    };

    /* ─── DRAW: Single leaf — multiple shapes ──── */
    const drawLeaf = (leaf: Leaf, t: number, lp: number, wind: number) => {
      const sway = Math.sin(t * leaf.swayFreq + leaf.swayPhase) * 2;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const dx = mx - leaf.baseX, dy = my - leaf.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Magnetic pull toward cursor
      let magX = 0, magY = 0;
      if (dist < 55 && dist > 0) {
        const force = (1 - dist / 55) * 4;
        magX = (dx / dist) * force; magY = (dy / dist) * force;
        leaf.glowAmt = Math.min(leaf.glowAmt + 0.06, 1);
      } else {
        leaf.glowAmt = Math.max(leaf.glowAmt - 0.025, 0);
      }

      leaf.x = leaf.baseX + sway + wind * 2.5 + magX;
      leaf.y = leaf.baseY + Math.sin(t * 0.001 + leaf.swayPhase) * 0.6 + magY;

      // Depth rendering
      const depthScale = leaf.depthLayer === 0 ? 0.8 : leaf.depthLayer === 1 ? 1.0 : 1.15;
      const depthAlpha = leaf.depthLayer === 0 ? 0.55 : leaf.depthLayer === 1 ? 0.8 : 1.0;

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      const flutter = Math.sin(t * 0.0015 + leaf.swayPhase * 3) * 0.03;
      ctx.rotate(leaf.rotation + Math.sin(t * 0.0006 + leaf.swayPhase) * 0.05 + flutter);
      ctx.globalAlpha = leaf.opacity * lp * depthAlpha;

      const s = leaf.size * (0.85 + lp * 0.15) * (1 + leaf.glowAmt * 0.15) * depthScale;

      // Glow effect on hover
      if (leaf.glowAmt > 0) {
        ctx.shadowColor = leaf.highlight;
        ctx.shadowBlur = 14 * leaf.glowAmt;
      }

      // ── Draw leaf shape based on variety ──
      ctx.beginPath();
      switch (leaf.shape) {
        case 0: // Classic pointed leaf
          ctx.moveTo(0, -s * 0.85);
          ctx.bezierCurveTo(s * 0.5, -s * 0.4, s * 0.5, s * 0.15, s * 0.05, s * 0.5);
          ctx.bezierCurveTo(-s * 0.05, s * 0.5, -s * 0.5, s * 0.15, -s * 0.5, -s * 0.4);
          ctx.closePath();
          break;
        case 1: // Rounded broad leaf
          ctx.moveTo(0, -s * 0.7);
          ctx.bezierCurveTo(s * 0.6, -s * 0.35, s * 0.55, s * 0.3, 0, s * 0.55);
          ctx.bezierCurveTo(-s * 0.55, s * 0.3, -s * 0.6, -s * 0.35, 0, -s * 0.7);
          break;
        case 2: // Narrow willow-like leaf
          ctx.moveTo(0, -s * 0.9);
          ctx.bezierCurveTo(s * 0.25, -s * 0.45, s * 0.3, s * 0.2, 0, s * 0.65);
          ctx.bezierCurveTo(-s * 0.3, s * 0.2, -s * 0.25, -s * 0.45, 0, -s * 0.9);
          break;
        case 3: // Asymmetric natural leaf
          ctx.moveTo(0, -s * 0.8);
          ctx.bezierCurveTo(s * 0.55, -s * 0.3, s * 0.45, s * 0.25, s * 0.05, s * 0.5);
          ctx.bezierCurveTo(-s * 0.1, s * 0.45, -s * 0.5, s * 0.1, -s * 0.4, -s * 0.4);
          ctx.closePath();
          break;
      }

      // Fill with subtle gradient
      const baseColor = leaf.glowAmt > 0.3 ? leaf.highlight : leaf.color;
      ctx.fillStyle = baseColor;
      ctx.fill();

      // Subtle darker edge
      ctx.strokeStyle = `rgba(0,0,0,0.06)`;
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // Reset shadow before vein drawing
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Central vein — delicate
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.65);
      ctx.quadraticCurveTo(0.3, 0, 0, s * 0.4);
      ctx.strokeStyle = `rgba(255,255,255,${0.18 + leaf.glowAmt * 0.12})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Side veins — subtle
      if (s > 8) {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.3); ctx.lineTo(s * 0.25, -s * 0.12);
        ctx.moveTo(0, -s * 0.05); ctx.lineTo(-s * 0.22, s * 0.08);
        ctx.moveTo(0, s * 0.12); ctx.lineTo(s * 0.18, s * 0.24);
        ctx.strokeStyle = `rgba(255,255,255,${0.08 + leaf.glowAmt * 0.06})`;
        ctx.lineWidth = 0.25;
        ctx.stroke();
      }

      ctx.restore();
    };

    /* ─── DRAW: Glass dome — premium glass effect ─── */
    const drawDome = (t: number) => {
      ctx.save();

      // Dome glass fill — very subtle
      ctx.beginPath();
      ctx.ellipse(DX, DBY, DRX, DRY, 0, Math.PI, 0);
      ctx.closePath();
      const dg = ctx.createLinearGradient(DX - DRX, DBY - DRY, DX + DRX, DBY);
      dg.addColorStop(0, 'rgba(230,240,235,0.06)');
      dg.addColorStop(0.3, 'rgba(255,255,255,0.02)');
      dg.addColorStop(0.7, 'rgba(240,245,240,0.03)');
      dg.addColorStop(1, 'rgba(220,230,225,0.05)');
      ctx.fillStyle = dg;
      ctx.fill();

      // Outer edge — subtle glass border
      ctx.beginPath();
      ctx.ellipse(DX, DBY, DRX, DRY, 0, Math.PI, 0);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(120,140,130,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner highlight stroke
      ctx.beginPath();
      ctx.ellipse(DX, DBY, DRX - 3, DRY - 3, 0, Math.PI, 0);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Left reflection — long, elegant
      ctx.beginPath();
      ctx.ellipse(DX - DRX * 0.52, DBY - DRY * 0.45, 8, DRY * 0.35, -0.18, 0, Math.PI * 2);
      const rg = ctx.createRadialGradient(
        DX - DRX * 0.52, DBY - DRY * 0.45, 0,
        DX - DRX * 0.52, DBY - DRY * 0.45, DRY * 0.35
      );
      rg.addColorStop(0, 'rgba(255,255,255,0.18)');
      rg.addColorStop(0.4, 'rgba(255,255,255,0.05)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.fill();

      // Top crown highlight
      ctx.beginPath();
      ctx.ellipse(DX - 15, DBY - DRY + 25, 30, 7, -0.05, 0, Math.PI * 2);
      const th = ctx.createRadialGradient(DX - 15, DBY - DRY + 25, 0, DX - 15, DBY - DRY + 25, 30);
      th.addColorStop(0, 'rgba(255,255,255,0.14)');
      th.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = th;
      ctx.fill();

      // Prismatic light — rainbow refraction on right edge
      const prismY = DBY - DRY * 0.3 + Math.sin(t * 0.00025) * 15;
      const prismColors = [
        'rgba(255,180,180,0.06)', 'rgba(255,220,150,0.05)',
        'rgba(180,255,180,0.04)', 'rgba(150,200,255,0.05)',
        'rgba(200,170,255,0.04)',
      ];
      for (let i = 0; i < prismColors.length; i++) {
        ctx.beginPath();
        ctx.ellipse(DX + DRX * 0.44 + i * 2.5, prismY + i * 5, 3, 12 + i * 2.5, 0.25, 0, Math.PI * 2);
        ctx.fillStyle = prismColors[i];
        ctx.fill();
      }

      // Condensation drops
      for (const drop of dropsRef.current) {
        drop.angle += drop.speed * 0.0015;
        if (drop.angle > -0.04) {
          drop.angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.5;
          drop.opacity = 0.08 + Math.random() * 0.1;
          drop.size = 1 + Math.random() * 1.5;
        }
        drop.x = DX + Math.cos(drop.angle) * DRX * 0.97;
        drop.y = DBY + Math.sin(drop.angle) * DRY * 0.97;

        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,210,${drop.opacity})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(drop.x - drop.size * 0.25, drop.y - drop.size * 0.25, drop.size * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${drop.opacity * 0.7})`;
        ctx.fill();
      }

      // Moving sparkle
      const sa = t * 0.0003;
      const spx = DX + Math.cos(sa) * DRX * 0.5;
      const spy = DBY - DRY * 0.35 + Math.sin(sa * 1.3) * 30;
      const salpha = (Math.sin(t * 0.002) + 1) * 0.08 + 0.03;

      ctx.save();
      ctx.translate(spx, spy); ctx.rotate(t * 0.0008);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 4, Math.sin(a) * 4);
      }
      ctx.strokeStyle = `rgba(255,255,255,${salpha})`; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${salpha * 1.4})`; ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    /* ─── DRAW: Canopy shadow on soil ──────────── */
    const drawCanopyShadow = () => {
      if (!grownRef.current) return;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(DX, DBY - 5, 90, 12, 0, 0, Math.PI * 2);
      const shg = ctx.createRadialGradient(DX, DBY - 5, 0, DX, DBY - 5, 90);
      shg.addColorStop(0, 'rgba(25,50,20,0.1)');
      shg.addColorStop(0.6, 'rgba(25,50,20,0.04)');
      shg.addColorStop(1, 'rgba(25,50,20,0)');
      ctx.fillStyle = shg; ctx.fill();
      ctx.restore();
    };

    /* ─── DRAW: Canopy ambient glow ─────────────── */
    const drawCanopyGlow = (t: number) => {
      if (leavesRef.current.length === 0) return;
      let minX = W, maxX = 0, minY = H, maxY = 0;
      for (const l of leavesRef.current) {
        if (l.baseX < minX) minX = l.baseX;
        if (l.baseX > maxX) maxX = l.baseX;
        if (l.baseY < minY) minY = l.baseY;
        if (l.baseY > maxY) maxY = l.baseY;
      }
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      const r = Math.max(maxX - minX, maxY - minY) / 2 + 40;
      const breathe = Math.sin(t * 0.0004) * 0.01 + 1;

      ctx.save();
      const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * breathe);
      gg.addColorStop(0, 'rgba(60,120,50,0.05)');
      gg.addColorStop(0.5, 'rgba(80,140,70,0.025)');
      gg.addColorStop(1, 'rgba(100,160,90,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(cx, cy, r * breathe, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    /* ─── DRAW: Dappled light through canopy ───── */
    const drawDappledLight = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      const spots = [
        { x: DX - 35, y: DBY - 180, r: 18 },
        { x: DX + 25, y: DBY - 200, r: 14 },
        { x: DX - 10, y: DBY - 145, r: 20 },
        { x: DX + 50, y: DBY - 165, r: 12 },
        { x: DX - 50, y: DBY - 220, r: 10 },
      ];
      for (let i = 0; i < spots.length; i++) {
        const sp = spots[i];
        const drift = Math.sin(t * 0.00025 + i * 1.5) * 8;
        const alpha = (Math.sin(t * 0.0004 + i * 2) + 1) * 0.025 + 0.01;
        const lg = ctx.createRadialGradient(sp.x + drift, sp.y, 0, sp.x + drift, sp.y, sp.r);
        lg.addColorStop(0, `rgba(255,255,210,${alpha})`);
        lg.addColorStop(1, 'rgba(255,255,210,0)');
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.arc(sp.x + drift, sp.y, sp.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    };

    /* ─── DRAW: Golden fireflies ───────────────── */
    const drawFireflies = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      for (const f of firefliesRef.current) {
        f.x = f.baseX + Math.cos(t * f.speed + f.phase) * f.radius;
        f.y = f.baseY + Math.sin(t * f.speed * 1.3 + f.phase) * f.radius * 0.6;
        const pulse = (Math.sin(t * 0.0025 + f.phase) + 1) * 0.5;
        const alpha = pulse * f.brightness * 0.3;

        const gg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 7);
        gg.addColorStop(0, `rgba(255,230,140,${alpha})`);
        gg.addColorStop(0.4, `rgba(255,210,100,${alpha * 0.35})`);
        gg.addColorStop(1, 'rgba(255,200,80,0)');
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(f.x, f.y, 7, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath(); ctx.arc(f.x, f.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,245,200,${alpha * 1.3})`; ctx.fill();
      }
      ctx.restore();
    };

    /* ─── DRAW: Falling leaves ─────────────────── */
    const updateFallingLeaves = (t: number) => {
      if (!grownRef.current) return;

      if (t - lastFallTime.current > 5000 && leavesRef.current.length > 0) {
        lastFallTime.current = t;
        const src = leavesRef.current[Math.floor(Math.random() * leavesRef.current.length)];
        fallingRef.current.push({
          x: src.baseX, y: src.baseY,
          vx: (Math.random() - 0.5) * 0.25,
          vy: 0.25 + Math.random() * 0.15,
          rotation: src.rotation,
          rotSpeed: (Math.random() - 0.5) * 0.015,
          size: src.size * 0.75,
          color: src.color,
          opacity: 0.7,
          life: 1,
        });
      }

      ctx.save();
      fallingRef.current = fallingRef.current.filter(fl => {
        fl.x += fl.vx + Math.sin(t * 0.0015 + fl.rotation) * 0.12;
        fl.y += fl.vy;
        fl.rotation += fl.rotSpeed;
        fl.life -= 0.0025;
        fl.opacity = fl.life * 0.7;

        if (fl.life <= 0 || fl.y > DBY) return false;

        ctx.save();
        ctx.translate(fl.x, fl.y);
        ctx.rotate(fl.rotation);
        ctx.globalAlpha = fl.opacity;

        const s = fl.size * fl.life;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.8);
        ctx.bezierCurveTo(s * 0.45, -s * 0.35, s * 0.45, s * 0.2, 0, s * 0.5);
        ctx.bezierCurveTo(-s * 0.45, s * 0.2, -s * 0.45, -s * 0.35, 0, -s * 0.8);
        ctx.fillStyle = fl.color;
        ctx.fill();
        ctx.restore();

        return true;
      });
      ctx.restore();
    };

    /* ─── Growth animation ─────────────────────── */
    const growTree = (b: Branch, parentP: number) => {
      const spd = b.depth === 0 ? 0.04 : 0.035;
      if (parentP > 0.12) b.progress = Math.min(b.progress + spd, 1);
      b.children.forEach(c => growTree(c, b.progress));
    };

    /* ─── Hover detection ──────────────────────── */
    const checkHover = () => {
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      let closest: Leaf | null = null, cd = 25;
      for (const l of leavesRef.current) {
        const d = Math.sqrt((mx - l.x) ** 2 + (my - l.y) ** 2);
        if (d < cd) { cd = d; closest = l; }
      }
      if (closest !== hoveredRef.current) {
        hoveredRef.current = closest;
        if (closest?.supporterName && grownRef.current) {
          const rect = canvas.getBoundingClientRect();
          setTooltip({
            x: (closest.x / W) * rect.width,
            y: (closest.y / H) * rect.height - 14,
            name: closest.supporterName,
          });
        } else setTooltip(null);
      }
    };

    /* ─── Main animation loop ──────────────────── */
    const animate = (ts: number) => {
      ctx.clearRect(0, 0, W, H);
      if (treeRef.current) {
        treeRef.current.progress = Math.min(treeRef.current.progress + 0.04, 1);
        growTree(treeRef.current, 1);
        if (treeRef.current.progress >= 1) grownRef.current = true;

        // Render back to front
        drawCanopyShadow();
        drawBase();
        if (grownRef.current) drawCanopyGlow(ts);
        drawBranch(treeRef.current, ts);
        if (grownRef.current) {
          drawDappledLight(ts);
          updateFallingLeaves(ts);
          drawFireflies(ts);
        }
        drawDome(ts);
        checkHover();
      }

      mouseRef.current.vx *= 0.87;
      mouseRef.current.vy *= 0.92;

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchstart', onTouch);
      cancelAnimationFrame(animRef.current);
    };
  }, [buildBranch]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div
        className="absolute rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(60,110,50,0.2) 0%, transparent 70%)',
          width: '130%', height: '130%', top: '-15%', left: '-15%',
        }}
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="relative z-10 cursor-pointer"
          style={{ width: '100%', maxWidth: 560, height: 'auto', aspectRatio: '560 / 620' }}
        />
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-200"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div
              className="px-4 py-2 rounded-full text-[11px] font-medium text-white whitespace-nowrap shadow-lg"
              style={{ backgroundColor: 'rgba(45,80,40,0.9)', backdropFilter: 'blur(10px)' }}
            >
              {tooltip.name}&apos;s leaf
            </div>
          </div>
        )}
      </div>
      <p className="mt-4 text-[11px] text-[var(--color-text-muted)] tracking-[0.14em] uppercase opacity-35">
        Hover the leaves
      </p>
    </div>
  );
}
