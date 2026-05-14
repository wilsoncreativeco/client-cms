import { supabase } from '@/lib/supabase'

export const clientService = {
  async list() {
    const { data, error } = await supabase
      .from('clients')
      .select('*, profiles(count)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async get(id) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create({ business_name, slug, custom_domain, plan = 'starter' }) {
    const { data, error } = await supabase
      .from('clients')
      .insert({ business_name, slug, custom_domain: custom_domain || null, plan })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async toggleActive(id, is_active) {
    return this.update(id, { is_active })
  },

  async getStats(clientId) {
    const [pages, media, users] = await Promise.all([
      supabase.from('pages').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
      supabase.from('media').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
    ])
    return {
      pages: pages.count ?? 0,
      media: media.count ?? 0,
      users: users.count ?? 0,
    }
  },
}
