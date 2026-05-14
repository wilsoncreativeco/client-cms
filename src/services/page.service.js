import { supabase } from '@/lib/supabase'

export const pageService = {
  async list(clientId) {
    const { data, error } = await supabase
      .from('pages')
      .select('*, content_blocks(count)')
      .eq('client_id', clientId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data
  },

  async get(pageId) {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single()
    if (error) throw error
    return data
  },

  async create(clientId, { name, slug, seo_title, seo_description }) {
    const { data, error } = await supabase
      .from('pages')
      .insert({ client_id: clientId, name, slug, seo_title, seo_description, status: 'draft' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(pageId, updates) {
    const { data, error } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', pageId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async publish(pageId) {
    return this.update(pageId, { status: 'published', published_at: new Date().toISOString() })
  },

  async unpublish(pageId) {
    return this.update(pageId, { status: 'draft', published_at: null })
  },

  async delete(pageId) {
    const { error } = await supabase.from('pages').delete().eq('id', pageId)
    if (error) throw error
  },

  async reorder(pages) {
    const updates = pages.map((p, i) => ({ id: p.id, sort_order: i }))
    const { error } = await supabase.from('pages').upsert(updates, { onConflict: 'id' })
    if (error) throw error
  },
}
