'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'

interface LeadFiltersProps {
  search: string
  status: string
  uf: string
  origem: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onUfChange: (value: string) => void
  onOrigemChange: (value: string) => void
}

export function LeadFilters({
  search,
  status,
  uf,
  origem,
  onSearchChange,
  onStatusChange,
  onUfChange,
  onOrigemChange,
}: LeadFiltersProps) {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Buscar</label>
          <Input
            placeholder="Nome, email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={status || 'all'} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="prospecção">Prospecção</SelectItem>
              <SelectItem value="contato_realizado">Contato Realizado</SelectItem>
              <SelectItem value="reuniao_agendada">Reunião Agendada</SelectItem>
              <SelectItem value="negociacao">Negociação</SelectItem>
              <SelectItem value="fechado">Fechado</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">UF</label>
          <Input
            placeholder="Ex: SP"
            maxLength={2}
            value={uf}
            onChange={(e) => onUfChange(e.target.value.toUpperCase())}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Origem</label>
          <Select value={origem || 'all'} onValueChange={onOrigemChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Inbound">Inbound</SelectItem>
              <SelectItem value="Outbound">Outbound</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}

