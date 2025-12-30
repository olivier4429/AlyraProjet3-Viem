import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { hardhat, sepolia } from 'wagmi/chains'

export function getConfig() {
  return createConfig({
    chains: [hardhat, sepolia],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [hardhat.id]: http(),
      [sepolia.id]: http(),
    },
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
