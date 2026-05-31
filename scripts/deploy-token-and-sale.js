const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const { chainId } = await ethers.provider.getNetwork();
  const isMainnet = chainId === 8453n;
  const isSepolia = chainId === 84532n;

  const name = process.env.TOKEN_NAME || "ASHES";
  const symbol = process.env.TOKEN_SYMBOL || "ASH";
  const initialSupply = process.env.INITIAL_SUPPLY || "1000000";
  const initialOwner = isMainnet
    ? process.env.MAINNET_INITIAL_OWNER
    : process.env.INITIAL_OWNER || deployer.address;
  const usdcAddress = isMainnet
    ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    : "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const treasury = isMainnet
    ? process.env.MAINNET_TREASURY_ADDRESS
    : process.env.TREASURY_ADDRESS || initialOwner;
  const ashPerUsdc = process.env.ASH_PER_USDC || "7";
  const saleAllocation = process.env.SALE_ALLOCATION || "700000";

  if (!isMainnet && !isSepolia) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  if (
    isMainnet &&
    process.env.MAINNET_DEPLOY_CONFIRMATION !== "I_UNDERSTAND_THIS_USES_REAL_FUNDS"
  ) {
    throw new Error(
      "Set MAINNET_DEPLOY_CONFIRMATION=I_UNDERSTAND_THIS_USES_REAL_FUNDS before a mainnet deploy."
    );
  }

  if (!ethers.isAddress(initialOwner) || !ethers.isAddress(treasury)) {
    throw new Error(
      "Set INITIAL_OWNER and TREASURY_ADDRESS to valid wallet addresses in .env."
    );
  }

  const token = await ethers.deployContract("BaseCoin", [
    name,
    symbol,
    initialSupply,
    initialOwner,
  ]);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  const sale = await ethers.deployContract("AshSale", [
    usdcAddress,
    tokenAddress,
    treasury,
    ashPerUsdc,
    deployer.address,
  ]);
  await sale.waitForDeployment();
  const saleAddress = await sale.getAddress();

  if (initialOwner.toLowerCase() === deployer.address.toLowerCase()) {
    await (await token.transfer(saleAddress, ethers.parseEther(saleAllocation))).wait();
  } else {
    console.log(
      "Sale not funded automatically because INITIAL_OWNER is not the deployer."
    );
    console.log(
      `Transfer ${saleAllocation} ${symbol} from ${initialOwner} to ${saleAddress} before selling.`
    );
  }

  console.log(`Token deployed at: ${tokenAddress}`);
  console.log(`Sale deployed at: ${saleAddress}`);
  console.log(`USDC token: ${usdcAddress}`);
  console.log(`Rate: 1 USDC = ${ashPerUsdc} ${symbol}`);
  console.log(`Treasury: ${treasury}`);
  console.log(
    `Verify ASH: npx hardhat verify --network ${isMainnet ? "baseMainnet" : "baseSepolia"} ${tokenAddress} "${name}" "${symbol}" ${initialSupply} ${initialOwner}`
  );
  console.log(
    `Verify sale: npx hardhat verify --network ${isMainnet ? "baseMainnet" : "baseSepolia"} ${saleAddress} ${usdcAddress} ${tokenAddress} ${treasury} ${ashPerUsdc} ${deployer.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
