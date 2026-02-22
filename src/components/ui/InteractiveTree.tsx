'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/* ─── Types ────────────────────────────────────────── */
interface Branch {
  startX: number; startY: number; endX: number; endY: number;
  cpX: number; cpY: number;
  width: number; depth: number; angle: number; length: number;
  progress: number; children: Branch[]; leaves: Leaf[];
  barkSeed: number;
  side: number; // -1 left, 0 center, 1 right — for asymmetry
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

/* ─── Rich palette — deep forest greens with warm highlights ─── */
const COLORS = [
  // Deep forest greens
  { fill: '#1B4332', hi: '#2D6A4F', sh: '#0B2918' },
  { fill: '#1E5038', hi: '#348E5C', sh: '#0E2D1C' },
  { fill: '#22543D', hi: '#38A169', sh: '#1A3A2A' },
  { fill: '#2D6A4F', hi: '#52B788', sh: '#1B4332' },
  // Mid greens
  { fill: '#3A7D5B', hi: '#6BC18F', sh: '#245040' },
  { fill: '#48855E', hi: '#7DC99A', sh: '#2E5C3C' },
  { fill: '#4C8C50', hi: '#82C86E', sh: '#336A35' },
  // Bright greens
  { fill: '#5B9A4A', hi: '#8ED47A', sh: '#3E6C32' },
  { fill: '#6DB85A', hi: '#A0DC8E', sh: '#4A8040' },
  { fill: '#7EC850', hi: '#B5E8A0', sh: '#5A9040' },
  // Light greens
  { fill: '#82C46E', hi: '#B5E8A0', sh: '#5A9050' },
  { fill: '#8BC34A', hi: '#C5E1A5', sh: '#689F38' },
  { fill: '#97C97A', hi: '#C8EDAA', sh: '#72A858' },
  { fill: '#A5D68C', hi: '#D4EDBA', sh: '#7AB868' },
  // Warm accents — golden autumn touches
  { fill: '#C9B458', hi: '#E0D080', sh: '#A89838' },
  { fill: '#B8A040', hi: '#D4C068', sh: '#988830' },
  { fill: '#D4A843', hi: '#E8C870', sh: '#B08828' },
];

const NAMES = [
  'James', 'Mom', 'Rachel', 'David & Ana', 'Coach Williams',
  'Priya', 'Marcus', 'The Nguyens', 'Elena', 'Dr. Mehta',
  'Anonymous', 'Sophie & Tom', 'Alex', 'Grandma Rose',
  'Uncle Ben', 'Sarah K.', 'The Patels', 'Mrs. Chen',
  'Jordan', 'Lila & Mike', 'Team Alpha', 'Dr. Shah',
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

  /* ─── Build organic fractal tree — gnarled and characterful ─── */
  const buildBranch = useCallback((
    x: number, y: number, angle: number, len: number, w: number,
    depth: number, side: number
  ): Branch => {
    // More dramatic jitter at higher depths for organic feel
    const jitterAmt = depth < 1 ? 0.06 : depth < 2 ? 0.15 : depth < 4 ? 0.28 : 0.38;
    const jitter = (Math.random() - 0.5) * jitterAmt;
    const endAngle = angle + jitter;
    const ex = x + Math.cos(endAngle) * len;
    const ey = y + Math.sin(endAngle) * len;

    // Strong S-curve control points — more pronounced on thick branches
    const perpAngle = endAngle + Math.PI / 2;
    const curviness = depth < 2 ? 0.22 : depth < 4 ? 0.38 : 0.3;
    const cpOffset = (Math.random() - 0.5) * len * curviness;
    const midX = (x + ex) / 2 + Math.cos(perpAngle) * cpOffset;
    const midY = (y + ey) / 2 + Math.sin(perpAngle) * cpOffset;

    const b: Branch = {
      startX: x, startY: y, endX: ex, endY: ey,
      cpX: midX, cpY: midY,
      width: w, depth, angle: endAngle, length: len, progress: 0,
      children: [], leaves: [],
      barkSeed: Math.random() * 1000,
      side,
    };

    if (depth < 9 && len > 6) {
      // Branching count — more generous for fuller canopy
      const n = depth < 1 ? 3 :
                depth < 2 ? 2 + (Math.random() > 0.35 ? 1 : 0) :
                depth < 4 ? 2 + (Math.random() > 0.45 ? 1 : 0) :
                depth < 6 ? (Math.random() > 0.2 ? 2 : 1) :
                Math.random() > 0.4 ? 2 : 1;

      for (let i = 0; i < n; i++) {
        // Spread — wider at lower depths for broad crown
        const spread = depth < 1 ? 0.35 + Math.random() * 0.35 :
                       depth < 3 ? 0.25 + Math.random() * 0.4 :
                       depth < 5 ? 0.2 + Math.random() * 0.5 :
                       0.15 + Math.random() * 0.55;
        const off = n === 1 ? (Math.random() - 0.5) * 0.5 :
                    n === 2 ? (i === 0 ? -spread : spread) :
                    (i === 0 ? -spread * 1.1 : i === 1 ? spread * 1.1 : (Math.random() - 0.5) * 0.3);

        const childSide = off < -0.1 ? -1 : off > 0.1 ? 1 : 0;

        // Length decay — slower for more substantial branches
        const decay = depth < 2 ? 0.58 + Math.random() * 0.15 :
                      depth < 4 ? 0.55 + Math.random() * 0.18 :
                      0.5 + Math.random() * 0.2;
        // Width tapers more gradually
        const widthDecay = depth < 2 ? 0.58 : depth < 4 ? 0.55 : 0.5;
        b.children.push(buildBranch(ex, ey, endAngle + off, len * decay, w * widthDecay, depth + 1, childSide));
      }
    }

    // Leaves — dense clusters at branch tips
    if (depth >= 3) {
      const count = depth >= 7 ? 5 + Math.floor(Math.random() * 4) :
                    depth >= 6 ? 4 + Math.floor(Math.random() * 3) :
                    depth >= 5 ? 3 + Math.floor(Math.random() * 3) :
                    depth >= 4 ? 2 + Math.floor(Math.random() * 3) :
                    1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        // Spread leaves more at tips, less near trunk
        const spreadFactor = depth >= 6 ? 35 : depth >= 4 ? 28 : 20;
        const lx = ex + (Math.random() - 0.5) * spreadFactor * 2;
        const ly = ey + (Math.random() - 0.5) * spreadFactor * 1.5;
        // Mostly green, 8% chance of warm accent
        const ci = Math.random() < 0.08
          ? COLORS.length - 3 + Math.floor(Math.random() * 3)
          : Math.floor(Math.random() * (COLORS.length - 3));
        const c = COLORS[ci];
        const leaf: Leaf = {
          x: lx, y: ly, baseX: lx, baseY: ly,
          size: 8 + Math.random() * 11 + (depth >= 7 ? 4 : depth >= 5 ? 2 : 0),
          color: c.fill, highlight: c.hi, shadowColor: c.sh,
          rotation: Math.random() * Math.PI * 2,
          opacity: 0.75 + Math.random() * 0.25,
          swayPhase: Math.random() * Math.PI * 2,
          swayFreq: 0.0006 + Math.random() * 0.001,
          depthLayer: depth >= 7 ? 3 : depth >= 6 ? (Math.random() > 0.3 ? 3 : 2) :
                      depth >= 5 ? 2 : depth >= 4 ? 1 : 0,
          glowAmt: 0,
          shape: Math.floor(Math.random() * 5), // 5 leaf shapes now
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
    const W = 680, H = 740;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    leavesRef.current = [];
    fallingRef.current = [];
    nameIdx.current = 0;

    // Tree origin — centered, with room for roots and ground
    const TX = W / 2, TY = H - 120;

    // Build tree — thicker trunk (36px), taller (155px), slightly tilted for character
    const tiltAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.08;
    treeRef.current = buildBranch(TX, TY, tiltAngle, 155, 36, 0, 0);

    // Light source — upper left (golden hour)
    const LIGHT_X = W * 0.12, LIGHT_Y = H * 0.03;

    // Fireflies
    firefliesRef.current = [];
    for (let i = 0; i < 18; i++) {
      firefliesRef.current.push({
        x: TX, y: TY - 200,
        baseX: TX - 180 + Math.random() * 360,
        baseY: TY - 80 - Math.random() * 340,
        phase: Math.random() * Math.PI * 2,
        speed: 0.00012 + Math.random() * 0.0004,
        radius: 20 + Math.random() * 55,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }

    // Dust motes
    dustRef.current = [];
    for (let i = 0; i < 28; i++) {
      dustRef.current.push({
        x: LIGHT_X + Math.random() * W * 0.6,
        y: LIGHT_Y + Math.random() * H * 0.55,
        vx: (Math.random() - 0.5) * 0.06,
        vy: 0.015 + Math.random() * 0.05,
        size: 0.6 + Math.random() * 2,
        opacity: 0.08 + Math.random() * 0.25,
        life: Math.random(),
        maxLife: 0.75 + Math.random() * 0.25,
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

    /* ─── DRAW: Ground plane — rich earth, moss, fallen leaves ─── */
    const drawGround = () => {
      ctx.save();

      // Large soft ground shadow beneath tree
      const sg = ctx.createRadialGradient(TX + 10, TY + 18, 0, TX + 10, TY + 18, 220);
      sg.addColorStop(0, 'rgba(15,30,12,0.18)');
      sg.addColorStop(0.3, 'rgba(15,30,12,0.1)');
      sg.addColorStop(0.6, 'rgba(15,30,12,0.04)');
      sg.addColorStop(1, 'rgba(15,30,12,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(TX + 10, TY + 18, 220, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rich earth mound at base
      const eg = ctx.createRadialGradient(TX, TY + 6, 0, TX, TY + 6, 110);
      eg.addColorStop(0, 'rgba(72,50,32,0.22)');
      eg.addColorStop(0.4, 'rgba(68,48,30,0.12)');
      eg.addColorStop(0.7, 'rgba(60,45,28,0.05)');
      eg.addColorStop(1, 'rgba(60,45,28,0)');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.ellipse(TX, TY + 6, 110, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Moss patches around base
      const mossColors = ['rgba(50,95,40,0.09)', 'rgba(60,110,50,0.07)', 'rgba(45,85,35,0.08)'];
      const mossPatches = [
        { x: TX - 50, y: TY + 8, rx: 28, ry: 6 },
        { x: TX + 40, y: TY + 12, rx: 22, ry: 5 },
        { x: TX - 20, y: TY + 15, rx: 18, ry: 4 },
        { x: TX + 70, y: TY + 10, rx: 15, ry: 4 },
      ];
      for (let i = 0; i < mossPatches.length; i++) {
        const m = mossPatches[i];
        ctx.fillStyle = mossColors[i % mossColors.length];
        ctx.beginPath();
        ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Grass blades — more visible, varied heights
      for (let i = 0; i < 40; i++) {
        const gx = TX - 120 + Math.random() * 240;
        const gy = TY + 4 + Math.random() * 20;
        const gh = 5 + Math.random() * 12;
        const lean = (Math.random() - 0.5) * 0.5;
        const gAlpha = 0.08 + Math.random() * 0.12;
        const gGreen = 70 + Math.floor(Math.random() * 50);
        ctx.strokeStyle = `rgba(50,${gGreen},35,${gAlpha})`;
        ctx.lineWidth = 0.6 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.quadraticCurveTo(gx + lean * 8, gy - gh * 0.6, gx + lean * 14, gy - gh);
        ctx.stroke();
      }

      // Scattered fallen leaves on ground
      const groundLeafColors = [
        'rgba(130,115,55,0.18)', 'rgba(90,120,45,0.15)', 'rgba(150,130,60,0.13)',
        'rgba(110,100,40,0.12)', 'rgba(80,105,50,0.14)'
      ];
      for (let i = 0; i < 12; i++) {
        const glx = TX - 130 + Math.random() * 260;
        const gly = TY + 3 + Math.random() * 24;
        ctx.save();
        ctx.translate(glx, gly);
        ctx.rotate(Math.random() * Math.PI * 2);
        ctx.fillStyle = groundLeafColors[i % groundLeafColors.length];
        ctx.beginPath();
        const gs = 2.5 + Math.random() * 4;
        ctx.ellipse(0, 0, gs, gs * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    };

    /* ─── DRAW: Thick exposed roots with knobby detail ─── */
    const drawRoots = () => {
      ctx.save();
      const roots = [
        { angle: -0.35, len: 70, w: 12, curve: 16, taper: 0.3 },
        { angle: 0.3, len: 65, w: 11, curve: -14, taper: 0.25 },
        { angle: -0.65, len: 50, w: 8, curve: 10, taper: 0.3 },
        { angle: 0.6, len: 55, w: 9, curve: -18, taper: 0.28 },
        { angle: -0.15, len: 45, w: 7, curve: 8, taper: 0.3 },
        { angle: 0.1, len: 48, w: 7, curve: -7, taper: 0.25 },
        { angle: -0.82, len: 35, w: 5, curve: 6, taper: 0.3 },
        { angle: 0.78, len: 38, w: 6, curve: -8, taper: 0.28 },
      ];

      for (const root of roots) {
        const rx = TX + Math.cos(Math.PI / 2 + root.angle) * 14;
        const ry = TY + 2;
        const rex = rx + Math.cos(root.angle + Math.PI / 2.5) * root.len;
        const rey = ry + Math.abs(Math.sin(root.angle + Math.PI / 2.5)) * root.len * 0.4 + 10;
        const rcpx = (rx + rex) / 2 + root.curve;
        const rcpy = (ry + rey) / 2 + 6;

        // Root shadow
        ctx.beginPath();
        ctx.moveTo(rx + 2, ry + 2);
        ctx.quadraticCurveTo(rcpx + 2, rcpy + 3, rex + 2, rey + 2);
        ctx.strokeStyle = 'rgba(12,8,4,0.12)';
        ctx.lineWidth = root.w + 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Root body — gradient from trunk color to darker tip
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.quadraticCurveTo(rcpx, rcpy, rex, rey);
        const rg = ctx.createLinearGradient(rx, ry, rex, rey);
        rg.addColorStop(0, 'rgb(62,42,28)');
        rg.addColorStop(0.4, 'rgb(55,38,24)');
        rg.addColorStop(0.8, 'rgb(48,34,20)');
        rg.addColorStop(1, 'rgb(42,30,18)');
        ctx.strokeStyle = rg;
        ctx.lineWidth = root.w;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Root highlight — top edge catching light
        ctx.beginPath();
        ctx.moveTo(rx - 1, ry - 0.5);
        ctx.quadraticCurveTo(rcpx - 1, rcpy - 1, rex - 1, rey - 0.5);
        ctx.strokeStyle = 'rgba(115,85,55,0.2)';
        ctx.lineWidth = Math.max(1.2, root.w * 0.22);
        ctx.stroke();

        // Root texture — small bumps/knobs
        if (root.w > 6) {
          const numBumps = Math.floor(root.len / 15);
          for (let i = 1; i < numBumps; i++) {
            const frac = i / numBumps;
            const bx = rx + (rex - rx) * frac + (Math.random() - 0.5) * 3;
            const by = ry + (rey - ry) * frac + (Math.random() - 0.5) * 2;
            const bumpSize = root.w * (1 - frac * root.taper) * 0.3;
            ctx.beginPath();
            ctx.arc(bx, by, bumpSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(50,35,22,${0.1 + Math.random() * 0.1})`;
            ctx.fill();
          }
        }
      }
      ctx.restore();
    };

    /* ─── DRAW: Branch with rich multi-pass bark rendering ──── */
    const drawBranch = (b: Branch, t: number) => {
      if (b.progress <= 0) return;
      const p = Math.min(b.progress, 1);

      const ceX = b.startX + (b.endX - b.startX) * p;
      const ceY = b.startY + (b.endY - b.startY) * p;
      const cpX = b.startX + (b.cpX - b.startX) * p;
      const cpY = b.startY + (b.cpY - b.startY) * p;

      // Wind — very gentle ambient sway
      const mv = mouseRef.current;
      const rawWind = mv.x > 0 ? (mv.vx || 0) * 0.0002 * b.depth : 0;
      const windForce = Math.max(-1.5, Math.min(1.5, rawWind));
      const ambientSway = Math.sin(t * 0.0004 + b.depth * 0.8 + b.barkSeed) * b.depth * 0.1;
      const totalSway = ambientSway + windForce * 1.2;

      const swayedCpX = cpX + totalSway * 0.4;
      const swayedEndX = ceX + totalSway;

      // Width with taper — thicker at base, thin at tips
      const taperP = depth0Width(b);
      const lineW = Math.max(0.6, taperP * p);

      // Bark colors — warm browns with per-branch variation
      const warmth = Math.sin(b.barkSeed) * 10;
      const barkAge = Math.max(0, 1 - b.depth / 9); // 1 at trunk, ~0 at tips
      const darkR = Math.max(28, 62 - b.depth * 3 + warmth);
      const darkG = Math.max(18, 42 - b.depth * 2.5 + warmth * 0.35);
      const darkB = Math.max(10, 28 - b.depth * 1.8);

      const lightR = darkR + 38;
      const lightG = darkG + 28;
      const lightB = darkB + 22;

      // Directional lighting
      const branchMidX = (b.startX + ceX) / 2;
      const branchMidY = (b.startY + ceY) / 2;
      const toLight = Math.atan2(LIGHT_Y - branchMidY, LIGHT_X - branchMidX);
      const branchAngle = Math.atan2(ceY - b.startY, ceX - b.startX);
      const lightFacing = (Math.cos(toLight - branchAngle) + 1) / 2;

      if (b.depth < 6 && lineW > 1.2) {
        // === SHADOW PASS ===
        ctx.beginPath();
        ctx.moveTo(b.startX + 2, b.startY + 2);
        ctx.quadraticCurveTo(swayedCpX + 2, cpY + 2, swayedEndX + 2, ceY + 2);
        ctx.strokeStyle = `rgba(10,6,3,${0.12 + barkAge * 0.06})`;
        ctx.lineWidth = lineW + 4;
        ctx.lineCap = 'round'; ctx.stroke();

        // === MAIN BARK PASS ===
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.quadraticCurveTo(swayedCpX, cpY, swayedEndX, ceY);
        // Rich gradient along branch length
        const barkGrad = ctx.createLinearGradient(b.startX, b.startY, swayedEndX, ceY);
        barkGrad.addColorStop(0, `rgb(${darkR + 5},${darkG + 3},${darkB + 2})`);
        barkGrad.addColorStop(0.5, `rgb(${darkR},${darkG},${darkB})`);
        barkGrad.addColorStop(1, `rgb(${Math.max(20, darkR - 8)},${Math.max(14, darkG - 6)},${Math.max(8, darkB - 4)})`);
        ctx.strokeStyle = barkGrad;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round'; ctx.stroke();

        // === LIGHT-SIDE HIGHLIGHT ===
        if (lineW > 2.5) {
          const hiAlpha = 0.18 + lightFacing * 0.3;
          ctx.beginPath();
          ctx.moveTo(b.startX - lineW * 0.2, b.startY);
          ctx.quadraticCurveTo(swayedCpX - lineW * 0.2, cpY, swayedEndX - lineW * 0.2, ceY);
          ctx.strokeStyle = `rgba(${lightR},${lightG},${lightB},${hiAlpha})`;
          ctx.lineWidth = Math.max(1, lineW * 0.32);
          ctx.stroke();
        }

        // === DARK-SIDE SHADOW ===
        if (lineW > 3.5) {
          ctx.beginPath();
          ctx.moveTo(b.startX + lineW * 0.22, b.startY);
          ctx.quadraticCurveTo(swayedCpX + lineW * 0.22, cpY, swayedEndX + lineW * 0.22, ceY);
          ctx.strokeStyle = `rgba(${Math.max(0, darkR - 28)},${Math.max(0, darkG - 20)},${Math.max(0, darkB - 14)},0.3)`;
          ctx.lineWidth = Math.max(0.8, lineW * 0.2);
          ctx.stroke();
        }

        // === BARK TEXTURE — horizontal grain lines ===
        if (b.depth < 3 && lineW > 8) {
          ctx.save();
          const segs = Math.floor(b.length / 8);
          for (let i = 1; i < segs && i < 14; i++) {
            const frac = i / segs;
            const bx = b.startX + (swayedEndX - b.startX) * frac;
            const by = b.startY + (ceY - b.startY) * frac;
            const knotW = lineW * (0.22 + Math.random() * 0.18);

            // Dark grain line
            ctx.beginPath();
            ctx.moveTo(bx - knotW, by + (Math.random() - 0.5) * 2.5);
            ctx.lineTo(bx + knotW, by + (Math.random() - 0.5) * 2.5);
            ctx.strokeStyle = `rgba(30,18,10,${0.08 + Math.random() * 0.06})`;
            ctx.lineWidth = 0.5 + Math.random() * 0.4;
            ctx.stroke();

            // Occasional knot — round bump
            if (Math.random() > 0.8 && lineW > 12) {
              const kx = bx + (Math.random() - 0.5) * lineW * 0.3;
              const ky = by + (Math.random() - 0.5) * 3;
              ctx.beginPath();
              ctx.arc(kx, ky, 1.5 + Math.random() * 2.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(40,25,15,${0.06 + Math.random() * 0.06})`;
              ctx.fill();
              // Knot highlight
              ctx.beginPath();
              ctx.arc(kx - 0.5, ky - 0.5, 0.8 + Math.random(), 0, Math.PI * 2);
              ctx.fillStyle = `rgba(100,75,50,${0.05 + Math.random() * 0.04})`;
              ctx.fill();
            }
          }
          ctx.restore();
        }

        // === RIM LIGHT on trunk — golden hour edge glow ===
        if (b.depth < 2 && lineW > 14 && lightFacing > 0.3) {
          ctx.beginPath();
          ctx.moveTo(b.startX - lineW * 0.44, b.startY);
          ctx.quadraticCurveTo(swayedCpX - lineW * 0.44, cpY, swayedEndX - lineW * 0.44, ceY);
          ctx.strokeStyle = `rgba(255,215,150,${0.04 + 0.06 * lightFacing})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        // === TRUNK BASE FLARE — wider at ground level ===
        if (b.depth === 0 && p > 0.8) {
          // Draw a wider base shape connecting trunk to roots
          ctx.save();
          ctx.beginPath();
          const flareW = lineW * 1.6;
          ctx.moveTo(b.startX - flareW * 0.5, b.startY + 2);
          ctx.quadraticCurveTo(b.startX - flareW * 0.3, b.startY - 15, b.startX, b.startY - 25);
          ctx.quadraticCurveTo(b.startX + flareW * 0.3, b.startY - 15, b.startX + flareW * 0.5, b.startY + 2);
          const flareGrad = ctx.createLinearGradient(b.startX - flareW, b.startY, b.startX + flareW, b.startY);
          flareGrad.addColorStop(0, `rgba(${darkR - 5},${darkG - 4},${darkB - 3},0.6)`);
          flareGrad.addColorStop(0.3, `rgba(${darkR},${darkG},${darkB},0.8)`);
          flareGrad.addColorStop(0.7, `rgba(${darkR},${darkG},${darkB},0.8)`);
          flareGrad.addColorStop(1, `rgba(${darkR - 10},${darkG - 8},${darkB - 5},0.6)`);
          ctx.fillStyle = flareGrad;
          ctx.fill();
          ctx.restore();
        }
      } else {
        // === THIN TWIGS ===
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.quadraticCurveTo(swayedCpX, cpY, swayedEndX, ceY);
        ctx.strokeStyle = `rgba(${darkR},${darkG},${darkB},${0.35 + p * 0.65})`;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round'; ctx.stroke();
      }

      // Draw leaves once branch is 55% grown
      if (b.progress > 0.55) {
        const lp = Math.min((b.progress - 0.55) / 0.45, 1);
        b.leaves.forEach(leaf => drawLeaf(leaf, t, lp, windForce));
      }

      if (p >= 0.15) b.children.forEach(c => drawBranch(c, t));
    };

    // Helper: compute tapered width for a branch
    function depth0Width(b: Branch): number {
      return b.width;
    }

    /* ─── DRAW: Cinematic leaf with rich detail ──── */
    const drawLeaf = (leaf: Leaf, t: number, lp: number, wind: number) => {
      const sway = Math.sin(t * leaf.swayFreq + leaf.swayPhase) * 2.5;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const dx = mx - leaf.baseX, dy = my - leaf.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let magX = 0, magY = 0;
      if (dist < 55 && dist > 0) {
        const force = (1 - dist / 55) * 6;
        magX = (dx / dist) * force; magY = (dy / dist) * force;
        leaf.glowAmt = Math.min(leaf.glowAmt + 0.08, 1);
      } else {
        leaf.glowAmt = Math.max(leaf.glowAmt - 0.02, 0);
      }

      leaf.x = leaf.baseX + sway + wind * 3.5 + magX;
      leaf.y = leaf.baseY + Math.sin(t * 0.0008 + leaf.swayPhase) * 1 + magY;

      // 4-layer depth system
      const depthScale = [0.65, 0.82, 1.0, 1.2][leaf.depthLayer];
      const depthAlpha = [0.35, 0.55, 0.85, 1.0][leaf.depthLayer];
      const depthBlur = leaf.depthLayer === 0 ? 0.4 : 0;

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      const flutter = Math.sin(t * 0.0014 + leaf.swayPhase * 3) * 0.05;
      ctx.rotate(leaf.rotation + Math.sin(t * 0.0004 + leaf.swayPhase) * 0.07 + flutter);
      ctx.globalAlpha = leaf.opacity * lp * depthAlpha;

      const s = leaf.size * (0.75 + lp * 0.25) * (1 + leaf.glowAmt * 0.2) * depthScale;

      // Depth blur for far leaves
      if (depthBlur > 0) {
        ctx.filter = `blur(${depthBlur}px)`;
      }

      // Leaf shadow for mid/front layers
      if (leaf.depthLayer >= 2) {
        ctx.save();
        ctx.translate(1.5, 2.5);
        ctx.globalAlpha *= 0.12;
        drawLeafShape(ctx, s, leaf.shape);
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();
        ctx.restore();
      }

      // Glow on hover
      if (leaf.glowAmt > 0) {
        ctx.shadowColor = leaf.highlight;
        ctx.shadowBlur = 20 * leaf.glowAmt;
      }

      // Main leaf shape
      drawLeafShape(ctx, s, leaf.shape);

      // Gradient fill — light-aware
      const toLight = Math.atan2(LIGHT_Y - leaf.y, LIGHT_X - leaf.x);
      const gx1 = Math.cos(toLight) * s * 0.55;
      const gy1 = Math.sin(toLight) * s * 0.55;
      const lg = ctx.createLinearGradient(gx1, gy1, -gx1, -gy1);
      const baseColor = leaf.glowAmt > 0.3 ? leaf.highlight : leaf.color;
      lg.addColorStop(0, leaf.highlight);
      lg.addColorStop(0.35, baseColor);
      lg.addColorStop(1, leaf.shadowColor);
      ctx.fillStyle = lg;
      ctx.fill();

      // Subtle edge stroke
      ctx.strokeStyle = `rgba(0,0,0,${0.04 + leaf.glowAmt * 0.04})`;
      ctx.lineWidth = 0.35;
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.filter = 'none';

      // Central vein
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.6);
      ctx.quadraticCurveTo(0.5, 0, 0, s * 0.4);
      ctx.strokeStyle = `rgba(255,255,255,${0.18 + leaf.glowAmt * 0.15})`;
      ctx.lineWidth = 0.55;
      ctx.stroke();

      // Side veins for larger leaves
      if (s > 9) {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.38); ctx.lineTo(s * 0.3, -s * 0.18);
        ctx.moveTo(0, -s * 0.1); ctx.lineTo(-s * 0.28, s * 0.04);
        ctx.moveTo(0, s * 0.08); ctx.lineTo(s * 0.22, s * 0.2);
        ctx.moveTo(0, -s * 0.25); ctx.lineTo(-s * 0.22, -s * 0.08);
        ctx.strokeStyle = `rgba(255,255,255,${0.06 + leaf.glowAmt * 0.06})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      ctx.restore();
    };

    /* ─── 5 Leaf shape paths — more variety ─── */
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
          c.bezierCurveTo(s * 0.22, -s * 0.45, s * 0.28, s * 0.2, 0, s * 0.65);
          c.bezierCurveTo(-s * 0.28, s * 0.2, -s * 0.22, -s * 0.45, 0, -s * 0.9);
          break;
        case 3: // Asymmetric natural
          c.moveTo(0, -s * 0.8);
          c.bezierCurveTo(s * 0.55, -s * 0.3, s * 0.45, s * 0.25, s * 0.05, s * 0.5);
          c.bezierCurveTo(-s * 0.1, s * 0.45, -s * 0.5, s * 0.1, -s * 0.4, -s * 0.4);
          c.closePath();
          break;
        case 4: // Heart/birch shaped
          c.moveTo(0, -s * 0.6);
          c.bezierCurveTo(s * 0.55, -s * 0.6, s * 0.55, s * 0.05, 0, s * 0.6);
          c.bezierCurveTo(-s * 0.55, s * 0.05, -s * 0.55, -s * 0.6, 0, -s * 0.6);
          break;
      }
    };

    /* ─── DRAW: Canopy shadow on ground ──── */
    const drawCanopyShadow = () => {
      if (!grownRef.current) return;
      ctx.save();
      const csg = ctx.createRadialGradient(TX + 18, TY + 10, 0, TX + 18, TY + 10, 150);
      csg.addColorStop(0, 'rgba(12,25,8,0.15)');
      csg.addColorStop(0.4, 'rgba(12,25,8,0.07)');
      csg.addColorStop(1, 'rgba(12,25,8,0)');
      ctx.fillStyle = csg;
      ctx.beginPath();
      ctx.ellipse(TX + 18, TY + 10, 150, 22, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    /* ─── DRAW: Canopy ambient glow ──── */
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
      const r = Math.max(maxX - minX, maxY - minY) / 2 + 60;
      const breathe = Math.sin(t * 0.00025) * 0.02 + 1;

      ctx.save();
      const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * breathe);
      gg.addColorStop(0, 'rgba(45,90,35,0.07)');
      gg.addColorStop(0.5, 'rgba(60,110,45,0.03)');
      gg.addColorStop(1, 'rgba(80,130,60,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(cx, cy, r * breathe, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    /* ─── DRAW: Volumetric light rays — stronger, more visible ── */
    const drawLightRays = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const rays = [
        { x: TX - 80, w: 40, speed: 0.00014 },
        { x: TX - 30, w: 30, speed: 0.0002 },
        { x: TX + 20, w: 35, speed: 0.00017 },
        { x: TX + 65, w: 25, speed: 0.00022 },
        { x: TX - 120, w: 28, speed: 0.00016 },
        { x: TX + 100, w: 22, speed: 0.00019 },
        { x: TX - 5, w: 20, speed: 0.00024 },
      ];

      for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];
        const shimmer = Math.sin(t * ray.speed + i * 2.3) * 0.5 + 0.5;
        const alpha = shimmer * 0.055; // Stronger than before
        if (alpha < 0.008) continue;

        const topX = LIGHT_X + (ray.x - LIGHT_X) * 0.25;
        const topY = LIGHT_Y + 30;
        const botX = ray.x;
        const botY = TY + 25;

        const lg = ctx.createLinearGradient(topX, topY, botX, botY);
        lg.addColorStop(0, `rgba(255,235,175,${alpha * 0.3})`);
        lg.addColorStop(0.2, `rgba(255,230,155,${alpha * 0.7})`);
        lg.addColorStop(0.5, `rgba(255,225,140,${alpha})`);
        lg.addColorStop(0.8, `rgba(255,220,120,${alpha * 0.5})`);
        lg.addColorStop(1, `rgba(255,215,100,0)`);

        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(topX - ray.w * 0.25, topY);
        ctx.lineTo(botX - ray.w, botY);
        ctx.lineTo(botX + ray.w, botY);
        ctx.lineTo(topX + ray.w * 0.25, topY);
        ctx.closePath();
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    };

    /* ─── DRAW: Dappled light spots on leaves ──── */
    const drawDappledLight = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      const spots = [
        { x: TX - 45, y: TY - 200, r: 24 },
        { x: TX + 35, y: TY - 230, r: 18 },
        { x: TX - 18, y: TY - 155, r: 26 },
        { x: TX + 60, y: TY - 185, r: 16 },
        { x: TX - 70, y: TY - 250, r: 14 },
        { x: TX + 12, y: TY - 290, r: 12 },
        { x: TX - 90, y: TY - 170, r: 20 },
        { x: TX + 80, y: TY - 210, r: 15 },
        { x: TX - 30, y: TY - 320, r: 11 },
        { x: TX + 45, y: TY - 130, r: 18 },
      ];
      for (let i = 0; i < spots.length; i++) {
        const sp = spots[i];
        const drift = Math.sin(t * 0.00018 + i * 1.9) * 12;
        const alpha = (Math.sin(t * 0.0003 + i * 2.5) + 1) * 0.035 + 0.015;
        const lg = ctx.createRadialGradient(sp.x + drift, sp.y, 0, sp.x + drift, sp.y, sp.r);
        lg.addColorStop(0, `rgba(255,248,195,${alpha})`);
        lg.addColorStop(0.6, `rgba(255,245,180,${alpha * 0.4})`);
        lg.addColorStop(1, 'rgba(255,245,180,0)');
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.arc(sp.x + drift, sp.y, sp.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    };

    /* ─── DRAW: Golden fireflies ──── */
    const drawFireflies = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      for (const f of firefliesRef.current) {
        f.x = f.baseX + Math.cos(t * f.speed + f.phase) * f.radius;
        f.y = f.baseY + Math.sin(t * f.speed * 1.3 + f.phase) * f.radius * 0.55;
        const pulse = (Math.sin(t * 0.002 + f.phase) + 1) * 0.5;
        const alpha = pulse * f.brightness * 0.4;

        const gg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 10);
        gg.addColorStop(0, `rgba(255,235,145,${alpha})`);
        gg.addColorStop(0.35, `rgba(255,215,100,${alpha * 0.35})`);
        gg.addColorStop(1, 'rgba(255,200,80,0)');
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(f.x, f.y, 10, 0, Math.PI * 2); ctx.fill();

        // Bright core
        ctx.beginPath(); ctx.arc(f.x, f.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,250,210,${alpha * 1.8})`; ctx.fill();
      }
      ctx.restore();
    };

    /* ─── DRAW: Dust motes in light ──── */
    const drawDustMotes = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      for (const d of dustRef.current) {
        d.x += d.vx + Math.sin(t * 0.00025 + d.life * 8) * 0.03;
        d.y += d.vy;
        d.life -= 0.0006;

        if (d.life <= 0) {
          d.x = LIGHT_X + Math.random() * W * 0.55;
          d.y = LIGHT_Y + Math.random() * H * 0.3;
          d.life = d.maxLife;
          d.opacity = 0.08 + Math.random() * 0.22;
        }

        const fade = d.life > 0.85 ? (1 - d.life) / 0.15 : d.life > 0.15 ? 1 : d.life / 0.15;
        const alpha = d.opacity * fade;
        if (alpha < 0.01) continue;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,240,195,${alpha})`;
        ctx.fill();
      }
      ctx.restore();
    };

    /* ─── DRAW: Falling leaves ──── */
    const updateFallingLeaves = (t: number) => {
      if (!grownRef.current) return;

      if (t - lastFallTime.current > 3800 && leavesRef.current.length > 0) {
        lastFallTime.current = t;
        const src = leavesRef.current[Math.floor(Math.random() * leavesRef.current.length)];
        fallingRef.current.push({
          x: src.baseX, y: src.baseY,
          vx: (Math.random() - 0.5) * 0.35,
          vy: 0.18 + Math.random() * 0.25,
          rotation: src.rotation,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          size: src.size * 0.65,
          color: src.color,
          opacity: 0.7,
          life: 1,
        });
      }

      ctx.save();
      fallingRef.current = fallingRef.current.filter(fl => {
        fl.x += fl.vx + Math.sin(t * 0.001 + fl.rotation) * 0.18;
        fl.y += fl.vy;
        fl.rotation += fl.rotSpeed;
        fl.life -= 0.0018;
        fl.opacity = fl.life * 0.7;

        if (fl.life <= 0 || fl.y > TY + 35) return false;

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

    /* ─── DRAW: Soft vignette ──── */
    const drawVignette = () => {
      ctx.save();
      const vg = ctx.createRadialGradient(W / 2, H * 0.38, W * 0.22, W / 2, H * 0.38, W * 0.62);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.65, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.06)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    };

    /* ─── Growth animation ──── */
    const growTree = (b: Branch, parentP: number) => {
      const spd = b.depth === 0 ? 0.04 : 0.032;
      if (parentP > 0.08) b.progress = Math.min(b.progress + spd, 1);
      b.children.forEach(c => growTree(c, b.progress));
    };

    /* ─── Hover detection ──── */
    const checkHover = () => {
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      let closest: Leaf | null = null, cd = 26;
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

    /* ─── Main animation loop ──── */
    const animate = (ts: number) => {
      ctx.clearRect(0, 0, W, H);
      if (treeRef.current) {
        treeRef.current.progress = Math.min(treeRef.current.progress + 0.04, 1);
        growTree(treeRef.current, 1);
        if (treeRef.current.progress >= 1) grownRef.current = true;

        // Render layers — back to front
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

      mouseRef.current.vx *= 0.85;
      mouseRef.current.vy *= 0.9;

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
        className="absolute rounded-full blur-3xl opacity-[0.08] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 35% 35%, rgba(255,215,140,0.35) 0%, rgba(50,100,45,0.18) 50%, transparent 70%)',
          width: '150%', height: '150%', top: '-25%', left: '-25%',
        }}
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="relative z-10 cursor-pointer"
          style={{ width: '100%', maxWidth: 680, height: 'auto', aspectRatio: '680 / 740' }}
        />
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-200"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div
              className="px-4 py-2 rounded-full text-[11px] font-medium text-white whitespace-nowrap shadow-lg"
              style={{ backgroundColor: 'rgba(40,72,35,0.92)', backdropFilter: 'blur(12px)' }}
            >
              {tooltip.name}&apos;s leaf
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] text-[var(--color-text-muted)] tracking-[0.14em] uppercase opacity-25">
        Hover the leaves
      </p>
    </div>
  );
}
