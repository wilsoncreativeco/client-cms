import { useEffect, useState, useCallback } from 'react'
import { mediaService } from '@/services/media.service'
import { useClient }    from './useClient'

export function useMedia() {
  const { clientId }  = useClient()
  const [media,   setMedia]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    setError(null)
    try {
      setMedia(await mediaService.list(clientId))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => { load() }, [load])

  return { media, setMedia, loading, error, reload: load }
}
