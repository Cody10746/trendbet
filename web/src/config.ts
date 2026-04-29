import { http, createConfig } from 'wagmi';
import { baseSepolia, hardhat } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [hardhat, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'TrendBet',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});
