import { Label }    from '@/components/ui/label'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MediaPickerField } from '@/components/media/MediaPickerField'

export function HeroBlock({ content, onChange }) {
  const set = (key, value) => onChange({ ...content, [key]: value })

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Heading</Label>
        <Input value={content.heading ?? ''} onChange={e => set('heading', e.target.value)} placeholder="Your heading" />
      </div>
      <div className="space-y-2">
        <Label>Subheading</Label>
        <Textarea
          value={content.subheading ?? ''}
          onChange={e => set('subheading', e.target.value)}
          placeholder="A short description"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>CTA text</Label>
          <Input value={content.cta_text ?? ''} onChange={e => set('cta_text', e.target.value)} placeholder="Get in touch" />
        </div>
        <div className="space-y-2">
          <Label>CTA link</Label>
          <Input value={content.cta_link ?? ''} onChange={e => set('cta_link', e.target.value)} placeholder="/contact" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Background image</Label>
        <MediaPickerField
          value={content.background_image ?? ''}
          onChange={url => set('background_image', url)}
        />
      </div>
    </div>
  )
}
