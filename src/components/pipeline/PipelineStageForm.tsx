'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pipelineStageSchema, pipelineStageUpdateSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PipelineStage } from '@/types/pipeline.types'
import { useCreatePipelineStage, useUpdatePipelineStage } from '@/hooks/usePipelineStages'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

interface PipelineStageFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stage?: PipelineStage | null
}

export function PipelineStageForm({ open, onOpenChange, stage }: PipelineStageFormProps) {
  const createStage = useCreatePipelineStage()
  const updateStage = useUpdatePipelineStage()
  const isEditing = !!stage

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEditing ? pipelineStageUpdateSchema : pipelineStageSchema),
    defaultValues: {
      name: '',
      slug: '',
      order: undefined,
      color: null,
    },
  })

  const nameValue = watch('name')
  const slugValue = watch('slug')

  useEffect(() => {
    if (open && stage) {
      reset({
        name: stage.name,
        slug: stage.slug,
        color: stage.color || null,
      })
    } else if (open && !stage) {
      reset({
        name: '',
        slug: '',
        color: null,
      })
    }
  }, [open, stage, reset])

  // Gerar slug automaticamente quando o nome mudar (apenas ao criar)
  useEffect(() => {
    if (!isEditing && nameValue && !slugValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
      setValue('slug', generatedSlug)
    }
  }, [nameValue, isEditing, slugValue, setValue])

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && stage) {
        // Ao editar, remover slug dos updates (não pode ser alterado)
        const { slug, ...updates } = data
        await updateStage.mutateAsync({
          id: stage.id,
          updates,
        })
      } else {
        await createStage.mutateAsync(data)
      }
      onOpenChange(false)
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Etapa' : 'Nova Etapa'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite as informações da etapa do pipeline.'
              : 'Crie uma nova etapa para o pipeline de vendas.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Etapa *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Prospecção"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message as string}</p>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="Ex: prospeccao"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message as string}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Identificador único da etapa (apenas letras minúsculas, números e underscore)
                {' - Será gerado automaticamente a partir do nome'}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="color">Cor (Hex)</Label>
            <Input
              id="color"
              type="color"
              {...register('color')}
              className="h-10 w-full cursor-pointer"
            />
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message as string}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createStage.isPending || updateStage.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createStage.isPending || updateStage.isPending}>
              {(createStage.isPending || updateStage.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

