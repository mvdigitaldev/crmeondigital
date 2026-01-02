import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types/lead.types'

export const leadsService = {
  async getAll(filters?: {
    status?: string
    uf?: string
    origem?: string
    search?: string
  }) {
    const supabase = createClient()
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.uf) {
      query = query.eq('uf', filters.uf)
    }
    if (filters?.origem) {
      query = query.eq('origem', filters.origem)
    }
    if (filters?.search) {
      query = query.or(
        `nome_produtor.ilike.%${filters.search}%,nome_contato.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query
    if (error) throw error
    return data as Lead[]
  },

  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Lead
  },

  async create(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('leads')
      .insert({ ...lead, sdr_id: user.id })
      .select()
      .single()

    if (error) throw error
    return data as Lead
  },

  async update(id: string, updates: Partial<Omit<Lead, 'id' | 'sdr_id' | 'created_at' | 'updated_at'>>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Lead
  },

  async delete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getByStatusPaginated(status: string, page: number = 0, pageSize: number = 20) {
    const supabase = createClient()
    const from = page * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return {
      data: (data || []) as Lead[],
      hasMore: (data || []).length === pageSize,
    }
  },
}

