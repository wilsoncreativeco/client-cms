import { useState } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Eye, EyeOff, Trash2, Plus, ChevronDown,
} from 'lucide-react'
import { contentService } from '@/services/content.service'
import { useToast }       from '@/components/ui/toast-provider'
import { Button }         from '@/components/ui/button'
import { cn }             from '@/lib/utils'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const BLOCK_TYPES = [
  { type: 'hero',         label: 'Hero' },
  { type: 'about',        label: 'About' },
  { type: 'services',     label: 'Services' },
  { type: 'gallery',      label: 'Gallery' },
  { type: 'testimonials', label: 'Testimonials' },
  { type: 'faq',          label: 'FAQ' },
  { type: 'cta',          label: 'Call to Action' },
  { type: 'contact',      label: 'Contact' },
  { type: 'richtext',     label: 'Rich Text' },
]

const BLOCK_ICONS = {
  hero:         '🏔',
  about:        '👤',
  services:     '⚡',
  gallery:      '🖼',
  testimonials: '💬',
  faq:          '❓',
  cta:          '🎯',
  contact:      '📬',
  richtext:     '📝',
}

export function BlockList({ blocks, setBlocks, clientId, pageId, selectedId, onSelect }) {
  const { toast }       = useToast()
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = blocks.findIndex(b => b.id === active.id)
    const newIndex = blocks.findIndex(b => b.id === over.id)
    const reordered = arrayMove(blocks, oldIndex, newIndex)
    setBlocks(reordered)
    try {
      await contentService.reorderBlocks(reordered)
    } catch (e) {
      toast({ title: 'Reorder failed', description: e.message, variant: 'destructive' })
    }
  }

  const handleAddBlock = async (type) => {
    try {
      const block = await contentService.createBlock(clientId, pageId, type, blocks.length)
      setBlocks(prev => [...prev, block])
      onSelect(block)
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const handleToggleVisible = async (block) => {
    try {
      const updated = await contentService.toggleVisible(block.id, !block.visible)
      setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b))
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (block) => {
    try {
      await contentService.deleteBlock(block.id)
      setBlocks(prev => prev.filter(b => b.id !== block.id))
      if (selectedId === block.id) onSelect(null)
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const activeBlock = blocks.find(b => b.id === activeId)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sections
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {BLOCK_TYPES.map(bt => (
              <DropdownMenuItem key={bt.type} onClick={() => handleAddBlock(bt.type)}>
                <span className="mr-2 text-base leading-none">{BLOCK_ICONS[bt.type]}</span>
                {bt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
            <p className="text-sm text-muted-foreground">No sections yet.</p>
            <p className="text-xs text-muted-foreground">Click "Add" to add your first section.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveId(active.id)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map(block => (
                <SortableBlockItem
                  key={block.id}
                  block={block}
                  isSelected={selectedId === block.id}
                  onSelect={() => onSelect(block)}
                  onToggleVisible={() => handleToggleVisible(block)}
                  onDelete={() => handleDelete(block)}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeBlock && (
                <div className="rounded-lg border bg-background shadow-xl px-3 py-2.5 text-sm font-medium opacity-90">
                  {BLOCK_ICONS[activeBlock.block_type]} {BLOCK_TYPES.find(t => t.type === activeBlock.block_type)?.label}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}

function SortableBlockItem({ block, isSelected, onSelect, onToggleVisible, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const label = BLOCK_TYPES.find(t => t.type === block.block_type)?.label ?? block.block_type
  const preview = getBlockPreview(block)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 border-b px-3 py-3 cursor-pointer transition-colors last:border-0',
        isSelected ? 'bg-accent' : 'hover:bg-muted/50',
        isDragging  ? 'opacity-50' : '',
        !block.visible && 'opacity-50'
      )}
      onClick={onSelect}
    >
      <button
        className="shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
        {...attributes} {...listeners}
        onClick={e => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="text-base leading-none shrink-0">{BLOCK_ICONS[block.block_type]}</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-none">{label}</p>
        {preview && <p className="text-xs text-muted-foreground mt-0.5 truncate">{preview}</p>}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <button
          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          onClick={onToggleVisible}
          title={block.visible ? 'Hide section' : 'Show section'}
        >
          {block.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {label} section?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function getBlockPreview(block) {
  const c = block.content_json
  if (!c) return null
  return c.heading ?? c.title ?? c.content?.replace(/<[^>]*>/g, '').slice(0, 40) ?? null
}
