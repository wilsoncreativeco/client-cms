import { supabase } from '@/lib/supabase'

export const contentService = {
  async getBlocks(pageId) {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data
  },

  async createBlock(clientId, pageId, block_type, sort_order = 0) {
    const defaults = defaultContent(block_type)
    const { data, error } = await supabase
      .from('content_blocks')
      .insert({ client_id: clientId, page_id: pageId, block_type, sort_order, content_json: defaults })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateBlock(id, updates) {
    const { data, error } = await supabase
      .from('content_blocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async toggleVisible(id, visible) {
    return this.updateBlock(id, { visible })
  },

  async deleteBlock(id) {
    const { error } = await supabase.from('content_blocks').delete().eq('id', id)
    if (error) throw error
  },

  async reorderBlocks(blocks) {
    const updates = blocks.map((b, i) => ({ id: b.id, sort_order: i, client_id: b.client_id, page_id: b.page_id, block_type: b.block_type }))
    const { error } = await supabase.from('content_blocks').upsert(updates, { onConflict: 'id' })
    if (error) throw error
  },
}

function defaultContent(type) {
  const defaults = {
    hero: {
      heading: 'Welcome to our site',
      subheading: 'We do great things for great people.',
      cta_text: 'Get in touch',
      cta_link: '/contact',
      background_image: '',
    },
    about: {
      heading: 'About Us',
      body: '<p>Tell your story here.</p>',
      image: '',
    },
    services: {
      heading: 'Our Services',
      subheading: '',
      items: [
        { id: crypto.randomUUID(), title: 'Service One', description: 'Description of this service.', icon: 'star' },
      ],
    },
    gallery: {
      heading: 'Gallery',
      images: [],
    },
    testimonials: {
      heading: 'What clients say',
      items: [
        { id: crypto.randomUUID(), name: 'Jane Smith', role: 'CEO, Acme Corp', text: 'Amazing work!', avatar: '' },
      ],
    },
    faq: {
      heading: 'Frequently Asked Questions',
      items: [
        { id: crypto.randomUUID(), question: 'What services do you offer?', answer: 'We offer a wide range of services.' },
      ],
    },
    cta: {
      heading: 'Ready to get started?',
      subheading: "Let's work together on something great.",
      button_text: 'Contact us',
      button_link: '/contact',
    },
    contact: {
      heading: 'Get in touch',
      email: '',
      phone: '',
      address: '',
      show_form: true,
    },
    richtext: {
      content: '<p>Start writing here...</p>',
    },
  }
  return defaults[type] ?? {}
}
