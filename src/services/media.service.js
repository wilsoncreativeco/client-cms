import { supabase } from '@/lib/supabase'

export const mediaService = {
  async list(clientId) {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async upload(clientId, file, uploadedBy) {
    const ext  = file.name.split('.').pop()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `${clientId}/${name}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)

    // For private buckets use signed URLs — getPublicUrl still works but requires storage to be
    // set to public. For truly private buckets, swap to createSignedUrl below:
    // const { data: urlData } = await supabase.storage.from('media').createSignedUrl(path, 3600)

    const { data, error } = await supabase
      .from('media')
      .insert({
        client_id:    clientId,
        file_url:     publicUrl,
        file_name:    file.name,
        file_size:    file.size,
        mime_type:    file.type,
        storage_path: path,
        uploaded_by:  uploadedBy,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id, storagePath) {
    const { error: storageError } = await supabase.storage.from('media').remove([storagePath])
    if (storageError) throw storageError

    const { error } = await supabase.from('media').delete().eq('id', id)
    if (error) throw error
  },

  async getSignedUrl(storagePath, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from('media')
      .createSignedUrl(storagePath, expiresIn)
    if (error) throw error
    return data.signedUrl
  },
}
