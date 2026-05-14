import { Label }          from '@/components/ui/label'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

export function RichTextBlock({ content, onChange }) {
  return (
    <div className="space-y-2">
      <Label>Content</Label>
      <RichTextEditor value={content.content ?? ''} onChange={v => onChange({ ...content, content: v })} />
    </div>
  )
}
