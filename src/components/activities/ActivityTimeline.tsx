'use client'

import { useState } from 'react'
import { useActivitiesByLead, useUpdateActivity, useDeleteActivity } from '@/hooks/useActivities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Phone, MessageSquare, Mail, Calendar, Check, Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Activity } from '@/types/activity.types'
import { ActivityForm } from './ActivityForm'

const tipoIcons = {
  ligacao: Phone,
  whatsapp: MessageSquare,
  email: Mail,
  reuniao: Calendar,
}

const tipoLabels = {
  ligacao: 'Ligação',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  reuniao: 'Reunião',
}

interface ActivityTimelineProps {
  leadId: string
}

export function ActivityTimeline({ leadId }: ActivityTimelineProps) {
  const { data: activities = [], isLoading } = useActivitiesByLead(leadId)
  const updateActivity = useUpdateActivity()
  const deleteActivity = useDeleteActivity()
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleMarkAsDone = async (id: string) => {
    await updateActivity.mutateAsync({ id, updates: { realizada: true } })
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setIsFormOpen(true)
  }

  const handleDelete = async () => {
    if (deletingActivityId) {
      await deleteActivity.mutateAsync(deletingActivityId)
      setDeletingActivityId(null)
    }
  }

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      setEditingActivity(null)
    }
  }

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Carregando atividades...</div>
  }

  if (activities.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Nenhuma atividade registrada</div>
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = tipoIcons[activity.tipo]
        const isPast = activity.data_agendada && new Date(activity.data_agendada) < new Date()
        const isPending = !activity.realizada && activity.data_agendada && isPast

        return (
          <Card key={activity.id} className={isPending ? 'border-yellow-500/50' : ''}>
            <CardContent className="px-6 py-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tipoLabels[activity.tipo]}</span>
                      <Badge variant={activity.realizada ? 'default' : 'secondary'}>
                        {activity.realizada ? 'Realizada' : 'Pendente'}
                      </Badge>
                      {isPending && (
                        <Badge variant="destructive">Vencido</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!activity.realizada && activity.data_agendada && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsDone(activity.id)}
                          disabled={updateActivity.isPending}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Realizada
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(activity)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeletingActivityId(activity.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {activity.descricao && (
                    <p className="text-sm text-muted-foreground">{activity.descricao}</p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {activity.data_agendada ? (
                      <span>
                        Agendado para:{' '}
                        {format(new Date(activity.data_agendada), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    ) : (
                      <span>
                        Registrado em:{' '}
                        {format(new Date(activity.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
      
      <ActivityForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        leadId={leadId}
        activity={editingActivity}
      />

      <AlertDialog open={!!deletingActivityId} onOpenChange={(open) => !open && setDeletingActivityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

