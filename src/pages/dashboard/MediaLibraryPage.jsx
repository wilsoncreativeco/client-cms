import { useRef, useState } from 'react'
import { Upload, Trash2, Copy, Search, Loader2, Image } from 'lucide-react'
import { useMedia }      from '@/hooks/useMedia'
import { useClient }     from '@/hooks/useClient'
import { useAuth }       from '@/contexts/AuthContext'
import { mediaService }  from '@/services/media.service'
import { formatBytes, formatDate } from '@/lib/utils'
import { useToast }      from '@/components/ui/toast-provider'
import { Button }        from '@/components/ui/button'
import { Input }         from '@/components/ui/input'
import { Badge }         from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export default function MediaLibraryPage() {
  const { user }      = useAuth()
  const { clientId }  = useClient()
  const { toast }     = useToast()
  const { media, setMedia, loading } = useMedia()
  const [query,      setQuery]      = useState('')
  const [selected,   setSelected]   = useState(null)
  const [uploading,  setUploading]  = useState(false)
  const [dragOver,   setDragOver]   = useState(false)
  const inputRef = useRef()

  const filtered = media.filter(m =>
    !query || m.file_name.toLowerCase().includes(query.toLowerCase())
  )

  const handleFiles = async (files) => {
    if (!clientId) return
    setUploading(true)
    const uploads = []
    for (const file of files) {
      try {
        const m = await mediaService.upload(clientId, file, user.id)
        uploads.push(m)
      } catch (e) {
        toast({ title: `Failed: ${file.name}`, description: e.message, variant: 'destructive' })
      }
    }
    if (uploads.length) {
      setMedia(prev => [...uploads, ...prev])
      toast({ title: `${uploads.length} file${uploads.length > 1 ? 's' : ''} uploaded`, variant: 'success' })
    }
    setUploading(false)
  }

  const handleDelete = async (item) => {
    try {
      await mediaService.delete(item.id, item.storage_path)
      setMedia(prev => prev.filter(m => m.id !== item.id))
      if (selected?.id === item.id) setSelected(null)
      toast({ title: 'File deleted', variant: 'success' })
    } catch (e) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' })
    }
  }

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    toast({ title: 'URL copied', variant: 'success' })
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (files.length) handleFiles(files)
  }

  return (
    <div className="flex h-full gap-6" style={{ height: 'calc(100vh - 10rem)' }}>
      {/* Main area */}
      <div className="flex flex-1 flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Media library</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? '—' : `${media.length} file${media.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => inputRef.current.click()} disabled={uploading || !clientId}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </Button>
          <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden"
            onChange={e => handleFiles(Array.from(e.target.files))} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search files…"
            className="pl-9"
          />
        </div>

        {/* Drop zone + grid */}
        <div
          className={cn(
            'flex-1 rounded-xl border-2 transition-colors overflow-y-auto',
            dragOver ? 'border-primary bg-primary/5 border-solid' : 'border-dashed border-border'
          )}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Image className="h-10 w-10 text-muted-foreground/30" />
              {media.length === 0 ? (
                <>
                  <p className="font-medium">No files yet</p>
                  <p className="text-sm text-muted-foreground">Drop images here or click Upload</p>
                  <Button size="sm" variant="outline" className="gap-2 mt-2" onClick={() => inputRef.current.click()}>
                    <Upload className="h-4 w-4" /> Upload files
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No files match "{query}"</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(prev => prev?.id === item.id ? null : item)}
                  className={cn(
                    'group relative aspect-square rounded-lg overflow-hidden border-2 transition-all text-left',
                    selected?.id === item.id
                      ? 'border-primary ring-2 ring-primary ring-offset-1'
                      : 'border-transparent hover:border-muted-foreground/20'
                  )}
                >
                  <img src={item.file_url} alt={item.file_name} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-[10px] text-white truncate">{item.file_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail sidebar */}
      {selected && (
        <div className="w-64 shrink-0 flex flex-col gap-4">
          <div className="rounded-xl border overflow-hidden">
            <img src={selected.file_url} alt={selected.file_name} className="h-40 w-full object-cover" />
            <div className="p-3 space-y-3">
              <div>
                <p className="text-sm font-medium truncate">{selected.file_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(selected.created_at)}</p>
              </div>
              <div className="space-y-1.5">
                {selected.file_size && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Size</span>
                    <span>{formatBytes(selected.file_size)}</span>
                  </div>
                )}
                {selected.mime_type && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="secondary" className="text-[10px]">{selected.mime_type.split('/')[1]}</Badge>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs" onClick={() => copyUrl(selected.file_url)}>
                  <Copy className="h-3.5 w-3.5" /> Copy URL
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" /> Delete file
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{selected.file_name}" will be permanently deleted from storage. Any pages using this image will break.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(selected)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
