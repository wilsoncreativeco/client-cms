import { useRef } from 'react'
import { Trash2, Plus, Upload } from 'lucide-react'
import { Label }    from '@/components/ui/label'
import { Input }    from '@/components/ui/input'
import { Button }   from '@/components/ui/button'
import { useAuth }  from '@/contexts/AuthContext'
import { useClient } from '@/hooks/useClient'
import { mediaService } from '@/services/media.service'
import { useToast }     from '@/components/ui/toast-provider'

export function GalleryBlock({ content, onChange }) {
  const { user }      = useAuth()
  const { clientId }  = useClient()
  const { toast }     = useToast()
  const inputRef      = useRef()
  const set           = (key, value) => onChange({ ...content, [key]: value })
  const images        = content.images ?? []
  const setImages     = (next) => set('images', next)

  const handleFiles = async (files) => {
    const uploads = []
    for (const file of files) {
      try {
        const media = await mediaService.upload(clientId, file, user.id)
        uploads.push({ id: media.id, url: media.file_url, alt: '' })
      } catch (e) {
        toast({ title: `Upload failed: ${file.name}`, description: e.message, variant: 'destructive' })
      }
    }
    if (uploads.length) setImages([...images, ...uploads])
  }

  const updateAlt    = (id, alt)   => setImages(images.map(i => i.id === id ? { ...i, alt } : i))
  const removeImage  = (id)        => setImages(images.filter(i => i.id !== id))

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Section heading</Label>
        <Input value={content.heading ?? ''} onChange={e => set('heading', e.target.value)} placeholder="Gallery" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Images</Label>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => inputRef.current.click()}>
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(Array.from(e.target.files))}
          />
        </div>

        {images.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => inputRef.current.click()}
          >
            <Plus className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload images</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map(img => (
              <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden border">
                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                  <input
                    value={img.alt}
                    onChange={e => updateAlt(img.id, e.target.value)}
                    placeholder="Alt text"
                    className="w-full rounded text-xs bg-white/20 text-white placeholder:text-white/60 px-2 py-1 border-0 outline-none text-center"
                    onClick={e => e.stopPropagation()}
                  />
                  <button onClick={() => removeImage(img.id)} className="text-white/80 hover:text-white">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <div
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => inputRef.current.click()}
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
