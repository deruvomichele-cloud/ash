const { ethers } = require("ethers");
require("dotenv").config();

const COMPROMISED_TESTNET_WALLET = "0xA6Bb39f60D5B5856334F6A49039a49070b0706BE";
const MAINNET_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

function report(label, passed, message) {
  console.log(`${passed ? "[OK]" : "[MISSING]"} ${label}: ${message}`);
  return passed;
}

async function main() {
  const walletKey = process.env.MAINNET_WALLET_PRIVATE_KEY || "";
  const keyValid = /^0x[0-9a-fA-F]{64}$/.test(walletKey);
  const deployerAddress = keyValid ? new ethers.Wallet(walletKey).address : null;
  const owner = process.env.MAINNET_INITIAL_OWNER || "";
  const treasury = process.env.MAINNET_TREASURY_ADDRESS || "";
  const confirmation =
    process.env.MAINNET_DEPLOY_CONFIRMATION === "I_UNDERSTAND_THIS_USES_REAL_FUNDS";
  const usesCompromisedWallet =
    deployerAddress?.toLowerCase() === COMPROMISED_TESTNET_WALLET.toLowerCase() ||
    owner.toLowerCase() === COMPROMISED_TESTNET_WALLET.toLowerCase() ||
    treasury.toLowerCase() === COMPROMISED_TESTNET_WALLET.toLowerCase();

  const results = [
    report("Network", true, "Base mainnet chain ID 8453"),
    report("Circle USDC", true, MAINNET_USDC),
    report(
      "Fresh deploy wallet",
      keyValid && !usesCompromisedWallet,
      keyValid
        ? usesCompromisedWallet
          ? "do not use the wallet exposed during testnet"
          : `configured (${deployerAddress})`
        : "add MAINNET_WALLET_PRIVATE_KEY locally in .env"
    ),
    report(
      "Mainnet initial owner",
      ethers.isAddress(owner) && !usesCompromisedWallet,
      ethers.isAddress(owner) ? owner : "add MAINNET_INITIAL_OWNER in .env"
    ),
    report(
      "Mainnet treasury",
      ethers.isAddress(treasury) && !usesCompromisedWallet,
      ethers.isAddress(treasury) ? treasury : "add MAINNET_TREASURY_ADDRESS in .env"
    ),
    report(
      "Explicit deploy confirmation",
      confirmation,
      confirmation
        ? "real-funds confirmation configured"
        : "set MAINNET_DEPLOY_CONFIRMATION=I_UNDERSTAND_THIS_USES_REAL_FUNDS"
    ),
  ];

  if (keyValid && !usesCompromisedWallet) {
    const provider = new ethers.JsonRpcProvider(
      process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org"
    );
    const balance = await provider.getBalance(deployerAddress);
    results.push(
      report("Base mainnet gas", balance > 0n, `${ethers.formatEther(balance)} ETH`)
    );
  }

  if (results.every(Boolean)) {
    console.log("\nReady for a real-funds deployment.");
    console.log("Deploy with: npm run deploy:sale:base-mainnet");
    return;
  }

  console.log("\nNot ready for mainnet deployment.");
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Readiness check failed: ${error.message}`);
  process.exitCode = 1;
});
