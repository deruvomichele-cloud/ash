const { expect } = require("chai");
const hre = require("hardhat");
const { parseUnits } = require("ethers");

describe("AshSwap", () => {
  let ashSwap, baseCoin, usdc;
  let deployer, user1, user2;
  const ASH_PER_USDC = 7n;

  beforeEach(async () => {
    [deployer, user1, user2] = await hre.ethers.getSigners();

    // Deploy BaseCoin
    const BaseCoin = await hre.ethers.getContractFactory("BaseCoin");
    baseCoin = await BaseCoin.deploy("Ashes", "ASH", 1000000, deployer.address);

    // Simula USDC con ERC20 semplice
    const ERC20Mock = await hre.ethers.getContractFactory("BaseCoin");
    usdc = await ERC20Mock.deploy("USD Coin", "USDC", 1000000, deployer.address);

    // Deploy AshSwap
    const AshSwap = await hre.ethers.getContractFactory("AshSwap");
    ashSwap = await AshSwap.deploy(
      await usdc.getAddress(),
      await baseCoin.getAddress(),
      deployer.address,
      ASH_PER_USDC,
      deployer.address
    );

    // Trasferisci fondi ai test user
    const ashAmount = parseUnits("500000", 18);
    const usdcAmount = parseUnits("500000", 6);

    await baseCoin.transfer(await ashSwap.getAddress(), ashAmount);
    await usdc.transfer(user1.address, usdcAmount);
    await baseCoin.transfer(user1.address, parseUnits("100000", 18));
  });

  describe("Deployment", () => {
    it("Should set correct initial values", async () => {
      expect(await ashSwap.ashPerUsdc()).to.equal(ASH_PER_USDC);
      expect(await ashSwap.treasury()).to.equal(deployer.address);
    });
  });

  describe("Quote Functions", () => {
    it("Should quote ASH for USDC correctly", async () => {
      const usdcAmount = parseUnits("100", 6); // 100 USDC
      const ashQuote = await ashSwap.quoteAshForUsdc(usdcAmount);
      const expectedAsh = parseUnits("700", 18); // 100 * 7 = 700 ASH

      expect(ashQuote).to.equal(expectedAsh);
    });

    it("Should quote USDC for ASH correctly", async () => {
      const ashAmount = parseUnits("700", 18); // 700 ASH
      const usdcQuote = await ashSwap.quoteUsdcForAsh(ashAmount);
      const expectedUsdc = parseUnits("100", 6); // 700 / 7 = 100 USDC

      expect(usdcQuote).to.equal(expectedUsdc);
    });
  });

  describe("Swaps", () => {
    it("Should swap USDC for ASH", async () => {
      const usdcAmount = parseUnits("100", 6);
      const expectedAsh = parseUnits("700", 18);

      // Approva USDC
      await usdc.connect(user1).approve(await ashSwap.getAddress(), usdcAmount);

      // Esegui swap
      await ashSwap.connect(user1).swapUsdcForAsh(usdcAmount);

      // Verifica bilanci
      expect(await baseCoin.balanceOf(user1.address)).to.equal(
        parseUnits("100000", 18) + expectedAsh
      );
      expect(await usdc.balanceOf(deployer.address)).to.equal(
        parseUnits("1000000", 6) - parseUnits("500000", 6) + usdcAmount
      );
    });

    it("Should swap ASH for USDC", async () => {
      const ashAmount = parseUnits("700", 18);
      const expectedUsdc = parseUnits("100", 6);

      // Approva ASH
      await baseCoin.connect(user1).approve(await ashSwap.getAddress(), ashAmount);

      // Esegui swap
      await ashSwap.connect(user1).swapAshForUsdc(ashAmount);

      // Verifica bilanci
      expect(await usdc.balanceOf(user1.address)).to.equal(
        parseUnits("500000", 6) + expectedUsdc
      );
      expect(await baseCoin.balanceOf(user1.address)).to.equal(
        parseUnits("100000", 18) - ashAmount
      );
    });

    it("Should revert if insufficient ASH in contract", async () => {
      const usdcAmount = parseUnits("1000000", 6); // Troppo USDC

      await usdc.connect(user1).approve(await ashSwap.getAddress(), usdcAmount);

      await expect(
        ashSwap.connect(user1).swapUsdcForAsh(usdcAmount)
      ).to.be.revertedWith("Not enough ASH in contract");
    });

    it("Should revert if insufficient USDC in contract", async () => {
      const ashAmount = parseUnits("10000000", 18); // Troppo ASH

      await baseCoin.connect(user1).approve(await ashSwap.getAddress(), ashAmount);

      await expect(
        ashSwap.connect(user1).swapAshForUsdc(ashAmount)
      ).to.be.revertedWith("Not enough USDC in contract");
    });
  });

  describe("Admin Functions", () => {
    it("Should update rate", async () => {
      const newRate = 10n;
      await ashSwap.setRate(newRate);

      expect(await ashSwap.ashPerUsdc()).to.equal(newRate);
    });

    it("Should update treasury", async () => {
      await ashSwap.setTreasury(user2.address);

      expect(await ashSwap.treasury()).to.equal(user2.address);
    });

    it("Should withdraw ASH", async () => {
      const withdrawAmount = parseUnits("10000", 18);
      const balanceBefore = await baseCoin.balanceOf(user2.address);

      await ashSwap.withdrawAsh(user2.address, withdrawAmount);

      expect(await baseCoin.balanceOf(user2.address)).to.equal(
        balanceBefore + withdrawAmount
      );
    });

    it("Should withdraw USDC", async () => {
      const withdrawAmount = parseUnits("10000", 6);
      const balanceBefore = await usdc.balanceOf(user2.address);

      await ashSwap.withdrawUsdc(user2.address, withdrawAmount);

      expect(await usdc.balanceOf(user2.address)).to.equal(
        balanceBefore + withdrawAmount
      );
    });

    it("Should revert non-admin function calls", async () => {
      await expect(
        ashSwap.connect(user1).setRate(10n)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
