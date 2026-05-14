import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { contentService } from '@/services/content.service'
import { useToast }       from '@/components/ui/toast-provider'
import { Button }         from '@/components/ui/button'
import { Switch }         from '@/components/ui/switch'
import { cn }             from '@/lib/utils'

import { HeroBlock }         from './blocks/HeroBlock'
import { AboutBlock }        from './blocks/AboutBlock'
import { ServicesBlock }     from './blocks/ServicesBlock'
import { GalleryBlock }      from './blocks/GalleryBlock'
import { TestimonialsBlock } from './blocks/TestimonialsBlock'
import { FaqBlock }          from './blocks/FaqBlock'
import { CtaBlock }          from './blocks/CtaBlock'
import { ContactBlock }      from './blocks/ContactBlock'
import { RichTextBlock }     from './blocks/RichTextBlock'

const EDITORS = {
  hero:         HeroBlock,
  about:        AboutBlock,
  services:     ServicesBlock,
  gallery:      GalleryBlock,
  testimonials: TestimonialsBlock,
  faq:          FaqBlock,
  cta:          CtaBlock,
  contact:      ContactBlock,
  richtext:     RichTextBlock,
}

const BLOCK_LABELS = {
  hero: 'Hero', about: 'About', services: 'Services', gallery: 'Gallery',
  testimonials: 'Testimonials', faq: 'FAQ', cta: 'Call to Action',
  contact: 'Contact', richtext: 'Rich Text',
}

export function BlockEditor({ block, onUpdated }) {
  const { toast }    = useToast()
  const [content, setContent] = useState(block?.content_json ?? {})
  const [saving,  setSaving]  = useState(false)
  const [dirty,   setDirty]   = useState(false)
  const debounceRef = useRef(null)

  // Reset when block changes
  useEffect(() => {
    setContent(block?.content_json ?? {})
    setDirty(false)
  }, [block?.id])

  const handleChange = useCallback((next) => {
    setContent(next)
    setDirty(true)
    // Auto-save after 800ms idle
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(next), 800)
  }, [block?.id])

  const save = async (data = content) => {
    if (!block) return
    setSaving(true)
    try {
      const updated = await contentService.updateBlock(block.id, { content_json: data })
      onUpdated(updated)
      setDirty(false)
    } catch (e) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisible = async () => {
    try {
      const updated = await contentService.toggleVisible(block.id, !block.visible)
      onUpdated(updated)
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  if (!block) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-8">
        <div className="text-4xl">👈</div>
        <p className="font-medium">Select a section</p>
        <p className="text-sm text-muted-foreground">Click any section on the left to edit its content.</p>
      </div>
    )
  }

  const EditorComponent = EDITORS[block.block_type]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">{BLOCK_LABELS[block.block_type] ?? block.block_type}</h3>
          {dirty && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Unsaved
            </span>
          )}
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{block.visible ? 'Visible' : 'Hidden'}</span>
            <Switch checked={block.visible} onCheckedChange={handleToggleVisible} />
          </div>
          <Button
            size="sm"
            variant={dirty ? 'default' : 'outline'}
            className="h-8 gap-1.5 text-xs"
            onClick={() => save()}
            disabled={saving || !dirty}
          >
            {saving
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Save    className="h-3.5 w-3.5" />
            }
            Save
          </Button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto p-4">
        {EditorComponent ? (
          <EditorComponent content={content} onChange={handleChange} />
        ) : (
          <p className="text-sm text-muted-foreground">No editor for block type: {block.block_type}</p>
        )}
      </div>
    </div>
  )
}
