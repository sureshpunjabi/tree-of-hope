'use client'

import { useState } from 'react'
import { TreeVisualization } from '@/components/tree/TreeVisualization'

interface HeroLeaf {
  id: string
  author_name: string
  message: string
  position_x: number
  position_y: number
  created_at: string
}

const HERO_LEAVES: HeroLeaf[] = [
  {
    id: '1',
    author_name: 'Sarah',
    message: 'You are stronger than you know',
    position_x: 20,
    position_y: 30,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    author_name: 'James',
    message: 'Thinking of you every day',
    position_x: 60,
    position_y: 40,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    author_name: 'Maria',
    message: 'Sending love and strength',
    position_x: 80,
    position_y: 50,
    created_at: new Date().toISOString(),
  },
]

export function HeroTree() {
  const [_selectedLeaf, setSelectedLeaf] = useState<HeroLeaf | null>(null)

  return (
    <div className="bg-white rounded-lg p-8 border border-[var(--color-border)] shadow-sm">
      <TreeVisualization
        leaves={HERO_LEAVES}
        patientName="Patient"
        onLeafClick={(leaf) => setSelectedLeaf(leaf as HeroLeaf)}
      />
    </div>
  )
}
