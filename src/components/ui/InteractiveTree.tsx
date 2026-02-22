'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/* ─── Types ────────────────────────────────────────── */
interface Branch {
  startX: number; startY: number; endX: number; endY: number;
  cpX: number; cpY: number;
  width: number; depth: number; angle: number; length: number;
  progress: number; children: Branch[]; leaves: Leaf[];
  barkSeed: number;
}

interface Leaf {
  x: number; y: number; baseX: number; baseY: number;
  size: number; color: string; highlight: string; shadowColor: string;
  rotation: number; opacity: number;
  swayPhase: number; swayFreq: number;
  depthLayer: number; // 0=far-back 1=back 2=mid 3=front
  glowAmt: number;
  shape: number;
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

interface DustMote {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; life: number; maxLife: number;
}

/* ─── Cinematic palette — earthy, warm, rich ─── */
const COLORS = [
  { fill: '#1B4332', hi: '#2D6A4F', sh: '#0B2918' },
  { fill: '#22543D', hi: '#38A169', sh: '#1A3A2A' },
  { fill: '#2D6A4F', hi: '#52B788', sh: '#1B4332' },
  { fill: '#3A7D5B', hi: '#6BC18F', sh: '#245040' },
  { fill: '#48855E', hi: '#7DC99A', sh: '#2E5C3C' },
  { fill: '#5B9A4A', hi: '#8ED47A', sh: '#3E6C32' },
  { fill: '#6DB85A', hi: '#A0DC8E', sh: '#4A8040' },
  { fill: '#7EC850', hi: '#B5E8A0', sh: '#5A9040' },
  { fill: '#82C46E', hi: '#B5E8A0', sh: '#5A9050' },
  { fill: '#8BC34A', hi: '#C5E1A5', sh: '#689F38' },
  { fill: '#97C97A', hi: '#C8EDAA', sh: '#72A858' },
  { fill: '#A5D68C', hi: '#D4EDBA', sh: '#7AB868' },
  // Warm accents — autumn touches
  { fill: '#C9B458', hi: '#E0D080', sh: '#A89838' },
  { fill: '#B8A040', hi: '#D4C068', sh: '#988830' },
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
  const dustRef = useRef<DustMote[]>([]);
  const hoveredRef = useRef<Leaf | null>(null);
  const grownRef = useRef(false);
  const nameIdx = useRef(0);
  const lastFallTime = useRef(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);

  /* ─── Build organic fractal tree ─────────────── */
  const buildBranch = useCallback((
    x: number, y: number, angle: number, len: number, w: number, depth: number
  ): Branch => {
    const jitter = (Math.random() - 0.5) * (depth < 2 ? 0.1 : 0.25);
    const endAngle = angle + jitter;
    const ex = x + Math.cos(endAngle) * len;
    const ey = y + Math.sin(endAngle) * len;

    // Organic S-curve control point
    const perpAngle = endAngle + Math.PI / 2;
    const cpOffset = (Math.random() - 0.5) * len * (depth < 2 ? 0.18 : 0.35);
    const midX = (x + ex) / 2 + Math.cos(perpAngle) * cpOffset;
    const midY = (y + ey) / 2 + Math.sin(perpAngle) * cpOffset;

    const b: Branch = {
      startX: x, startY: y, endX: ex, endY: ey,
      cpX: midX, cpY: midY,
      width: w, depth, angle: endAngle, length: len, progress: 0,
      children: [], leaves: [],
      barkSeed: Math.random() * 1000,
    };

    if (depth < 8 && len > 8) {
      const n = depth < 2 ? 2 + (Math.random() > 0.6 ? 1 : 0) :
                depth < 4 ? 2 + (Math.random() > 0.5 ? 1 : 0) :
                depth < 6 ? (Math.random() > 0.3 ? 2 : 1) :
                Math.random() > 0.5 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const spread = depth < 2 ? 0.28 + Math.random() * 0.3 :
                       depth < 4 ? 0.22 + Math.random() * 0.42 :
                       0.18 + Math.random() * 0.55;
        const off = n === 1 ? (Math.random() - 0.5) * 0.6 :
                    n === 2 ? (i === 0 ? -spread : spread) :
                    (i === 0 ? -spread : i === 1 ? spread : (Math.random() - 0.5) * 0.4);
        const decay = 0.55 + Math.random() * 0.18;
        b.children.push(buildBranch(ex, ey, endAngle + off, len * decay, w * 0.6, depth + 1));
      }
    }

    // Leaves — lush but not overcrowded
    if (depth >= 3) {
      const count = depth >= 7 ? 4 + Math.floor(Math.random() * 3) :
                    depth >= 5 ? 3 + Math.floor(Math.random() * 3) :
                    depth >= 4 ? 2 + Math.floor(Math.random() * 2) :
                    1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const sp = depth >= 5 ? 28 : 22;
        const lx = ex + (Math.random() - 0.5) * sp * 2.5;
        const ly = ey + (Math.random() - 0.5) * sp * 2;
        // Mostly green, occasional warm accent
        const ci = Math.random() < 0.06
          ? COLORS.length - 2 + Math.floor(Math.random() * 2)
          : Math.floor(Math.random() * (COLORS.length - 2));
        const c = COLORS[ci];
        const leaf: Leaf = {
          x: lx, y: ly, baseX: lx, baseY: ly,
          size: 7 + Math.random() * 10 + (depth >= 6 ? 3 : 0),
          color: c.fill, highlight: c.hi, shadowColor: c.sh,
          rotation: Math.random() * Math.PI * 2,
          opacity: 0.7 + Math.random() * 0.3,
          swayPhase: Math.random() * Math.PI * 2,
          swayFreq: 0.0007 + Math.random() * 0.0009,
          depthLayer: depth >= 7 ? 3 : depth >= 5 ? 2 : depth >= 4 ? 1 : 0,
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
    const W = 620, H = 680;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    leavesRef.current = [];
    fallingRef.current = [];
    nameIdx.current = 0;

    // Tree origin — centered, with room for roots below
    const TX = W / 2, TY = H - 110;
    treeRef.current = buildBranch(TX, TY, -Math.PI / 2 + (Math.random() - 0.5) * 0.06, 140, 26, 0);

    // Light source — upper left (golden hour feel)
    const LIGHT_X = W * 0.15, LIGHT_Y = H * 0.05;

    // Fireflies — scattered through canopy area
    firefliesRef.current = [];
    for (let i = 0; i < 14; i++) {
      firefliesRef.current.push({
        x: TX, y: TY - 200,
        baseX: TX - 160 + Math.random() * 320,
        baseY: TY - 60 - Math.random() * 300,
        phase: Math.random() * Math.PI * 2,
        speed: 0.00015 + Math.random() * 0.00035,
        radius: 25 + Math.random() * 45,
        brightness: 0.25 + Math.random() * 0.75,
      });
    }

    // Dust motes — golden particles in the light
    dustRef.current = [];
    for (let i = 0; i < 20; i++) {
      dustRef.current.push({
        x: LIGHT_X + Math.random() * W * 0.5,
        y: LIGHT_Y + Math.random() * H * 0.6,
        vx: (Math.random() - 0.5) * 0.08,
        vy: 0.02 + Math.random() * 0.06,
        size: 0.5 + Math.random() * 1.5,
        opacity: Math.random() * 0.25,
        life: Math.random(),
        maxLife: 0.8 + Math.random() * 0.2,
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

    /* ─── DRAW: Ground plane — soft shadow, grass hints ───── */
    const drawGround = () => {
      ctx.save();

      // Large soft ground shadow beneath tree
      const sg = ctx.createRadialGradient(TX, TY + 15, 0, TX, TY + 15, 180);
      sg.addColorStop(0, 'rgba(20,35,15,0.14)');
      sg.addColorStop(0.4, 'rgba(20,35,15,0.06)');
      sg.addColorStop(0.7, 'rgba(20,35,15,0.02)');
      sg.addColorStop(1, 'rgba(20,35,15,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(TX, TY + 15, 180, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Subtle earth/soil mound at base
      const eg = ctx.createRadialGradient(TX, TY + 5, 0, TX, TY + 5, 90);
      eg.addColorStop(0, 'rgba(75,55,35,0.18)');
      eg.addColorStop(0.5, 'rgba(75,55,35,0.08)');
      eg.addColorStop(1, 'rgba(75,55,35,0)');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.ellipse(TX, TY + 5, 90, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tiny grass blades around base
      ctx.strokeStyle = 'rgba(60,100,45,0.12)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 24; i++) {
        const gx = TX - 80 + Math.random() * 160;
        const gy = TY + 5 + Math.random() * 12;
        const gh = 4 + Math.random() * 8;
        const lean = (Math.random() - 0.5) * 0.4;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.quadraticCurveTo(gx + lean * 6, gy - gh * 0.6, gx + lean * 10, gy - gh);
        ctx.stroke();
      }

      // Scattered tiny fallen leaves on the ground
      const groundLeafColors = ['rgba(140,120,60,0.15)', 'rgba(100,130,50,0.12)', 'rgba(160,140,70,0.1)'];
      for (let i = 0; i < 8; i++) {
        const glx = TX - 100 + Math.random() * 200;
        const gly = TY + 2 + Math.random() * 18;
        ctx.save();
        ctx.translate(glx, gly);
        ctx.rotate(Math.random() * Math.PI * 2);
        ctx.fillStyle = groundLeafColors[i % groundLeafColors.length];
        ctx.beginPath();
        const gs = 2 + Math.random() * 3;
        ctx.ellipse(0, 0, gs, gs * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    };

    /* ─── DRAW: Exposed roots ────────────────────── */
    const drawRoots = () => {
      ctx.save();
      const roots = [
        { angle: -0.3, len: 55, w: 8, curve: 12 },
        { angle: 0.25, len: 50, w: 7, curve: -10 },
        { angle: -0.6, len: 40, w: 5, curve: 8 },
        { angle: 0.55, len: 45, w: 6, curve: -14 },
        { angle: -0.12, len: 35, w: 4, curve: 6 },
        { angle: 0.08, len: 38, w: 5, curve: -5 },
      ];

      for (const root of roots) {
        const rx = TX + Math.cos(Math.PI / 2 + root.angle) * 10;
        const ry = TY + 2;
        const rex = rx + Math.cos(root.angle + Math.PI / 2.5) * root.len;
        const rey = ry + Math.abs(Math.sin(root.angle + Math.PI / 2.5)) * root.len * 0.35 + 8;
        const rcpx = (rx + rex) / 2 + root.curve;
        const rcpy = (ry + rey) / 2 + 5;

        // Root shadow
        ctx.beginPath();
        ctx.moveTo(rx + 1, ry + 1);
        ctx.quadraticCurveTo(rcpx + 1, rcpy + 2, rex + 1, rey + 1);
        ctx.strokeStyle = 'rgba(15,10,5,0.08)';
        ctx.lineWidth = root.w + 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Root body
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.quadraticCurveTo(rcpx, rcpy, rex, rey);
        const rg = ctx.createLinearGradient(rx, ry, rex, rey);
        rg.addColorStop(0, 'rgb(65,45,30)');
        rg.addColorStop(0.5, 'rgb(58,40,25)');
        rg.addColorStop(1, 'rgb(50,35,22)');
        ctx.strokeStyle = rg;
        ctx.lineWidth = root.w;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Root highlight
        ctx.beginPath();
        ctx.moveTo(rx - 1, ry);
        ctx.quadraticCurveTo(rcpx - 1, rcpy, rex - 1, rey);
        ctx.strokeStyle = 'rgba(120,90,60,0.15)';
        ctx.lineWidth = Math.max(1, root.w * 0.25);
        ctx.stroke();
      }
      ctx.restore();
    };

    /* ─── DRAW: Branch with rich bark ──────────── */
    const drawBranch = (b: Branch, t: number) => {
      if (b.progress <= 0) return;
      const p = Math.min(b.progress, 1);

      const ceX = b.startX + (b.endX - b.startX) * p;
      const ceY = b.startY + (b.endY - b.startY) * p;
      const cpX = b.startX + (b.cpX - b.startX) * p;
      const cpY = b.startY + (b.cpY - b.startY) * p;

      // Wind
      const mv = mouseRef.current;
      const rawWind = mv.x > 0 ? (mv.vx || 0) * 0.00025 * b.depth : 0;
      const windForce = Math.max(-2, Math.min(2, rawWind));
      const ambientSway = Math.sin(t * 0.0005 + b.depth * 0.9 + b.barkSeed) * b.depth * 0.12;
      const totalSway = ambientSway + windForce * 1.5;

      const swayedCpX = cpX + totalSway * 0.5;
      const swayedEndX = ceX + totalSway;

      const lineW = Math.max(0.8, b.width * p);

      // Bark colors — rich warm brown with per-branch variation
      const warmth = Math.sin(b.barkSeed) * 12;
      const darkR = Math.max(30, 68 - b.depth * 3.5 + warmth);
      const darkG = Math.max(20, 46 - b.depth * 2.8 + warmth * 0.4);
      const darkB = Math.max(12, 32 - b.depth * 2);

      const lightR = darkR + 35;
      const lightG = darkG + 25;
      const lightB = darkB + 18;

      // Directional lighting — branches facing light source get highlights
      const branchMidX = (b.startX + ceX) / 2;
      const branchMidY = (b.startY + ceY) / 2;
      const toLight = Math.atan2(LIGHT_Y - branchMidY, LIGHT_X - branchMidX);
      const branchAngle = Math.atan2(ceY - b.startY, ceX - b.startX);
      const lightFacing = (Math.cos(toLight - branchAngle) + 1) / 2; // 0-1

      if (b.depth < 5 && lineW > 1.5) {
        // Shadow
        ctx.beginPath();
        ctx.moveTo(b.startX + 1.5, b.startY + 1.5);
        ctx.quadraticCurveTo(swayedCpX + 1.5, cpY + 1.5, swayedEndX + 1.5, ceY + 1.5);
        ctx.strokeStyle = 'rgba(15,10,5,0.15)';
        ctx.lineWidth = lineW + 3;
        ctx.lineCap = 'round'; ctx.stroke();

        // Main bark
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.quadraticCurveTo(swayedCpX, cpY, swayedEndX, ceY);
        ctx.strokeStyle = `rgb(${darkR},${darkG},${darkB})`;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round'; ctx.stroke();

        // Light-side highlight — stronger on light-facing branches
        if (lineW > 3) {
          const hiAlpha = 0.2 + lightFacing * 0.25;
          ctx.beginPath();
          ctx.moveTo(b.startX - lineW * 0.18, b.startY);
          ctx.quadraticCurveTo(swayedCpX - lineW * 0.18, cpY, swayedEndX - lineW * 0.18, ceY);
          ctx.strokeStyle = `rgba(${lightR},${lightG},${lightB},${hiAlpha})`;
          ctx.lineWidth = Math.max(1, lineW * 0.3);
          ctx.stroke();
        }

        // Dark side
        if (lineW > 4) {
          ctx.beginPath();
          ctx.moveTo(b.startX + lineW * 0.22, b.startY);
          ctx.quadraticCurveTo(swayedCpX + lineW * 0.22, cpY, swayedEndX + lineW * 0.22, ceY);
          ctx.strokeStyle = `rgba(${Math.max(0, darkR - 25)},${Math.max(0, darkG - 18)},${Math.max(0, darkB - 12)},0.25)`;
          ctx.lineWidth = Math.max(0.8, lineW * 0.22);
          ctx.stroke();
        }

        // Bark texture — knots and horizontal lines
        if (b.depth < 3 && lineW > 8) {
          ctx.save();
          ctx.strokeStyle = 'rgba(35,22,12,0.12)';
          ctx.lineWidth = 0.6;
          const segs = Math.floor(b.length / 10);
          for (let i = 1; i < segs && i < 10; i++) {
            const frac = i / segs;
            const bx = b.startX + (swayedEndX - b.startX) * frac;
            const by = b.startY + (ceY - b.startY) * frac;
            const knotW = lineW * (0.25 + Math.random() * 0.15);
            ctx.beginPath();
            ctx.moveTo(bx - knotW, by + (Math.random() - 0.5) * 2);
            ctx.lineTo(bx + knotW, by + (Math.random() - 0.5) * 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Rim light on trunk from directional light
        if (b.depth < 2 && lineW > 12 && lightFacing > 0.4) {
          ctx.beginPath();
          ctx.moveTo(b.startX - lineW * 0.42, b.startY);
          ctx.quadraticCurveTo(swayedCpX - lineW * 0.42, cpY, swayedEndX - lineW * 0.42, ceY);
          ctx.strokeStyle = `rgba(255,220,160,${0.06 * lightFacing})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else {
        // Thin twigs
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.quadraticCurveTo(swayedCpX, cpY, swayedEndX, ceY);
        ctx.strokeStyle = `rgba(${darkR},${darkG},${darkB},${0.4 + p * 0.6})`;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round'; ctx.stroke();
      }

      // Draw leaves once branch is 60% grown
      if (b.progress > 0.6) {
        const lp = Math.min((b.progress - 0.6) / 0.4, 1);
        b.leaves.forEach(leaf => drawLeaf(leaf, t, lp, windForce));
      }

      if (p >= 0.2) b.children.forEach(c => drawBranch(c, t));
    };

    /* ─── DRAW: Cinematic leaf — gradient fill, shadow, vein detail ──── */
    const drawLeaf = (leaf: Leaf, t: number, lp: number, wind: number) => {
      const sway = Math.sin(t * leaf.swayFreq + leaf.swayPhase) * 2.2;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const dx = mx - leaf.baseX, dy = my - leaf.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let magX = 0, magY = 0;
      if (dist < 60 && dist > 0) {
        const force = (1 - dist / 60) * 5;
        magX = (dx / dist) * force; magY = (dy / dist) * force;
        leaf.glowAmt = Math.min(leaf.glowAmt + 0.07, 1);
      } else {
        leaf.glowAmt = Math.max(leaf.glowAmt - 0.02, 0);
      }

      leaf.x = leaf.baseX + sway + wind * 3 + magX;
      leaf.y = leaf.baseY + Math.sin(t * 0.0009 + leaf.swayPhase) * 0.8 + magY;

      // 4-layer depth rendering
      const depthScale = [0.7, 0.85, 1.0, 1.18][leaf.depthLayer];
      const depthAlpha = [0.4, 0.6, 0.85, 1.0][leaf.depthLayer];
      const depthBlur = leaf.depthLayer === 0 ? 0.3 : 0;

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      const flutter = Math.sin(t * 0.0013 + leaf.swayPhase * 3) * 0.04;
      ctx.rotate(leaf.rotation + Math.sin(t * 0.0005 + leaf.swayPhase) * 0.06 + flutter);
      ctx.globalAlpha = leaf.opacity * lp * depthAlpha;

      const s = leaf.size * (0.8 + lp * 0.2) * (1 + leaf.glowAmt * 0.18) * depthScale;

      // Subtle depth blur for far-back leaves
      if (depthBlur > 0) {
        ctx.filter = `blur(${depthBlur}px)`;
      }

      // Leaf shadow — tiny offset for depth
      if (leaf.depthLayer >= 2) {
        ctx.save();
        ctx.translate(1.5, 2);
        ctx.globalAlpha *= 0.1;
        drawLeafShape(ctx, s, leaf.shape);
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();
        ctx.restore();
      }

      // Glow effect on hover
      if (leaf.glowAmt > 0) {
        ctx.shadowColor = leaf.highlight;
        ctx.shadowBlur = 18 * leaf.glowAmt;
      }

      // Draw main leaf shape
      drawLeafShape(ctx, s, leaf.shape);

      // Gradient fill — light direction aware
      const toLight = Math.atan2(LIGHT_Y - leaf.y, LIGHT_X - leaf.x);
      const gx1 = Math.cos(toLight) * s * 0.5;
      const gy1 = Math.sin(toLight) * s * 0.5;
      const lg = ctx.createLinearGradient(gx1, gy1, -gx1, -gy1);
      const baseColor = leaf.glowAmt > 0.3 ? leaf.highlight : leaf.color;
      lg.addColorStop(0, leaf.highlight);
      lg.addColorStop(0.4, baseColor);
      lg.addColorStop(1, leaf.shadowColor);
      ctx.fillStyle = lg;
      ctx.fill();

      // Subtle edge
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.filter = 'none';

      // Central vein
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.6);
      ctx.quadraticCurveTo(0.4, 0, 0, s * 0.4);
      ctx.strokeStyle = `rgba(255,255,255,${0.2 + leaf.glowAmt * 0.15})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Side veins
      if (s > 8) {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.35); ctx.lineTo(s * 0.28, -s * 0.15);
        ctx.moveTo(0, -s * 0.08); ctx.lineTo(-s * 0.25, s * 0.06);
        ctx.moveTo(0, s * 0.1); ctx.lineTo(s * 0.2, s * 0.22);
        ctx.strokeStyle = `rgba(255,255,255,${0.08 + leaf.glowAmt * 0.08})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      ctx.restore();
    };

    /* ─── Leaf shape paths ─────────────────────── */
    const drawLeafShape = (c: CanvasRenderingContext2D, s: number, shape: number) => {
      c.beginPath();
      switch (shape) {
        case 0: // Classic pointed
          c.moveTo(0, -s * 0.85);
          c.bezierCurveTo(s * 0.5, -s * 0.4, s * 0.5, s * 0.15, s * 0.05, s * 0.5);
          c.bezierCurveTo(-s * 0.05, s * 0.5, -s * 0.5, s * 0.15, -s * 0.5, -s * 0.4);
          c.closePath();
          break;
        case 1: // Broad rounded
          c.moveTo(0, -s * 0.7);
          c.bezierCurveTo(s * 0.6, -s * 0.35, s * 0.55, s * 0.3, 0, s * 0.55);
          c.bezierCurveTo(-s * 0.55, s * 0.3, -s * 0.6, -s * 0.35, 0, -s * 0.7);
          break;
        case 2: // Narrow willow
          c.moveTo(0, -s * 0.9);
          c.bezierCurveTo(s * 0.25, -s * 0.45, s * 0.3, s * 0.2, 0, s * 0.65);
          c.bezierCurveTo(-s * 0.3, s * 0.2, -s * 0.25, -s * 0.45, 0, -s * 0.9);
          break;
        case 3: // Asymmetric natural
          c.moveTo(0, -s * 0.8);
          c.bezierCurveTo(s * 0.55, -s * 0.3, s * 0.45, s * 0.25, s * 0.05, s * 0.5);
          c.bezierCurveTo(-s * 0.1, s * 0.45, -s * 0.5, s * 0.1, -s * 0.4, -s * 0.4);
          c.closePath();
          break;
      }
    };

    /* ─── DRAW: Canopy shadow on ground ────────── */
    const drawCanopyShadow = () => {
      if (!grownRef.current) return;
      ctx.save();
      // Soft, large shadow from canopy
      const csg = ctx.createRadialGradient(TX + 15, TY + 8, 0, TX + 15, TY + 8, 120);
      csg.addColorStop(0, 'rgba(15,30,10,0.12)');
      csg.addColorStop(0.5, 'rgba(15,30,10,0.05)');
      csg.addColorStop(1, 'rgba(15,30,10,0)');
      ctx.fillStyle = csg;
      ctx.beginPath();
      ctx.ellipse(TX + 15, TY + 8, 120, 18, 0.1, 0, Math.PI * 2);
      ctx.fill();
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
      const r = Math.max(maxX - minX, maxY - minY) / 2 + 50;
      const breathe = Math.sin(t * 0.0003) * 0.015 + 1;

      ctx.save();
      const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * breathe);
      gg.addColorStop(0, 'rgba(50,100,40,0.06)');
      gg.addColorStop(0.5, 'rgba(70,120,55,0.025)');
      gg.addColorStop(1, 'rgba(90,140,70,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(cx, cy, r * breathe, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    /* ─── DRAW: Volumetric light rays through canopy ── */
    const drawLightRays = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // 5 soft light shafts from upper-left through canopy gaps
      const rays = [
        { x: TX - 60, w: 35, angle: 0.3, speed: 0.00015 },
        { x: TX - 20, w: 25, angle: 0.25, speed: 0.0002 },
        { x: TX + 30, w: 30, angle: 0.35, speed: 0.00018 },
        { x: TX + 70, w: 20, angle: 0.28, speed: 0.00022 },
        { x: TX - 100, w: 22, angle: 0.32, speed: 0.00016 },
      ];

      for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];
        const shimmer = Math.sin(t * ray.speed + i * 2.1) * 0.5 + 0.5;
        const alpha = shimmer * 0.035;
        if (alpha < 0.005) continue;

        const topX = LIGHT_X + (ray.x - LIGHT_X) * 0.3;
        const topY = LIGHT_Y + 40;
        const botX = ray.x + Math.sin(ray.angle) * ray.w * 2;
        const botY = TY + 20;

        const lg = ctx.createLinearGradient(topX, topY, botX, botY);
        lg.addColorStop(0, `rgba(255,235,180,${alpha * 0.3})`);
        lg.addColorStop(0.3, `rgba(255,230,160,${alpha})`);
        lg.addColorStop(0.7, `rgba(255,225,140,${alpha * 0.6})`);
        lg.addColorStop(1, `rgba(255,220,120,0)`);

        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(topX - ray.w * 0.3, topY);
        ctx.lineTo(botX - ray.w, botY);
        ctx.lineTo(botX + ray.w, botY);
        ctx.lineTo(topX + ray.w * 0.3, topY);
        ctx.closePath();
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    };

    /* ─── DRAW: Dappled light spots ──────────────── */
    const drawDappledLight = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      const spots = [
        { x: TX - 40, y: TY - 190, r: 20 },
        { x: TX + 30, y: TY - 220, r: 16 },
        { x: TX - 15, y: TY - 150, r: 22 },
        { x: TX + 55, y: TY - 175, r: 14 },
        { x: TX - 65, y: TY - 240, r: 12 },
        { x: TX + 10, y: TY - 280, r: 10 },
        { x: TX - 80, y: TY - 160, r: 16 },
      ];
      for (let i = 0; i < spots.length; i++) {
        const sp = spots[i];
        const drift = Math.sin(t * 0.0002 + i * 1.7) * 10;
        const alpha = (Math.sin(t * 0.00035 + i * 2.3) + 1) * 0.03 + 0.012;
        const lg = ctx.createRadialGradient(sp.x + drift, sp.y, 0, sp.x + drift, sp.y, sp.r);
        lg.addColorStop(0, `rgba(255,250,200,${alpha})`);
        lg.addColorStop(1, 'rgba(255,250,200,0)');
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
        const pulse = (Math.sin(t * 0.002 + f.phase) + 1) * 0.5;
        const alpha = pulse * f.brightness * 0.35;

        const gg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 8);
        gg.addColorStop(0, `rgba(255,235,150,${alpha})`);
        gg.addColorStop(0.4, `rgba(255,215,110,${alpha * 0.3})`);
        gg.addColorStop(1, 'rgba(255,200,80,0)');
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(f.x, f.y, 8, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath(); ctx.arc(f.x, f.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,210,${alpha * 1.5})`; ctx.fill();
      }
      ctx.restore();
    };

    /* ─── DRAW: Dust motes in light ────────────── */
    const drawDustMotes = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      for (const d of dustRef.current) {
        d.x += d.vx + Math.sin(t * 0.0003 + d.life * 10) * 0.02;
        d.y += d.vy;
        d.life -= 0.0008;

        if (d.life <= 0) {
          d.x = LIGHT_X + Math.random() * W * 0.5;
          d.y = LIGHT_Y + Math.random() * H * 0.3;
          d.life = d.maxLife;
          d.opacity = Math.random() * 0.2;
        }

        const fade = d.life > 0.8 ? (1 - d.life) / 0.2 : d.life > 0.2 ? 1 : d.life / 0.2;
        const alpha = d.opacity * fade;
        if (alpha < 0.005) continue;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,240,200,${alpha})`;
        ctx.fill();
      }
      ctx.restore();
    };

    /* ─── DRAW: Falling leaves ─────────────────── */
    const updateFallingLeaves = (t: number) => {
      if (!grownRef.current) return;

      if (t - lastFallTime.current > 4500 && leavesRef.current.length > 0) {
        lastFallTime.current = t;
        const src = leavesRef.current[Math.floor(Math.random() * leavesRef.current.length)];
        fallingRef.current.push({
          x: src.baseX, y: src.baseY,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.2 + Math.random() * 0.2,
          rotation: src.rotation,
          rotSpeed: (Math.random() - 0.5) * 0.018,
          size: src.size * 0.7,
          color: src.color,
          opacity: 0.65,
          life: 1,
        });
      }

      ctx.save();
      fallingRef.current = fallingRef.current.filter(fl => {
        fl.x += fl.vx + Math.sin(t * 0.0012 + fl.rotation) * 0.15;
        fl.y += fl.vy;
        fl.rotation += fl.rotSpeed;
        fl.life -= 0.002;
        fl.opacity = fl.life * 0.65;

        if (fl.life <= 0 || fl.y > TY + 30) return false;

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

    /* ─── DRAW: Soft vignette ──────────────────── */
    const drawVignette = () => {
      ctx.save();
      const vg = ctx.createRadialGradient(W / 2, H * 0.4, W * 0.25, W / 2, H * 0.4, W * 0.65);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.7, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.04)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    };

    /* ─── Growth animation ─────────────────────── */
    const growTree = (b: Branch, parentP: number) => {
      const spd = b.depth === 0 ? 0.035 : 0.03;
      if (parentP > 0.1) b.progress = Math.min(b.progress + spd, 1);
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
        treeRef.current.progress = Math.min(treeRef.current.progress + 0.035, 1);
        growTree(treeRef.current, 1);
        if (treeRef.current.progress >= 1) grownRef.current = true;

        // Render layers back to front
        drawCanopyShadow();
        drawGround();
        drawRoots();
        if (grownRef.current) drawCanopyGlow(ts);
        if (grownRef.current) drawLightRays(ts);
        drawBranch(treeRef.current, ts);
        if (grownRef.current) {
          drawDappledLight(ts);
          updateFallingLeaves(ts);
          drawFireflies(ts);
          drawDustMotes(ts);
        }
        drawVignette();
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
      {/* Warm ambient glow behind tree */}
      <div
        className="absolute rounded-full blur-3xl opacity-[0.07] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 40% 40%, rgba(255,220,150,0.3) 0%, rgba(60,110,50,0.15) 50%, transparent 70%)',
          width: '140%', height: '140%', top: '-20%', left: '-20%',
        }}
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="relative z-10 cursor-pointer"
          style={{ width: '100%', maxWidth: 620, height: 'auto', aspectRatio: '620 / 680' }}
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
      <p className="mt-4 text-[11px] text-[var(--color-text-muted)] tracking-[0.14em] uppercase opacity-30">
        Hover the leaves
      </p>
    </div>
  );
}
