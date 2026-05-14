import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Globe, X } from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import { clientService } from '@/services/client.service'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function ClientSelector() {
  const { activeClientId, setActiveClientId, clearActiveClient } = useAdminStore()
  const [clients, setClients] = useState([])
  const [open,    setOpen]    = useState(false)

  useEffect(() => {
    clientService.list().then(setClients).catch(() => {})
  }, [])

  const active = clients.find(c => c.id === activeClientId)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors',
          'bg-white/5 hover:bg-white/10'
        )}
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-white/50" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white">
            {active ? active.business_name : 'All clients'}
          </p>
          <p className="text-[10px] text-white/40">
            {active ? active.slug : 'Agency view'}
          </p>
        </div>
        <ChevronsUpDown className="h-3 w-3 shrink-0 text-white/30" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-white/10 bg-[hsl(240,5.9%,12%)] py-1 shadow-xl">
            <button
              onClick={() => { clearActiveClient(); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5',
                !activeClientId ? 'text-white' : 'text-white/60'
              )}
            >
              <Check className={cn('h-3 w-3', !activeClientId ? 'opacity-100' : 'opacity-0')} />
              All clients (agency view)
            </button>
            <div className="my-1 border-t border-white/10" />
            <div className="max-h-64 overflow-y-auto">
              {clients.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setActiveClientId(c.id); setOpen(false) }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5',
                    activeClientId === c.id ? 'text-white' : 'text-white/60'
                  )}
                >
                  <Check className={cn('h-3 w-3 shrink-0', activeClientId === c.id ? 'opacity-100' : 'opacity-0')} />
                  <span className="flex-1 truncate text-left">{c.business_name}</span>
                  <span className="text-[10px] text-white/30">{c.slug}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
