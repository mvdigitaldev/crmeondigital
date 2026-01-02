'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useLeads, useDeleteLead } from '@/hooks/useLeads'
import { LeadForm } from '@/components/leads/LeadForm'
import { LeadFilters } from '@/components/leads/LeadFilters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
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
import type { Lead } from '@/types/lead.types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusColors: Record<string, string> = {
  prospecção: 'bg-blue-500/20 text-blue-400',
  contato_realizado: 'bg-yellow-500/20 text-yellow-400',
  reuniao_agendada: 'bg-purple-500/20 text-purple-400',
  negociacao: 'bg-orange-500/20 text-orange-400',
  fechado: 'bg-green-500/20 text-green-400',
  perdido: 'bg-red-500/20 text-red-400',
}

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [uf, setUf] = useState('')
  const [origem, setOrigem] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)

  const filters = {
    search: search || undefined,
    status: status && status !== 'all' ? status : undefined,
    uf: uf || undefined,
    origem: origem && origem !== 'all' ? origem : undefined,
  }

  const { data: leads = [], isLoading } = useLeads(filters)
  const deleteLead = useDeleteLead()

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead)
    setIsFormOpen(true)
  }

  const handleDelete = async () => {
    if (leadToDelete) {
      await deleteLead.mutateAsync(leadToDelete.id)
      setLeadToDelete(null)
    }
  }

  const handleNewLead = () => {
    setSelectedLead(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Button onClick={handleNewLead}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <LeadFilters
        search={search}
        status={status}
        uf={uf}
        origem={origem}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onUfChange={setUf}
        onOrigemChange={setOrigem}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum lead encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produtor</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Valor Estimado</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.nome_produtor}</TableCell>
                    <TableCell>{lead.nome_contato}</TableCell>
                    <TableCell>{lead.email || '-'}</TableCell>
                    <TableCell>{lead.uf || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[lead.status]}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.origem}</TableCell>
                    <TableCell>
                      {lead.valor_estimado
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(lead.valor_estimado)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(lead)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLeadToDelete(lead)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LeadForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        lead={selectedLead}
      />

      <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lead {leadToDelete?.nome_produtor}? Esta ação não pode ser desfeita.
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
