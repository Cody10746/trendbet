import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config';
import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';
import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
  WalletDropdownDisconnect 
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import '@coinbase/onchainkit/styles.css';
import './index.css';

// Pages
import Home from './pages/Home';
import MyBets from './pages/MyBets';

const queryClient = new QueryClient();

function MainContent() {
  const [activeTab, setActiveTab] = useState<'home' | 'my-bets'>('home');

  return (
    <div className="container">
      <header>
        <div className="logo">
          <TrendingUp size={28} />
          TrendBet
        </div>
        
        <Wallet>
          <ConnectWallet className="btn-wallet">
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>

      <nav className="tabs">
        <div 
          className={`tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Markets
        </div>
        <div 
          className={`tab ${activeTab === 'my-bets' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-bets')}
        >
          My Bets
        </div>
      </nav>

      {activeTab === 'home' ? <Home /> : <MyBets />}
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          chain={baseSepolia}
          apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY}
        >
          <MainContent />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
