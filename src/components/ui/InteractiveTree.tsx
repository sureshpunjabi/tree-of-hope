'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface Branch {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  depth: number;
  angle: number;
  length: number;
  progress: number;
  children: Branch[];
  leaves: TreeLeaf[];
}

interface TreeLeaf {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  highlightColor: string;
  rotation: number;
  opacity: number;
  swayOffset: number;
  swaySpeed: number;
  glowAmount: number;
  supporterName?: string;
}

// Rich palette — spring greens, deep forest, lime accents, golden highlights
const LEAF_COLORS = [
  { fill: '#4A7C3F', highlight: '#6AAE58' },
  { fill: '#5B9A4A', highlight: '#7DC06A' },
  { fill: '#3D6E35', highlight: '#5A9C4E' },
  { fill: '#6DB85A', highlight: '#8ED47A' },
  { fill: '#82C46E', highlight: '#A0DC8E' },
  { fill: '#2E7D32', highlight: '#4CAF50' },
  { fill: '#558B2F', highlight: '#7CB342' },
  { fill: '#43A047', highlight: '#66BB6A' },
  { fill: '#8BC34A', highlight: '#AED581' }, // lime accent
  { fill: '#689F38', highlight: '#8BC34A' },
];

const SUPPORTER_NAMES = [
  'James', 'Mom', 'Rachel', 'David & Ana', 'Coach Williams',
  'Priya', 'Marcus', 'The Nguyens', 'Elena', 'Dr. Mehta',
  'Anonymous', 'Sophie & Tom',
];

export default function InteractiveTree() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const treeRef = useRef<Branch | null>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const animFrameRef = useRef(0);
  const allLeavesRef = useRef<TreeLeaf[]>([]);
  const hoveredLeafRef = useRef<TreeLeaf | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);
  const nameIndexRef = useRef(0);
  const isGrownRef = useRef(false);

  const createBranch = useCallback((
    x: number, y: number, angle: number, length: number, width: number, depth: number
  ): Branch => {
    const sway = (Math.random() - 0.5) * 0.18;
    const endX = x + Math.cos(angle + sway) * length;
    const endY = y + Math.sin(angle + sway) * length;

    const branch: Branch = {
      startX: x, startY: y, endX, endY,
      width, depth, angle, length,
      progress: 0,
      children: [],
      leaves: [],
    };

    // More aggressive branching for a fuller tree
    if (depth < 8 && length > 8) {
      const numBranches = depth < 2 ? 3 : depth < 4 ? (Math.random() > 0.3 ? 3 : 2) : (Math.random() > 0.5 ? 2 : 3);
      for (let i = 0; i < numBranches; i++) {
        const spread = depth < 3 ? 0.35 + Math.random() * 0.35 : 0.25 + Math.random() * 0.5;
        const offsetAngle = numBranches === 2
          ? (i === 0 ? -spread : spread)
          : (i === 0 ? -spread : i === 1 ? spread : (Math.random() - 0.5) * 0.5);
        const newAngle = angle + offsetAngle;
        const decay = 0.62 + Math.random() * 0.13;
        const newLength = length * decay;
        const newWidth = width * 0.68;
        branch.children.push(createBranch(endX, endY, newAngle, newLength, newWidth, depth + 1));
      }
    }

    // Leaves on branches depth 3+
    if (depth >= 3) {
      const numLeaves = depth >= 6 ? Math.floor(Math.random() * 6) + 4 : depth >= 4 ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < numLeaves; i++) {
        const spread = depth >= 5 ? 22 : 18;
        const lx = endX + (Math.random() - 0.5) * spread * 2;
        const ly = endY + (Math.random() - 0.5) * spread * 2;
        const colorPick = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
        const leaf: TreeLeaf = {
          x: lx,
          y: ly,
          baseX: lx,
          baseY: ly,
          size: 8 + Math.random() * 12 + (depth >= 5 ? 4 : 0),
          color: colorPick.fill,
          highlightColor: colorPick.highlight,
          rotation: Math.random() * Math.PI * 2,
          opacity: 0.8 + Math.random() * 0.2,
          swayOffset: Math.random() * Math.PI * 2,
          swaySpeed: 0.001 + Math.random() * 0.001,
          glowAmount: 0,
          supporterName: SUPPORTER_NAMES[nameIndexRef.current % SUPPORTER_NAMES.length],
        };
        nameIndexRef.current++;
        branch.leaves.push(leaf);
        allLeavesRef.current.push(leaf);
      }
    }

    return branch;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = 500;
    const H = 550;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    allLeavesRef.current = [];
    nameIndexRef.current = 0;
    // Bold trunk — longer reach, thicker base
    treeRef.current = createBranch(W / 2, H - 85, -Math.PI / 2, 130, 18, 0);

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
      setTooltip(null);
    };

    const onTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const touch = e.touches[0];
      if (touch) {
        mouseRef.current = {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
    };

    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('touchstart', onTouch, { passive: true });

    // ─── Dome geometry ───
    const domeX = W / 2;
    const domeBaseY = H - 65;
    const domeRadiusX = 190;
    const domeRadiusY = 255;

    // ─── Draw the glass dome terrarium ───
    const drawDome = (time: number) => {
      ctx.save();

      // ── Wooden base platform ──
      const baseGrad = ctx.createLinearGradient(domeX - domeRadiusX - 25, domeBaseY, domeX + domeRadiusX + 25, domeBaseY);
      baseGrad.addColorStop(0, '#7A6548');
      baseGrad.addColorStop(0.25, '#9A8268');
      baseGrad.addColorStop(0.5, '#B09878');
      baseGrad.addColorStop(0.75, '#9A8268');
      baseGrad.addColorStop(1, '#7A6548');

      const baseH = 30;
      const baseW = domeRadiusX * 2 + 50;
      const baseX = domeX - baseW / 2;

      // Base shadow
      ctx.beginPath();
      ctx.ellipse(domeX, domeBaseY + baseH + 6, baseW / 2 + 10, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fill();

      // Main base
      ctx.beginPath();
      ctx.roundRect(baseX, domeBaseY, baseW, baseH, 10);
      ctx.fillStyle = baseGrad;
      ctx.fill();

      // Base rim
      ctx.beginPath();
      ctx.roundRect(baseX + 3, domeBaseY, baseW - 6, 4, [4, 4, 0, 0]);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();

      // Base dark underside
      ctx.beginPath();
      ctx.roundRect(baseX, domeBaseY + baseH - 8, baseW, 8, [0, 0, 10, 10]);
      ctx.fillStyle = 'rgba(60, 40, 20, 0.2)';
      ctx.fill();

      // ── Soil / ground inside dome ──
      ctx.beginPath();
      ctx.ellipse(domeX, domeBaseY - 2, domeRadiusX - 15, 18, 0, 0, Math.PI * 2);
      const soilGrad = ctx.createRadialGradient(domeX, domeBaseY - 2, 0, domeX, domeBaseY - 2, domeRadiusX - 15);
      soilGrad.addColorStop(0, 'rgba(101, 80, 56, 0.4)');
      soilGrad.addColorStop(0.6, 'rgba(101, 80, 56, 0.25)');
      soilGrad.addColorStop(1, 'rgba(101, 80, 56, 0.05)');
      ctx.fillStyle = soilGrad;
      ctx.fill();

      // Tiny moss/grass patches
      const grassY = domeBaseY - 5;
      ctx.fillStyle = 'rgba(74, 103, 65, 0.25)';
      for (let gx = domeX - 110; gx < domeX + 110; gx += 12 + Math.random() * 16) {
        const gw = 4 + Math.random() * 7;
        const gh = 2 + Math.random() * 3;
        ctx.beginPath();
        ctx.ellipse(gx, grassY + Math.random() * 6, gw, gh, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Decorative pebbles
      ctx.fillStyle = 'rgba(140, 120, 100, 0.3)';
      [[domeX - 60, domeBaseY - 8, 4], [domeX + 45, domeBaseY - 6, 3.5],
       [domeX - 25, domeBaseY - 4, 2.5], [domeX + 70, domeBaseY - 7, 2.8],
       [domeX - 80, domeBaseY - 5, 2], [domeX + 15, domeBaseY - 3, 3],
       [domeX - 95, domeBaseY - 6, 2.2], [domeX + 90, domeBaseY - 5, 1.8]].forEach(([px, py, pr]) => {
        ctx.beginPath();
        ctx.ellipse(px, py, pr, pr * 0.7, 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Glass dome ──
      ctx.beginPath();
      ctx.ellipse(domeX, domeBaseY, domeRadiusX, domeRadiusY, 0, Math.PI, 0);
      ctx.closePath();

      // Glass fill
      const domeGrad = ctx.createLinearGradient(domeX, domeBaseY - domeRadiusY, domeX, domeBaseY);
      domeGrad.addColorStop(0, 'rgba(220, 235, 220, 0.07)');
      domeGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.02)');
      domeGrad.addColorStop(1, 'rgba(200, 210, 200, 0.05)');
      ctx.fillStyle = domeGrad;
      ctx.fill();

      // Glass edge
      ctx.beginPath();
      ctx.ellipse(domeX, domeBaseY, domeRadiusX, domeRadiusY, 0, Math.PI, 0);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(140, 155, 140, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner edge highlight
      ctx.beginPath();
      ctx.ellipse(domeX, domeBaseY, domeRadiusX - 3, domeRadiusY - 3, 0, Math.PI, 0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Left-side light reflection ──
      ctx.beginPath();
      ctx.ellipse(domeX - domeRadiusX * 0.5, domeBaseY - domeRadiusY * 0.5, 12, domeRadiusY * 0.3, -0.25, 0, Math.PI * 2);
      const reflGrad = ctx.createRadialGradient(
        domeX - domeRadiusX * 0.5, domeBaseY - domeRadiusY * 0.5, 0,
        domeX - domeRadiusX * 0.5, domeBaseY - domeRadiusY * 0.5, domeRadiusY * 0.3
      );
      reflGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      reflGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
      reflGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = reflGrad;
      ctx.fill();

      // ── Small top highlight ──
      ctx.beginPath();
      ctx.ellipse(domeX - 20, domeBaseY - domeRadiusY + 30, 25, 8, -0.1, 0, Math.PI * 2);
      const topHighlight = ctx.createRadialGradient(
        domeX - 20, domeBaseY - domeRadiusY + 30, 0,
        domeX - 20, domeBaseY - domeRadiusY + 30, 25
      );
      topHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
      topHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = topHighlight;
      ctx.fill();

      // ── Moving sparkle ──
      const sparkleAngle = time * 0.0004;
      const sparkleX = domeX + Math.cos(sparkleAngle) * domeRadiusX * 0.55;
      const sparkleY = domeBaseY - domeRadiusY * 0.4 + Math.sin(sparkleAngle * 1.3) * 40;
      const sparkleAlpha = (Math.sin(time * 0.003) + 1) * 0.12 + 0.04;

      ctx.save();
      ctx.translate(sparkleX, sparkleY);
      ctx.rotate(time * 0.001);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 4, Math.sin(a) * 4);
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha * 1.5})`;
      ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    // ─── Draw branch with natural curvature and bark texture ───
    const drawBranch = (branch: Branch, time: number) => {
      if (branch.progress <= 0) return;

      const p = Math.min(branch.progress, 1);
      const currentEndX = branch.startX + (branch.endX - branch.startX) * p;
      const currentEndY = branch.startY + (branch.endY - branch.startY) * p;

      const windX = mouseRef.current.x > 0 ? (mouseRef.current.x - W / 2) * 0.0002 * branch.depth : 0;
      const sway = Math.sin(time * 0.0008 + branch.depth * 0.7) * branch.depth * 0.2;

      // Control point for smooth curve
      const cpX = (branch.startX + currentEndX) / 2 + sway + windX * 10;
      const cpY = (branch.startY + currentEndY) / 2;

      // Draw the branch — thicker outline for depth
      if (branch.depth < 4 && branch.width > 3) {
        ctx.beginPath();
        ctx.moveTo(branch.startX, branch.startY);
        ctx.quadraticCurveTo(cpX, cpY, currentEndX + sway + windX * 15, currentEndY);
        const darkR = Math.max(30, 65 - branch.depth * 6);
        const darkG = Math.max(22, 45 - branch.depth * 5);
        const darkB = Math.max(15, 32 - branch.depth * 4);
        ctx.strokeStyle = `rgb(${darkR}, ${darkG}, ${darkB})`;
        ctx.lineWidth = Math.max(2, branch.width * p) + 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Main branch color
      ctx.beginPath();
      ctx.moveTo(branch.startX, branch.startY);
      ctx.quadraticCurveTo(cpX, cpY, currentEndX + sway + windX * 15, currentEndY);

      // Rich bark gradient — warm browns
      const r = Math.max(45, 95 - branch.depth * 5);
      const g = Math.max(32, 68 - branch.depth * 4);
      const b = Math.max(22, 48 - branch.depth * 3);
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = Math.max(1.2, branch.width * p);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Bark highlight on thick branches
      if (branch.depth < 3 && branch.width > 5) {
        ctx.beginPath();
        ctx.moveTo(branch.startX + 1, branch.startY);
        ctx.quadraticCurveTo(cpX + 1, cpY, currentEndX + sway + windX * 15 + 1, currentEndY);
        ctx.strokeStyle = `rgba(180, 155, 130, 0.25)`;
        ctx.lineWidth = Math.max(1, branch.width * p * 0.3);
        ctx.stroke();
      }

      // Draw leaves when branch is mostly grown
      if (branch.progress > 0.7) {
        const leafProgress = Math.min((branch.progress - 0.7) / 0.3, 1);
        branch.leaves.forEach(leaf => {
          const leafSway = Math.sin(time * leaf.swaySpeed + leaf.swayOffset) * 2.5;
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          const dx = mx - leaf.baseX;
          const dy = my - leaf.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Magnetic pull
          const magnetRange = 65;
          let magnetX = 0;
          let magnetY = 0;
          if (dist < magnetRange && dist > 0) {
            const force = (1 - dist / magnetRange) * 5;
            magnetX = (dx / dist) * force;
            magnetY = (dy / dist) * force;
            leaf.glowAmount = Math.min(leaf.glowAmount + 0.08, 1);
          } else {
            leaf.glowAmount = Math.max(leaf.glowAmount - 0.03, 0);
          }

          leaf.x = leaf.baseX + leafSway + windX * 18 + magnetX;
          leaf.y = leaf.baseY + Math.sin(time * 0.0012 + leaf.swayOffset) * 0.8 + magnetY;

          ctx.save();
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.rotation + Math.sin(time * 0.0008 + leaf.swayOffset) * 0.06);
          ctx.globalAlpha = leaf.opacity * leafProgress;

          // Glow when hovered
          if (leaf.glowAmount > 0) {
            ctx.shadowColor = leaf.highlightColor;
            ctx.shadowBlur = 14 * leaf.glowAmount;
          }

          const s = leaf.size * (0.9 + leafProgress * 0.1) * (1 + leaf.glowAmount * 0.2);

          // Natural leaf shape — pointed tip, rounded body
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.9);
          ctx.bezierCurveTo(s * 0.55, -s * 0.5, s * 0.6, s * 0.1, s * 0.1, s * 0.55);
          ctx.bezierCurveTo(0, s * 0.65, 0, s * 0.65, -s * 0.1, s * 0.55);
          ctx.bezierCurveTo(-s * 0.6, s * 0.1, -s * 0.55, -s * 0.5, 0, -s * 0.9);
          ctx.closePath();

          // Fill with slight gradient
          const leafGrad = ctx.createLinearGradient(0, -s, 0, s * 0.6);
          leafGrad.addColorStop(0, leaf.highlightColor);
          leafGrad.addColorStop(0.4, leaf.color);
          leafGrad.addColorStop(1, leaf.color);
          ctx.fillStyle = leafGrad;
          ctx.fill();

          // Subtle edge
          ctx.strokeStyle = `rgba(0, 0, 0, 0.08)`;
          ctx.lineWidth = 0.4;
          ctx.stroke();

          // Central vein
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.7);
          ctx.quadraticCurveTo(0.5, 0, 0, s * 0.45);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + leaf.glowAmount * 0.15})`;
          ctx.lineWidth = 0.7;
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
          ctx.stroke();

          // Side veins
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.3);
          ctx.lineTo(s * 0.3, -s * 0.15);
          ctx.moveTo(0, -s * 0.05);
          ctx.lineTo(-s * 0.28, s * 0.1);
          ctx.moveTo(0, s * 0.15);
          ctx.lineTo(s * 0.22, s * 0.28);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 + leaf.glowAmount * 0.08})`;
          ctx.lineWidth = 0.35;
          ctx.stroke();

          ctx.restore();
        });
      }

      // Recursively draw children
      if (p >= 0.5) {
        branch.children.forEach(child => drawBranch(child, time));
      }
    };

    // ─── Growth animation ───
    const growTree = (branch: Branch, parentProgress: number) => {
      const speed = branch.depth === 0 ? 0.03 : 0.022;
      if (parentProgress > 0.25) {
        branch.progress = Math.min(branch.progress + speed, 1);
      }
      branch.children.forEach(child => growTree(child, branch.progress));
    };

    // ─── Hover detection ───
    const checkHover = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      let closest: TreeLeaf | null = null;
      let closestDist = 28;

      for (const leaf of allLeavesRef.current) {
        const dx = mx - leaf.x;
        const dy = my - leaf.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = leaf;
        }
      }

      if (closest !== hoveredLeafRef.current) {
        hoveredLeafRef.current = closest;
        if (closest && closest.supporterName && isGrownRef.current) {
          const rect = canvas.getBoundingClientRect();
          setTooltip({
            x: (closest.x / W) * rect.width,
            y: (closest.y / H) * rect.height - 16,
            name: closest.supporterName,
          });
        } else {
          setTooltip(null);
        }
      }
    };

    // ─── Subtle canopy glow — BEHIND everything, very faint ───
    const drawCanopyGlow = (time: number) => {
      if (allLeavesRef.current.length === 0) return;

      let minX = W, maxX = 0, minY = H, maxY = 0;
      for (const leaf of allLeavesRef.current) {
        if (leaf.baseX < minX) minX = leaf.baseX;
        if (leaf.baseX > maxX) maxX = leaf.baseX;
        if (leaf.baseY < minY) minY = leaf.baseY;
        if (leaf.baseY > maxY) maxY = leaf.baseY;
      }

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const rx = (maxX - minX) / 2 + 35;
      const ry = (maxY - minY) / 2 + 30;

      const breathe = Math.sin(time * 0.0005) * 0.015 + 1;

      // Just 3 very subtle blobs — hint of green atmosphere
      ctx.save();
      const blobs = [
        { x: cx, y: cy, r: Math.max(rx, ry) * 0.7 },
        { x: cx - rx * 0.3, y: cy - ry * 0.25, r: Math.max(rx, ry) * 0.5 },
        { x: cx + rx * 0.3, y: cy + ry * 0.1, r: Math.max(rx, ry) * 0.5 },
      ];

      for (const blob of blobs) {
        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r * breathe);
        grad.addColorStop(0, 'rgba(74, 130, 65, 0.06)');
        grad.addColorStop(0.5, 'rgba(90, 150, 80, 0.03)');
        grad.addColorStop(1, 'rgba(100, 170, 90, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r * breathe, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    // ─── Floating light particles ───
    const particles: { x: number; y: number; speed: number; size: number; phase: number }[] = [];
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: domeX - 120 + Math.random() * 240,
        y: domeBaseY - 60 - Math.random() * 200,
        speed: 0.2 + Math.random() * 0.3,
        size: 1 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const drawParticles = (time: number) => {
      ctx.save();
      for (const p of particles) {
        const y = p.y - (time * p.speed * 0.01) % 220;
        const adjustedY = y < domeBaseY - 260 ? y + 220 : y;
        const x = p.x + Math.sin(time * 0.001 + p.phase) * 8;
        const alpha = (Math.sin(time * 0.002 + p.phase) + 1) * 0.15 + 0.05;

        ctx.beginPath();
        ctx.arc(x, adjustedY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 230, 180, ${alpha})`;
        ctx.fill();
      }
      ctx.restore();
    };

    // ─── Main animation loop ───
    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, W, H);

      if (treeRef.current) {
        treeRef.current.progress = Math.min(treeRef.current.progress + 0.03, 1);
        growTree(treeRef.current, 1);

        if (treeRef.current.progress >= 1) {
          isGrownRef.current = true;
        }

        // Layer order: canopy glow → branches+leaves → particles → dome glass
        if (isGrownRef.current) {
          drawCanopyGlow(timestamp);
        }
        drawBranch(treeRef.current, timestamp);
        if (isGrownRef.current) {
          drawParticles(timestamp);
        }
        drawDome(timestamp);
        checkHover();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchstart', onTouch);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [createBranch]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Ambient glow behind dome */}
      <div
        className="absolute rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74, 124, 63, 0.25) 0%, transparent 70%)',
          width: '120%',
          height: '120%',
          top: '-10%',
          left: '-10%',
        }}
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="relative z-10 cursor-pointer"
          style={{ width: '100%', maxWidth: 500, height: 'auto', aspectRatio: '500 / 550' }}
        />
        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div
              className="px-3.5 py-1.5 rounded-full text-[11px] font-medium text-white whitespace-nowrap shadow-lg"
              style={{ backgroundColor: 'rgba(74, 103, 65, 0.92)', backdropFilter: 'blur(8px)' }}
            >
              {tooltip.name}&apos;s leaf
            </div>
          </div>
        )}
      </div>
      {/* Label */}
      <p className="mt-3 text-[11px] text-[var(--color-text-muted)] tracking-[0.12em] uppercase opacity-40">
        Hover the leaves
      </p>
    </div>
  );
}
