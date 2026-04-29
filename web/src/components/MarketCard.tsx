import { formatEther } from 'viem';
import { Clock, Users } from 'lucide-react';

interface Market {
  question: string;
  optionA: string;
  optionB: string;
  deadline: bigint;
  totalPool: bigint;
  totalA: bigint;
  totalB: bigint;
  resolved: boolean;
  winningOption: number;
}

interface MarketCardProps {
  id: bigint;
  market: Market;
  onClick: () => void;
}

export default function MarketCard({ market, onClick }: MarketCardProps) {
  const timeLeft = Number(market.deadline) - Math.floor(Date.now() / 1000);
  const hoursLeft = Math.max(0, Math.floor(timeLeft / 3600));
  
  const getCategory = (q: string) => {
    if (!q) return 'trends';
    if (q.includes('$') || q.includes('ETH')) return 'crypto';
    if (q.includes('Arsenal') || q.includes('Chelsea')) return 'football';
    return 'trends';
  };

  const category = getCategory(market?.question);

  return (
    <div className="market-card" onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className={`badge badge-${category}`}>{category}</span>
        <div className="market-meta">
          <Clock size={14} style={{ marginRight: 4 }} />
          {hoursLeft > 0 ? `${hoursLeft}h left` : 'Ending soon'}
        </div>
      </div>
      
      <h3 className="market-question">{market?.question || 'Unknown Question'}</h3>
      
      <div className="market-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={14} />
          Pool: {formatEther(market?.totalPool || 0n)} ETH
        </div>
        <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
          {market?.optionA || 'Yes'} / {market?.optionB || 'No'}
        </div>
      </div>
    </div>
  );
}
