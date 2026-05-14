import { supabase } from '@/lib/supabase'

export const userService = {
  async listForClient(clientId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async listAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, clients(business_name, slug)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async invite({ email, full_name, role, client_id }) {
    // Calls the Supabase Edge Function which uses service role key
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, full_name, role, client_id }),
      }
    )
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Invite failed')
    return json
  },

  async remove(userId) {
    // Remove profile first (cascade handles auth.users FK)
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (error) throw error
  },
}
