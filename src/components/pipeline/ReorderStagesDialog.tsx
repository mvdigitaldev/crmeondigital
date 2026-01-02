'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2 } from 'lucide-react'
import type { PipelineStage } from '@/types/pipeline.types'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { pipelineService } from '@/services/pipeline.service'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ReorderStagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SortableStageItemProps {
  stage: PipelineStage
}

function SortableStageItem({ stage }: SortableStageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: stage.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="font-semibold">{stage.name}</div>
        <div className="text-sm text-muted-foreground">Slug: {stage.slug}</div>
      </div>
      <div className="text-sm text-muted-foreground">#{stage.order + 1}</div>
    </div>
  )
}

export function ReorderStagesDialog({ open, onOpenChange }: ReorderStagesDialogProps) {
  const { data: stages = [], isLoading } = usePipelineStages()
  const queryClient = useQueryClient()
  const [orderedStages, setOrderedStages] = useState<PipelineStage[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Inicializar a ordem quando o modal abrir
  useEffect(() => {
    if (open && stages.length > 0) {
      setOrderedStages([...stages].sort((a, b) => a.order - b.order))
    }
  }, [open, stages])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    setOrderedStages((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = [...items]
      const [removed] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, removed)

      return newItems
    })
  }

  const handleSave = async () => {
    if (orderedStages.length === 0) return

    setIsSaving(true)
    try {
      // Atualizar a ordem de todas as etapas
      await pipelineService.reorderAllStages(
        orderedStages.map((stage, index) => ({
          id: stage.id,
          order: index,
        }))
      )

      // Invalidar queries para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })

      toast.success('Ordem das etapas atualizada com sucesso!')
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Erro ao atualizar ordem das etapas', {
        description: error.message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const activeStage = activeId ? orderedStages.find((s) => s.id === activeId) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reordenar Etapas</DialogTitle>
          <DialogDescription>
            Arraste as etapas para reordená-las. Clique em Salvar para aplicar as mudanças.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando etapas...
          </div>
        ) : (
          <div className="relative">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedStages.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {orderedStages.map((stage) => (
                    <SortableStageItem key={stage.id} stage={stage} />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay
                style={{ 
                  cursor: 'grabbing',
                }}
                dropAnimation={{
                  duration: 200,
                  easing: 'ease-out',
                }}
                zIndex={9999}
              >
                {activeStage ? (
                  <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg shadow-xl opacity-100 min-w-[280px] max-w-[600px]">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-semibold">{activeStage.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Slug: {activeStage.slug}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      #{activeStage.order + 1}
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || orderedStages.length === 0}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Ordem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

