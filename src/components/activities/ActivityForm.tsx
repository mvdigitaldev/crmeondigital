'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { activitySchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateActivity, useUpdateActivity } from '@/hooks/useActivities'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Activity } from '@/types/activity.types'

interface ActivityFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string
  activity?: Activity | null
}

export function ActivityForm({ open, onOpenChange, leadId, activity }: ActivityFormProps) {
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()
  const isEditing = !!activity
  const [tipo, setTipo] = useState<'ligacao' | 'whatsapp' | 'email' | 'reuniao'>('ligacao')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      tipo: 'ligacao' as const,
      descricao: '',
      data_agendada: null,
      realizada: false,
    },
  })

  // Quando a atividade mudar ou o dialog abrir, preencher o formulário
  useEffect(() => {
    if (open && activity) {
      setTipo(activity.tipo)
      setValue('tipo', activity.tipo)
      setValue('descricao', activity.descricao || '')
      setValue('realizada', activity.realizada)
      if (activity.data_agendada) {
        const date = new Date(activity.data_agendada)
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
        setValue('data_agendada', localDateTime)
      } else {
        setValue('data_agendada', null)
      }
    } else if (open && !activity) {
      // Reset para novo
      setTipo('ligacao')
      setValue('tipo', 'ligacao')
      setValue('descricao', '')
      setValue('realizada', false)
      setValue('data_agendada', null)
    }
  }, [open, activity, setValue])

  const onSubmit = async (data: any) => {
    try {
      const submitData = {
        tipo: data.tipo,
        descricao: data.descricao || null,
        data_agendada: data.data_agendada 
          ? new Date(data.data_agendada).toISOString() 
          : null,
        realizada: data.realizada || false,
      }

      if (isEditing && activity) {
        await updateActivity.mutateAsync({ id: activity.id, updates: submitData })
      } else {
        await createActivity.mutateAsync({ ...submitData, lead_id: leadId } as any)
      }
      
      onOpenChange(false)
      reset()
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edite os dados da atividade' : 'Registre uma nova atividade para este lead'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={tipo}
              onValueChange={(value) => {
                setTipo(value as any)
                setValue('tipo', value as any)
              }}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ligacao">Ligação</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="realizada"
                {...register('realizada')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="realizada" className="cursor-pointer">
                Marcar como realizada
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              rows={4}
              aria-invalid={!!errors.descricao}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">{errors.descricao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_agendada">Data Agendada (opcional)</Label>
            <Input
              id="data_agendada"
              type="datetime-local"
              {...register('data_agendada')}
              aria-invalid={!!errors.data_agendada}
            />
            {errors.data_agendada && (
              <p className="text-sm text-destructive">{errors.data_agendada.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createActivity.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createActivity.isPending || updateActivity.isPending}
            >
              {(createActivity.isPending || updateActivity.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Salvar Alterações' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

