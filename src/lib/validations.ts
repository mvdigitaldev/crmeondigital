import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nome_completo: z.string().min(1, 'Nome completo é obrigatório'),
})

export const leadSchema = z.object({
  nome_produtor: z.string().min(1, 'Nome do produtor é obrigatório'),
  nome_contato: z.string().min(1, 'Nome do contato é obrigatório'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  produto: z.string().optional(),
  site_link: z.string().url('URL inválida').optional().or(z.literal('')),
  uf: z.string().max(2, 'UF deve ter no máximo 2 caracteres').optional(),
  status: z.string().min(1, 'Etapa é obrigatória'),
  valor_estimado: z.coerce.number().positive('Valor deve ser positivo').optional().nullable(),
  origem: z.enum(['Inbound', 'Outbound']),
  observacoes: z.string().optional(),
})

export const activitySchema = z.object({
  tipo: z.enum(['ligacao', 'whatsapp', 'email', 'reuniao']),
  descricao: z.string().optional(),
  data_agendada: z.string().optional().nullable(),
  realizada: z.boolean().default(false),
})

export const userProfileSchema = z.object({
  nome_completo: z.string().min(1, 'Nome completo é obrigatório'),
  role: z.enum(['SDR', 'Admin']),
})

export const pipelineStageSchema = z.object({
  name: z.string().min(1, 'Nome da etapa é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório').regex(/^[a-z0-9_]+$/, 'Slug deve conter apenas letras minúsculas, números e underscore'),
  order: z.coerce.number().int().optional(),
  color: z.string().optional().nullable(),
})

export const pipelineStageUpdateSchema = z.object({
  name: z.string().min(1, 'Nome da etapa é obrigatório').optional(),
  slug: z.string().optional(), // Slug não é validado no update pois não pode ser alterado
  order: z.coerce.number().int().optional(),
  color: z.string().optional().nullable(),
})

