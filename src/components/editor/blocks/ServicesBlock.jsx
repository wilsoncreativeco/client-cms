import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Label }    from '@/components/ui/label'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button }   from '@/components/ui/button'

export function ServicesBlock({ content, onChange }) {
  const set       = (key, value) => onChange({ ...content, [key]: value })
  const items     = content.items ?? []
  const setItems  = (next) => set('items', next)

  const addItem = () => setItems([
    ...items,
    { id: crypto.randomUUID(), title: 'New service', description: '', icon: '⚡' },
  ])

  const removeItem = (id) => setItems(items.filter(i => i.id !== id))

  const updateItem = (id, key, value) =>
    setItems(items.map(i => i.id === id ? { ...i, [key]: value } : i))

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Section heading</Label>
        <Input value={content.heading ?? ''} onChange={e => set('heading', e.target.value)} placeholder="Our Services" />
      </div>
      <div className="space-y-2">
        <Label>Subheading</Label>
        <Input value={content.subheading ?? ''} onChange={e => set('subheading', e.target.value)} placeholder="Optional intro line" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Services</Label>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        {items.map((item, i) => (
          <div key={item.id} className="rounded-lg border bg-muted/30 p-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center text-base">{item.icon || '⚡'}</div>
              <span className="text-sm font-medium flex-1">{item.title || `Service ${i + 1}`}</span>
              <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Icon</Label>
                <Input
                  value={item.icon ?? ''}
                  onChange={e => updateItem(item.id, 'icon', e.target.value)}
                  placeholder="⚡"
                  className="h-8 text-center text-lg"
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={item.title ?? ''}
                  onChange={e => updateItem(item.id, 'title', e.target.value)}
                  placeholder="Service title"
                  className="h-8"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={item.description ?? ''}
                onChange={e => updateItem(item.id, 'description', e.target.value)}
                placeholder="Describe this service"
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
