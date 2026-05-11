import { useReadContract, useReadContracts, useWriteContract } from 'wagmi';
import { TRENDBET_ADDRESS, TRENDBET_ABI } from '../constants';
import { useState, useMemo } from 'react';
import { formatEther } from 'viem';
import { PlusCircle, CheckCircle2, Wallet, AlertCircle } from 'lucide-react';

export default function Admin() {
  const { writeContract } = useWriteContract();
  
  // Form state
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [deadline, setDeadline] = useState('');

  // Fetch contract data
  const { data: totalFees } = useReadContract({
    address: TRENDBET_ADDRESS,
    abi: TRENDBET_ABI,
    functionName: 'totalProtocolFees',
  });

  const { data: marketCount } = useReadContract({
    address: TRENDBET_ADDRESS,
    abi: TRENDBET_ABI,
    functionName: 'marketCount',
  });

  const marketIds = useMemo(() => {
    try {
      return Array.from({ length: Number(marketCount || 0n) }, (_, i) => BigInt(i + 1));
    } catch (e) {
      return [];
    }
  }, [marketCount]);

  const { data: marketsData, isLoading: isMarketsLoading } = useReadContracts({
    contracts: marketIds.map((id) => ({
      address: TRENDBET_ADDRESS,
      abi: TRENDBET_ABI,
      functionName: 'markets',
      args: [id],
    })),
  });

  const handleCreateMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !optionA || !optionB || !deadline) return;

    const deadlineTimestamp = BigInt(Math.floor(new Date(deadline).getTime() / 1000));

    writeContract({
      address: TRENDBET_ADDRESS,
      abi: TRENDBET_ABI,
      functionName: 'createMarket',
      args: [question, optionA, optionB, deadlineTimestamp],
    });
  };

  const handleResolveMarket = (id: bigint, winningOption: number) => {
    writeContract({
      address: TRENDBET_ADDRESS,
      abi: TRENDBET_ABI,
      functionName: 'resolveMarket',
      args: [id, winningOption],
    });
  };

  const handleWithdrawFees = () => {
    writeContract({
      address: TRENDBET_ADDRESS,
      abi: TRENDBET_ABI,
      functionName: 'withdrawFees',
    });
  };

  const pendingResolutionMarkets = useMemo(() => {
    if (!marketsData) return [];
    const now = BigInt(Math.floor(Date.now() / 1000));
    return marketsData
      .map((res, i) => ({ id: BigInt(i + 1), market: res.result as any }))
      .filter(item => item.market && !item.market.resolved && now >= item.market.deadline);
  }, [marketsData]);

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-grid">
        {/* Market Creation Section */}
        <section className="admin-card">
          <div className="card-header">
            <PlusCircle className="text-trends" />
            <h2>Create New Market</h2>
          </div>
          <form onSubmit={handleCreateMarket} className="admin-form">
            <div className="form-group">
              <label>Question</label>
              <input 
                type="text" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                placeholder="e.g. Will ETH hit $5000?"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Option A</label>
                <input 
                  type="text" 
                  value={optionA} 
                  onChange={(e) => setOptionA(e.target.value)} 
                  placeholder="Yes"
                  required
                />
              </div>
              <div className="form-group">
                <label>Option B</label>
                <input 
                  type="text" 
                  value={optionB} 
                  onChange={(e) => setOptionB(e.target.value)} 
                  placeholder="No"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input 
                type="datetime-local" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)} 
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">Create Market</button>
          </form>
        </section>

        {/* Protocol Fees Section */}
        <section className="admin-card">
          <div className="card-header">
            <Wallet className="text-trends" />
            <h2>Protocol Management</h2>
          </div>
          <div className="fee-display">
            <div className="fee-label">Accumulated Fees</div>
            <div className="fee-value">{totalFees ? formatEther(totalFees as bigint) : '0'} ETH</div>
          </div>
          <button 
            onClick={handleWithdrawFees} 
            className="btn btn-outline w-full"
            disabled={!totalFees || totalFees === 0n}
          >
            Withdraw Fees
          </button>
        </section>
      </div>

      {/* Resolution Section */}
      <section className="admin-card mt-6">
        <div className="card-header">
          <CheckCircle2 className="text-trends" />
          <h2>Pending Resolutions</h2>
        </div>
        
        {isMarketsLoading ? (
          <p>Loading markets...</p>
        ) : pendingResolutionMarkets.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={32} />
            <p>No markets pending resolution.</p>
          </div>
        ) : (
          <div className="resolution-list">
            {pendingResolutionMarkets.map(({ id, market }) => (
              <div key={id.toString()} className="resolution-item">
                <div className="resolution-info">
                  <span className="badge">Market #{id.toString()}</span>
                  <h3>{market.question}</h3>
                </div>
                <div className="resolution-actions">
                  <button 
                    onClick={() => handleResolveMarket(id, 1)} 
                    className="btn btn-sm btn-outline"
                  >
                    Resolve: {market.optionA}
                  </button>
                  <button 
                    onClick={() => handleResolveMarket(id, 2)} 
                    className="btn btn-sm btn-outline"
                  >
                    Resolve: {market.optionB}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
