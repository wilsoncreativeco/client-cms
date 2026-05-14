import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Mail, Trash2, Loader2, Users } from 'lucide-react'
import { userService }  from '@/services/user.service'
import { useClient }    from '@/hooks/useClient'
import { useAuth }      from '@/contexts/AuthContext'
import { formatDate }   from '@/lib/utils'
import { useToast }     from '@/components/ui/toast-provider'
import { Button }       from '@/components/ui/button'
import { Input }        from '@/components/ui/input'
import { Label }        from '@/components/ui/label'
import { Badge }        from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function UsersPage() {
  const { clientId }  = useClient()
  const { profile }   = useAuth()
  const { toast }     = useToast()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(false)

  const load = async () => {
    if (!clientId) return
    try {
      setUsers(await userService.listForClient(clientId))
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [clientId])

  const handleRemove = async (userId) => {
    try {
      await userService.remove(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      toast({ title: 'User removed', variant: 'success' })
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? '—' : `${users.length} user${users.length !== 1 ? 's' : ''} on this account`}
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setOpen(true)} disabled={!clientId}>
          <Plus className="h-4 w-4" /> Invite user
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30" />
            <div>
              <p className="font-medium">No users yet</p>
              <p className="text-sm text-muted-foreground mt-1">Invite someone to collaborate on this site.</p>
            </div>
            <Button size="sm" className="gap-2 mt-2" onClick={() => setOpen(true)}>
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
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {(user.full_name ?? user.email)?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium">{user.full_name ?? '—'}</span>
                      {user.id === profile?.id && (
                        <Badge variant="secondary" className="text-[10px]">You</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    {user.id !== profile?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {user.full_name ?? user.email}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              They will immediately lose access to this account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemove(user.id)}>Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <InviteDialog
        open={open}
        onClose={() => setOpen(false)}
        clientId={clientId}
        onInvited={load}
      />
    </div>
  )
}

function InviteDialog({ open, onClose, clientId, onInvited }) {
  const { toast } = useToast()
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'client' },
  })

  const onSubmit = async (values) => {
    try {
      await userService.invite({ ...values, client_id: clientId })
      toast({ title: 'Invite sent!', description: `${values.email} will receive an invitation email.`, variant: 'success' })
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
        <DialogHeader><DialogTitle>Invite a user</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input placeholder="Jane Smith" {...register('full_name', { required: 'Required' })} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="jane@example.com" {...register('email', { required: 'Required' })} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select defaultValue="client" onValueChange={v => setValue('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client user</SelectItem>
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
