'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activitiesService } from '@/services/activities.service'
import type { Activity } from '@/types/activity.types'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { startOfDay, endOfDay } from 'date-fns'

export function useActivitiesByLead(leadId: string | null) {
  return useQuery({
    queryKey: ['activities', leadId],
    queryFn: () => (leadId ? activitiesService.getByLeadId(leadId) : []),
    enabled: !!leadId,
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activity: Omit<Activity, 'id' | 'created_at'>) =>
      activitiesService.create(activity),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities', data.lead_id] })
      queryClient.invalidateQueries({ queryKey: ['activities', 'pending-followups'] })
      toast.success('Atividade registrada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar atividade', {
        description: error.message,
      })
    },
  })
}

export function useUpdateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Activity> }) =>
      activitiesService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities', data.lead_id] })
      queryClient.invalidateQueries({ queryKey: ['activities', 'pending-followups'] })
      toast.success('Atividade atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar atividade', {
        description: error.message,
      })
    },
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Primeiro buscar a atividade para obter o lead_id antes de deletar
      const supabase = createClient()
      const { data: activity, error: fetchError } = await supabase
        .from('activities')
        .select('lead_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      if (!activity) throw new Error('Atividade não encontrada')

      const leadId = activity.lead_id

      // Agora deletar
      await activitiesService.delete(id)
      return { id, lead_id: leadId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities', data.lead_id] })
      queryClient.invalidateQueries({ queryKey: ['activities', 'pending-followups'] })
      toast.success('Atividade excluída com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir atividade', {
        description: error.message,
      })
    },
  })
}

// Hook for pending follow-ups count (used in Header)
export function usePendingFollowUps() {
  const supabase = createClient()

  const { data: pendingFollowUpsCount = 0 } = useQuery({
    queryKey: ['activities', 'pending-followups'],
    queryFn: async () => {
      const todayStart = startOfDay(new Date()).toISOString()
      const todayEnd = endOfDay(new Date()).toISOString()

      const { count, error } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('realizada', false)
        .not('data_agendada', 'is', null)
        .gte('data_agendada', todayStart)
        .lte('data_agendada', todayEnd)

      if (error) throw error
      return count || 0
    },
    refetchInterval: 60000, // Refetch every minute
  })

  return {
    pendingFollowUpsCount,
  }
}
