'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { leadsService } from '@/services/leads.service'
import type { Lead } from '@/types/lead.types'
import { toast } from 'sonner'

export function useLeads(filters?: {
  status?: string
  uf?: string
  origem?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadsService.getAll(filters),
  })
}

export function useLead(id: string | null) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => (id ? leadsService.getById(id) : null),
    enabled: !!id,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) =>
      leadsService.create(lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar lead', {
        description: error.message,
      })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Lead> }) =>
      leadsService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] })
      toast.success('Lead atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar lead', {
        description: error.message,
      })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => leadsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead excluído com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir lead', {
        description: error.message,
      })
    },
  })
}

export function useLeadsByStage(stageSlug: string) {
  return useInfiniteQuery({
    queryKey: ['leads', 'stage', stageSlug],
    queryFn: ({ pageParam = 0 }) =>
      leadsService.getByStatusPaginated(stageSlug, pageParam, 20),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        return allPages.length
      }
      return undefined
    },
    initialPageParam: 0,
  })
}

