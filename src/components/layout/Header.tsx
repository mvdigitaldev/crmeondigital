'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePendingFollowUps } from '@/hooks/useActivities'

export function Header() {
  const { pendingFollowUpsCount } = usePendingFollowUps()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">CRM EON Digital</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingFollowUpsCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center"
            >
              {pendingFollowUpsCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  )
}

