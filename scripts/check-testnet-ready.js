const { ethers } = require("ethers");
require("dotenv").config();

const placeholderValues = new Set([
  "0x_your_deployer_private_key",
  "0x_your_wallet_address",
  "your_basescan_api_key",
  "your_etherscan_api_v2_key",
  "paste_your_pinata_jwt_here",
]);

function isConfigured(value) {
  return Boolean(value) && !placeholderValues.has(value);
}

function report(label, passed, message) {
  console.log(`${passed ? "[OK]" : "[MISSING]"} ${label}: ${message}`);
  return passed;
}

async function main() {
  const walletKey = process.env.WALLET_PRIVATE_KEY;
  const keyValid = isConfigured(walletKey) && /^0x[0-9a-fA-F]{64}$/.test(walletKey);

  let deployerAddress = null;
  if (keyValid) {
    deployerAddress = new ethers.Wallet(walletKey).address;
  }

  const ownerValid = ethers.isAddress(process.env.INITIAL_OWNER || "");
  const treasuryValid = ethers.isAddress(process.env.TREASURY_ADDRESS || "");
  const tokenReady =
    process.env.TOKEN_NAME === "ASHES" &&
    process.env.TOKEN_SYMBOL === "ASH" &&
    process.env.ASH_PER_USDC === "7";

  const deploymentResults = [
    report("Token", tokenReady, "ASHES (ASH), rate 1 USDC = 7 ASH"),
    report(
      "Deploy wallet",
      keyValid,
      keyValid ? `configured (${deployerAddress})` : "add WALLET_PRIVATE_KEY in .env"
    ),
    report(
      "Initial owner",
      ownerValid,
      ownerValid ? process.env.INITIAL_OWNER : "add a valid INITIAL_OWNER address in .env"
    ),
    report(
      "Treasury",
      treasuryValid,
      treasuryValid
        ? process.env.TREASURY_ADDRESS
        : "add a valid TREASURY_ADDRESS address in .env"
    ),
  ];

  if (keyValid) {
    const provider = new ethers.JsonRpcProvider(
      process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"
    );
    const balance = await provider.getBalance(deployerAddress);
    deploymentResults.push(
      report(
        "Base Sepolia gas",
        balance > 0n,
        `${ethers.formatEther(balance)} ETH in deploy wallet`
      )
    );
  }

  report(
    "BaseScan verification (after deploy)",
    isConfigured(process.env.ETHERSCAN_API_KEY),
    isConfigured(process.env.ETHERSCAN_API_KEY)
      ? "API key configured"
      : "add ETHERSCAN_API_KEY to verify source code on BaseScan"
  );

  if (deploymentResults.every(Boolean)) {
    console.log("\nReady. Deploy with: npm run deploy:sale:base-sepolia");
    return;
  }

  console.log("\nNot ready for on-chain deployment yet.");
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Readiness check failed: ${error.message}`);
  process.exitCode = 1;
});
