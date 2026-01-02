export interface PipelineStage {
  id: string
  name: string
  slug: string
  order: number
  color?: string | null
  created_at: string
  updated_at: string
}

export interface CreatePipelineStageInput {
  name: string
  slug: string
  order?: number
  color?: string | null
}

export interface UpdatePipelineStageInput {
  name?: string
  slug?: string
  order?: number
  color?: string | null
}

