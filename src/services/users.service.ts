import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/types/user.types'

export const usersService = {
  async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as UserProfile[]
  },

  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as UserProfile
  },

  async update(id: string, updates: Partial<UserProfile>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as UserProfile
  },
}

