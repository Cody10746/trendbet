import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TrendBetModule = buildModule("TrendBetModule", (m) => {
  const trendBet = m.contract("TrendBet");

  return { trendBet };
});

export default TrendBetModule;
