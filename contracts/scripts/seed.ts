import { network } from "hardhat";
import { parseEther } from "viem";

async function main() {
  const { viem } = await network.create();
  const [owner] = await viem.getWalletClients();
  
  // Connect to the deployed contract
  const trendBetAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const trendBet = await viem.getContractAt("TrendBet", trendBetAddress);

  const now = Math.floor(Date.now() / 1000);
  
  console.log("Seeding markets...");

  await trendBet.write.createMarket([
    "Will ETH hit $5,000 this week?",
    "Yes",
    "No",
    BigInt(now + 86400 * 3) // 3 days
  ]);

  await trendBet.write.createMarket([
    "Will Arsenal win against Chelsea?",
    "Arsenal",
    "Chelsea",
    BigInt(now + 86400 * 1) // 1 day
  ]);

  await trendBet.write.createMarket([
    "Will 'Base' trend on X today?",
    "Yes",
    "No",
    BigInt(now + 3600 * 12) // 12 hours
  ]);

  console.log("Markets seeded!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
