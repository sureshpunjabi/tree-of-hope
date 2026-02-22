'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/* ─── Types ────────────────────────────────────────── */
interface Branch {
  startX: number; startY: number; endX: number; endY: number;
  width: number; depth: number; angle: number; length: number;
  progress: number; children: Branch[]; leaves: Leaf[];
}

interface Leaf {
  x: number; y: number; baseX: number; baseY: number;
  size: number; color: string; highlight: string;
  rotation: number; opacity: number;
  swayPhase: number; swayFreq: number;
  depthLayer: number; // 0=back 1=mid 2=front
  glowAmt: number;
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
  angle: number; // position on dome arc
}

/* ─── Palette ──────────────────────────────────────── */
const COLORS = [
  { fill: '#3D6E35', hi: '#5A9C4E' }, { fill: '#4A7C3F', hi: '#6AAE58' },
  { fill: '#5B9A4A', hi: '#7DC06A' }, { fill: '#2E7D32', hi: '#4CAF50' },
  { fill: '#558B2F', hi: '#7CB342' }, { fill: '#43A047', hi: '#66BB6A' },
  { fill: '#6DB85A', hi: '#8ED47A' }, { fill: '#82C46E', hi: '#A0DC8E' },
  { fill: '#8BC34A', hi: '#AED581' }, { fill: '#689F38', hi: '#8BC34A' },
  { fill: '#33691E', hi: '#558B2F' }, { fill: '#1B5E20', hi: '#2E7D32' },
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

  /* ─── Build fractal tree ───────────────────────── */
  const buildBranch = useCallback((
    x: number, y: number, angle: number, len: number, w: number, depth: number
  ): Branch => {
    const jitter = (Math.random() - 0.5) * 0.16;
    const ex = x + Math.cos(angle + jitter) * len;
    const ey = y + Math.sin(angle + jitter) * len;

    const b: Branch = {
      startX: x, startY: y, endX: ex, endY: ey,
      width: w, depth, angle, length: len, progress: 0,
      children: [], leaves: [],
    };

    if (depth < 8 && len > 8) {
      const n = depth < 2 ? 3 : depth < 4 ? (Math.random() > 0.3 ? 3 : 2) : (Math.random() > 0.5 ? 2 : 3);
      for (let i = 0; i < n; i++) {
        const spread = depth < 3 ? 0.35 + Math.random() * 0.35 : 0.25 + Math.random() * 0.5;
        const off = n === 2 ? (i === 0 ? -spread : spread)
          : (i === 0 ? -spread : i === 1 ? spread : (Math.random() - 0.5) * 0.5);
        const decay = 0.62 + Math.random() * 0.13;
        b.children.push(buildBranch(ex, ey, angle + off, len * decay, w * 0.68, depth + 1));
      }
    }

    // Leaves on depth 3+
    if (depth >= 3) {
      const count = depth >= 6 ? 4 + Math.floor(Math.random() * 5) :
        depth >= 4 ? 3 + Math.floor(Math.random() * 4) : 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const sp = depth >= 5 ? 22 : 18;
        const lx = ex + (Math.random() - 0.5) * sp * 2;
        const ly = ey + (Math.random() - 0.5) * sp * 2;
        const c = COLORS[Math.floor(Math.random() * COLORS.length)];
        const leaf: Leaf = {
          x: lx, y: ly, baseX: lx, baseY: ly,
          size: 8 + Math.random() * 12 + (depth >= 5 ? 4 : 0),
          color: c.fill, highlight: c.hi,
          rotation: Math.random() * Math.PI * 2,
          opacity: 0.8 + Math.random() * 0.2,
          swayPhase: Math.random() * Math.PI * 2,
          swayFreq: 0.001 + Math.random() * 0.001,
          depthLayer: depth >= 6 ? 2 : depth >= 4 ? 1 : 0,
          glowAmt: 0,
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
    const W = 500, H = 550;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    leavesRef.current = [];
    fallingRef.current = [];
    nameIdx.current = 0;
    treeRef.current = buildBranch(W / 2, H - 85, -Math.PI / 2, 130, 18, 0);

    // Dome geometry
    const DX = W / 2, DBY = H - 65, DRX = 190, DRY = 255;

    // Create fireflies
    firefliesRef.current = [];
    for (let i = 0; i < 12; i++) {
      firefliesRef.current.push({
        x: DX, y: DBY - 150,
        baseX: DX - 100 + Math.random() * 200,
        baseY: DBY - 40 - Math.random() * 200,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0003 + Math.random() * 0.0005,
        radius: 15 + Math.random() * 30,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }

    // Create condensation drops
    dropsRef.current = [];
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI * 0.15 - Math.random() * Math.PI * 0.5;
      dropsRef.current.push({
        x: DX + Math.cos(a) * DRX * 0.96,
        y: DBY + Math.sin(a) * DRY * 0.96,
        size: 1.5 + Math.random() * 2,
        speed: 0.015 + Math.random() * 0.02,
        opacity: 0.12 + Math.random() * 0.15,
        angle: a,
      });
    }

    // Mouse tracking with velocity
    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const sx = W / r.width, sy = H / r.height;
      const nx = (e.clientX - r.left) * sx, ny = (e.clientY - r.top) * sy;
      mouseRef.current.vx = nx - mouseRef.current.x;
      mouseRef.current.vy = ny - mouseRef.current.y;
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
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
      const baseW = DRX * 2 + 50, baseH = 30;
      const bx = DX - baseW / 2;

      // Shadow beneath entire dome
      ctx.beginPath();
      ctx.ellipse(DX, DBY + baseH + 6, baseW / 2 + 10, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fill();

      // Base
      const bg = ctx.createLinearGradient(bx, DBY, bx + baseW, DBY);
      bg.addColorStop(0, '#7A6548'); bg.addColorStop(0.3, '#9A8268');
      bg.addColorStop(0.5, '#B09878'); bg.addColorStop(0.7, '#9A8268');
      bg.addColorStop(1, '#7A6548');
      ctx.beginPath(); ctx.roundRect(bx, DBY, baseW, baseH, 10);
      ctx.fillStyle = bg; ctx.fill();

      // Rim
      ctx.beginPath(); ctx.roundRect(bx + 3, DBY, baseW - 6, 4, [4, 4, 0, 0]);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();

      // Underside
      ctx.beginPath(); ctx.roundRect(bx, DBY + baseH - 8, baseW, 8, [0, 0, 10, 10]);
      ctx.fillStyle = 'rgba(60,40,20,0.2)'; ctx.fill();

      // Soil ellipse
      ctx.beginPath();
      ctx.ellipse(DX, DBY - 2, DRX - 15, 18, 0, 0, Math.PI * 2);
      const sg = ctx.createRadialGradient(DX, DBY - 2, 0, DX, DBY - 2, DRX - 15);
      sg.addColorStop(0, 'rgba(101,80,56,0.4)');
      sg.addColorStop(0.6, 'rgba(101,80,56,0.25)');
      sg.addColorStop(1, 'rgba(101,80,56,0.05)');
      ctx.fillStyle = sg; ctx.fill();

      // Moss patches
      ctx.fillStyle = 'rgba(74,103,65,0.25)';
      for (let gx = DX - 110; gx < DX + 110; gx += 14 + Math.random() * 14) {
        ctx.beginPath();
        ctx.ellipse(gx, DBY - 5 + Math.random() * 6, 4 + Math.random() * 6, 2 + Math.random() * 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pebbles
      ctx.fillStyle = 'rgba(140,120,100,0.3)';
      [[DX - 60, DBY - 8, 4], [DX + 45, DBY - 6, 3.5], [DX - 25, DBY - 4, 2.5],
       [DX + 70, DBY - 7, 2.8], [DX - 80, DBY - 5, 2], [DX + 15, DBY - 3, 3],
       [DX - 95, DBY - 6, 2.2], [DX + 90, DBY - 5, 1.8]].forEach(([px, py, pr]) => {
        ctx.beginPath(); ctx.ellipse(px, py, pr, pr * 0.7, 0.3, 0, Math.PI * 2); ctx.fill();
      });

      ctx.restore();
    };

    /* ─── DRAW: Canopy shadow on soil ──────────── */
    const drawCanopyShadow = () => {
      if (!grownRef.current) return;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(DX, DBY - 6, 100, 14, 0, 0, Math.PI * 2);
      const shg = ctx.createRadialGradient(DX, DBY - 6, 0, DX, DBY - 6, 100);
      shg.addColorStop(0, 'rgba(30,60,25,0.12)');
      shg.addColorStop(0.6, 'rgba(30,60,25,0.05)');
      shg.addColorStop(1, 'rgba(30,60,25,0)');
      ctx.fillStyle = shg;
      ctx.fill();
      ctx.restore();
    };

    /* ─── DRAW: Glass dome ─────────────────────── */
    const drawDome = (t: number) => {
      ctx.save();

      // Dome glass fill
      ctx.beginPath();
      ctx.ellipse(DX, DBY, DRX, DRY, 0, Math.PI, 0); ctx.closePath();
      const dg = ctx.createLinearGradient(DX, DBY - DRY, DX, DBY);
      dg.addColorStop(0, 'rgba(220,235,220,0.07)');
      dg.addColorStop(0.4, 'rgba(255,255,255,0.02)');
      dg.addColorStop(1, 'rgba(200,210,200,0.05)');
      ctx.fillStyle = dg; ctx.fill();

      // Edge stroke
      ctx.beginPath();
      ctx.ellipse(DX, DBY, DRX, DRY, 0, Math.PI, 0); ctx.closePath();
      ctx.strokeStyle = 'rgba(140,155,140,0.5)'; ctx.lineWidth = 2.5; ctx.stroke();

      // Inner highlight
      ctx.beginPath();
      ctx.ellipse(DX, DBY, DRX - 3, DRY - 3, 0, Math.PI, 0);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; ctx.stroke();

      // Left reflection
      ctx.beginPath();
      ctx.ellipse(DX - DRX * 0.5, DBY - DRY * 0.5, 12, DRY * 0.3, -0.25, 0, Math.PI * 2);
      const rg = ctx.createRadialGradient(DX - DRX * 0.5, DBY - DRY * 0.5, 0, DX - DRX * 0.5, DBY - DRY * 0.5, DRY * 0.3);
      rg.addColorStop(0, 'rgba(255,255,255,0.2)'); rg.addColorStop(0.5, 'rgba(255,255,255,0.06)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg; ctx.fill();

      // Top highlight
      ctx.beginPath();
      ctx.ellipse(DX - 20, DBY - DRY + 30, 25, 8, -0.1, 0, Math.PI * 2);
      const th = ctx.createRadialGradient(DX - 20, DBY - DRY + 30, 0, DX - 20, DBY - DRY + 30, 25);
      th.addColorStop(0, 'rgba(255,255,255,0.16)'); th.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = th; ctx.fill();

      // ── Prismatic light refraction on right edge ──
      const prismY = DBY - DRY * 0.35 + Math.sin(t * 0.0003) * 20;
      const prismColors = [
        'rgba(255,180,180,0.08)', 'rgba(255,220,150,0.07)', 'rgba(180,255,180,0.06)',
        'rgba(150,200,255,0.07)', 'rgba(200,170,255,0.06)',
      ];
      for (let i = 0; i < prismColors.length; i++) {
        ctx.beginPath();
        ctx.ellipse(DX + DRX * 0.42 + i * 3, prismY + i * 6, 4, 15 + i * 3, 0.3, 0, Math.PI * 2);
        ctx.fillStyle = prismColors[i]; ctx.fill();
      }

      // ── Condensation drops ──
      for (const drop of dropsRef.current) {
        // Slowly slide down
        drop.angle += drop.speed * 0.002;
        if (drop.angle > -0.05) {
          drop.angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.5;
          drop.opacity = 0.12 + Math.random() * 0.15;
          drop.size = 1.5 + Math.random() * 2;
        }
        drop.x = DX + Math.cos(drop.angle) * DRX * 0.96;
        drop.y = DBY + Math.sin(drop.angle) * DRY * 0.96;

        // Draw drop
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,210,${drop.opacity})`;
        ctx.fill();
        // Tiny highlight
        ctx.beginPath();
        ctx.arc(drop.x - drop.size * 0.3, drop.y - drop.size * 0.3, drop.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${drop.opacity * 0.8})`;
        ctx.fill();
      }

      // ── Moving sparkle ──
      const sa = t * 0.0004;
      const sx = DX + Math.cos(sa) * DRX * 0.55;
      const sy = DBY - DRY * 0.4 + Math.sin(sa * 1.3) * 40;
      const salpha = (Math.sin(t * 0.003) + 1) * 0.12 + 0.04;

      ctx.save();
      ctx.translate(sx, sy); ctx.rotate(t * 0.001);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 5, Math.sin(a) * 5);
      }
      ctx.strokeStyle = `rgba(255,255,255,${salpha})`; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${salpha * 1.5})`; ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    /* ─── DRAW: Branch + leaves ────────────────── */
    const drawBranch = (b: Branch, t: number) => {
      if (b.progress <= 0) return;
      const p = Math.min(b.progress, 1);
      const ceX = b.startX + (b.endX - b.startX) * p;
      const ceY = b.startY + (b.endY - b.startY) * p;

      // Mouse wind — gentle breeze from mouse velocity
      const mv = mouseRef.current;
      const rawWind = mv.x > 0 ? (mv.vx || 0) * 0.0004 * b.depth : 0;
      const windForce = Math.max(-3, Math.min(3, rawWind)); // clamp
      const ambientSway = Math.sin(t * 0.0008 + b.depth * 0.7) * b.depth * 0.2;
      const totalSway = ambientSway + windForce * 2;

      const cpX = (b.startX + ceX) / 2 + totalSway;
      const cpY = (b.startY + ceY) / 2;
      const tipX = ceX + totalSway;

      // Dark outline for thick branches
      if (b.depth < 4 && b.width > 3) {
        ctx.beginPath(); ctx.moveTo(b.startX, b.startY);
        ctx.quadraticCurveTo(cpX, cpY, tipX, ceY);
        const dr = Math.max(30, 65 - b.depth * 6);
        const dg = Math.max(22, 45 - b.depth * 5);
        const db = Math.max(15, 32 - b.depth * 4);
        ctx.strokeStyle = `rgb(${dr},${dg},${db})`;
        ctx.lineWidth = Math.max(2, b.width * p) + 1.5;
        ctx.lineCap = 'round'; ctx.stroke();
      }

      // Main branch
      ctx.beginPath(); ctx.moveTo(b.startX, b.startY);
      ctx.quadraticCurveTo(cpX, cpY, tipX, ceY);
      const r = Math.max(45, 95 - b.depth * 5);
      const g = Math.max(32, 68 - b.depth * 4);
      const bl = Math.max(22, 48 - b.depth * 3);
      ctx.strokeStyle = `rgb(${r},${g},${bl})`;
      ctx.lineWidth = Math.max(1.2, b.width * p);
      ctx.lineCap = 'round'; ctx.stroke();

      // Bark highlight
      if (b.depth < 3 && b.width > 5) {
        ctx.beginPath(); ctx.moveTo(b.startX + 1, b.startY);
        ctx.quadraticCurveTo(cpX + 1, cpY, tipX + 1, ceY);
        ctx.strokeStyle = 'rgba(180,155,130,0.25)';
        ctx.lineWidth = Math.max(1, b.width * p * 0.3); ctx.stroke();
      }

      // Draw leaves
      if (b.progress > 0.7) {
        const lp = Math.min((b.progress - 0.7) / 0.3, 1);
        b.leaves.forEach(leaf => drawLeaf(leaf, t, lp, windForce));
      }

      if (p >= 0.3) b.children.forEach(c => drawBranch(c, t));
    };

    /* ─── DRAW: Single leaf ────────────────────── */
    const drawLeaf = (leaf: Leaf, t: number, lp: number, wind: number) => {
      const sway = Math.sin(t * leaf.swayFreq + leaf.swayPhase) * 2.5;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const dx = mx - leaf.baseX, dy = my - leaf.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Magnetic pull
      let magX = 0, magY = 0;
      if (dist < 65 && dist > 0) {
        const force = (1 - dist / 65) * 5;
        magX = (dx / dist) * force; magY = (dy / dist) * force;
        leaf.glowAmt = Math.min(leaf.glowAmt + 0.08, 1);
      } else {
        leaf.glowAmt = Math.max(leaf.glowAmt - 0.03, 0);
      }

      leaf.x = leaf.baseX + sway + wind * 3 + magX;
      leaf.y = leaf.baseY + Math.sin(t * 0.0012 + leaf.swayPhase) * 0.8 + magY;

      // Depth-based rendering — back leaves smaller/dimmer, front bigger/brighter
      const depthScale = leaf.depthLayer === 0 ? 0.85 : leaf.depthLayer === 1 ? 1.0 : 1.12;
      const depthAlpha = leaf.depthLayer === 0 ? 0.65 : leaf.depthLayer === 1 ? 0.85 : 1.0;

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      // Flutter animation — different per leaf
      const flutter = Math.sin(t * 0.002 + leaf.swayPhase * 3) * 0.04;
      ctx.rotate(leaf.rotation + Math.sin(t * 0.0008 + leaf.swayPhase) * 0.06 + flutter);
      ctx.globalAlpha = leaf.opacity * lp * depthAlpha;

      if (leaf.glowAmt > 0) {
        ctx.shadowColor = leaf.highlight;
        ctx.shadowBlur = 16 * leaf.glowAmt;
      }

      const s = leaf.size * (0.9 + lp * 0.1) * (1 + leaf.glowAmt * 0.2) * depthScale;

      // Leaf shape
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.9);
      ctx.bezierCurveTo(s * 0.55, -s * 0.5, s * 0.6, s * 0.1, s * 0.1, s * 0.55);
      ctx.bezierCurveTo(0, s * 0.65, 0, s * 0.65, -s * 0.1, s * 0.55);
      ctx.bezierCurveTo(-s * 0.6, s * 0.1, -s * 0.55, -s * 0.5, 0, -s * 0.9);
      ctx.closePath();

      ctx.fillStyle = leaf.glowAmt > 0.3 ? leaf.highlight : leaf.color;
      ctx.fill();

      // Edge
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 0.4; ctx.stroke();

      // Central vein
      ctx.beginPath(); ctx.moveTo(0, -s * 0.7); ctx.quadraticCurveTo(0.5, 0, 0, s * 0.45);
      ctx.strokeStyle = `rgba(255,255,255,${0.2 + leaf.glowAmt * 0.15})`;
      ctx.lineWidth = 0.7; ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.stroke();

      // Side veins
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.3); ctx.lineTo(s * 0.3, -s * 0.15);
      ctx.moveTo(0, -s * 0.05); ctx.lineTo(-s * 0.28, s * 0.1);
      ctx.moveTo(0, s * 0.15); ctx.lineTo(s * 0.22, s * 0.28);
      ctx.strokeStyle = `rgba(255,255,255,${0.12 + leaf.glowAmt * 0.08})`;
      ctx.lineWidth = 0.35; ctx.stroke();

      ctx.restore();
    };

    /* ─── DRAW: Golden fireflies ───────────────── */
    const drawFireflies = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      for (const f of firefliesRef.current) {
        f.x = f.baseX + Math.cos(t * f.speed + f.phase) * f.radius;
        f.y = f.baseY + Math.sin(t * f.speed * 1.3 + f.phase) * f.radius * 0.6;
        const pulse = (Math.sin(t * 0.003 + f.phase) + 1) * 0.5;
        const alpha = pulse * f.brightness * 0.35;

        // Outer glow
        const gg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 8);
        gg.addColorStop(0, `rgba(255,230,140,${alpha})`);
        gg.addColorStop(0.4, `rgba(255,210,100,${alpha * 0.4})`);
        gg.addColorStop(1, `rgba(255,200,80,0)`);
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(f.x, f.y, 8, 0, Math.PI * 2); ctx.fill();

        // Core
        ctx.beginPath(); ctx.arc(f.x, f.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,245,200,${alpha * 1.5})`; ctx.fill();
      }
      ctx.restore();
    };

    /* ─── DRAW: Falling leaves ─────────────────── */
    const updateFallingLeaves = (t: number) => {
      if (!grownRef.current) return;

      // Spawn a new falling leaf every ~4 seconds
      if (t - lastFallTime.current > 4000 && leavesRef.current.length > 0) {
        lastFallTime.current = t;
        const src = leavesRef.current[Math.floor(Math.random() * leavesRef.current.length)];
        fallingRef.current.push({
          x: src.baseX, y: src.baseY,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.3 + Math.random() * 0.2,
          rotation: src.rotation,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          size: src.size * 0.8,
          color: src.color,
          opacity: 0.8,
          life: 1,
        });
      }

      // Update and draw
      ctx.save();
      fallingRef.current = fallingRef.current.filter(fl => {
        fl.x += fl.vx + Math.sin(t * 0.002 + fl.rotation) * 0.15;
        fl.y += fl.vy;
        fl.rotation += fl.rotSpeed;
        fl.life -= 0.003;
        fl.opacity = fl.life;

        if (fl.life <= 0 || fl.y > DBY) return false;

        ctx.save();
        ctx.translate(fl.x, fl.y);
        ctx.rotate(fl.rotation);
        ctx.globalAlpha = fl.opacity * 0.7;

        const s = fl.size * fl.life;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.9);
        ctx.bezierCurveTo(s * 0.55, -s * 0.5, s * 0.6, s * 0.1, s * 0.1, s * 0.55);
        ctx.bezierCurveTo(0, s * 0.65, 0, s * 0.65, -s * 0.1, s * 0.55);
        ctx.bezierCurveTo(-s * 0.6, s * 0.1, -s * 0.55, -s * 0.5, 0, -s * 0.9);
        ctx.closePath();
        ctx.fillStyle = fl.color; ctx.fill();
        ctx.restore();

        return true;
      });
      ctx.restore();
    };

    /* ─── DRAW: Dappled light ──────────────────── */
    const drawDappledLight = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      const spots = [
        { x: DX - 40, y: DBY - 180, r: 20 },
        { x: DX + 30, y: DBY - 200, r: 16 },
        { x: DX - 10, y: DBY - 140, r: 22 },
        { x: DX + 55, y: DBY - 160, r: 14 },
      ];
      for (let i = 0; i < spots.length; i++) {
        const sp = spots[i];
        const drift = Math.sin(t * 0.0003 + i * 1.5) * 10;
        const alpha = (Math.sin(t * 0.0005 + i * 2) + 1) * 0.03 + 0.015;
        const lg = ctx.createRadialGradient(sp.x + drift, sp.y, 0, sp.x + drift, sp.y, sp.r);
        lg.addColorStop(0, `rgba(255,255,220,${alpha})`);
        lg.addColorStop(1, 'rgba(255,255,220,0)');
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.arc(sp.x + drift, sp.y, sp.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    };

    /* ─── DRAW: Canopy glow ────────────────────── */
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
      const rx = (maxX - minX) / 2 + 35, ry = (maxY - minY) / 2 + 30;
      const breathe = Math.sin(t * 0.0005) * 0.015 + 1;
      ctx.save();
      const blobs = [
        { x: cx, y: cy, r: Math.max(rx, ry) * 0.7 },
        { x: cx - rx * 0.3, y: cy - ry * 0.25, r: Math.max(rx, ry) * 0.5 },
        { x: cx + rx * 0.3, y: cy + ry * 0.1, r: Math.max(rx, ry) * 0.5 },
      ];
      for (const blob of blobs) {
        const gg = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r * breathe);
        gg.addColorStop(0, 'rgba(74,130,65,0.06)');
        gg.addColorStop(0.5, 'rgba(90,150,80,0.03)');
        gg.addColorStop(1, 'rgba(100,170,90,0)');
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(blob.x, blob.y, blob.r * breathe, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    };

    /* ─── Growth ───────────────────────────────── */
    const growTree = (b: Branch, parentP: number) => {
      const spd = b.depth === 0 ? 0.05 : 0.04;
      if (parentP > 0.15) b.progress = Math.min(b.progress + spd, 1);
      b.children.forEach(c => growTree(c, b.progress));
    };

    /* ─── Hover detection ──────────────────────── */
    const checkHover = () => {
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      let closest: Leaf | null = null, cd = 28;
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
            y: (closest.y / H) * rect.height - 16,
            name: closest.supporterName,
          });
        } else setTooltip(null);
      }
    };

    /* ─── Main loop ────────────────────────────── */
    const animate = (ts: number) => {
      ctx.clearRect(0, 0, W, H);
      if (treeRef.current) {
        treeRef.current.progress = Math.min(treeRef.current.progress + 0.05, 1);
        growTree(treeRef.current, 1);
        if (treeRef.current.progress >= 1) grownRef.current = true;

        // Render layers back-to-front
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

      // Decay mouse velocity
      mouseRef.current.vx *= 0.85;
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
        className="absolute rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74,124,63,0.25) 0%, transparent 70%)',
          width: '120%', height: '120%', top: '-10%', left: '-10%',
        }}
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="relative z-10 cursor-pointer"
          style={{ width: '100%', maxWidth: 500, height: 'auto', aspectRatio: '500 / 550' }}
        />
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div
              className="px-3.5 py-1.5 rounded-full text-[11px] font-medium text-white whitespace-nowrap shadow-lg"
              style={{ backgroundColor: 'rgba(74,103,65,0.92)', backdropFilter: 'blur(8px)' }}
            >
              {tooltip.name}&apos;s leaf
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] text-[var(--color-text-muted)] tracking-[0.12em] uppercase opacity-40">
        Hover the leaves
      </p>
    </div>
  );
}
