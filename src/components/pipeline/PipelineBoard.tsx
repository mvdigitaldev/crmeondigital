'use client'

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { useState } from 'react'
import { PipelineColumn } from './PipelineColumn'
import { PipelineCard } from './PipelineCard'
import { useUpdateLead } from '@/hooks/useLeads'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { PipelineStageForm } from './PipelineStageForm'
import { ReorderStagesDialog } from './ReorderStagesDialog'
import { Button } from '@/components/ui/button'
import { Plus, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export function PipelineBoard() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeStageSlug, setActiveStageSlug] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false)
  const updateLead = useUpdateLead()
  const queryClient = useQueryClient()
  const { data: stages = [], isLoading: isLoadingStages } = usePipelineStages()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    const activeData = event.active.data.current
    if (activeData?.lead) {
      setActiveStageSlug(activeData.lead.status)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) {
      setActiveStageSlug(null)
      return
    }

    // Verificar se o drop foi feito em uma coluna (não em outro card)
    const overData = over.data.current
    if (overData?.type !== 'column') {
      setActiveStageSlug(null)
      return
    }

    const activeData = active.data.current
    if (!activeData?.lead) {
      setActiveStageSlug(null)
      return
    }

    const lead = activeData.lead
    const newStatus = over.id as string

    // Verificar se a etapa existe
    const targetStage = stages.find((s) => s.slug === newStatus)
    if (!targetStage) {
      toast.error('Etapa não encontrada')
      setActiveStageSlug(null)
      return
    }

    if (lead.status === newStatus) {
      setActiveStageSlug(null)
      return
    }

    try {
      await updateLead.mutateAsync({
        id: lead.id,
        updates: { status: newStatus as any },
      })
      // Invalidar queries das duas etapas (origem e destino)
      queryClient.invalidateQueries({ queryKey: ['leads', 'stage', lead.status] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'stage', newStatus] })
    } catch (error: any) {
      toast.error('Erro ao atualizar status do lead', {
        description: error?.message || 'Erro desconhecido',
      })
    } finally {
      setActiveStageSlug(null)
    }
  }

  // Buscar o lead ativo para o DragOverlay
  const activeLead = activeId && activeStageSlug
    ? (() => {
        const cachedData = queryClient.getQueryData(['leads', 'stage', activeStageSlug]) as any
        const leads = cachedData?.pages?.flatMap((page: any) => page.data) || []
        return leads.find((l: any) => l.id === activeId)
      })()
    : null

  if (isLoadingStages) {
    return (
      <div className="text-center py-8 text-muted-foreground">Carregando etapas...</div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setReorderDialogOpen(true)}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Ordem
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Etapa
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              id={stage.slug}
              title={stage.name}
              stage={stage}
              allStages={stages}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <PipelineCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>

      <PipelineStageForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        stage={null}
      />

      <ReorderStagesDialog
        open={reorderDialogOpen}
        onOpenChange={setReorderDialogOpen}
      />
    </>
  )
}
