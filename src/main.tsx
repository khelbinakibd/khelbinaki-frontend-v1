import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import router from './Router/Router'
import { Toaster } from 'sonner'
import { QueryProvider } from './Provider/QueryProvider'
import ErrorBoundary from './Components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <Toaster 
       position="bottom-right"
        richColors 
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "8px",
            fontWeight: 500,
          },
        }}
        />
        <RouterProvider router={router} />
      </QueryProvider>
    </ErrorBoundary>
  </StrictMode>,
)
