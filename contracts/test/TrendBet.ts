import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther, formatEther } from "viem";

describe("TrendBet", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [owner, user1, user2] = await viem.getWalletClients();

  async function deployContract() {
    const trendBet = await viem.deployContract("TrendBet");
    return { trendBet };
  }

  it("Should create a market correctly", async function () {
    const { trendBet } = await deployContract();
    const block = await publicClient.getBlock();
    const deadline = block.timestamp + 3600n;
    
    await trendBet.write.createMarket([
      "Will BTC hit 100k?",
      "Yes",
      "No",
      deadline
    ]);

    const market = await trendBet.read.markets([1n]);
    assert.equal(market[0], "Will BTC hit 100k?");
    assert.equal(market[1], "Yes");
    assert.equal(market[2], "No");
    assert.equal(market[3], deadline);
  });

  it("Should allow users to stake", async function () {
    const { trendBet } = await deployContract();
    const block = await publicClient.getBlock();
    const deadline = block.timestamp + 3600n;
    
    await trendBet.write.createMarket(["Test?", "A", "B", deadline]);

    const stakeAmount = parseEther("0.1");
    
    await trendBet.write.stake([1n, 1], {
      value: stakeAmount,
      account: user1.account
    });

    const market = await trendBet.read.markets([1n]);
    assert.equal(market[4], stakeAmount); // totalPool
    assert.equal(market[5], stakeAmount); // totalA
  });

  it("Should resolve market and allow winners to claim", async function () {
    const { trendBet } = await deployContract();
    const block = await publicClient.getBlock();
    const deadline = block.timestamp + 10n;
    await trendBet.write.createMarket(["Test?", "A", "B", deadline]);

    await trendBet.write.stake([1n, 1], { value: parseEther("1"), account: user1.account }); // User 1 bets 1 ETH on A
    await trendBet.write.stake([1n, 2], { value: parseEther("1"), account: user2.account }); // User 2 bets 1 ETH on B

    // Fast forward time
    await publicClient.request({ method: "evm_increaseTime", params: [20] });
    await publicClient.request({ method: "evm_mine" });

    // Resolve as A wins (option 1)
    await trendBet.write.resolveMarket([1n, 1]);

    const marketAfter = await trendBet.read.markets([1n]);
    assert.equal(marketAfter[7], true); // resolved
    assert.equal(marketAfter[8], 1); // winningOption

    // User 1 (winner) claims
    const initialBalance = await publicClient.getBalance({ address: user1.account.address });
    await trendBet.write.claimWinnings([1n], { account: user1.account });
    const finalBalance = await publicClient.getBalance({ address: user1.account.address });

    // Payout should be (1 / 1) * (2 * 0.98) = 1.96 ETH
    assert.ok(finalBalance > initialBalance + parseEther("1.9"));
  });

  it("Should not allow losers to claim", async function () {
    const { trendBet } = await deployContract();
    const block = await publicClient.getBlock();
    const deadline = block.timestamp + 10n;
    await trendBet.write.createMarket(["Test?", "A", "B", deadline]);

    await trendBet.write.stake([1n, 1], { value: parseEther("1"), account: user1.account });
    await trendBet.write.stake([1n, 2], { value: parseEther("1"), account: user2.account });

    await publicClient.request({ method: "evm_increaseTime", params: [20] });
    await publicClient.request({ method: "evm_mine" });

    await trendBet.write.resolveMarket([1n, 1]);

    // User 2 (loser) tries to claim
    await assert.rejects(
      trendBet.write.claimWinnings([1n], { account: user2.account }),
      /No winning stake/
    );
  });
});
