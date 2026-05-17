const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AshSale", function () {
  async function deploySaleFixture() {
    const [owner, buyer, treasury] = await ethers.getSigners();

    const usdc = await ethers.deployContract("BaseCoin", [
      "Test USDC",
      "USDC",
      1_000_000,
      owner.address,
    ]);
    const ash = await ethers.deployContract("BaseCoin", [
      "ASHES",
      "ASH",
      1_000_000,
      owner.address,
    ]);
    const sale = await ethers.deployContract("AshSale", [
      await usdc.getAddress(),
      await ash.getAddress(),
      treasury.address,
      7,
      owner.address,
    ]);

    await ash.transfer(await sale.getAddress(), ethers.parseEther("700000"));
    await usdc.transfer(buyer.address, ethers.parseUnits("100", 18));

    return { owner, buyer, treasury, usdc, ash, sale };
  }

  it("quotes 7 ASH for 1 USDC", async function () {
    const { sale } = await deploySaleFixture();

    expect(await sale.quoteAsh(1_000_000)).to.equal(ethers.parseEther("7"));
  });

  it("sells ASH for USDC at 1:7", async function () {
    const { buyer, treasury, usdc, ash, sale } = await deploySaleFixture();
    const saleAddress = await sale.getAddress();

    await usdc.connect(buyer).approve(saleAddress, 1_000_000);
    await sale.connect(buyer).buy(1_000_000);

    expect(await ash.balanceOf(buyer.address)).to.equal(ethers.parseEther("7"));
    expect(await usdc.balanceOf(treasury.address)).to.equal(1_000_000);
  });
});
