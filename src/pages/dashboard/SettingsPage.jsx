// Phase 2 settings — profile + account
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { authService } from '@/services/auth.service'
import { useToast } from '@/components/ui/toast-provider'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth()
  const { toast } = useToast()

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({
    defaultValues: {
      full_name: profile?.full_name ?? '',
    },
  })

  const onSubmit = async (values) => {
    try {
      await authService.updateProfile(profile.id, { full_name: values.full_name })
      await refreshProfile()
      toast({ title: 'Profile updated', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...register('full_name', { required: 'Name is required.' })} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email ?? ''} disabled className="bg-muted" />
            </div>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
