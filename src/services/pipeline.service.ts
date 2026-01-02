import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PipelineStage, CreatePipelineStageInput, UpdatePipelineStageInput } from '@/types/pipeline.types'

async function reorderStages(
  supabase: SupabaseClient,
  movedStageId: string,
  oldOrder: number,
  newOrder: number
) {
  // Buscar todas as etapas ordenadas
  const { data: allStages } = await supabase
    .from('pipeline_stages')
    .select('id, order')
    .order('order', { ascending: true })

  if (!allStages) return

  // Se newOrder > oldOrder: mover para frente
  // Decrementar ordem de etapas entre oldOrder+1 e newOrder
  if (newOrder > oldOrder) {
    const stagesToUpdate = allStages.filter(
      (stage) =>
        stage.id !== movedStageId &&
        stage.order > oldOrder &&
        stage.order <= newOrder
    )

    for (const stage of stagesToUpdate) {
      await supabase
        .from('pipeline_stages')
        .update({ order: stage.order - 1 })
        .eq('id', stage.id)
    }
  }
  // Se newOrder < oldOrder: mover para trás
  // Incrementar ordem de etapas entre newOrder e oldOrder-1
  else if (newOrder < oldOrder) {
    const stagesToUpdate = allStages.filter(
      (stage) =>
        stage.id !== movedStageId &&
        stage.order >= newOrder &&
        stage.order < oldOrder
    )

    for (const stage of stagesToUpdate) {
      await supabase
        .from('pipeline_stages')
        .update({ order: stage.order + 1 })
        .eq('id', stage.id)
    }
  }
}

export const pipelineService = {
  async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .order('order', { ascending: true })

    if (error) throw error
    return data as PipelineStage[]
  },

  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as PipelineStage
  },

  async create(stage: CreatePipelineStageInput) {
    const supabase = createClient()
    
    // Sempre adiciona no final (pega a última ordem + 1)
    const { data: stages } = await supabase
      .from('pipeline_stages')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
    
    const newOrder = stages && stages.length > 0 ? stages[0].order + 1 : 0

    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert({ ...stage, order: newOrder })
      .select()
      .single()

    if (error) throw error
    return data as PipelineStage
  },

  async update(id: string, updates: UpdatePipelineStageInput) {
    const supabase = createClient()
    
    // Se a ordem está sendo alterada, precisamos reordenar as outras etapas
    if (updates.order !== undefined) {
      // Buscar a etapa atual para saber a ordem antiga
      const { data: currentStage } = await supabase
        .from('pipeline_stages')
        .select('order')
        .eq('id', id)
        .single()

      if (currentStage) {
        const oldOrder = currentStage.order
        const newOrder = updates.order

        // Se a ordem realmente mudou, reordenar
        if (oldOrder !== newOrder) {
          await reorderStages(supabase, id, oldOrder, newOrder)
        }
      }
    }

    const { data, error } = await supabase
      .from('pipeline_stages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as PipelineStage
  },


  async delete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('pipeline_stages')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getLeadsCountByStage(stageSlug: string) {
    const supabase = createClient()
    const { count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', stageSlug)

    if (error) throw error
    return count || 0
  },

  async transferLeads(fromStageSlug: string, toStageSlug: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({ status: toStageSlug as any })
      .eq('status', fromStageSlug)

    if (error) throw error
  },

  async reorderAllStages(stageOrders: Array<{ id: string; order: number }>) {
    const supabase = createClient()

    // Atualizar a ordem de todas as etapas em uma transação
    for (const { id, order } of stageOrders) {
      const { error } = await supabase
        .from('pipeline_stages')
        .update({ order })
        .eq('id', id)

      if (error) throw error
    }
  },
}

