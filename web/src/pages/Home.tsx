import { useReadContract, useReadContracts } from 'wagmi';
import { TRENDBET_ADDRESS, TRENDBET_ABI } from '../constants';
import { useState, useMemo } from 'react';
import MarketCard from '../components/MarketCard';
import MarketDetail from './MarketDetail';
import { parseEther } from 'viem';

export default function Home() {
  const [selectedMarketId, setSelectedMarketId] = useState<bigint | null>(null);

  const { data: marketCount, error: countError, isLoading: isCountLoading } = useReadContract({
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

  const mockMarkets = [
    {
      id: 1n,
      market: {
        question: "Will ETH hit $5,000 this week?",
        optionA: "Yes",
        optionB: "No",
        deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 3),
        totalPool: parseEther('1.5'),
        totalA: parseEther('1.0'),
        totalB: parseEther('0.5'),
        resolved: false,
        winningOption: 0
      }
    },
    {
      id: 2n,
      market: {
        question: "Will Arsenal win against Chelsea?",
        optionA: "Arsenal",
        optionB: "Chelsea",
        deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 1),
        totalPool: parseEther('2.2'),
        totalA: parseEther('1.5'),
        totalB: parseEther('0.7'),
        resolved: false,
        winningOption: 0
      }
    }
  ];

  const displayMarkets = useMemo(() => {
    if (marketsData && marketsData.length > 0) {
      const successfulMarkets = marketsData
        .map((res, i) => ({ id: BigInt(i + 1), market: res.result }))
        .filter(m => m.market);
      
      if (successfulMarkets.length > 0) return successfulMarkets;
    }
    return mockMarkets;
  }, [marketsData]);

  if ((isCountLoading || isMarketsLoading) && !marketsData && !countError) {
    return <div className="container">Loading markets...</div>;
  }

  if (selectedMarketId !== null) {
    const marketObj = displayMarkets.find(m => m.id === selectedMarketId);
    if (!marketObj || !marketObj.market) return <div>Market not found</div>;
    return (
      <MarketDetail 
        id={selectedMarketId} 
        market={marketObj.market as any} 
        onBack={() => setSelectedMarketId(null)} 
      />
    );
  }

  return (
    <div className="market-grid animate-fade-in">
      {displayMarkets.map((item, index) => {
        if (!item.market) return null;
        return (
          <MarketCard
            key={index}
            id={item.id}
            market={item.market as any}
            onClick={() => setSelectedMarketId(item.id)}
          />
        );
      })}
    </div>
  );
}
