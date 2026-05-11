import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import { defineConfig } from "hardhat/config";
import "dotenv/config";

console.log("BASE_MAINNET_RPC_URL", process.env.BASE_MAINNET_RPC_URL);
console.log("BASE_MAINNET_PRIVATE_KEY", process.env.BASE_MAINNET_PRIVATE_KEY);
console.log("BASESCAN_API_KEY", process.env.BASESCAN_API_KEY);
export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, hardhatVerify],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    baseMainnet: {
      type: "http",
      chainType: "op",
      url: process.env.BASE_MAINNET_RPC_URL || "",
      accounts: process.env.BASE_MAINNET_PRIVATE_KEY ? [process.env.BASE_MAINNET_PRIVATE_KEY] : [],
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.BASESCAN_API_KEY || "",
    },
  },
});
