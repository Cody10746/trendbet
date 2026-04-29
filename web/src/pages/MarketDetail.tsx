import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { TRENDBET_ADDRESS, TRENDBET_ABI } from '../constants';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

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

interface MarketDetailProps {
  id: bigint;
  market: Market;
  onBack: () => void;
}

export default function MarketDetail({ id, market, onBack }: MarketDetailProps) {
  const [selectedOption, setSelectedOption] = useState<1 | 2>(1);
  const [stakeAmount, setStakeAmount] = useState('0.01');
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleStake = () => {
    writeContract({
      address: TRENDBET_ADDRESS,
      abi: TRENDBET_ABI,
      functionName: 'stake',
      args: [id, selectedOption],
      value: parseEther(stakeAmount),
    });
  };

  const totalA = Number(formatEther(market.totalA));
  const totalB = Number(formatEther(market.totalB));
  const total = totalA + totalB || 1;
  const percentA = Math.round((totalA / total) * 100);
  const percentB = 100 - percentA;

  if (isSuccess) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
        <CheckCircle2 size={64} color="var(--accent-green)" style={{ marginBottom: 20 }} />
        <h2>Stake Confirmed!</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 10, marginBottom: 30 }}>
          You staked {stakeAmount} ETH on {selectedOption === 1 ? market.optionA : market.optionB}
        </p>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onBack}>
          Back to Markets
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button 
        onClick={onBack} 
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', marginBottom: 20 }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: 24, marginBottom: 20 }}>{market.question}</h1>

      <div style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
          <span>{market.optionA} ({percentA}%)</span>
          <span>{market.optionB} ({percentB}%)</span>
        </div>
        <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${percentA}%`, background: 'var(--primary)', height: '100%' }}></div>
          <div style={{ width: `${percentB}%`, background: 'var(--accent-red)', height: '100%' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button 
          className={`btn ${selectedOption === 1 ? 'btn-primary' : 'btn-outline'}`} 
          style={{ flex: 1, height: 50 }}
          onClick={() => setSelectedOption(1)}
        >
          {market.optionA}
        </button>
        <button 
          className={`btn ${selectedOption === 2 ? 'btn-primary' : 'btn-outline'}`} 
          style={{ flex: 1, height: 50, borderColor: selectedOption === 2 ? 'var(--primary)' : 'var(--border)' }}
          onClick={() => setSelectedOption(2)}
        >
          {market.optionB}
        </button>
      </div>

      <h3 style={{ marginBottom: 12, fontSize: 16 }}>Select Amount (ETH)</h3>
      <div className="stake-options" style={{ marginBottom: 30 }}>
        {['0.001', '0.01', '0.05', '0.1'].map((amt) => (
          <div 
            key={amt} 
            className={`stake-btn ${stakeAmount === amt ? 'active' : ''}`}
            onClick={() => setStakeAmount(amt)}
          >
            {amt}
          </div>
        ))}
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', height: 56, fontSize: 18 }}
        onClick={handleStake}
        disabled={isPending || isConfirming}
      >
        {(isPending || isConfirming) ? <Loader2 className="animate-spin" /> : 'Confirm Stake'}
      </button>
      
      {error && <p style={{ color: 'var(--accent-red)', marginTop: 12, textAlign: 'center', fontSize: 14 }}>{error.message.split('\n')[0]}</p>}
    </div>
  );
}
