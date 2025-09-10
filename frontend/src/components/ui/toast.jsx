import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(({ title, message, variant = 'default', duration = 3000 }) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, title, message, variant }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-md border px-4 py-3 shadow-lg bg-card text-foreground ${t.variant === 'error' ? 'border-destructive/50' : 'border-border'}`}>
            {t.title && <div className="font-medium mb-1">{t.title}</div>}
            {t.message && <div className="text-sm text-muted-foreground">{t.message}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}


