import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './config/queryClient'
import { env } from './config/env'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store} >
      <GoogleOAuthProvider clientId={env.GOOGLE_CLIENT_ID} >
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)

