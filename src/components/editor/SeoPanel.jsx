import { useEffect } from 'react'
import { useForm }   from 'react-hook-form'
import { Loader2 }   from 'lucide-react'
import { pageService } from '@/services/page.service'
import { useToast }    from '@/components/ui/toast-provider'
import { Button }      from '@/components/ui/button'
import { Input }       from '@/components/ui/input'
import { Label }       from '@/components/ui/label'
import { Textarea }    from '@/components/ui/textarea'
import { MediaPickerField } from '@/components/media/MediaPickerField'

export function SeoPanel({ page, onUpdated }) {
  const { toast } = useToast()
  const { register, handleSubmit, setValue, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: {
      seo_title:       page?.seo_title       ?? '',
      seo_description: page?.seo_description ?? '',
      seo_og_image:    page?.seo_og_image    ?? '',
      name:            page?.name            ?? '',
      slug:            page?.slug            ?? '',
    },
  })

  useEffect(() => {
    if (page) {
      setValue('seo_title',       page.seo_title       ?? '')
      setValue('seo_description', page.seo_description ?? '')
      setValue('seo_og_image',    page.seo_og_image    ?? '')
      setValue('name',            page.name            ?? '')
      setValue('slug',            page.slug            ?? '')
    }
  }, [page?.id])

  const onSubmit = async (values) => {
    try {
      const updated = await pageService.update(page.id, values)
      onUpdated(updated)
      toast({ title: 'SEO saved', variant: 'success' })
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      <div>
        <h3 className="text-sm font-semibold mb-4">Page details</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Page name</Label>
            <Input {...register('name')} placeholder="Home" />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">/</span>
              <Input {...register('slug')} placeholder="home" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold mb-4">SEO</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Meta title
              <span className="ml-1 text-xs text-muted-foreground">(50–60 chars recommended)</span>
            </Label>
            <Input {...register('seo_title')} placeholder="Page title — Site Name" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>
              Meta description
              <span className="ml-1 text-xs text-muted-foreground">(120–160 chars)</span>
            </Label>
            <Textarea {...register('seo_description')} placeholder="Brief description for search results" rows={3} maxLength={300} />
          </div>
          <div className="space-y-2">
            <Label>OG image <span className="text-xs text-muted-foreground">(Open Graph / social share)</span></Label>
            <MediaPickerField
              value={''}
              onChange={url => setValue('seo_og_image', url, { shouldDirty: true })}
            />
            {page?.seo_og_image && (
              <img src={page.seo_og_image} alt="OG preview" className="mt-2 h-24 w-full object-cover rounded-md border" />
            )}
          </div>
        </div>
      </div>

      <Button type="submit" size="sm" disabled={isSubmitting || !isDirty} className="w-full">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save SEO
      </Button>
    </form>
  )
}
