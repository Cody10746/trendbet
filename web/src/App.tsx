import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config';
import { useState, useEffect } from 'react';
import { TrendingUp, Wallet, Trophy, Clock, Search } from 'lucide-react';
import './index.css';

// Pages
import Home from './pages/Home';
import MyBets from './pages/MyBets';

const queryClient = new QueryClient();

function MainContent() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [activeTab, setActiveTab] = useState<'home' | 'my-bets'>('home');

  const handleConnect = () => {
    const connector = connectors.find((c) => c.id === 'coinbaseWalletSDK') || connectors[0];
    if (connector) connect({ connector });
  };

  return (
    <div className="container">
      <header>
        <div className="logo">
          <TrendingUp size={28} />
          TrendBet
        </div>
        {!isConnected ? (
          <button className="btn btn-primary" onClick={handleConnect}>
            <Wallet size={18} />
            Connect Wallet
          </button>
        ) : (
          <button className="btn btn-outline" onClick={() => disconnect()}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </button>
        )}
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
        <MainContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
