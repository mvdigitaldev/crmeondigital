import { createClient } from '@/lib/supabase/client'
import type { Activity } from '@/types/activity.types'

export const activitiesService = {
  async getByLeadId(leadId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Activity[]
  },

  async create(activity: Omit<Activity, 'id' | 'created_at'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('activities')
      .insert({ ...activity, created_by: user.id })
      .select()
      .single()

    if (error) throw error
    return data as Activity
  },

  async update(id: string, updates: Partial<Activity>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Activity
  },

  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Activity
  },
}

