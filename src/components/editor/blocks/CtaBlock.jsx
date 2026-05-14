import { Label }    from '@/components/ui/label'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function CtaBlock({ content, onChange }) {
  const set = (key, value) => onChange({ ...content, [key]: value })
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Heading</Label>
        <Input value={content.heading ?? ''} onChange={e => set('heading', e.target.value)} placeholder="Ready to get started?" />
      </div>
      <div className="space-y-2">
        <Label>Subheading</Label>
        <Textarea value={content.subheading ?? ''} onChange={e => set('subheading', e.target.value)} placeholder="A compelling reason to click" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Button text</Label>
          <Input value={content.button_text ?? ''} onChange={e => set('button_text', e.target.value)} placeholder="Contact us" />
        </div>
        <div className="space-y-2">
          <Label>Button link</Label>
          <Input value={content.button_link ?? ''} onChange={e => set('button_link', e.target.value)} placeholder="/contact" />
        </div>
      </div>
    </div>
  )
}
