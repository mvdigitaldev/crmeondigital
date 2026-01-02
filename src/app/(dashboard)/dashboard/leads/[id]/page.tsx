'use client'

export const dynamic = 'force-dynamic'

import { use } from 'react'
import { useLead, useUpdateLead, useDeleteLead } from '@/hooks/useLeads'
import { ActivityTimeline } from '@/components/activities/ActivityTimeline'
import { ActivityForm } from '@/components/activities/ActivityForm'
import { LeadForm } from '@/components/leads/LeadForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Plus, ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatPhoneForDisplay, removePhoneMask } from '@/lib/phone-mask'

const statusColors: Record<string, string> = {
  prospecção: 'bg-blue-500/20 text-blue-400',
  contato_realizado: 'bg-yellow-500/20 text-yellow-400',
  reuniao_agendada: 'bg-purple-500/20 text-purple-400',
  negociacao: 'bg-orange-500/20 text-orange-400',
  fechado: 'bg-green-500/20 text-green-400',
  perdido: 'bg-red-500/20 text-red-400',
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: lead, isLoading } = useLead(resolvedParams.id)
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    if (lead) {
      await deleteLead.mutateAsync(lead.id)
      router.push('/dashboard/leads')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  if (!lead) {
    return <div className="text-center py-8 text-muted-foreground">Lead não encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{lead.nome_produtor}</h1>
            <p className="text-muted-foreground">{lead.nome_contato}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {lead.telefone && (
            <Button
              variant="outline"
              onClick={() => {
                const phoneNumber = removePhoneMask(lead.telefone!)
                window.open(`https://wa.me/${phoneNumber}`, '_blank')
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          )}
          <Button onClick={() => setIsEditFormOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1">{lead.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
              <p className="mt-1">{lead.telefone ? formatPhoneForDisplay(lead.telefone) : '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">UF</label>
              <p className="mt-1">{lead.uf || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Produto</label>
              <p className="mt-1">{lead.produto || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Site/Link</label>
              <p className="mt-1">
                {lead.site_link ? (
                  <a
                    href={lead.site_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {lead.site_link}
                  </a>
                ) : (
                  '-'
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Origem</label>
              <p className="mt-1">{lead.origem}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valor Estimado</label>
              <p className="mt-1">
                {lead.valor_estimado
                  ? new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(lead.valor_estimado)
                  : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
              <p className="mt-1">
                {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            {lead.observacoes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Observações</label>
                <p className="mt-1 whitespace-pre-wrap">{lead.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Atividades</CardTitle>
            <Button onClick={() => setIsActivityFormOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nova Atividade
            </Button>
          </CardHeader>
          <CardContent>
            <ActivityTimeline leadId={lead.id} />
          </CardContent>
        </Card>
      </div>

      <LeadForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        lead={lead}
      />

      <ActivityForm
        open={isActivityFormOpen}
        onOpenChange={setIsActivityFormOpen}
        leadId={lead.id}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lead {lead.nome_produtor}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
