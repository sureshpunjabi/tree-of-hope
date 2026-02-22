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
  '#4A6741', '#66BB6A', '#81C784', '#A5D6A7',
  '#C8E6C9', '#388E3C', '#2E7D32', '#43A047',
];

const SUPPORTER_NAMES = [
  'James', 'Mom', 'Rachel', 'David & Ana', 'Coach Williams',
  'Priya', 'Marcus', 'The Nguyens', 'Elena', 'Dr. Mehta',
  'Anonymous', 'Sophie & Tom',
];

export default function InteractiveTree() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const treeRef = useRef<Branch | null>(null);
  const mouseRef = useRef({ x: 250, y: 250 });
  const animFrameRef = useRef(0);
  const allLeavesRef = useRef<TreeLeaf[]>([]);
  const hoveredLeafRef = useRef<TreeLeaf | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);
  const nameIndexRef = useRef(0);
  const isGrownRef = useRef(false);

  const createBranch = useCallback((
    x: number, y: number, angle: number, length: number, width: number, depth: number
  ): Branch => {
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    const branch: Branch = {
      startX: x, startY: y, endX, endY,
      width, depth, angle, length,
      progress: 0,
      children: [],
      leaves: [],
    };

    if (depth < 8 && length > 8) {
      const numBranches = depth < 3 ? 2 : (Math.random() > 0.3 ? 2 : 3);
      for (let i = 0; i < numBranches; i++) {
        const spread = 0.4 + Math.random() * 0.3;
        const newAngle = angle + (i === 0 ? -spread : i === 1 ? spread : (Math.random() - 0.5) * 0.3);
        const newLength = length * (0.65 + Math.random() * 0.15);
        const newWidth = width * 0.7;
        branch.children.push(createBranch(endX, endY, newAngle, newLength, newWidth, depth + 1));
      }
    }

    if (depth >= 5) {
      const numLeaves = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numLeaves; i++) {
        const lx = endX + (Math.random() - 0.5) * 14;
        const ly = endY + (Math.random() - 0.5) * 14;
        const leaf: TreeLeaf = {
          x: lx,
          y: ly,
          baseX: lx,
          baseY: ly,
          size: 4 + Math.random() * 6,
          color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          opacity: 0.6 + Math.random() * 0.4,
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
    const H = 520;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    allLeavesRef.current = [];
    nameIndexRef.current = 0;
    treeRef.current = createBranch(W / 2, H - 70, -Math.PI / 2, 85, 8, 0);

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
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
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('touchstart', onTouch, { passive: true });

    // Dome dimensions
    const domeX = W / 2;
    const domeBaseY = H - 55;
    const domeRadiusX = 185;
    const domeRadiusY = 240;

    const drawDome = (time: number) => {
      // Glass dome base platform
      ctx.save();

      // Wooden base
      const baseGrad = ctx.createLinearGradient(domeX - domeRadiusX - 20, domeBaseY, domeX + domeRadiusX + 20, domeBaseY);
      baseGrad.addColorStop(0, '#8B7355');
      baseGrad.addColorStop(0.3, '#A0896A');
      baseGrad.addColorStop(0.5, '#B09878');
      baseGrad.addColorStop(0.7, '#A0896A');
      baseGrad.addColorStop(1, '#8B7355');

      // Base platform - rounded rect
      const baseH = 28;
      const baseW = domeRadiusX * 2 + 40;
      const baseX = domeX - baseW / 2;
      ctx.beginPath();
      ctx.roundRect(baseX, domeBaseY - 2, baseW, baseH, 8);
      ctx.fillStyle = baseGrad;
      ctx.fill();

      // Base subtle shadow
      ctx.beginPath();
      ctx.roundRect(baseX, domeBaseY + baseH - 6, baseW, 6, [0, 0, 8, 8]);
      ctx.fillStyle = 'rgba(93, 64, 55, 0.15)';
      ctx.fill();

      // Glass dome - elliptical arc
      ctx.beginPath();
      ctx.ellipse(domeX, domeBaseY, domeRadiusX, domeRadiusY, 0, Math.PI, 0);

      // Glass gradient - subtle, transparent
      const domeGrad = ctx.createRadialGradient(
        domeX - 40, domeBaseY - domeRadiusY * 0.6, 20,
        domeX, domeBaseY - domeRadiusY * 0.4, domeRadiusX * 1.2
      );
      domeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      domeGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
      domeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
      ctx.fillStyle = domeGrad;
      ctx.fill();

      // Glass edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Light reflection on glass (left side highlight)
      ctx.beginPath();
      ctx.ellipse(domeX - domeRadiusX * 0.45, domeBaseY - domeRadiusY * 0.55, 15, domeRadiusY * 0.35, -0.3, 0, Math.PI * 2);
      const reflGrad = ctx.createRadialGradient(
        domeX - domeRadiusX * 0.45, domeBaseY - domeRadiusY * 0.55, 0,
        domeX - domeRadiusX * 0.45, domeBaseY - domeRadiusY * 0.55, domeRadiusY * 0.35
      );
      reflGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      reflGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = reflGrad;
      ctx.fill();

      // Tiny sparkle that moves with time
      const sparkleAngle = time * 0.0003;
      const sparkleX = domeX + Math.cos(sparkleAngle) * domeRadiusX * 0.6;
      const sparkleY = domeBaseY - domeRadiusY * 0.3 + Math.sin(sparkleAngle * 1.5) * 30;
      const sparkleAlpha = (Math.sin(time * 0.003) + 1) * 0.1;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
      ctx.fill();

      ctx.restore();
    };

    const drawBranch = (branch: Branch, time: number) => {
      if (branch.progress <= 0) return;

      const p = Math.min(branch.progress, 1);
      const currentEndX = branch.startX + (branch.endX - branch.startX) * p;
      const currentEndY = branch.startY + (branch.endY - branch.startY) * p;

      const windX = (mouseRef.current.x - 250) * 0.0004 * branch.depth;
      const sway = Math.sin(time * 0.001 + branch.depth * 0.5) * branch.depth * 0.3;

      ctx.beginPath();
      ctx.moveTo(branch.startX, branch.startY);
      const cpX = (branch.startX + currentEndX) / 2 + sway + windX * 10;
      const cpY = (branch.startY + currentEndY) / 2;
      ctx.quadraticCurveTo(cpX, cpY, currentEndX + sway + windX * 20, currentEndY);

      const darkness = Math.max(0.2, 1 - branch.depth * 0.1);
      ctx.strokeStyle = `rgba(93, 64, 55, ${darkness})`;
      ctx.lineWidth = branch.width * p;
      ctx.lineCap = 'round';
      ctx.stroke();

      if (branch.progress > 0.8) {
        const leafProgress = (branch.progress - 0.8) / 0.2;
        branch.leaves.forEach(leaf => {
          const leafSway = Math.sin(time * 0.002 + leaf.swayOffset) * 2.5;
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          const dx = mx - leaf.baseX;
          const dy = my - leaf.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Magnetic pull toward cursor when close
          const magnetRange = 60;
          let magnetX = 0;
          let magnetY = 0;
          if (dist < magnetRange) {
            const force = (1 - dist / magnetRange) * 4;
            magnetX = (dx / dist) * force;
            magnetY = (dy / dist) * force;
            leaf.glowAmount = Math.min(leaf.glowAmount + 0.08, 1);
          } else {
            leaf.glowAmount = Math.max(leaf.glowAmount - 0.03, 0);
          }

          leaf.x = leaf.baseX + leafSway + windX * 25 + magnetX;
          leaf.y = leaf.baseY + magnetY;

          ctx.save();
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.rotation + Math.sin(time * 0.001 + leaf.swayOffset) * 0.1);
          ctx.globalAlpha = leaf.opacity * leafProgress;

          // Glow effect for nearby leaves
          if (leaf.glowAmount > 0) {
            ctx.shadowColor = leaf.color;
            ctx.shadowBlur = 12 * leaf.glowAmount;
          }

          // Leaf shape
          const s = leaf.size * (1 + leaf.glowAmount * 0.3);
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(s * 0.7, -s * 0.2, 0, s * 0.6);
          ctx.quadraticCurveTo(-s * 0.7, -s * 0.2, 0, -s);
          ctx.fillStyle = leaf.color;
          ctx.fill();

          // Leaf vein
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.7);
          ctx.lineTo(0, s * 0.4);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + leaf.glowAmount * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();

          ctx.restore();
        });
      }

      if (p >= 0.7) {
        branch.children.forEach(child => drawBranch(child, time));
      }
    };

    const growTree = (branch: Branch, parentProgress: number) => {
      const growSpeed = 0.008;
      if (parentProgress > 0.5) {
        branch.progress = Math.min(branch.progress + growSpeed, 1);
      }
      branch.children.forEach(child => growTree(child, branch.progress));
    };

    // Check for hovered leaf
    const checkHover = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      let closest: TreeLeaf | null = null;
      let closestDist = 25;

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
            y: (closest.y / H) * rect.height - 20,
            name: closest.supporterName,
          });
        } else {
          setTooltip(null);
        }
      }
    };

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, W, H);

      if (treeRef.current) {
        treeRef.current.progress = Math.min(treeRef.current.progress + 0.012, 1);
        growTree(treeRef.current, 1);

        if (treeRef.current.progress >= 1) {
          isGrownRef.current = true;
        }

        // Draw ground inside dome
        const groundGrad = ctx.createRadialGradient(W / 2, H - 65, 0, W / 2, H - 65, 120);
        groundGrad.addColorStop(0, 'rgba(139, 119, 101, 0.12)');
        groundGrad.addColorStop(1, 'rgba(139, 119, 101, 0)');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(W / 2 - 150, H - 80, 300, 30);

        // Small decorative stones/pebbles
        ctx.fillStyle = 'rgba(160, 140, 120, 0.15)';
        ctx.beginPath(); ctx.arc(W / 2 - 50, H - 62, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(W / 2 + 35, H - 60, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(W / 2 - 20, H - 58, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(W / 2 + 55, H - 63, 1.8, 0, Math.PI * 2); ctx.fill();

        drawBranch(treeRef.current, timestamp);
        drawDome(timestamp);
        checkHover();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchstart', onTouch);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [createBranch]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74, 103, 65, 0.25) 0%, transparent 70%)',
          transform: 'scale(1.4)',
        }}
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="relative z-10 cursor-pointer"
          style={{ width: '100%', maxWidth: 500, height: 'auto', aspectRatio: '500 / 520' }}
        />
        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div
              className="px-3 py-1.5 rounded-full text-[11px] font-medium text-white whitespace-nowrap animate-fade-in-up"
              style={{ backgroundColor: 'rgba(74, 103, 65, 0.9)', backdropFilter: 'blur(8px)' }}
            >
              {tooltip.name}&apos;s leaf
            </div>
          </div>
        )}
      </div>
      {/* Label */}
      <p className="absolute bottom-0 text-[11px] text-[var(--color-text-muted)] tracking-[0.1em] uppercase opacity-50">
        Hover the leaves
      </p>
    </div>
  );
}
