'use client';

import { useEffect, useRef, useCallback } from 'react';

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
  size: number;
  color: string;
  rotation: number;
  opacity: number;
  swayOffset: number;
}

const LEAF_COLORS = [
  '#4A6741', '#66BB6A', '#81C784', '#A5D6A7',
  '#C8E6C9', '#388E3C', '#2E7D32', '#43A047',
];

export default function InteractiveTree() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const treeRef = useRef<Branch | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const animFrameRef = useRef(0);
  const timeRef = useRef(0);

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

    // Add leaves at branch tips
    if (depth >= 5) {
      const numLeaves = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numLeaves; i++) {
        branch.leaves.push({
          x: endX + (Math.random() - 0.5) * 12,
          y: endY + (Math.random() - 0.5) * 12,
          size: 3 + Math.random() * 5,
          color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          opacity: 0.6 + Math.random() * 0.4,
          swayOffset: Math.random() * Math.PI * 2,
        });
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
    const width = 500;
    const height = 500;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Create tree structure
    treeRef.current = createBranch(width / 2, height - 40, -Math.PI / 2, 80, 8, 0);

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.addEventListener('mousemove', onMouse);

    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const drawBranch = (branch: Branch, time: number) => {
      if (branch.progress <= 0) return;

      const p = Math.min(branch.progress, 1);
      const currentEndX = branch.startX + (branch.endX - branch.startX) * p;
      const currentEndY = branch.startY + (branch.endY - branch.startY) * p;

      // Wind effect based on mouse position
      const windX = (mouseRef.current.x - 250) * 0.0003 * branch.depth;
      const sway = Math.sin(time * 0.001 + branch.depth * 0.5) * branch.depth * 0.3;

      ctx.beginPath();
      ctx.moveTo(branch.startX, branch.startY);

      // Curved branches with wind
      const cpX = (branch.startX + currentEndX) / 2 + sway + windX * 10;
      const cpY = (branch.startY + currentEndY) / 2;
      ctx.quadraticCurveTo(cpX, cpY, currentEndX + sway + windX * 20, currentEndY);

      // Branch color gradient (trunk to tips)
      const darkness = Math.max(0.2, 1 - branch.depth * 0.1);
      ctx.strokeStyle = `rgba(93, 64, 55, ${darkness})`;
      ctx.lineWidth = branch.width * p;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Draw leaves
      if (branch.progress > 0.8) {
        const leafProgress = (branch.progress - 0.8) / 0.2;
        branch.leaves.forEach(leaf => {
          const leafSway = Math.sin(time * 0.002 + leaf.swayOffset) * 2;
          ctx.save();
          ctx.translate(leaf.x + leafSway + windX * 25, leaf.y);
          ctx.rotate(leaf.rotation + Math.sin(time * 0.001 + leaf.swayOffset) * 0.1);
          ctx.globalAlpha = leaf.opacity * leafProgress;

          // Draw leaf shape
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size);
          ctx.quadraticCurveTo(leaf.size * 0.6, -leaf.size * 0.2, 0, leaf.size * 0.6);
          ctx.quadraticCurveTo(-leaf.size * 0.6, -leaf.size * 0.2, 0, -leaf.size);
          ctx.fillStyle = leaf.color;
          ctx.fill();
          ctx.restore();
        });
      }

      // Recurse children
      if (p >= 0.7) {
        branch.children.forEach(child => drawBranch(child, time));
      }
    };

    const growTree = (branch: Branch, time: number, parentProgress: number) => {
      const growSpeed = 0.008;
      if (parentProgress > 0.5) {
        branch.progress = Math.min(branch.progress + growSpeed, 1);
      }
      branch.children.forEach(child => growTree(child, time, branch.progress));
    };

    const animate = (timestamp: number) => {
      timeRef.current = timestamp;
      ctx.clearRect(0, 0, width, height);

      if (treeRef.current) {
        // Grow tree
        treeRef.current.progress = Math.min(treeRef.current.progress + 0.012, 1);
        growTree(treeRef.current, timestamp, 1);

        // Draw
        drawBranch(treeRef.current, timestamp);

        // Draw ground shadow
        const gradient = ctx.createRadialGradient(250, height - 30, 0, 250, height - 30, 100);
        gradient.addColorStop(0, 'rgba(93, 64, 55, 0.08)');
        gradient.addColorStop(1, 'rgba(93, 64, 55, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(100, height - 50, 300, 40);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [createBranch]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow behind tree */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(74, 103, 65, 0.3) 0%, transparent 70%)',
          transform: 'scale(1.5)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="relative z-10"
        style={{ width: 500, height: 500 }}
      />
    </div>
  );
}
