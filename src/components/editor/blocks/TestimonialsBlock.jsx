import { Plus, Trash2 } from 'lucide-react'
import { Label }    from '@/components/ui/label'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button }   from '@/components/ui/button'

export function TestimonialsBlock({ content, onChange }) {
  const set     = (key, value) => onChange({ ...content, [key]: value })
  const items   = content.items ?? []
  const setItems = (next) => set('items', next)

  const addItem = () => setItems([
    ...items,
    { id: crypto.randomUUID(), name: '', role: '', text: '', avatar: '' },
  ])

  const removeItem  = (id)         => setItems(items.filter(i => i.id !== id))
  const updateItem  = (id, k, v)   => setItems(items.map(i => i.id === id ? { ...i, [k]: v } : i))

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Section heading</Label>
        <Input value={content.heading ?? ''} onChange={e => set('heading', e.target.value)} placeholder="What clients say" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Testimonials</Label>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        {items.map((item, i) => (
          <div key={item.id} className="rounded-lg border bg-muted/30 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
              <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={item.name ?? ''} onChange={e => updateItem(item.id, 'name', e.target.value)} placeholder="Jane Smith" className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Role / Company</Label>
                <Input value={item.role ?? ''} onChange={e => updateItem(item.id, 'role', e.target.value)} placeholder="CEO, Acme" className="h-8" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Quote</Label>
              <Textarea value={item.text ?? ''} onChange={e => updateItem(item.id, 'text', e.target.value)} placeholder="What they said…" rows={2} className="text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
