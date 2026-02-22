'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/* ─────────────────────────────────────────────────────
   Types — every leaf is a spring-physics body
   ───────────────────────────────────────────────────── */
interface Branch {
  startX: number; startY: number; endX: number; endY: number;
  cpX: number; cpY: number;
  width: number; depth: number; angle: number; length: number;
  progress: number; children: Branch[]; leaves: Leaf[];
  seed: number;
}

interface Leaf {
  x: number; y: number;
  baseX: number; baseY: number;
  // Spring physics
  vx: number; vy: number;
  // Visual
  size: number; baseSize: number;
  hue: number; sat: number; lum: number;
  rotation: number; baseRotation: number;
  opacity: number;
  phase: number; freq: number;
  layer: number; // 0-3 depth
  shape: number;
  glow: number; // 0-1 current hover intensity
  // Supporter
  name?: string;
}

interface Spark {
  x: number; y: number; vx: number; vy: number;
  size: number; life: number; hue: number;
}

interface FallingLeaf {
  x: number; y: number; vx: number; vy: number;
  rot: number; rotV: number;
  size: number; hue: number; sat: number; lum: number;
  life: number;
}

/* ─────────────────────────────────────────────────────
   Curated palette — HSL for smooth interpolation
   ───────────────────────────────────────────────────── */
const LEAF_HUES: [number, number, number][] = [
  // [hue, sat%, lum%]  — forest to spring greens
  [148, 55, 18], [150, 50, 22], [145, 48, 26], [142, 44, 30],
  [140, 42, 34], [138, 40, 38], [135, 38, 42], [132, 44, 36],
  [128, 46, 40], [125, 42, 44], [120, 40, 46], [115, 42, 48],
  // Golden accents (8% chance)
  [45, 55, 52], [38, 50, 48], [52, 48, 50],
];

const NAMES = [
  'James', 'Mom', 'Rachel', 'David & Ana', 'Coach Williams',
  'Priya', 'Marcus', 'The Nguyens', 'Elena', 'Dr. Mehta',
  'Anonymous', 'Sophie & Tom', 'Alex', 'Grandma Rose',
  'Uncle Ben', 'Sarah K.', 'The Patels', 'Mrs. Chen',
  'Jordan', 'Lila & Mike', 'Team Alpha', 'Dr. Shah',
];

/* ─────────────────────────────────────────────────────
   Easing — everything should feel organic
   ───────────────────────────────────────────────────── */
const SPRING_K = 0.04;     // Spring stiffness
const SPRING_DAMP = 0.88;  // Damping (0.8-0.95)
const CURSOR_RADIUS = 80;  // How far cursor influence reaches
const CURSOR_FORCE = 12;   // How strongly leaves part
const CLICK_FORCE = 28;    // Explosive click force
const CLICK_RADIUS = 120;  // Click blast radius

export default function InteractiveTree() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const treeRef = useRef<Branch | null>(null);
  const animRef = useRef(0);
  const leavesRef = useRef<Leaf[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const fallingRef = useRef<FallingLeaf[]>([]);
  const mouseRef = useRef({ x: -999, y: -999, vx: 0, vy: 0, down: false });
  const clickRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const hoveredRef = useRef<Leaf | null>(null);
  const grownRef = useRef(false);
  const nameIdx = useRef(0);
  const lastFallTime = useRef(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);

  /* ─── Build fractal tree ─── */
  const buildBranch = useCallback((
    x: number, y: number, angle: number, len: number, w: number, depth: number
  ): Branch => {
    const jitter = (Math.random() - 0.5) * (depth < 2 ? 0.12 : 0.32);
    const ea = angle + jitter;
    const ex = x + Math.cos(ea) * len;
    const ey = y + Math.sin(ea) * len;

    const perp = ea + Math.PI / 2;
    const curve = (Math.random() - 0.5) * len * (depth < 2 ? 0.2 : 0.35);
    const mx = (x + ex) / 2 + Math.cos(perp) * curve;
    const my = (y + ey) / 2 + Math.sin(perp) * curve;

    const b: Branch = {
      startX: x, startY: y, endX: ex, endY: ey,
      cpX: mx, cpY: my,
      width: w, depth, angle: ea, length: len, progress: 0,
      children: [], leaves: [], seed: Math.random() * 999,
    };

    if (depth < 9 && len > 6) {
      const n = depth < 1 ? 3 :
                depth < 3 ? 2 + (Math.random() > 0.4 ? 1 : 0) :
                depth < 6 ? (Math.random() > 0.25 ? 2 : 1) :
                Math.random() > 0.4 ? 2 : 1;

      for (let i = 0; i < n; i++) {
        const sp = depth < 1 ? 0.35 + Math.random() * 0.3 :
                   depth < 3 ? 0.25 + Math.random() * 0.4 :
                   0.2 + Math.random() * 0.5;
        const off = n === 1 ? (Math.random() - 0.5) * 0.5 :
                    n === 2 ? (i === 0 ? -sp : sp) :
                    (i === 0 ? -sp * 1.1 : i === 1 ? sp * 1.1 : (Math.random() - 0.5) * 0.3);
        const decay = 0.54 + Math.random() * 0.16;
        const wDecay = depth < 2 ? 0.58 : depth < 4 ? 0.54 : 0.48;
        b.children.push(buildBranch(ex, ey, ea + off, len * decay, w * wDecay, depth + 1));
      }
    }

    // Leaves at branch tips
    if (depth >= 3) {
      const count = depth >= 7 ? 5 + Math.floor(Math.random() * 4) :
                    depth >= 5 ? 3 + Math.floor(Math.random() * 3) :
                    2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const spread = depth >= 6 ? 30 : 22;
        const lx = ex + (Math.random() - 0.5) * spread * 2;
        const ly = ey + (Math.random() - 0.5) * spread * 1.5;
        const isAccent = Math.random() < 0.08;
        const palette = isAccent
          ? LEAF_HUES[LEAF_HUES.length - 3 + Math.floor(Math.random() * 3)]
          : LEAF_HUES[Math.floor(Math.random() * (LEAF_HUES.length - 3))];
        const leaf: Leaf = {
          x: lx, y: ly, baseX: lx, baseY: ly,
          vx: 0, vy: 0,
          size: 9 + Math.random() * 10 + (depth >= 6 ? 3 : 0),
          baseSize: 9 + Math.random() * 10 + (depth >= 6 ? 3 : 0),
          hue: palette[0] + (Math.random() - 0.5) * 8,
          sat: palette[1] + (Math.random() - 0.5) * 6,
          lum: palette[2] + (Math.random() - 0.5) * 6,
          rotation: Math.random() * Math.PI * 2,
          baseRotation: Math.random() * Math.PI * 2,
          opacity: 0.8 + Math.random() * 0.2,
          phase: Math.random() * Math.PI * 2,
          freq: 0.0005 + Math.random() * 0.001,
          layer: depth >= 7 ? 3 : depth >= 5 ? 2 : depth >= 4 ? 1 : 0,
          shape: Math.floor(Math.random() * 4),
          glow: 0,
          name: NAMES[nameIdx.current % NAMES.length],
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
    const W = 680, H = 720;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    leavesRef.current = [];
    fallingRef.current = [];
    sparksRef.current = [];
    nameIdx.current = 0;

    const TX = W / 2, TY = H - 100;
    treeRef.current = buildBranch(TX, TY, -Math.PI / 2 + (Math.random() - 0.5) * 0.06, 150, 34, 0);

    // Light source
    const LX = W * 0.15, LY = H * 0.05;

    /* ─── Mouse / Touch ─── */
    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const nx = (e.clientX - r.left) * (W / r.width);
      const ny = (e.clientY - r.top) * (H / r.height);
      mouseRef.current.vx = nx - mouseRef.current.x;
      mouseRef.current.vy = ny - mouseRef.current.y;
      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
    };
    const onLeave = () => { mouseRef.current.x = -999; mouseRef.current.y = -999; setTooltip(null); };
    const onClick = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const cx = (e.clientX - r.left) * (W / r.width);
      const cy = (e.clientY - r.top) * (H / r.height);
      clickRef.current = { x: cx, y: cy, t: performance.now() };
      // Spawn sparks at click
      for (let i = 0; i < 16; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        sparksRef.current.push({
          x: cx, y: cy,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 1,
          size: 1 + Math.random() * 2.5,
          life: 1,
          hue: 40 + Math.random() * 30,
        });
      }
    };
    const onTouch = (e: TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const t = e.touches[0];
      if (t) {
        mouseRef.current.x = (t.clientX - r.left) * (W / r.width);
        mouseRef.current.y = (t.clientY - r.top) * (H / r.height);
      }
    };
    const onTouchEnd = () => {
      // Treat touch-up as click at current position
      if (mouseRef.current.x > 0) {
        clickRef.current = { x: mouseRef.current.x, y: mouseRef.current.y, t: performance.now() };
        for (let i = 0; i < 12; i++) {
          const a = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 3;
          sparksRef.current.push({
            x: mouseRef.current.x, y: mouseRef.current.y,
            vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 1,
            size: 1 + Math.random() * 2, life: 1, hue: 40 + Math.random() * 30,
          });
        }
      }
    };

    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('touchstart', onTouch, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    /* ─── DRAW: Clean ground — just a soft shadow, Ive-minimal ─── */
    const drawGround = () => {
      ctx.save();
      // Single, beautiful shadow ellipse
      const sg = ctx.createRadialGradient(TX + 8, TY + 12, 0, TX + 8, TY + 12, 180);
      sg.addColorStop(0, 'rgba(20,35,15,0.14)');
      sg.addColorStop(0.35, 'rgba(20,35,15,0.07)');
      sg.addColorStop(0.65, 'rgba(20,35,15,0.02)');
      sg.addColorStop(1, 'rgba(20,35,15,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(TX + 8, TY + 12, 180, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    /* ─── DRAW: Clean roots — confident, minimal ─── */
    const drawRoots = () => {
      ctx.save();
      const roots = [
        { a: -0.35, l: 60, w: 10, c: 14 },
        { a: 0.3, l: 55, w: 9, c: -12 },
        { a: -0.62, l: 42, w: 7, c: 8 },
        { a: 0.55, l: 48, w: 8, c: -15 },
        { a: -0.12, l: 36, w: 6, c: 6 },
        { a: 0.1, l: 38, w: 6, c: -5 },
      ];
      for (const r of roots) {
        const rx = TX + Math.cos(Math.PI / 2 + r.a) * 12;
        const ry = TY + 2;
        const rex = rx + Math.cos(r.a + Math.PI / 2.5) * r.l;
        const rey = ry + Math.abs(Math.sin(r.a + Math.PI / 2.5)) * r.l * 0.38 + 8;
        const rcx = (rx + rex) / 2 + r.c;
        const rcy = (ry + rey) / 2 + 5;

        // Shadow
        ctx.beginPath();
        ctx.moveTo(rx + 1.5, ry + 1.5);
        ctx.quadraticCurveTo(rcx + 1.5, rcy + 2, rex + 1.5, rey + 1.5);
        ctx.strokeStyle = 'rgba(10,6,3,0.08)';
        ctx.lineWidth = r.w + 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.quadraticCurveTo(rcx, rcy, rex, rey);
        const rg = ctx.createLinearGradient(rx, ry, rex, rey);
        rg.addColorStop(0, 'rgb(58,40,26)');
        rg.addColorStop(1, 'rgb(44,30,18)');
        ctx.strokeStyle = rg;
        ctx.lineWidth = r.w;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Highlight
        ctx.beginPath();
        ctx.moveTo(rx - 0.8, ry - 0.3);
        ctx.quadraticCurveTo(rcx - 0.8, rcy - 0.8, rex - 0.8, rey - 0.3);
        ctx.strokeStyle = 'rgba(100,75,50,0.15)';
        ctx.lineWidth = Math.max(1, r.w * 0.2);
        ctx.stroke();
      }
      ctx.restore();
    };

    /* ─── DRAW: Branch — clean, confident strokes ─── */
    const drawBranch = (b: Branch, t: number) => {
      if (b.progress <= 0) return;
      const p = Math.min(b.progress, 1);
      const ceX = b.startX + (b.endX - b.startX) * p;
      const ceY = b.startY + (b.endY - b.startY) * p;
      const cpX = b.startX + (b.cpX - b.startX) * p;
      const cpY = b.startY + (b.cpY - b.startY) * p;

      // Gentle ambient sway
      const sway = Math.sin(t * 0.0004 + b.depth * 0.7 + b.seed) * b.depth * 0.08;
      const scX = cpX + sway * 0.4;
      const seX = ceX + sway;

      const lw = Math.max(0.5, b.width * p);
      const warmth = Math.sin(b.seed) * 8;
      const dr = Math.max(26, 58 - b.depth * 3 + warmth);
      const dg = Math.max(16, 38 - b.depth * 2.2 + warmth * 0.3);
      const db = Math.max(10, 26 - b.depth * 1.5);

      if (b.depth < 6 && lw > 1) {
        // Shadow
        ctx.beginPath();
        ctx.moveTo(b.startX + 1.5, b.startY + 1.5);
        ctx.quadraticCurveTo(scX + 1.5, cpY + 1.5, seX + 1.5, ceY + 1.5);
        ctx.strokeStyle = `rgba(8,4,2,${0.08 + (1 - b.depth / 9) * 0.06})`;
        ctx.lineWidth = lw + 3;
        ctx.lineCap = 'round'; ctx.stroke();

        // Main bark
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.quadraticCurveTo(scX, cpY, seX, ceY);
        const bg = ctx.createLinearGradient(b.startX, b.startY, seX, ceY);
        bg.addColorStop(0, `rgb(${dr + 4},${dg + 2},${db + 1})`);
        bg.addColorStop(1, `rgb(${Math.max(20, dr - 6)},${Math.max(12, dg - 4)},${Math.max(6, db - 3)})`);
        ctx.strokeStyle = bg;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round'; ctx.stroke();

        // Light edge
        if (lw > 3) {
          ctx.beginPath();
          ctx.moveTo(b.startX - lw * 0.18, b.startY);
          ctx.quadraticCurveTo(scX - lw * 0.18, cpY, seX - lw * 0.18, ceY);
          ctx.strokeStyle = `rgba(${dr + 35},${dg + 25},${db + 18},0.22)`;
          ctx.lineWidth = Math.max(0.8, lw * 0.28);
          ctx.stroke();
        }

        // Trunk base flare
        if (b.depth === 0 && p > 0.8) {
          ctx.save();
          const fw = lw * 1.5;
          ctx.beginPath();
          ctx.moveTo(b.startX - fw * 0.45, b.startY + 2);
          ctx.quadraticCurveTo(b.startX - fw * 0.25, b.startY - 12, b.startX, b.startY - 22);
          ctx.quadraticCurveTo(b.startX + fw * 0.25, b.startY - 12, b.startX + fw * 0.45, b.startY + 2);
          ctx.fillStyle = `rgb(${dr},${dg},${db})`;
          ctx.fill();
          ctx.restore();
        }
      } else {
        // Twigs
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.quadraticCurveTo(scX, cpY, seX, ceY);
        ctx.strokeStyle = `rgba(${dr},${dg},${db},${0.3 + p * 0.7})`;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round'; ctx.stroke();
      }

      // Leaves
      if (b.progress > 0.5) {
        const lp = Math.min((b.progress - 0.5) / 0.5, 1);
        for (const leaf of b.leaves) drawLeaf(leaf, t, lp);
      }
      if (p >= 0.12) b.children.forEach(c => drawBranch(c, t));
    };

    /* ─── SPRING PHYSICS — update all leaves every frame ─── */
    const updateLeafPhysics = (t: number) => {
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const click = clickRef.current;
      const clickAge = click ? (t - click.t) / 1000 : 99;

      for (const leaf of leavesRef.current) {
        // Ambient sway — the tree breathes
        const breathe = Math.sin(t * 0.0003) * 0.6;
        const swayX = Math.sin(t * leaf.freq + leaf.phase) * 2 + breathe;
        const swayY = Math.sin(t * 0.0008 + leaf.phase) * 0.6;

        // Target position (base + sway)
        let targetX = leaf.baseX + swayX;
        let targetY = leaf.baseY + swayY;

        // Cursor repulsion — leaves part like water
        const dx = leaf.baseX - mx, dy = leaf.baseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CURSOR_RADIUS && dist > 0) {
          const strength = (1 - dist / CURSOR_RADIUS) ** 2; // Quadratic falloff
          const pushX = (dx / dist) * CURSOR_FORCE * strength;
          const pushY = (dy / dist) * CURSOR_FORCE * strength;
          leaf.vx += pushX * 0.15;
          leaf.vy += pushY * 0.15;

          // Glow increases smoothly
          leaf.glow = Math.min(leaf.glow + 0.06, 1);
        } else {
          leaf.glow *= 0.95; // Smooth decay
        }

        // Click explosion — burst outward
        if (click && clickAge < 0.5) {
          const cdx = leaf.baseX - click.x, cdy = leaf.baseY - click.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < CLICK_RADIUS && cdist > 0) {
            const wave = Math.max(0, 1 - clickAge * 3); // Quick decay
            const strength = ((1 - cdist / CLICK_RADIUS) ** 1.5) * wave;
            leaf.vx += (cdx / cdist) * CLICK_FORCE * strength * 0.08;
            leaf.vy += (cdy / cdist) * CLICK_FORCE * strength * 0.08;
            leaf.glow = Math.min(leaf.glow + strength * 0.3, 1);
          }
        }

        // Spring force back to target
        const springX = (targetX - leaf.x) * SPRING_K;
        const springY = (targetY - leaf.y) * SPRING_K;
        leaf.vx = (leaf.vx + springX) * SPRING_DAMP;
        leaf.vy = (leaf.vy + springY) * SPRING_DAMP;

        leaf.x += leaf.vx;
        leaf.y += leaf.vy;

        // Rotation springs back too
        const targetRot = leaf.baseRotation + Math.sin(t * 0.0004 + leaf.phase) * 0.06;
        leaf.rotation += (targetRot - leaf.rotation) * 0.05;
        // Add rotation from velocity
        leaf.rotation += leaf.vx * 0.008;

        // Size pulses on interaction
        leaf.size = leaf.baseSize * (1 + leaf.glow * 0.25);
      }

      // Clear old clicks
      if (click && clickAge > 1) clickRef.current = null;
    };

    /* ─── DRAW: Leaf — translucent, light-aware, material ─── */
    const drawLeaf = (leaf: Leaf, t: number, lp: number) => {
      const depthScale = [0.65, 0.82, 1.0, 1.15][leaf.layer];
      const depthAlpha = [0.35, 0.55, 0.82, 1.0][leaf.layer];

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.globalAlpha = leaf.opacity * lp * depthAlpha;

      const s = leaf.size * depthScale * (0.7 + lp * 0.3);

      // Far-back blur
      if (leaf.layer === 0) ctx.filter = 'blur(0.4px)';

      // Drop shadow (front leaves only)
      if (leaf.layer >= 2) {
        ctx.save();
        ctx.translate(1.2, 2);
        ctx.globalAlpha *= 0.1;
        leafPath(ctx, s, leaf.shape);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.restore();
      }

      // Glow halo on interaction
      if (leaf.glow > 0.05) {
        ctx.shadowColor = `hsla(${leaf.hue}, 60%, 65%, ${leaf.glow * 0.6})`;
        ctx.shadowBlur = 16 * leaf.glow;
      }

      // Main fill — HSL with light-direction gradient
      leafPath(ctx, s, leaf.shape);
      const toLight = Math.atan2(LY - leaf.y, LX - leaf.x);
      const gx = Math.cos(toLight) * s * 0.5;
      const gy = Math.sin(toLight) * s * 0.5;
      const lg = ctx.createLinearGradient(gx, gy, -gx, -gy);

      // Subsurface scattering — glow makes leaves translucent
      const glowLum = leaf.lum + leaf.glow * 18;
      const glowSat = leaf.sat + leaf.glow * 10;

      lg.addColorStop(0, `hsl(${leaf.hue}, ${glowSat + 8}%, ${Math.min(70, glowLum + 14)}%)`);
      lg.addColorStop(0.4, `hsl(${leaf.hue}, ${glowSat}%, ${glowLum}%)`);
      lg.addColorStop(1, `hsl(${leaf.hue}, ${leaf.sat - 4}%, ${Math.max(10, leaf.lum - 10)}%)`);
      ctx.fillStyle = lg;
      ctx.fill();

      // Soft edge
      ctx.strokeStyle = `hsla(${leaf.hue}, ${leaf.sat}%, ${leaf.lum - 8}%, ${0.06 + leaf.glow * 0.06})`;
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.filter = 'none';

      // Central vein — delicate
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.55);
      ctx.quadraticCurveTo(0.3, 0, 0, s * 0.35);
      ctx.strokeStyle = `hsla(0, 0%, 100%, ${0.15 + leaf.glow * 0.2})`;
      ctx.lineWidth = 0.45;
      ctx.stroke();

      // Side veins
      if (s > 10) {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.32); ctx.lineTo(s * 0.26, -s * 0.14);
        ctx.moveTo(0, -s * 0.06); ctx.lineTo(-s * 0.24, s * 0.06);
        ctx.moveTo(0, s * 0.1); ctx.lineTo(s * 0.18, s * 0.18);
        ctx.strokeStyle = `hsla(0, 0%, 100%, ${0.05 + leaf.glow * 0.08})`;
        ctx.lineWidth = 0.25;
        ctx.stroke();
      }

      ctx.restore();
    };

    /* ─── Leaf shape paths ─── */
    const leafPath = (c: CanvasRenderingContext2D, s: number, shape: number) => {
      c.beginPath();
      switch (shape) {
        case 0: // Pointed
          c.moveTo(0, -s * 0.82);
          c.bezierCurveTo(s * 0.48, -s * 0.38, s * 0.48, s * 0.14, 0, s * 0.48);
          c.bezierCurveTo(-s * 0.48, s * 0.14, -s * 0.48, -s * 0.38, 0, -s * 0.82);
          break;
        case 1: // Rounded
          c.moveTo(0, -s * 0.68);
          c.bezierCurveTo(s * 0.56, -s * 0.32, s * 0.52, s * 0.28, 0, s * 0.52);
          c.bezierCurveTo(-s * 0.52, s * 0.28, -s * 0.56, -s * 0.32, 0, -s * 0.68);
          break;
        case 2: // Willow
          c.moveTo(0, -s * 0.88);
          c.bezierCurveTo(s * 0.2, -s * 0.42, s * 0.26, s * 0.18, 0, s * 0.62);
          c.bezierCurveTo(-s * 0.26, s * 0.18, -s * 0.2, -s * 0.42, 0, -s * 0.88);
          break;
        case 3: // Heart
          c.moveTo(0, -s * 0.58);
          c.bezierCurveTo(s * 0.52, -s * 0.58, s * 0.52, s * 0.04, 0, s * 0.58);
          c.bezierCurveTo(-s * 0.52, s * 0.04, -s * 0.52, -s * 0.58, 0, -s * 0.58);
          break;
      }
    };

    /* ─── DRAW: Canopy glow ─── */
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

      ctx.save();
      const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      gg.addColorStop(0, 'rgba(45,90,35,0.06)');
      gg.addColorStop(0.6, 'rgba(60,110,45,0.02)');
      gg.addColorStop(1, 'rgba(80,130,60,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    /* ─── DRAW: Light rays — subtle ─── */
    const drawLightRays = (t: number) => {
      if (!grownRef.current) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const rays = [
        { x: TX - 70, w: 35 }, { x: TX - 15, w: 28 },
        { x: TX + 30, w: 32 }, { x: TX + 80, w: 24 },
        { x: TX - 110, w: 22 },
      ];
      for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];
        const shimmer = Math.sin(t * 0.00016 + i * 2.4) * 0.5 + 0.5;
        const alpha = shimmer * 0.04;
        if (alpha < 0.006) continue;

        const topX = LX + (ray.x - LX) * 0.25, topY = LY + 25;
        const lg = ctx.createLinearGradient(topX, topY, ray.x, TY + 20);
        lg.addColorStop(0, `rgba(255,235,170,${alpha * 0.3})`);
        lg.addColorStop(0.4, `rgba(255,228,150,${alpha})`);
        lg.addColorStop(1, 'rgba(255,220,120,0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(topX - ray.w * 0.2, topY);
        ctx.lineTo(ray.x - ray.w, TY + 20);
        ctx.lineTo(ray.x + ray.w, TY + 20);
        ctx.lineTo(topX + ray.w * 0.2, topY);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    };

    /* ─── DRAW: Sparks — click particle burst ─── */
    const drawSparks = () => {
      ctx.save();
      sparksRef.current = sparksRef.current.filter(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.04; // gravity
        s.vx *= 0.98;
        s.vy *= 0.98;
        s.life -= 0.018;
        if (s.life <= 0) return false;

        const fade = s.life > 0.7 ? 1 : s.life / 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * fade, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 80%, 70%, ${fade * 0.7})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 3 * fade, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 80%, 70%, ${fade * 0.12})`;
        ctx.fill();

        return true;
      });
      ctx.restore();
    };

    /* ─── DRAW: Falling leaves ─── */
    const updateFalling = (t: number) => {
      if (!grownRef.current) return;
      if (t - lastFallTime.current > 4500 && leavesRef.current.length > 0) {
        lastFallTime.current = t;
        const src = leavesRef.current[Math.floor(Math.random() * leavesRef.current.length)];
        fallingRef.current.push({
          x: src.baseX, y: src.baseY,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.15 + Math.random() * 0.2,
          rot: src.rotation, rotV: (Math.random() - 0.5) * 0.015,
          size: src.baseSize * 0.6,
          hue: src.hue, sat: src.sat, lum: src.lum,
          life: 1,
        });
      }

      ctx.save();
      fallingRef.current = fallingRef.current.filter(fl => {
        fl.x += fl.vx + Math.sin(t * 0.001 + fl.rot) * 0.15;
        fl.y += fl.vy;
        fl.rot += fl.rotV;
        fl.life -= 0.0016;
        if (fl.life <= 0 || fl.y > TY + 30) return false;

        ctx.save();
        ctx.translate(fl.x, fl.y);
        ctx.rotate(fl.rot);
        ctx.globalAlpha = fl.life * 0.6;
        const s = fl.size * fl.life;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.75);
        ctx.bezierCurveTo(s * 0.4, -s * 0.3, s * 0.4, s * 0.18, 0, s * 0.45);
        ctx.bezierCurveTo(-s * 0.4, s * 0.18, -s * 0.4, -s * 0.3, 0, -s * 0.75);
        ctx.fillStyle = `hsl(${fl.hue}, ${fl.sat}%, ${fl.lum}%)`;
        ctx.fill();
        ctx.restore();
        return true;
      });
      ctx.restore();
    };

    /* ─── DRAW: Soft vignette ─── */
    const drawVignette = () => {
      ctx.save();
      const vg = ctx.createRadialGradient(W / 2, H * 0.38, W * 0.2, W / 2, H * 0.38, W * 0.6);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.6, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.04)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    };

    /* ─── Growth ─── */
    const growTree = (b: Branch, parentP: number) => {
      if (parentP > 0.08) b.progress = Math.min(b.progress + 0.035, 1);
      b.children.forEach(c => growTree(c, b.progress));
    };

    /* ─── Hover detection ─── */
    const checkHover = () => {
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      let closest: Leaf | null = null, cd = 22;
      for (const l of leavesRef.current) {
        const d = Math.sqrt((mx - l.x) ** 2 + (my - l.y) ** 2);
        if (d < cd) { cd = d; closest = l; }
      }
      if (closest !== hoveredRef.current) {
        hoveredRef.current = closest;
        if (closest?.name && grownRef.current) {
          const rect = canvas.getBoundingClientRect();
          setTooltip({
            x: (closest.x / W) * rect.width,
            y: (closest.y / H) * rect.height - 16,
            name: closest.name,
          });
        } else setTooltip(null);
      }
    };

    /* ─── Animation loop ─── */
    const animate = (ts: number) => {
      ctx.clearRect(0, 0, W, H);
      if (treeRef.current) {
        treeRef.current.progress = Math.min(treeRef.current.progress + 0.04, 1);
        growTree(treeRef.current, 1);
        if (treeRef.current.progress >= 1) grownRef.current = true;

        // Physics first
        if (grownRef.current) updateLeafPhysics(ts);

        // Render back to front
        drawGround();
        drawRoots();
        if (grownRef.current) drawCanopyGlow(ts);
        if (grownRef.current) drawLightRays(ts);
        drawBranch(treeRef.current, ts);
        if (grownRef.current) {
          updateFalling(ts);
          drawSparks();
        }
        drawVignette();
        checkHover();
      }

      mouseRef.current.vx *= 0.82;
      mouseRef.current.vy *= 0.88;

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animRef.current);
    };
  }, [buildBranch]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Ambient light behind tree */}
      <div
        className="absolute rounded-full blur-3xl opacity-[0.06] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 35% 35%, rgba(255,210,130,0.3) 0%, rgba(45,95,40,0.15) 50%, transparent 70%)',
          width: '140%', height: '140%', top: '-20%', left: '-20%',
        }}
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="relative z-10"
          style={{
            width: '100%', maxWidth: 680, height: 'auto', aspectRatio: '680 / 720',
            cursor: 'none',
          }}
        />
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: tooltip.x, top: tooltip.y,
              transform: 'translate(-50%, -100%)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like overshoot
            }}
          >
            <div
              className="px-4 py-2 rounded-2xl text-[11px] font-medium whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: '#2D5030',
                boxShadow: '0 2px 16px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)',
                letterSpacing: '0.01em',
              }}
            >
              {tooltip.name}&apos;s leaf
            </div>
          </div>
        )}
      </div>
      <p
        className="mt-4 text-[10px] tracking-[0.2em] uppercase"
        style={{ color: 'rgba(0,0,0,0.18)', fontWeight: 450 }}
      >
        Touch the tree
      </p>
    </div>
  );
}
