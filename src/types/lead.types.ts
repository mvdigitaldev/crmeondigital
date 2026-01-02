export type LeadStatus = 
  | 'prospecção' 
  | 'contato_realizado' 
  | 'reuniao_agendada' 
  | 'negociacao' 
  | 'fechado' 
  | 'perdido'

export type LeadOrigem = 'Inbound' | 'Outbound'

export interface Lead {
  id: string
  nome_produtor: string
  nome_contato: string
  telefone: string | null
  email: string | null
  produto: string | null
  site_link: string | null
  uf: string | null
  status: LeadStatus
  valor_estimado: number | null
  origem: LeadOrigem
  observacoes: string | null
  sdr_id: string
  created_at: string
  updated_at: string
}

export interface LeadHistory {
  id: string
  lead_id: string
  campo_alterado: string
  valor_anterior: string | null
  valor_novo: string | null
  changed_by: string
  created_at: string
}

