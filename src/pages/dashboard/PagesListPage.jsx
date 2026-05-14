import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Plus, FileText, Globe, Clock, MoreHorizontal, Loader2, Trash2, PencilLine } from 'lucide-react'
import { pageService }  from '@/services/page.service'
import { useClient }    from '@/hooks/useClient'
import { usePages }     from '@/hooks/usePages'
import { slugify, formatDate } from '@/lib/utils'
import { useToast }     from '@/components/ui/toast-provider'
import { Button }       from '@/components/ui/button'
import { Input }        from '@/components/ui/input'
import { Label }        from '@/components/ui/label'
import { Badge }        from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function PagesListPage() {
  const navigate      = useNavigate()
  const { toast }     = useToast()
  const { clientId }  = useClient()
  const { pages, loading, reload, setPages } = usePages()
  const [open, setOpen] = useState(false)

  const handleDelete = async (page) => {
    try {
      await pageService.delete(page.id)
      setPages(prev => prev.filter(p => p.id !== page.id))
      toast({ title: 'Page deleted', variant: 'success' })
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? '—' : `${pages.length} page${pages.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setOpen(true)} disabled={!clientId}>
          <Plus className="h-4 w-4" /> New page
        </Button>
      </div>

      <div className="rounded-xl border bg-card divide-y">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !clientId ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-muted-foreground text-sm">Select a client to manage their pages.</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30" />
            <div>
              <p className="font-medium">No pages yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create the first page for this site.</p>
            </div>
            <Button size="sm" className="gap-2 mt-2" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Create page
            </Button>
          </div>
        ) : (
          pages.map(page => (
            <div
              key={page.id}
              className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors group cursor-pointer"
              onClick={() => navigate(`/dashboard/pages/${page.id}`)}
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{page.name}</span>
                  <Badge variant={page.status === 'published' ? 'success' : 'secondary'} className="text-[10px]">
                    {page.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {page.status === 'published'
                  ? <><Globe className="h-3.5 w-3.5" /> {formatDate(page.published_at)}</>
                  : <><Clock className="h-3.5 w-3.5" /> {formatDate(page.updated_at)}</>
                }
              </div>
              <div onClick={e => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/pages/${page.id}`)}>
                      <PencilLine className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{page.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>This deletes the page and all its content blocks. This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(page)}>Delete page</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      <CreatePageDialog
        open={open}
        onClose={() => setOpen(false)}
        clientId={clientId}
        onCreated={(page) => navigate(`/dashboard/pages/${page.id}`)}
      />
    </div>
  )
}

function CreatePageDialog({ open, onClose, clientId, onCreated }) {
  const { toast } = useToast()
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm()
  const nameVal = watch('name', '')

  useState(() => { setValue('slug', slugify(nameVal)) }, [nameVal])

  const onSubmit = async (values) => {
    try {
      const page = await pageService.create(clientId, { ...values, slug: values.slug || slugify(values.name) })
      toast({ title: 'Page created', variant: 'success' })
      reset()
      onCreated(page)
      onClose()
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>New page</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Page name</Label>
            <Input
              placeholder="Home"
              {...register('name', { required: 'Required' })}
              onChange={e => { register('name').onChange(e); setValue('slug', slugify(e.target.value)) }}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input placeholder="home" {...register('slug', { required: 'Required' })} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create page
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
