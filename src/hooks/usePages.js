import { useEffect, useState, useCallback } from 'react'
import { pageService } from '@/services/page.service'
import { useClient }   from './useClient'

export function usePages() {
  const { clientId } = useClient()
  const [pages,   setPages]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    setError(null)
    try {
      setPages(await pageService.list(clientId))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => { load() }, [load])

  return { pages, loading, error, reload: load, setPages }
}
