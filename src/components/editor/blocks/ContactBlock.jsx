import { Label }    from '@/components/ui/label'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch }   from '@/components/ui/switch'

export function ContactBlock({ content, onChange }) {
  const set = (key, value) => onChange({ ...content, [key]: value })
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Heading</Label>
        <Input value={content.heading ?? ''} onChange={e => set('heading', e.target.value)} placeholder="Get in touch" />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={content.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="hello@example.com" />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input value={content.phone ?? ''} onChange={e => set('phone', e.target.value)} placeholder="+44 7700 000000" />
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Textarea value={content.address ?? ''} onChange={e => set('address', e.target.value)} placeholder="123 Main St, City, Country" rows={2} />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Show contact form</p>
          <p className="text-xs text-muted-foreground">Display a form so visitors can message you</p>
        </div>
        <Switch checked={content.show_form ?? true} onCheckedChange={v => set('show_form', v)} />
      </div>
    </div>
  )
}
