import { createClient } from '@supabase/supabase-js'

let _client = null

/**
 * Call once in your app root, before using any hooks.
 * @param {string} supabaseUrl   - VITE_SUPABASE_URL
 * @param {string} supabaseKey   - VITE_SUPABASE_ANON_KEY (public key, safe to expose)
 */
export function initCMS(supabaseUrl, supabaseKey) {
  _client = createClient(supabaseUrl, supabaseKey)
}

function getClient() {
  if (!_client) throw new Error('[AgencyCMS] Call initCMS() before using cms hooks.')
  return _client
}

/**
 * Fetch a published page and all its visible content blocks.
 * Uses the public RPC function — no auth required.
 *
 * @param {string} clientSlug  - The client's unique slug (set in Agency CMS admin)
 * @param {string} pageSlug    - The page slug, e.g. "home", "about"
 * @returns {{ page, blocks } | { error: string }}
 */
export async function getPageContent(clientSlug, pageSlug) {
  const { data, error } = await getClient().rpc('get_page_content', {
    p_client_slug: clientSlug,
    p_page_slug:   pageSlug,
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

/**
 * Fetch all published pages for a client (useful for nav generation).
 * @param {string} clientSlug
 * @returns {{ pages: Array }}
 */
export async function getClientPages(clientSlug) {
  const { data, error } = await getClient().rpc('get_client_pages', {
    p_client_slug: clientSlug,
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

/**
 * Subscribe to realtime content changes for a client.
 * Calls onChange whenever any block for clientSlug is inserted/updated/deleted.
 * @returns {Function} unsubscribe
 */
export function subscribeToContent(clientSlug, clientId, onChange) {
  const channel = getClient()
    .channel(`content-${clientId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'content_blocks',
      filter: `client_id=eq.${clientId}`,
    }, onChange)
    .subscribe()

  return () => getClient().removeChannel(channel)
}
