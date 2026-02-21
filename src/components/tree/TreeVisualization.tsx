'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface Leaf {
  id: string;
  author_name: string;
  message: string;
  position_x: number | null;
  position_y: number | null;
  created_at: string;
}

interface TreeVisualizationProps {
  leaves: Leaf[];
  patientName: string;
  onLeafClick: (leaf: Leaf) => void;
  className?: string;
}

// Seeded random number generator for consistent positioning
const seededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 1000) / 1000;
};

// Leaf color palette (cycling through 5 colors)
const LEAF_COLORS = ['#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9', '#FFD54F'];

// SVG constants
const SVG_WIDTH = 600;
const SVG_HEIGHT = 500;
const TRUNK_X = SVG_WIDTH / 2;
const TRUNK_Y = SVG_HEIGHT * 0.65;
const TRUNK_WIDTH = 25;
const TRUNK_HEIGHT = 180;
const LEAVES_PER_TIER = 8;

interface BranchConfig {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
}

const getBranchConfigs = (): BranchConfig[] => {
  return [
    // Tier 1 (bottom) - wider spread
    {
      startX: TRUNK_X,
      startY: TRUNK_Y,
      endX: TRUNK_X - 120,
      endY: TRUNK_Y - 100,
      angle: 225,
    },
    {
      startX: TRUNK_X,
      startY: TRUNK_Y,
      endX: TRUNK_X + 120,
      endY: TRUNK_Y - 100,
      angle: 315,
    },
    // Tier 2 (middle)
    {
      startX: TRUNK_X,
      startY: TRUNK_Y - 80,
      endX: TRUNK_X - 110,
      endY: TRUNK_Y - 160,
      angle: 220,
    },
    {
      startX: TRUNK_X,
      startY: TRUNK_Y - 80,
      endX: TRUNK_X + 110,
      endY: TRUNK_Y - 160,
      angle: 320,
    },
    // Tier 3 (upper)
    {
      startX: TRUNK_X,
      startY: TRUNK_Y - 160,
      endX: TRUNK_X - 100,
      endY: TRUNK_Y - 230,
      angle: 230,
    },
    {
      startX: TRUNK_X,
      startY: TRUNK_Y - 160,
      endX: TRUNK_X + 100,
      endY: TRUNK_Y - 230,
      angle: 310,
    },
    // Tier 4 (top)
    {
      startX: TRUNK_X,
      startY: TRUNK_Y - 240,
      endX: TRUNK_X - 80,
      endY: TRUNK_Y - 290,
      angle: 240,
    },
    {
      startX: TRUNK_X,
      startY: TRUNK_Y - 240,
      endX: TRUNK_X + 80,
      endY: TRUNK_Y - 290,
      angle: 300,
    },
  ];
};

interface PositionedLeaf extends Leaf {
  x: number;
  y: number;
  color: string;
  isNew: boolean;
}

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  leaves,
  patientName,
  onLeafClick,
  className,
}) => {
  const [hoveredLeafId, setHoveredLeafId] = useState<string | null>(null);

  const positionedLeaves = useMemo<PositionedLeaf[]>(() => {
    const branchConfigs = getBranchConfigs();
    
    return leaves.map((leaf, index) => {
      let x: number;
      let y: number;

      if (leaf.position_x !== null && leaf.position_y !== null) {
        x = leaf.position_x;
        y = leaf.position_y;
      } else {
        // Calculate branch tier (2 branches per tier)
        const branchIndex = Math.floor(index / LEAVES_PER_TIER) * 2;
        const positionOnBranch = (index % LEAVES_PER_TIER) / LEAVES_PER_TIER;

        // Use left or right branch alternately
        const isBranchLeft = index % 2 === 0;
        const actualBranchIndex = branchIndex + (isBranchLeft ? 0 : 1);

        if (actualBranchIndex >= branchConfigs.length) {
          // Fallback for overflow
          x = SVG_WIDTH / 2;
          y = SVG_HEIGHT - 100;
        } else {
          const branch = branchConfigs[actualBranchIndex];
          const branchLength = Math.hypot(
            branch.endX - branch.startX,
            branch.endY - branch.startY
          );

          // Interpolate along branch
          const t = positionOnBranch;
          x =
            branch.startX +
            (branch.endX - branch.startX) * t +
            (seededRandom(leaf.id) - 0.5) * 20;
          y =
            branch.startY +
            (branch.endY - branch.startY) * t +
            (seededRandom(leaf.id + '-y') - 0.5) * 20;
        }
      }

      return {
        ...leaf,
        x,
        y,
        color: LEAF_COLORS[index % LEAF_COLORS.length],
        isNew: false,
      };
    });
  }, [leaves]);

  const isEmpty = leaves.length === 0;

  return (
    <div className={cn('w-full flex flex-col items-center justify-center', className)}>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full max-w-2xl h-auto"
        style={{ aspectRatio: `${SVG_WIDTH}/${SVG_HEIGHT}` }}
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#E3F2FD', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#F1F8E9', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#6D4C41', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#5D4037', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#4E342E', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="leafShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1"
              floodOpacity="0.2"
            />
          </filter>
        </defs>

        {/* Background */}
        <rect
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          fill="url(#skyGradient)"
        />

        {/* Ground/Grass */}
        <ellipse
          cx={SVG_WIDTH / 2}
          cy={SVG_HEIGHT - 20}
          rx={SVG_WIDTH * 0.6}
          ry={40}
          fill="#81C784"
          opacity="0.4"
        />
        <path
          d={`M 0 ${SVG_HEIGHT - 25} Q ${SVG_WIDTH / 4} ${SVG_HEIGHT - 35} ${SVG_WIDTH / 2} ${SVG_HEIGHT - 25} T ${SVG_WIDTH} ${SVG_HEIGHT - 25}`}
          fill="none"
          stroke="#66BB6A"
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Trunk */}
        <rect
          x={TRUNK_X - TRUNK_WIDTH / 2}
          y={TRUNK_Y - TRUNK_HEIGHT}
          width={TRUNK_WIDTH}
          height={TRUNK_HEIGHT}
          fill="url(#trunkGradient)"
          rx="4"
        />

        {/* Branches */}
        {getBranchConfigs().map((branch, idx) => (
          <g key={`branch-${idx}`}>
            <line
              x1={branch.startX}
              y1={branch.startY}
              x2={branch.endX}
              y2={branch.endY}
              stroke="#5D4037"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Secondary branches */}
            {[0.3, 0.6].map((t) => (
              <line
                key={`secondary-${idx}-${t}`}
                x1={
                  branch.startX +
                  (branch.endX - branch.startX) * t
                }
                y1={
                  branch.startY +
                  (branch.endY - branch.startY) * t
                }
                x2={
                  branch.startX +
                  (branch.endX - branch.startX) * t +
                  Math.cos((branch.angle * Math.PI) / 180 + 0.5) * 25
                }
                y2={
                  branch.startY +
                  (branch.endY - branch.startY) * t +
                  Math.sin((branch.angle * Math.PI) / 180 + 0.5) * 25
                }
                stroke="#6D4C41"
                strokeWidth="3"
                opacity="0.6"
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}

        {/* Leaves */}
        {!isEmpty &&
          positionedLeaves.map((leaf) => (
            <g
              key={leaf.id}
              onClick={() => onLeafClick(leaf)}
              onMouseEnter={() => setHoveredLeafId(leaf.id)}
              onMouseLeave={() => setHoveredLeafId(null)}
              className="cursor-pointer transition-opacity duration-200"
              style={{
                opacity: hoveredLeafId && hoveredLeafId !== leaf.id ? 0.6 : 1,
              }}
            >
              {/* Leaf shape (ellipse rotated) */}
              <ellipse
                cx={leaf.x}
                cy={leaf.y}
                rx="12"
                ry="8"
                fill={leaf.color}
                stroke="#fff"
                strokeWidth="1.5"
                filter="url(#leafShadow)"
                style={{
                  transformOrigin: `${leaf.x}px ${leaf.y}px`,
                  transform: `rotate(${seededRandom(leaf.id + '-rot') * 360}deg)`,
                }}
                className="leaf-shape transition-all duration-200 hover:brightness-110"
              />

              {/* Tooltip on hover */}
              {hoveredLeafId === leaf.id && (
                <g>
                  {/* Tooltip background */}
                  <rect
                    x={leaf.x - 80}
                    y={leaf.y - 50}
                    width="160"
                    height="45"
                    fill="white"
                    stroke="#5D4037"
                    strokeWidth="1"
                    rx="4"
                    opacity="0.95"
                  />
                  {/* Tooltip text */}
                  <text
                    x={leaf.x}
                    y={leaf.y - 35}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#5D4037"
                    style={{ pointerEvents: 'none' }}
                  >
                    {leaf.author_name}
                  </text>
                  <text
                    x={leaf.x}
                    y={leaf.y - 20}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#666"
                    style={{
                      pointerEvents: 'none',
                      wordWrap: 'break-word',
                      maxWidth: '140px',
                    }}
                  >
                    {leaf.message.split('\n')[0].substring(0, 40)}
                    {leaf.message.length > 40 ? '...' : ''}
                  </text>
                </g>
              )}
            </g>
          ))}
      </svg>

      {/* Leaf count and empty state */}
      <div className="mt-6 text-center">
        {isEmpty ? (
          <p className="text-gray-600 text-sm italic">
            Every tree starts with a single leaf. Be the first to add yours.
          </p>
        ) : (
          <p className="text-gray-700 text-sm font-medium">
            <span className="text-green-600 font-semibold">
              {leaves.length}
            </span>
            {' '}
            leaf{leaves.length !== 1 ? 'ves' : ''} on{' '}
            <span className="font-semibold text-amber-900">{patientName}</span>
            's Tree
          </p>
        )}
      </div>

      <style>{`
        @keyframes leaf-fade-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .leaf-shape {
          animation: leaf-fade-in 0.6s ease-out;
        }

        .leaf-shape:hover {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
      `}</style>
    </div>
  );
};
