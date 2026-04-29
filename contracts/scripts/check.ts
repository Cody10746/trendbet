import { network } from "hardhat";

async function main() {
  const { viem } = await network.create();
  const tb = await viem.getContractAt("TrendBet", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const count = await tb.read.marketCount();
  console.log("Count:", count.toString());
}

main().catch(console.error);
