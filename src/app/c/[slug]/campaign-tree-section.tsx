'use client'

import { useState } from 'react'
import { TreeVisualization } from '@/components/tree/TreeVisualization'

interface PageLeaf {
  id: string
  campaign_id: string
  author_name: string
  message: string
  position_x: number | null
  position_y: number | null
  is_public: boolean
  is_hidden: boolean
  created_at: string
}

interface TreeLeaf {
  id: string
  author_name: string
  message: string
  position_x: number | null
  position_y: number | null
  created_at: string
}

interface CampaignTreeSectionProps {
  leaves: PageLeaf[]
  patientName: string
}

export default function CampaignTreeSection({ leaves, patientName }: CampaignTreeSectionProps) {
  const [_selectedLeaf, setSelectedLeaf] = useState<TreeLeaf | null>(null)

  // Convert page leaves to tree leaves
  const treeLeaves: TreeLeaf[] = leaves.map(leaf => ({
    id: leaf.id,
    author_name: leaf.author_name,
    message: leaf.message,
    position_x: leaf.position_x,
    position_y: leaf.position_y,
    created_at: leaf.created_at,
  }))

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Tree of Hope
        </h2>
        <div className="flex justify-center items-center" style={{ height: '400px' }}>
          <TreeVisualization 
            leaves={treeLeaves} 
            patientName={patientName} 
            onLeafClick={(leaf: TreeLeaf) => setSelectedLeaf(leaf)} 
          />
        </div>
      </div>
    </div>
  )
}
