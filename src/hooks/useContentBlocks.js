import { useEffect, useState, useCallback } from 'react'
import { contentService } from '@/services/content.service'

export function useContentBlocks(pageId) {
  const [blocks,  setBlocks]  = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    if (!pageId) return
    setLoading(true)
    setError(null)
    try {
      setBlocks(await contentService.getBlocks(pageId))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [pageId])

  useEffect(() => { load() }, [load])

  return { blocks, setBlocks, loading, error, reload: load }
}
