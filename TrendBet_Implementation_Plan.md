# TrendBet — Implementation Plan
> Predict & Earn · Built as a Mini App on Base

---

## What It Is

A lightweight prediction market mini app where users pick outcomes, stake a small amount of ETH (or USDC), and winners split the pool. Simple, social, fun.

---

## Core User Flow

```
Browse open markets → Pick a side → Stake → Wait for result → Claim winnings
```

That's it. No complex UI, no dashboards, no order books.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Chain | Base (mainnet or testnet) | Low fees, fast, mini app native |
| Smart Contract | Solidity (single contract) | Handles staking + payouts |
| Frontend | React + Wagmi + Viem | Standard Base mini app stack |
| Wallet | Coinbase Smart Wallet | Native to Base app |
| Data | On-chain + simple JSON config | No backend needed |

---

## Smart Contract (The Core)

One contract does everything. Keep it minimal.

```
TrendBet.sol
├── createMarket(question, optionA, optionB, deadline)
├── stake(marketId, option)   ← payable, min 0.001 ETH
├── resolveMarket(marketId, winningOption)   ← admin only
└── claimWinnings(marketId)   ← winners call this
```

**Pool logic:** All stakes go into the market pool. After resolution, winners split the pool proportional to their stake. A small protocol fee (e.g. 2%) is taken before distribution.

**Who resolves?** Start with a trusted admin wallet (you). Upgrade to an oracle later if needed.

---

## Frontend Screens

Only 3 screens needed:

### 1. Home — Open Markets
- List of active prediction cards
- Each card shows: question, options, total pool size, time left
- Tap a card to open it

### 2. Market Detail
- Question + two option buttons (e.g. "BTC above $100k?" → YES / NO)
- Stake input (preset amounts: 0.001 / 0.005 / 0.01 ETH)
- Current pool breakdown (% on each side)
- "Confirm Stake" button → triggers wallet tx

### 3. My Bets
- Active bets (pending resolution)
- Won bets with "Claim" button
- Past results

---

## Market Categories (MVP)

Start with 3 simple categories, manually curated:

- **Crypto** — "Will ETH hit $5k this week?"
- **Football** — "Will Arsenal win this weekend?"
- **Trends** — "Will X topic trend on Twitter today?"

Markets are created by the admin. Users just bet.

---

## Resolution (Simple Approach for MVP)

| Step | Action |
|---|---|
| Admin monitors | Watch the real-world outcome |
| Call `resolveMarket()` | Set winner on-chain |
| Winners notified | Frontend shows "You won! Claim now" |
| Winners call `claimWinnings()` | ETH sent to wallet |

No oracle needed for MVP — manual resolution is fine to start.

---

## Build Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Write and test `TrendBet.sol` on Base Sepolia testnet
- [ ] Deploy contract, verify on Basescan
- [ ] Scaffold React mini app with Wagmi + Coinbase Wallet connector

### Phase 2 — Core UI (Week 3)
- [ ] Build Home screen (market cards)
- [ ] Build Market Detail screen with stake flow
- [ ] Connect UI to contract (`stake`, `claimWinnings`)

### Phase 3 — Polish & Launch (Week 4)
- [ ] Add My Bets screen
- [ ] Create 3–5 real markets on testnet
- [ ] Test full flow end-to-end
- [ ] Deploy to Base mainnet
- [ ] Submit as Base mini app

---

## What's Out of Scope (MVP)

To stay simple, skip these for now:

- ❌ Decentralized oracles (Chainlink, UMA)
- ❌ Token rewards or points system
- ❌ Social features (comments, sharing)
- ❌ Multiple currencies (just ETH for MVP)
- ❌ User-created markets
- ❌ Automated market resolution

---

## Rough Estimates

| Item | Estimate |
|---|---|
| Contract development + testing | 3–4 days |
| Frontend (3 screens) | 4–5 days |
| Integration + testing | 2–3 days |
| **Total** | **~2 weeks solo** |

---

## Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Admin resolves wrong outcome | Add a 24h dispute window before funds unlock |
| Low liquidity on a market | Set minimum pool size before staking opens |
| Gas costs eat small stakes | Base fees are very low (~$0.01), safe for small bets |
| Contract bug / lost funds | Audit contract, start with low stake limits |

---

## Next Steps

1. Set up a Base Sepolia testnet wallet and get test ETH
2. Write `TrendBet.sol` and deploy to testnet
3. Scaffold the mini app repo with Wagmi
4. Build the market card UI and wire up the stake flow
5. Test with 3 friends before mainnet

---

*Keep it simple. Ship fast. Add complexity only when users ask for it.*
