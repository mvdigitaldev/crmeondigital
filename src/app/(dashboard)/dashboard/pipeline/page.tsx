'use client'

export const dynamic = 'force-dynamic'

import { PipelineBoard } from '@/components/pipeline/PipelineBoard'

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pipeline</h1>
      <PipelineBoard />
    </div>
  )
}

