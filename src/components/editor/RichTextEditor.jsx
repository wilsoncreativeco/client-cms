import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit  from '@tiptap/starter-kit'
import Link        from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { Bold, Italic, Link2, List, ListOrdered, Heading2, Undo, Redo } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RichTextEditor({ value, onChange, placeholder = 'Start writing…' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2' },
    },
  })

  // Sync external content changes without losing cursor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value])

  if (!editor) return null

  const ToolBtn = ({ onClick, active, title, children }) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded text-sm transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-md border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5 flex-wrap">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading">
          <Heading2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolBtn>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolBtn onClick={() => {
          const url = window.prompt('URL')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }} active={editor.isActive('link')} title="Link">
          <Link2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
          <Undo className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
          <Redo className="h-3.5 w-3.5" />
        </ToolBtn>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
