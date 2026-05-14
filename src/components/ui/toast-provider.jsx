import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = 'default', duration = 4000 }) => {
    const id = ++_id
    setToasts(prev => [...prev, { id, title, description, variant }])
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
    }
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ title, description, variant, onDismiss }) {
  const icon = {
    default:     <Info         className="h-4 w-4 text-foreground/60 shrink-0" />,
    success:     <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
    destructive: <AlertCircle  className="h-4 w-4 text-destructive shrink-0" />,
  }[variant] ?? null

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border bg-background/95 backdrop-blur-sm px-4 py-3.5 shadow-lg animate-fade-in',
        variant === 'destructive' && 'border-destructive/20 bg-destructive/5'
      )}
    >
      {icon}
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-medium">{title}</p>}
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
