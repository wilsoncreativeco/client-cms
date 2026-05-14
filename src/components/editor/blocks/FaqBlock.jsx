import { Plus, Trash2 } from 'lucide-react'
import { Label }    from '@/components/ui/label'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button }   from '@/components/ui/button'

export function FaqBlock({ content, onChange }) {
  const set      = (key, value) => onChange({ ...content, [key]: value })
  const items    = content.items ?? []
  const setItems = (next) => set('items', next)

  const addItem    = ()          => setItems([...items, { id: crypto.randomUUID(), question: '', answer: '' }])
  const removeItem = (id)        => setItems(items.filter(i => i.id !== id))
  const updateItem = (id, k, v)  => setItems(items.map(i => i.id === id ? { ...i, [k]: v } : i))

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Section heading</Label>
        <Input value={content.heading ?? ''} onChange={e => set('heading', e.target.value)} placeholder="Frequently Asked Questions" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Questions</Label>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        {items.map((item, i) => (
          <div key={item.id} className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Q{i + 1}</span>
              <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Question</Label>
              <Input value={item.question ?? ''} onChange={e => updateItem(item.id, 'question', e.target.value)} placeholder="What do you offer?" className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Answer</Label>
              <Textarea value={item.answer ?? ''} onChange={e => updateItem(item.id, 'answer', e.target.value)} placeholder="Answer here…" rows={3} className="text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
