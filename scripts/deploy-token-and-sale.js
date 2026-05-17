const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const name = process.env.TOKEN_NAME || "ASHES";
  const symbol = process.env.TOKEN_SYMBOL || "ASH";
  const initialSupply = process.env.INITIAL_SUPPLY || "1000000";
  const initialOwner = process.env.INITIAL_OWNER || deployer.address;
  const usdcAddress =
    process.env.USDC_TOKEN_ADDRESS ||
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const treasury = process.env.TREASURY_ADDRESS || initialOwner;
  const ashPerUsdc = process.env.ASH_PER_USDC || "7";
  const saleAllocation = process.env.SALE_ALLOCATION || "700000";

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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
