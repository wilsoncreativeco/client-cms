import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Globe, Clock, Loader2, Eye, Zap } from 'lucide-react'
import { pageService }        from '@/services/page.service'
import { useContentBlocks }   from '@/hooks/useContentBlocks'
import { useClient }          from '@/hooks/useClient'
import { useToast }           from '@/components/ui/toast-provider'
import { BlockList }          from '@/components/editor/BlockList'
import { BlockEditor }        from '@/components/editor/BlockEditor'
import { SeoPanel }           from '@/components/editor/SeoPanel'
import { Button }             from '@/components/ui/button'
import { Badge }              from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export default function PageEditorPage() {
  const { pageId }    = useParams()
  const navigate      = useNavigate()
  const { toast }     = useToast()
  const { clientId, client } = useClient()

  const [page,        setPage]        = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [publishing,  setPublishing]  = useState(false)
  const [selectedBlock, setSelectedBlock] = useState(null)

  const { blocks, setBlocks, loading: blocksLoading } = useContentBlocks(pageId)

  useEffect(() => {
    if (!pageId) return
    pageService.get(pageId)
      .then(p => { setPage(p); setPageLoading(false) })
      .catch(() => { navigate('/dashboard/pages'); })
  }, [pageId])

  // Keep selected block in sync when blocks update (e.g. after toggle visible)
  useEffect(() => {
    if (selectedBlock) {
      const updated = blocks.find(b => b.id === selectedBlock.id)
      if (updated) setSelectedBlock(updated)
    }
  }, [blocks])

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const updated = page.status === 'published'
        ? await pageService.unpublish(pageId)
        : await pageService.publish(pageId)
      setPage(updated)
      toast({
        title: updated.status === 'published' ? '🟢 Page published' : 'Page unpublished',
        variant: 'success',
      })
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setPublishing(false)
    }
  }

  const previewUrl = client
    ? client.custom_domain
      ? `https://${client.custom_domain}/${page?.slug}`
      : `/${page?.slug}`
    : null

  if (pageLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-6 lg:-m-8">
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 lg:px-6">
        <Link to="/dashboard/pages">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <h1 className="text-sm font-semibold truncate">{page?.name}</h1>
          <Badge variant={page?.status === 'published' ? 'success' : 'secondary'} className="text-[10px] shrink-0">
            {page?.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {previewUrl && (
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" asChild>
              <a href={previewUrl} target="_blank" rel="noreferrer">
                <Eye className="h-3.5 w-3.5" /> Preview
              </a>
            </Button>
          )}
          <Button
            size="sm"
            className={cn('h-8 gap-1.5 text-xs', page?.status === 'published' ? 'bg-emerald-600 hover:bg-emerald-700' : '')}
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : page?.status === 'published'
                ? <><Globe className="h-3.5 w-3.5" /> Published</>
                : <><Zap   className="h-3.5 w-3.5" /> Publish</>
            }
          </Button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: block list */}
        <div className="w-56 shrink-0 border-r flex flex-col overflow-hidden">
          <Tabs defaultValue="sections" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="mx-3 mt-3 mb-0 h-8 text-xs">
              <TabsTrigger value="sections" className="text-xs flex-1">Sections</TabsTrigger>
              <TabsTrigger value="seo"      className="text-xs flex-1">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              {blocksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <BlockList
                  blocks={blocks}
                  setBlocks={setBlocks}
                  clientId={clientId}
                  pageId={pageId}
                  selectedId={selectedBlock?.id}
                  onSelect={setSelectedBlock}
                />
              )}
            </TabsContent>

            <TabsContent value="seo" className="flex-1 overflow-y-auto mt-0">
              <SeoPanel page={page} onUpdated={setPage} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: block editor */}
        <div className="flex-1 overflow-hidden bg-muted/20">
          <BlockEditor
            block={selectedBlock}
            onUpdated={(updated) => {
              setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b))
              setSelectedBlock(updated)
            }}
          />
        </div>
      </div>
    </div>
  )
}
