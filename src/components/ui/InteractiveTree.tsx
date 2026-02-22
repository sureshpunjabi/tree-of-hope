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
  rotation: number;
  opacity: number;
  swayOffset: number;
  glowAmount: number;
  supporterName?: string;
}

const LEAF_COLORS = [
  '#4A6741', '#5B8A4E', '#66BB6A', '#81C784',
  '#6B9362', '#388E3C', '#2E7D32', '#43A047',
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
    const sway = (Math.random() - 0.5) * 0.15;
    const endX = x + Math.cos(angle + sway) * length;
    const endY = y + Math.sin(angle + sway) * length;

    const branch: Branch = {
      startX: x, startY: y, endX, endY,
      width, depth, angle, length,
      progress: 0,
      children: [],
      leaves: [],
    };

    if (depth < 7 && length > 10) {
      const numBranches = depth < 2 ? 2 : (Math.random() > 0.4 ? 2 : 3);
      for (let i = 0; i < numBranches; i++) {
        const spread = 0.3 + Math.random() * 0.4;
        const newAngle = angle + (i === 0 ? -spread : i === 1 ? spread : (Math.random() - 0.5) * 0.4);
        const newLength = length * (0.6 + Math.random() * 0.2);
        const newWidth = width * 0.72;
        branch.children.push(createBranch(endX, endY, newAngle, newLength, newWidth, depth + 1));
      }
    }

    if (depth >= 3) {
      const numLeaves = depth >= 5 ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < numLeaves; i++) {
        const lx = endX + (Math.random() - 0.5) * 28;
        const ly = endY + (Math.random() - 0.5) * 28;
        const leaf: TreeLeaf = {
          x: lx,
          y: ly,
          baseX: lx,
          baseY: ly,
          size: 12 + Math.random() * 14,
          color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          opacity: 0.85 + Math.random() * 0.15,
          swayOffset: Math.random() * Math.PI * 2,
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
    // Trunk starts from base, grows upward. Bold trunk, long reach.
    treeRef.current = createBranch(W / 2, H - 85, -Math.PI / 2, 110, 16, 0);

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

      // Base rim (top edge highlight)
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
      soilGrad.addColorStop(0, 'rgba(101, 80, 56, 0.35)');
      soilGrad.addColorStop(0.6, 'rgba(101, 80, 56, 0.2)');
      soilGrad.addColorStop(1, 'rgba(101, 80, 56, 0.05)');
      ctx.fillStyle = soilGrad;
      ctx.fill();

      // Tiny moss/grass patches
      const grassY = domeBaseY - 5;
      ctx.fillStyle = 'rgba(74, 103, 65, 0.2)';
      for (let gx = domeX - 100; gx < domeX + 100; gx += 15 + Math.random() * 20) {
        const gw = 4 + Math.random() * 6;
        const gh = 2 + Math.random() * 3;
        ctx.beginPath();
        ctx.ellipse(gx, grassY + Math.random() * 6, gw, gh, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Decorative pebbles
      const pebbleColor = 'rgba(140, 120, 100, 0.25)';
      ctx.fillStyle = pebbleColor;
      [[domeX - 60, domeBaseY - 8, 4], [domeX + 45, domeBaseY - 6, 3.5],
       [domeX - 25, domeBaseY - 4, 2.5], [domeX + 70, domeBaseY - 7, 2.8],
       [domeX - 80, domeBaseY - 5, 2], [domeX + 15, domeBaseY - 3, 3]].forEach(([px, py, pr]) => {
        ctx.beginPath();
        ctx.ellipse(px, py, pr, pr * 0.7, 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Glass dome ──
      ctx.beginPath();
      ctx.ellipse(domeX, domeBaseY, domeRadiusX, domeRadiusY, 0, Math.PI, 0);
      ctx.closePath();

      // Glass fill — very subtle tint
      const domeGrad = ctx.createLinearGradient(domeX, domeBaseY - domeRadiusY, domeX, domeBaseY);
      domeGrad.addColorStop(0, 'rgba(220, 235, 220, 0.08)');
      domeGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.03)');
      domeGrad.addColorStop(1, 'rgba(200, 210, 200, 0.06)');
      ctx.fillStyle = domeGrad;
      ctx.fill();

      // Glass edge (visible, elegant)
      ctx.beginPath();
      ctx.ellipse(domeX, domeBaseY, domeRadiusX, domeRadiusY, 0, Math.PI, 0);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(140, 155, 140, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner edge highlight
      ctx.beginPath();
      ctx.ellipse(domeX, domeBaseY, domeRadiusX - 3, domeRadiusY - 3, 0, Math.PI, 0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Left-side light reflection ──
      ctx.beginPath();
      ctx.ellipse(domeX - domeRadiusX * 0.5, domeBaseY - domeRadiusY * 0.5, 12, domeRadiusY * 0.3, -0.25, 0, Math.PI * 2);
      const reflGrad = ctx.createRadialGradient(
        domeX - domeRadiusX * 0.5, domeBaseY - domeRadiusY * 0.5, 0,
        domeX - domeRadiusX * 0.5, domeBaseY - domeRadiusY * 0.5, domeRadiusY * 0.3
      );
      reflGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      reflGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.07)');
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
      topHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      topHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = topHighlight;
      ctx.fill();

      // ── Moving sparkle ──
      const sparkleAngle = time * 0.0004;
      const sparkleX = domeX + Math.cos(sparkleAngle) * domeRadiusX * 0.55;
      const sparkleY = domeBaseY - domeRadiusY * 0.4 + Math.sin(sparkleAngle * 1.3) * 40;
      const sparkleAlpha = (Math.sin(time * 0.003) + 1) * 0.15 + 0.05;

      // Star-shaped sparkle
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

    // ─── Draw branch with natural curvature ───
    const drawBranch = (branch: Branch, time: number) => {
      if (branch.progress <= 0) return;

      const p = Math.min(branch.progress, 1);
      const currentEndX = branch.startX + (branch.endX - branch.startX) * p;
      const currentEndY = branch.startY + (branch.endY - branch.startY) * p;

      const windX = mouseRef.current.x > 0 ? (mouseRef.current.x - W / 2) * 0.0003 * branch.depth : 0;
      const sway = Math.sin(time * 0.0008 + branch.depth * 0.7) * branch.depth * 0.25;

      // Draw branch with gradient
      ctx.beginPath();
      ctx.moveTo(branch.startX, branch.startY);
      const cpX = (branch.startX + currentEndX) / 2 + sway + windX * 10;
      const cpY = (branch.startY + currentEndY) / 2;
      ctx.quadraticCurveTo(cpX, cpY, currentEndX + sway + windX * 15, currentEndY);

      // Bark color — rich, visible brown tones
      const r = 85 - branch.depth * 4;
      const g = 60 - branch.depth * 3;
      const b = 42 - branch.depth * 2;
      ctx.strokeStyle = `rgb(${Math.max(40, r)}, ${Math.max(30, g)}, ${Math.max(20, b)})`;
      ctx.lineWidth = Math.max(1.5, branch.width * p);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Draw leaves when branch is mostly grown
      if (branch.progress > 0.7) {
        const leafProgress = Math.min((branch.progress - 0.7) / 0.3, 1);
        branch.leaves.forEach(leaf => {
          const leafSway = Math.sin(time * 0.0015 + leaf.swayOffset) * 2;
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          const dx = mx - leaf.baseX;
          const dy = my - leaf.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Magnetic pull toward cursor when close
          const magnetRange = 70;
          let magnetX = 0;
          let magnetY = 0;
          if (dist < magnetRange && dist > 0) {
            const force = (1 - dist / magnetRange) * 6;
            magnetX = (dx / dist) * force;
            magnetY = (dy / dist) * force;
            leaf.glowAmount = Math.min(leaf.glowAmount + 0.1, 1);
          } else {
            leaf.glowAmount = Math.max(leaf.glowAmount - 0.04, 0);
          }

          leaf.x = leaf.baseX + leafSway + windX * 20 + magnetX;
          leaf.y = leaf.baseY + magnetY;

          ctx.save();
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.rotation + Math.sin(time * 0.001 + leaf.swayOffset) * 0.08);
          ctx.globalAlpha = leaf.opacity * leafProgress;

          // Glow effect for nearby leaves
          if (leaf.glowAmount > 0) {
            ctx.shadowColor = '#66BB6A';
            ctx.shadowBlur = 16 * leaf.glowAmount;
          }

          // Leaf shape — teardrop with more body
          const s = leaf.size * (1 + leaf.glowAmount * 0.35);
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.bezierCurveTo(s * 0.8, -s * 0.3, s * 0.5, s * 0.5, 0, s * 0.7);
          ctx.bezierCurveTo(-s * 0.5, s * 0.5, -s * 0.8, -s * 0.3, 0, -s);
          ctx.fillStyle = leaf.color;
          ctx.fill();

          // Leaf vein (central)
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.6);
          ctx.lineTo(0, s * 0.5);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + leaf.glowAmount * 0.15})`;
          ctx.lineWidth = 0.6;
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
          ctx.stroke();

          // Side veins
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.2);
          ctx.lineTo(s * 0.3, -s * 0.05);
          ctx.moveTo(0, 0);
          ctx.lineTo(-s * 0.25, s * 0.15);
          ctx.moveTo(0, s * 0.2);
          ctx.lineTo(s * 0.2, s * 0.3);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + leaf.glowAmount * 0.1})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();

          ctx.restore();
        });
      }

      // Recursively draw children
      if (p >= 0.6) {
        branch.children.forEach(child => drawBranch(child, time));
      }
    };

    // ─── Growth animation — faster cascade ───
    const growTree = (branch: Branch, parentProgress: number) => {
      const growSpeed = 0.02;
      if (parentProgress > 0.3) {
        branch.progress = Math.min(branch.progress + growSpeed, 1);
      }
      branch.children.forEach(child => growTree(child, branch.progress));
    };

    // ─── Hover detection ───
    const checkHover = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      let closest: TreeLeaf | null = null;
      let closestDist = 30;

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

    // ─── Draw lush canopy cloud behind individual leaves ───
    const drawCanopy = (time: number) => {
      if (allLeavesRef.current.length === 0) return;

      // Find the bounding box of all leaves
      let minX = W, maxX = 0, minY = H, maxY = 0;
      for (const leaf of allLeavesRef.current) {
        if (leaf.baseX < minX) minX = leaf.baseX;
        if (leaf.baseX > maxX) maxX = leaf.baseX;
        if (leaf.baseY < minY) minY = leaf.baseY;
        if (leaf.baseY > maxY) maxY = leaf.baseY;
      }

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const rx = (maxX - minX) / 2 + 30;
      const ry = (maxY - minY) / 2 + 25;

      // Draw overlapping soft green circles for a canopy "cloud"
      const canopyBlobs = [
        { x: cx, y: cy, r: Math.max(rx, ry) * 0.75 },
        { x: cx - rx * 0.4, y: cy - ry * 0.2, r: Math.max(rx, ry) * 0.6 },
        { x: cx + rx * 0.4, y: cy - ry * 0.15, r: Math.max(rx, ry) * 0.6 },
        { x: cx - rx * 0.15, y: cy - ry * 0.5, r: Math.max(rx, ry) * 0.5 },
        { x: cx + rx * 0.2, y: cy + ry * 0.35, r: Math.max(rx, ry) * 0.45 },
        { x: cx - rx * 0.55, y: cy + ry * 0.2, r: Math.max(rx, ry) * 0.4 },
        { x: cx + rx * 0.55, y: cy + ry * 0.15, r: Math.max(rx, ry) * 0.42 },
      ];

      const breathe = Math.sin(time * 0.0006) * 0.02 + 1;

      ctx.save();
      for (const blob of canopyBlobs) {
        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r * breathe);
        grad.addColorStop(0, 'rgba(74, 130, 65, 0.18)');
        grad.addColorStop(0.5, 'rgba(90, 150, 80, 0.10)');
        grad.addColorStop(1, 'rgba(100, 170, 90, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r * breathe, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    // ─── Main animation loop ───
    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, W, H);

      if (treeRef.current) {
        treeRef.current.progress = Math.min(treeRef.current.progress + 0.025, 1);
        growTree(treeRef.current, 1);

        if (treeRef.current.progress >= 1) {
          isGrownRef.current = true;
        }

        // Draw canopy cloud first (behind branches)
        if (isGrownRef.current) {
          drawCanopy(timestamp);
        }
        drawBranch(treeRef.current, timestamp);
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
        className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74, 103, 65, 0.3) 0%, transparent 70%)',
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
