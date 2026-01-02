'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import type { UserProfile } from '@/types/user.types'

export function useUserProfile(userId?: string) {
  const supabase = createClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null
        userId = user.id
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as UserProfile
    },
    enabled: !!userId || true,
  })

  return {
    profile,
    isLoading,
    isAdmin: profile?.role === 'Admin',
    isSDR: profile?.role === 'SDR',
  }
}

