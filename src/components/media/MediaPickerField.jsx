import { useState } from 'react'
import { Image, X, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { MediaPickerModal } from './MediaPickerModal'

export function MediaPickerField({ value, onChange, label }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group rounded-lg border overflow-hidden">
          <img src={value} alt="Selected" className="h-32 w-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" className="h-8 text-xs gap-1" onClick={() => setOpen(true)}>
              <FolderOpen className="h-3.5 w-3.5" /> Change
            </Button>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => onChange('')}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Paste URL or pick from library"
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setOpen(true)}>
            <Image className="h-4 w-4" /> Library
          </Button>
        </div>
      )}

      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(url) => { onChange(url); setOpen(false) }}
      />
    </div>
  )
}
