'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        },
        classNames: {
          success: 'border-l-2 !border-l-primary',
          error: 'border-l-2 !border-l-destructive',
        },
      }}
    />
  )
}
