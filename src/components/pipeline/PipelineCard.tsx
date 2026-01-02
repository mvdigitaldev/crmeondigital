'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import type { Lead } from '@/types/lead.types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

interface PipelineCardProps {
  lead: Lead
}

export function PipelineCard({ lead }: PipelineCardProps) {
  const router = useRouter()
  const dragStartedRef = useRef(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lead.id,
    data: {
      type: 'lead',
      lead,
    },
  })

  useEffect(() => {
    if (isDragging) {
      dragStartedRef.current = true
    }
  }, [isDragging])

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // O PointerSensor com distance: 8 previne o drag em cliques simples
      // Verificar se o drag realmente aconteceu
      if (!dragStartedRef.current && !isDragging) {
        router.push(`/dashboard/leads/${lead.id}`)
      }
      // Reset após um breve delay
      setTimeout(() => {
        dragStartedRef.current = false
      }, 100)
    },
    [isDragging, router, lead.id]
  )

  return (
    <div ref={setNodeRef} style={style}>
      <Card 
        {...listeners}
        {...attributes}
        onClick={handleClick}
        className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{lead.nome_produtor}</h3>
              <p className="text-xs text-muted-foreground">{lead.nome_contato}</p>
            </div>
          </div>
          {lead.valor_estimado && (
            <div className="text-sm font-medium text-primary">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(lead.valor_estimado)}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{lead.uf || '-'}</span>
            <span>{format(new Date(lead.created_at), 'dd/MM/yy', { locale: ptBR })}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
