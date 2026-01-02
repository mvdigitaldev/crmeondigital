'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pipelineService } from '@/services/pipeline.service'
import type { PipelineStage, CreatePipelineStageInput, UpdatePipelineStageInput } from '@/types/pipeline.types'
import { toast } from 'sonner'

export function usePipelineStages() {
  return useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: () => pipelineService.getAll(),
  })
}

export function usePipelineStage(id: string | null) {
  return useQuery({
    queryKey: ['pipeline-stage', id],
    queryFn: () => (id ? pipelineService.getById(id) : null),
    enabled: !!id,
  })
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (stage: CreatePipelineStageInput) => pipelineService.create(stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Etapa criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar etapa', {
        description: error.message,
      })
    },
  })
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdatePipelineStageInput }) =>
      pipelineService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Etapa atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar etapa', {
        description: error.message,
      })
    },
  })
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pipelineService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Etapa excluída com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir etapa', {
        description: error.message,
      })
    },
  })
}

export function useTransferLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fromStageSlug, toStageSlug }: { fromStageSlug: string; toStageSlug: string }) =>
      pipelineService.transferLeads(fromStageSlug, toStageSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Leads transferidos com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao transferir leads', {
        description: error.message,
      })
    },
  })
}

export function useStageLeadsCount(stageSlug: string) {
  return useQuery({
    queryKey: ['pipeline-stage-leads-count', stageSlug],
    queryFn: () => pipelineService.getLeadsCountByStage(stageSlug),
  })
}

