'use client'
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CustomRainbowKitProvider from './providers' 

const queryClient = new QueryClient()
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CustomRainbowKitProvider>{children}</CustomRainbowKitProvider >
      </body>
    </html>
  );
}
