const { ethers } = require("hardhat");

async function main() {
  const name = process.env.TOKEN_NAME || "Base Coin";
  const symbol = process.env.TOKEN_SYMBOL || "BCOIN";
  const initialSupply = process.env.INITIAL_SUPPLY || "1000000";
  const recipient = process.env.INITIAL_OWNER || (await ethers.provider.getSigner()).address;

  const token = await ethers.deployContract("BaseCoin", [
    name,
    symbol,
    initialSupply,
    recipient,
  ]);

  await token.waitForDeployment();

  console.log(`Token: ${name} (${symbol})`);
  console.log(`Initial supply: ${initialSupply}`);
  console.log(`Initial owner: ${recipient}`);
  console.log(`Contract deployed at: ${await token.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
