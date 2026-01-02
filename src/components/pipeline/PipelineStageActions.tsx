'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import type { PipelineStage } from '@/types/pipeline.types'
import { PipelineStageForm } from './PipelineStageForm'
import { DeleteStageDialog } from './DeleteStageDialog'

interface PipelineStageActionsProps {
  stage: PipelineStage
  allStages: PipelineStage[]
}

export function PipelineStageActions({ stage, allStages }: PipelineStageActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="h-6 w-6">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PipelineStageForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        stage={stage}
      />

      <DeleteStageDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        stage={stage}
        allStages={allStages}
      />
    </>
  )
}

