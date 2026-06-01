const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Configurazione
  const config = {
    baseSepoliaUsdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    baseMainnetUsdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    network: hre.network.name,
  };

  let usdcAddress = config.network === "base-mainnet" 
    ? config.baseMainnetUsdc 
    : config.baseSepoliaUsdc;

  console.log(`\nNetwork: ${config.network}`);
  console.log(`USDC Address: ${usdcAddress}`);

  // Leggi da .env
  const tokenName = process.env.TOKEN_NAME || "Ashes";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "ASH";
  const initialSupply = process.env.INITIAL_SUPPLY || 1000000;
  const initialOwner = process.env.INITIAL_OWNER || deployer.address;
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  const ashPerUsdc = parseInt(process.env.ASH_PER_USDC || "7");
  const saleAllocation = process.env.SALE_ALLOCATION || 500000;

  console.log(`\nToken: ${tokenName} (${tokenSymbol})`);
  console.log(`Initial Supply: ${initialSupply}`);
  console.log(`Initial Owner: ${initialOwner}`);
  console.log(`Treasury: ${treasuryAddress}`);
  console.log(`Rate: 1 USDC = ${ashPerUsdc} ASH`);
  console.log(`Sale Allocation: ${saleAllocation} ASH`);

  // Deploy BaseCoin
  console.log("\n📦 Deploying BaseCoin...");
  const BaseCoin = await hre.ethers.getContractFactory("BaseCoin");
  const baseCoin = await BaseCoin.deploy(
    tokenName,
    tokenSymbol,
    initialSupply,
    initialOwner
  );
  await baseCoin.waitForDeployment();
  const baseCoinAddress = await baseCoin.getAddress();
  console.log(`✅ BaseCoin deployed: ${baseCoinAddress}`);

  // Deploy AshSwap
  console.log("\n🔄 Deploying AshSwap...");
  const AshSwap = await hre.ethers.getContractFactory("AshSwap");
  const ashSwap = await AshSwap.deploy(
    usdcAddress,
    baseCoinAddress,
    treasuryAddress,
    ashPerUsdc,
    initialOwner
  );
  await ashSwap.waitForDeployment();
  const ashSwapAddress = await ashSwap.getAddress();
  console.log(`✅ AshSwap deployed: ${ashSwapAddress}`);

  // Trasferisci ASH a AshSwap se deployer è initialOwner
  if (deployer.address === initialOwner) {
    console.log("\n💸 Transferring ASH to AshSwap...");
    const saleAllocationWei = hre.ethers.parseUnits(saleAllocation.toString(), 18);
    const tx = await baseCoin.transfer(ashSwapAddress, saleAllocationWei);
    await tx.wait();
    console.log(`✅ Transferred ${saleAllocation} ASH to AshSwap`);
  }

  // Salva deployment info
  const deployment = {
    network: config.network,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    BaseCoin: baseCoinAddress,
    AshSwap: ashSwapAddress,
    USDC: usdcAddress,
    Treasury: treasuryAddress,
    AshPerUsdc: ashPerUsdc,
    SaleAllocation: saleAllocation,
    ExplorerBaseCoin: `https://basescan.org/token/${baseCoinAddress}`,
    ExplorerAshSwap: `https://basescan.org/address/${ashSwapAddress}`,
  };

  const fs = require("fs");
  const filename = `deployments/${config.network}.json`;
  fs.writeFileSync(filename, JSON.stringify(deployment, null, 2));
  console.log(`\n📄 Deployment info saved to ${filename}`);

  console.log("\n🎉 Deployment complete!");
  console.log(JSON.stringify(deployment, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
