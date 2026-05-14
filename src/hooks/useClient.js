import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminStore } from '@/store/adminStore'
import { clientService } from '@/services/client.service'

/**
 * Returns the "active" client context.
 * - For regular client users: always their own client.
 * - For admins: the client they've selected via the client selector (or null for global view).
 */
export function useClient() {
  const { isAdmin, clientId: ownClientId, client: ownClient } = useAuth()
  const { activeClientId } = useAdminStore()

  const [adminClient, setAdminClient] = useState(null)
  const [loading, setLoading]         = useState(false)

  // Admins can switch to any client
  const effectiveClientId = isAdmin ? (activeClientId ?? null) : ownClientId
  const isOwnClient       = effectiveClientId === ownClientId

  useEffect(() => {
    if (!isAdmin || !activeClientId) {
      setAdminClient(null)
      return
    }
    // Already loaded and matches
    if (adminClient?.id === activeClientId) return

    setLoading(true)
    clientService.get(activeClientId)
      .then(setAdminClient)
      .catch(() => setAdminClient(null))
      .finally(() => setLoading(false))
  }, [isAdmin, activeClientId])

  const client = isAdmin ? adminClient : ownClient

  return {
    clientId: effectiveClientId,
    client,
    loading,
    isOwnClient,
  }
}
