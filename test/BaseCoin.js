const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BaseCoin", function () {
  it("mints the configured initial supply to the initial owner", async function () {
    const [owner, other] = await ethers.getSigners();
    const token = await ethers.deployContract("BaseCoin", [
      "My Base Coin",
      "MBC",
      1_000_000,
      other.address,
    ]);

    expect(await token.name()).to.equal("My Base Coin");
    expect(await token.symbol()).to.equal("MBC");
    expect(await token.balanceOf(other.address)).to.equal(
      ethers.parseEther("1000000")
    );
    expect(await token.balanceOf(owner.address)).to.equal(0);
  });

  it("rejects a zero initial owner", async function () {
    await expect(
      ethers.deployContract("BaseCoin", [
        "My Base Coin",
        "MBC",
        1_000_000,
        ethers.ZeroAddress,
      ])
    ).to.be.revertedWith("Initial owner cannot be zero");
  });
});
