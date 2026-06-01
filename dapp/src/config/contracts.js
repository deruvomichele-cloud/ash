export const CONTRACTS = {
  BASE_SEPOLIA: {
    chainId: 84532,
    chainName: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
    // Aggiorna questi indirizzi dopo il deploy
    ashSwapAddress: "0x...", 
    ashTokenAddress: "0x...",
    usdcTokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
  BASE_MAINNET: {
    chainId: 8453,
    chainName: "Base",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    // Aggiorna questi indirizzi dopo il deploy
    ashSwapAddress: "0x...",
    ashTokenAddress: "0x...",
    usdcTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
};

export const AshSwapABI = [
  {
    inputs: [{ internalType: "uint256", name: "usdcAmount", type: "uint256" }],
    name: "quoteAshForUsdc",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "ashAmount", type: "uint256" }],
    name: "quoteUsdcForAsh",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "usdcAmount", type: "uint256" }],
    name: "swapUsdcForAsh",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "ashAmount", type: "uint256" }],
    name: "swapAshForUsdc",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "ashPerUsdc",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];
