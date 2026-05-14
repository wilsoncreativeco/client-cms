import { Label }    from '@/components/ui/label'
import { Input }    from '@/components/ui/input'
import { MediaPickerField } from '@/components/media/MediaPickerField'
import { RichTextEditor }   from '@/components/editor/RichTextEditor'

export function AboutBlock({ content, onChange }) {
  const set = (key, value) => onChange({ ...content, [key]: value })

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Heading</Label>
        <Input value={content.heading ?? ''} onChange={e => set('heading', e.target.value)} placeholder="About Us" />
      </div>
      <div className="space-y-2">
        <Label>Body text</Label>
        <RichTextEditor value={content.body ?? ''} onChange={v => set('body', v)} />
      </div>
      <div className="space-y-2">
        <Label>Image</Label>
        <MediaPickerField value={content.image ?? ''} onChange={url => set('image', url)} />
      </div>
    </div>
  )
}
