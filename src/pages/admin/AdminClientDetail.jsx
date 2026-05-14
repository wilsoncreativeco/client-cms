import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Loader2, Plus, Mail, MoreHorizontal, Trash2, Globe } from 'lucide-react'
import { clientService } from '@/services/client.service'
import { userService }   from '@/services/user.service'
import { formatDate }    from '@/lib/utils'
import { useToast }      from '@/components/ui/toast-provider'
import { Button }        from '@/components/ui/button'
import { Input }         from '@/components/ui/input'
import { Label }         from '@/components/ui/label'
import { Badge }         from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function AdminClientDetail() {
  const { clientId } = useParams()
  const navigate     = useNavigate()
  const { toast }    = useToast()

  const [client, setClient]   = useState(null)
  const [stats,  setStats]    = useState(null)
  const [users,  setUsers]    = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)

  const load = async () => {
    try {
      const [c, s, u] = await Promise.all([
        clientService.get(clientId),
        clientService.getStats(clientId),
        userService.listForClient(clientId),
      ])
      setClient(c); setStats(s); setUsers(u)
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [clientId])

  const handleRemoveUser = async (userId) => {
    try {
      await userService.remove(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      toast({ title: 'User removed', variant: 'success' })
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }
  if (!client) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/clients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{client.business_name}</h1>
            <Badge variant={client.is_active ? 'success' : 'secondary'}>
              {client.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="secondary" className="capitalize">{client.plan}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            slug: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{client.slug}</code>
            {client.custom_domain && (
              <span className="ml-3 flex-inline items-center gap-1">
                <Globe className="inline h-3.5 w-3.5 mr-0.5" />{client.custom_domain}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pages',   value: stats.pages },
            { label: 'Media',   value: stats.media },
            { label: 'Users',   value: stats.users },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{s.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Users tab */}
        <TabsContent value="users" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{users.length} user{users.length !== 1 ? 's' : ''}</p>
            <Button size="sm" className="gap-2" onClick={() => setInviteOpen(true)}>
              <Plus className="h-4 w-4" /> Invite user
            </Button>
          </div>
          <div className="rounded-xl border bg-card">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <p className="text-muted-foreground text-sm">No users yet — invite someone to get started.</p>
                <Button size="sm" variant="outline" className="gap-2 mt-1" onClick={() => setInviteOpen(true)}>
                  <Mail className="h-4 w-4" /> Send invite
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{user.role}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove user?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This removes {user.full_name ?? user.email} from this client. They will lose access immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveUser(user.id)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Settings tab */}
        <TabsContent value="settings" className="mt-4">
          <EditClientForm client={client} onUpdated={setClient} />
        </TabsContent>
      </Tabs>

      <InviteUserDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        clientId={clientId}
        onInvited={() => load()}
      />
    </div>
  )
}

function EditClientForm({ client, onUpdated }) {
  const { toast } = useToast()
  const { register, handleSubmit, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: {
      business_name: client.business_name,
      custom_domain: client.custom_domain ?? '',
      plan:          client.plan,
    },
  })

  const onSubmit = async (values) => {
    try {
      const updated = await clientService.update(client.id, values)
      onUpdated(updated)
      toast({ title: 'Settings saved', variant: 'success' })
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader><CardTitle>Client settings</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Business name</Label>
            <Input {...register('business_name', { required: 'Required' })} />
          </div>
          <div className="space-y-2">
            <Label>Custom domain</Label>
            <Input placeholder="example.com" {...register('custom_domain')} />
          </div>
          <div className="space-y-2">
            <Label>Slug <span className="text-muted-foreground text-xs">(read-only)</span></Label>
            <Input value={client.slug} disabled className="bg-muted" />
          </div>
          <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function InviteUserDialog({ open, onClose, clientId, onInvited }) {
  const { toast } = useToast()
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'client' },
  })

  const onSubmit = async (values) => {
    try {
      await userService.invite({ ...values, client_id: clientId })
      toast({ title: 'Invite sent!', description: `${values.email} will receive an email.`, variant: 'success' })
      reset()
      onInvited()
      onClose()
    } catch (e) {
      toast({ title: 'Invite failed', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Invite user</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input placeholder="Jane Smith" {...register('full_name', { required: 'Required' })} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="jane@client.com" {...register('email', { required: 'Required' })} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select defaultValue="client" onValueChange={v => setValue('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
