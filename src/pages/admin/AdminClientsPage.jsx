import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Plus, Building2, Globe, ChevronRight, Loader2, MoreHorizontal, ToggleLeft, ToggleRight } from 'lucide-react'
import { clientService } from '@/services/client.service'
import { slugify, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast-provider'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Badge }    from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function AdminClientsPage() {
  const navigate     = useNavigate()
  const { toast }    = useToast()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(false)

  const load = async () => {
    try { setClients(await clientService.list()) }
    catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (client) => {
    try {
      const updated = await clientService.toggleActive(client.id, !client.is_active)
      setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
      toast({ title: updated.is_active ? 'Client activated' : 'Client deactivated', variant: 'success' })
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? '—' : `${clients.length} tenant${clients.length !== 1 ? 's' : ''}`} on the platform.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New client
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/30" />
            <div>
              <p className="font-medium">No clients yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first client to get started.</p>
            </div>
            <Button size="sm" className="gap-2 mt-2" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Add first client
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map(client => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/clients/${client.id}`)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.business_name}</p>
                      <p className="text-xs text-muted-foreground">{client.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.custom_domain ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        {client.custom_domain}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{client.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.is_active ? 'success' : 'secondary'}>
                      {client.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(client.created_at)}
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/clients/${client.id}`)}>
                          <ChevronRight className="mr-2 h-4 w-4" /> View detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle(client)}>
                          {client.is_active
                            ? <><ToggleLeft  className="mr-2 h-4 w-4" /> Deactivate</>
                            : <><ToggleRight className="mr-2 h-4 w-4" /> Activate</>
                          }
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateClientDialog
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(c) => { setClients(prev => [c, ...prev]); navigate(`/admin/clients/${c.id}`) }}
      />
    </div>
  )
}

function CreateClientDialog({ open, onClose, onCreated }) {
  const { toast } = useToast()
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm()
  const nameVal = watch('business_name', '')

  useEffect(() => {
    setValue('slug', slugify(nameVal))
  }, [nameVal, setValue])

  const onSubmit = async (values) => {
    try {
      const client = await clientService.create(values)
      toast({ title: 'Client created', variant: 'success' })
      reset()
      onCreated(client)
      onClose()
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Business name</Label>
            <Input placeholder="Acme Landscaping" {...register('business_name', { required: 'Required' })} />
            {errors.business_name && <p className="text-xs text-destructive">{errors.business_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Slug <span className="text-muted-foreground text-xs">(URL identifier)</span></Label>
            <Input placeholder="acme-landscaping" {...register('slug', { required: 'Required' })} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Custom domain <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input placeholder="acmelandscaping.com" {...register('custom_domain')} />
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select onValueChange={v => setValue('plan', v)} defaultValue="starter">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
