export type ActivityTipo = 'ligacao' | 'whatsapp' | 'email' | 'reuniao'

export interface Activity {
  id: string
  lead_id: string
  tipo: ActivityTipo
  descricao: string | null
  data_agendada: string | null
  realizada: boolean
  created_by: string
  created_at: string
}

