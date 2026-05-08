import { http, createConfig } from 'wagmi';
import { baseSepolia, hardhat } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia, hardhat],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'TrendBet',
      preference: 'all',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});
