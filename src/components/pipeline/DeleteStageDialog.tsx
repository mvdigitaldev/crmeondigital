'use client'

import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { PipelineStage } from '@/types/pipeline.types'
import { useDeletePipelineStage, useTransferLeads, useStageLeadsCount } from '@/hooks/usePipelineStages'
import { Loader2 } from 'lucide-react'

interface DeleteStageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stage: PipelineStage | null
  allStages: PipelineStage[]
}

export function DeleteStageDialog({
  open,
  onOpenChange,
  stage,
  allStages,
}: DeleteStageDialogProps) {
  const deleteStage = useDeletePipelineStage()
  const transferLeads = useTransferLeads()
  const [targetStageSlug, setTargetStageSlug] = useState<string>('')
  
  const { data: leadsCount = 0 } = useStageLeadsCount(stage?.slug || '')

  // Filtrar a própria etapa da lista de opções
  const availableStages = allStages.filter((s) => s.id !== stage?.id)

  useEffect(() => {
    if (open && availableStages.length > 0 && !targetStageSlug) {
      // Selecionar a primeira etapa disponível por padrão
      setTargetStageSlug(availableStages[0].slug)
    }
  }, [open, availableStages, targetStageSlug])

  const handleDelete = async () => {
    if (!stage) return

    try {
      // Se houver leads na etapa, transferir primeiro
      if (leadsCount > 0 && targetStageSlug) {
        await transferLeads.mutateAsync({
          fromStageSlug: stage.slug,
          toStageSlug: targetStageSlug,
        })
      }

      // Depois excluir a etapa
      await deleteStage.mutateAsync(stage.id)
      onOpenChange(false)
      setTargetStageSlug('')
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  }

  const isLoading = deleteStage.isPending || transferLeads.isPending

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Etapa</AlertDialogTitle>
          <AlertDialogDescription>
            {leadsCount > 0 ? (
              <>
                Esta etapa possui <strong>{leadsCount}</strong> lead{leadsCount !== 1 ? 's' : ''}.
                Você precisa transferir {leadsCount !== 1 ? 'esses leads' : 'este lead'} para outra
                etapa antes de excluir.
              </>
            ) : (
              'Tem certeza que deseja excluir esta etapa? Esta ação não pode ser desfeita.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {leadsCount > 0 && availableStages.length > 0 && (
          <div className="space-y-2 py-4">
            <Label htmlFor="target-stage">Transferir leads para:</Label>
            <Select value={targetStageSlug} onValueChange={setTargetStageSlug}>
              <SelectTrigger id="target-stage">
                <SelectValue placeholder="Selecione uma etapa" />
              </SelectTrigger>
              <SelectContent>
                {availableStages.map((s) => (
                  <SelectItem key={s.id} value={s.slug}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!targetStageSlug && (
              <p className="text-sm text-destructive">Selecione uma etapa de destino</p>
            )}
          </div>
        )}

        {leadsCount > 0 && availableStages.length === 0 && (
          <div className="py-4">
            <p className="text-sm text-destructive">
              Não é possível excluir esta etapa. Não há outras etapas disponíveis para transferir
              os leads.
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || (leadsCount > 0 && (!targetStageSlug || availableStages.length === 0))}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

