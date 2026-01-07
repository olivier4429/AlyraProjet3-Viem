import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import CustomRainbowKitProvider from './providers/providers.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomRainbowKitProvider><App /></CustomRainbowKitProvider>
  </StrictMode>,
)
