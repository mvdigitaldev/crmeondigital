'use client'

import { useDroppable } from '@dnd-kit/core'
import { PipelineCard } from './PipelineCard'
import type { PipelineStage } from '@/types/pipeline.types'
import { PipelineStageActions } from './PipelineStageActions'
import { useLeadsByStage } from '@/hooks/useLeads'
import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface PipelineColumnProps {
  id: string
  title: string
  stage: PipelineStage
  allStages: PipelineStage[]
}

export function PipelineColumn({ id, title, stage, allStages }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.slug,
    data: {
      type: 'column',
      stage,
    },
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useLeadsByStage(stage.slug)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Flatten all pages into a single array
  const leads = data?.pages.flatMap((page) => page.data) || []
  const totalCount = leads.length

  // Handle scroll to load more
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || !hasNextPage || isFetchingNextPage) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      // Load more when user is 200px from bottom
      if (scrollHeight - scrollTop - clientHeight < 200) {
        fetchNextPage()
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-w-[300px] bg-card rounded-lg border border-border p-4 transition-colors ${
        isOver ? 'bg-accent/50 border-primary' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold flex-1">
          {title} {isLoading ? '' : `(${totalCount}${hasNextPage ? '+' : ''})`}
        </div>
        <PipelineStageActions stage={stage} allStages={allStages} />
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto space-y-3"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {leads.map((lead) => (
              <PipelineCard key={lead.id} lead={lead} />
            ))}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

