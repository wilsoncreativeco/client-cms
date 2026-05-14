import { useState, useRef } from 'react'
import { Upload, Loader2, Search, Check } from 'lucide-react'
import { useMedia }      from '@/hooks/useMedia'
import { useClient }     from '@/hooks/useClient'
import { useAuth }       from '@/contexts/AuthContext'
import { mediaService }  from '@/services/media.service'
import { formatBytes }   from '@/lib/utils'
import { useToast }      from '@/components/ui/toast-provider'
import { Button }        from '@/components/ui/button'
import { Input }         from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function MediaPickerModal({ open, onClose, onSelect }) {
  const { user }     = useAuth()
  const { clientId } = useClient()
  const { toast }    = useToast()
  const { media, setMedia, loading } = useMedia()
  const [query,      setQuery]      = useState('')
  const [selected,   setSelected]   = useState(null)
  const [uploading,  setUploading]  = useState(false)
  const inputRef = useRef()

  const filtered = media.filter(m =>
    !query || m.file_name.toLowerCase().includes(query.toLowerCase())
  )

  const handleUpload = async (files) => {
    setUploading(true)
    const uploads = []
    for (const file of files) {
      try {
        const m = await mediaService.upload(clientId, file, user.id)
        uploads.push(m)
      } catch (e) {
        toast({ title: `Upload failed: ${file.name}`, description: e.message, variant: 'destructive' })
      }
    }
    if (uploads.length) {
      setMedia(prev => [...uploads, ...prev])
      toast({ title: `${uploads.length} file${uploads.length > 1 ? 's' : ''} uploaded`, variant: 'success' })
    }
    setUploading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle>Media library</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search files…"
              className="pl-8 h-8"
            />
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 h-8 shrink-0" onClick={() => inputRef.current.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload
          </Button>
          <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden"
            onChange={e => handleUpload(Array.from(e.target.files))} />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 h-32 text-center">
              <p className="text-sm text-muted-foreground">No media yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item.id === selected ? null : item.id)}
                  className={cn(
                    'group relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                    selected === item.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:border-muted-foreground/30'
                  )}
                >
                  <img src={item.file_url} alt={item.file_name} className="h-full w-full object-cover" />
                  {selected === item.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {selected
              ? `Selected: ${media.find(m => m.id === selected)?.file_name}`
              : `${filtered.length} file${filtered.length !== 1 ? 's' : ''}`
            }
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" disabled={!selected} onClick={() => {
              const m = media.find(m => m.id === selected)
              if (m) onSelect(m.file_url)
            }}>
              Select image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
