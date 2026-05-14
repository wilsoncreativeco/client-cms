import { useState, useEffect, useCallback } from 'react'
import { getPageContent, getClientPages } from './api.js'

/**
 * Hook to fetch and subscribe to a page's content.
 *
 * @param {string} clientSlug  - Your client's slug from Agency CMS
 * @param {string} pageSlug    - The page slug, e.g. "home"
 *
 * Usage in your Vite+React site:
 *   const { page, blocks, loading, error } = usePageContent('acme-co', 'home')
 */
export function usePageContent(clientSlug, pageSlug) {
  const [page,    setPage]    = useState(null)
  const [blocks,  setBlocks]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    if (!clientSlug || !pageSlug) return
    setLoading(true)
    setError(null)
    try {
      const result = await getPageContent(clientSlug, pageSlug)
      setPage(result.page)
      setBlocks(result.blocks ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [clientSlug, pageSlug])

  useEffect(() => { load() }, [load])

  return { page, blocks, loading, error, reload: load }
}

/**
 * Hook to fetch all published pages for a client (nav building).
 *
 * Usage:
 *   const { pages, loading } = useClientPages('acme-co')
 */
export function useClientPages(clientSlug) {
  const [pages,   setPages]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!clientSlug) return
    getClientPages(clientSlug)
      .then(result => setPages(result.pages ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [clientSlug])

  return { pages, loading, error }
}
