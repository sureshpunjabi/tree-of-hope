'use client';

import React, { useState, useMemo } from 'react';
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

const GOLDEN_RATIO = 1.618033988749895;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // approximately 137.5 degrees

// Generate leaf positions using golden spiral distribution
const generateLeafPositions = (count: number) => {
  const positions: Array<{ x: number; y: number }> = [];
  const maxRadius = 140;
  const centerX = 200;
  const centerY = 180;

  for (let i = 0; i < count; i++) {
    const angle = i * GOLDEN_ANGLE;
    const radius = Math.sqrt(i) * 12 + 30;
    
    // Add slight randomness for organic feel
    const randomRadius = radius + (Math.random() - 0.5) * 15;
    const randomAngle = angle + (Math.random() - 0.5) * 0.3;
    
    const boundedRadius = Math.min(randomRadius, maxRadius);
    
    const x = centerX + Math.cos(randomAngle) * boundedRadius;
    const y = centerY + Math.sin(randomAngle) * boundedRadius;
    
    positions.push({ x, y });
  }

  return positions;
};

// Generate smooth curved branch paths
const generateBranchPaths = () => {
  const branches = [
    // Main trunk splits into primary branches
    'M200,280 Q180,240 170,200 Q165,180 160,160',
    'M200,280 Q220,240 230,200 Q235,180 240,160',
    'M200,280 Q190,240 185,180 Q182,160 178,140',
    'M200,280 Q210,240 215,180 Q218,160 222,140',
  ];

  return branches;
};

// Generate secondary branches from main branches
const generateSecondaryBranches = () => {
  const branches = [
    'M160,160 Q145,145 135,130',
    'M160,160 Q155,140 150,120',
    'M240,160 Q255,145 265,130',
    'M240,160 Q245,140 250,120',
    'M178,140 Q165,125 155,110',
    'M178,140 Q180,120 182,100',
    'M222,140 Q235,125 245,110',
    'M222,140 Q220,120 218,100',
  ];

  return branches;
};

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  leaves,
  patientName,
  onLeafClick,
  className,
}) => {
  const [hoveredLeafId, setHoveredLeafId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const leafPositions = useMemo(() => generateLeafPositions(leaves.length), [leaves.length]);

  const handleLeafHover = (
    e: React.MouseEvent<SVGElement>,
    leafId: string
  ) => {
    setHoveredLeafId(leafId);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left,
      y: rect.top,
    });
  };

  if (leaves.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-96 bg-gradient-to-b from-green-50 to-green-100 rounded-lg',
          className
        )}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-32 h-32 mb-4"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            @keyframes sway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(1deg); }
            }
            .sapling { animation: sway 3s ease-in-out infinite; }
          `}</style>

          <defs>
            <linearGradient id="sapling-trunk" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5D4037" />
              <stop offset="100%" stopColor="#8D6E63" />
            </linearGradient>
            <radialGradient id="sapling-glow">
              <stop offset="0%" stopColor="#81C784" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#81C784" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="200" cy="300" r="80" fill="url(#sapling-glow)" />

          <g className="sapling" style={{ transformOrigin: '200px 340px' }}>
            <path
              d="M200,340 Q195,300 190,260 Q185,220 180,180"
              stroke="url(#sapling-trunk)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="150" cy="160" r="12" fill="#66BB6A" />
            <circle cx="210" cy="150" r="12" fill="#81C784" />
            <circle cx="180" cy="140" r="12" fill="#A5D6A7" />
          </g>
        </svg>

        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Be the first to add a leaf
        </h3>
        <p className="text-gray-600 text-center max-w-xs">
          Plant a message of hope and support for {patientName}
        </p>
      </div>
    );
  }

  const mainBranches = generateBranchPaths();
  const secondaryBranches = generateSecondaryBranches();

  return (
    <div className={cn('relative w-full bg-white rounded-lg p-4', className)}>
      <style>{`
        @keyframes sway {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-2px) rotate(-0.5deg);
          }
          50% {
            transform: translateY(-4px) rotate(0deg);
          }
          75% {
            transform: translateY(-2px) rotate(0.5deg);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.9;
          }
        }

        .tree-leaf {
          animation: sway 6s ease-in-out infinite;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tree-leaf:hover {
          filter: brightness(1.2);
        }

        .leaf-glow {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .tooltip-card {
          position: fixed;
          background: white;
          border: 1px solid #E0E0E0;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 50;
          max-width: 280px;
          pointer-events: none;
        }

        .tooltip-card-author {
          font-weight: 600;
          color: #333;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .tooltip-card-message {
          color: #666;
          font-size: 13px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .tooltip-card-date {
          color: #999;
          font-size: 11px;
          margin-top: 6px;
        }
      `}</style>

      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto max-h-96"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Trunk gradient */}
          <linearGradient
            id="trunk-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#5D4037" />
            <stop offset="50%" stopColor="#6D4C41" />
            <stop offset="100%" stopColor="#8D6E63" />
          </linearGradient>

          {/* Canopy glow */}
          <radialGradient id="canopy-glow" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#81C784" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#66BB6A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#A5D6A7" stopOpacity="0" />
          </radialGradient>

          {/* Leaf glow filter */}
          <filter id="leaf-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Enhanced glow for darker leaves */}
          <filter id="leaf-glow-bright">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Leaf gradients */}
          <linearGradient id="leaf-color-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#66BB6A" />
            <stop offset="100%" stopColor="#558B2F" />
          </linearGradient>
          <linearGradient id="leaf-color-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#81C784" />
            <stop offset="100%" stopColor="#689F38" />
          </linearGradient>
          <linearGradient id="leaf-color-3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A5D6A7" />
            <stop offset="100%" stopColor="#7CB342" />
          </linearGradient>
          <linearGradient id="leaf-color-4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8E6C9" />
            <stop offset="100%" stopColor="#9CCC65" />
          </linearGradient>
        </defs>

        {/* Background canopy glow */}
        <circle cx="200" cy="180" r="160" fill="url(#canopy-glow)" />

        {/* Main trunk */}
        <path
          d="M200,280 Q198,250 196,220 Q195,190 194,160"
          stroke="url(#trunk-gradient)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Primary branches */}
        {mainBranches.map((path, idx) => (
          <path
            key={`main-branch-${idx}`}
            d={path}
            stroke="url(#trunk-gradient)"
            strokeWidth={8 - idx * 0.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        ))}

        {/* Secondary branches */}
        {secondaryBranches.map((path, idx) => (
          <path
            key={`secondary-branch-${idx}`}
            d={path}
            stroke="url(#trunk-gradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        ))}

        {/* Leaves positioned in golden spiral pattern */}
        {leaves.map((leaf, index) => {
          const position = leafPositions[index];
          const leafColors = [
            'url(#leaf-color-1)',
            'url(#leaf-color-2)',
            'url(#leaf-color-3)',
            'url(#leaf-color-4)',
          ];
          const leafColor = leafColors[index % leafColors.length];
          const delay = (index * 0.1) % 6;

          return (
            <g
              key={leaf.id}
              className="tree-leaf"
              style={{
                animationDelay: `${delay}s`,
              } as React.CSSProperties}
            >
              {/* Leaf glow background */}
              <ellipse
                cx={position.x}
                cy={position.y}
                rx="7.5"
                ry="8.5"
                fill={leafColor}
                opacity="0.4"
                className="leaf-glow"
                filter="url(#leaf-glow-bright)"
              />

              {/* Main leaf */}
              <ellipse
                cx={position.x}
                cy={position.y}
                rx="6"
                ry="7"
                fill={leafColor}
                filter="url(#leaf-glow)"
                onMouseEnter={(e) => handleLeafHover(e, leaf.id)}
                onMouseLeave={() => setHoveredLeafId(null)}
                onClick={() => onLeafClick(leaf)}
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`,
                  transformOrigin: `${position.x}px ${position.y}px`,
                }}
              />

              {/* Leaf vein detail */}
              <line
                x1={position.x}
                y1={position.y - 6}
                x2={position.x}
                y2={position.y + 6}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="0.5"
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredLeafId && (
        <div
          className="tooltip-card"
          style={{
            left: `${tooltipPos.x + 10}px`,
            top: `${tooltipPos.y - 100}px`,
          }}
        >
          {leaves.map((leaf) => {
            if (leaf.id !== hoveredLeafId) return null;
            return (
              <div key={leaf.id}>
                <div className="tooltip-card-author">{leaf.author_name}</div>
                <div className="tooltip-card-message">{leaf.message}</div>
                <div className="tooltip-card-date">
                  {new Date(leaf.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tree title */}
      <div className="mt-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Tree of Hope
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {leaves.length} {leaves.length === 1 ? 'leaf' : 'leaves'} of support for {patientName}
        </p>
      </div>
    </div>
  );
};
