import { useAccount, useReadContract, useReadContracts, useWriteContract } from 'wagmi';
import { TRENDBET_ADDRESS, TRENDBET_ABI } from '../constants';
import { formatEther } from 'viem';
import { Trophy, Clock, AlertCircle } from 'lucide-react';

export default function MyBets() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  const { data: marketCount } = useReadContract({
    address: TRENDBET_ADDRESS,
    abi: TRENDBET_ABI,
    functionName: 'marketCount',
  });

  const marketIds = Array.from({ length: Number(marketCount || 0) }, (_, i) => BigInt(i + 1));

  // Get market details
  const { data: marketsData } = useReadContracts({
    contracts: marketIds.map((id) => ({
      address: TRENDBET_ADDRESS,
      abi: TRENDBET_ABI,
      functionName: 'markets',
      args: [id],
    })),
  });

  // Get user stakes for each option in each market
  const { data: userStakesData, isLoading } = useReadContracts({
    contracts: marketIds.flatMap((id) => [
      {
        address: TRENDBET_ADDRESS,
        abi: TRENDBET_ABI,
        functionName: 'userStakes',
        args: [id, address!, 1],
      },
      {
        address: TRENDBET_ADDRESS,
        abi: TRENDBET_ABI,
        functionName: 'userStakes',
        args: [id, address!, 2],
      }
    ]),
    query: { enabled: !!address }
  });

  // Get claimed status
  const { data: claimedData } = useReadContracts({
    contracts: marketIds.map((id) => ({
      address: TRENDBET_ADDRESS,
      abi: TRENDBET_ABI,
      functionName: 'hasClaimed',
      args: [id, address!],
    })),
    query: { enabled: !!address }
  });

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
        <AlertCircle size={48} style={{ marginBottom: 16 }} />
        <p>Please connect your wallet to see your bets.</p>
      </div>
    );
  }

  if (isLoading) return <div>Loading your bets...</div>;

  const userBets = marketIds.map((id, index) => {
    const market = marketsData?.[index]?.result as any;
    const stakeA = userStakesData?.[index * 2]?.result as bigint || 0n;
    const stakeB = userStakesData?.[index * 2 + 1]?.result as bigint || 0n;
    const hasClaimed = Boolean(claimedData?.[index]?.result);

    if (stakeA === 0n && stakeB === 0n) return null;

    const chosenOption = stakeA > 0n ? 1 : 2;
    const stakeAmount = chosenOption === 1 ? stakeA : stakeB;
    const isWinner = market?.resolved && market.winningOption === chosenOption;

    return {
      id,
      market,
      chosenOption,
      stakeAmount,
      isWinner,
      hasClaimed
    };
  }).filter(Boolean);

  if (userBets.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
        <Clock size={48} style={{ marginBottom: 16 }} />
        <p>You haven't placed any bets yet.</p>
      </div>
    );
  }

  return (
    <div className="market-grid animate-fade-in">
      {userBets.map((bet: any, index) => (
        <div key={index} className="market-card" style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="badge badge-trends">Market #{bet.id.toString()}</span>
            {bet.market.resolved ? (
              <span style={{ color: bet.isWinner ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                {bet.isWinner ? 'WON' : 'LOST'}
              </span>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>Pending...</span>
            )}
          </div>
          
          <h3 className="market-question" style={{ fontSize: 16 }}>{bet.market.question}</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div style={{ fontSize: 14 }}>
              Your bet: <strong>{bet.stakeAmount ? formatEther(bet.stakeAmount) : '0'} ETH</strong> on {bet.chosenOption === 1 ? bet.market.optionA : bet.market.optionB}
            </div>
            
            {bet.isWinner && !bet.hasClaimed && (
              <button 
                className="btn btn-primary" 
                style={{ padding: '6px 16px', fontSize: 14 }}
                onClick={() => writeContract({
                  address: TRENDBET_ADDRESS,
                  abi: TRENDBET_ABI,
                  functionName: 'claimWinnings',
                  args: [bet.id],
                })}
              >
                <Trophy size={14} /> Claim
              </button>
            )}
            {bet.hasClaimed && <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Claimed</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
