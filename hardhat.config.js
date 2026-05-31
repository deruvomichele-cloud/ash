require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const testnetWalletKey = process.env.WALLET_PRIVATE_KEY || "";
const mainnetWalletKey = process.env.MAINNET_WALLET_PRIVATE_KEY || "";
const testnetAccounts = /^0x[0-9a-fA-F]{64}$/.test(testnetWalletKey)
  ? [testnetWalletKey]
  : [];
const mainnetAccounts = /^0x[0-9a-fA-F]{64}$/.test(mainnetWalletKey)
  ? [mainnetWalletKey]
  : [];

/** @type import("hardhat/config").HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      chainId: 84532,
      accounts: testnetAccounts,
    },
    baseMainnet: {
      url: process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org",
      chainId: 8453,
      accounts: mainnetAccounts,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || process.env.BASESCAN_API_KEY || "",
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};
