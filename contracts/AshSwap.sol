// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AshSwap is Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant ASH_DECIMALS = 18;

    IERC20 public immutable usdc;
    IERC20 public immutable ash;

    address public treasury;
    uint256 public ashPerUsdc; // Prezzo fisso: quanti ASH per 1 USDC

    event SwappedUsdcForAsh(address indexed user, uint256 usdcAmount, uint256 ashAmount);
    event SwappedAshForUsdc(address indexed user, uint256 ashAmount, uint256 usdcAmount);
    event TreasuryUpdated(address indexed newTreasury);
    event RateUpdated(uint256 newAshPerUsdc);

    constructor(
        address usdc_,
        address ash_,
        address treasury_,
        uint256 ashPerUsdc_,
        address owner_
    ) Ownable(owner_) {
        require(usdc_ != address(0), "USDC cannot be zero");
        require(ash_ != address(0), "ASH cannot be zero");
        require(treasury_ != address(0), "Treasury cannot be zero");
        require(ashPerUsdc_ > 0, "Rate cannot be zero");

        usdc = IERC20(usdc_);
        ash = IERC20(ash_);
        treasury = treasury_;
        ashPerUsdc = ashPerUsdc_;
    }

    // Quote: quanti ASH ricevi per X USDC
    function quoteAshForUsdc(uint256 usdcAmount) public view returns (uint256) {
        return (usdcAmount * ashPerUsdc * 10 ** ASH_DECIMALS) / 10 ** USDC_DECIMALS;
    }

    // Quote: quanti USDC ricevi per X ASH
    function quoteUsdcForAsh(uint256 ashAmount) public view returns (uint256) {
        return (ashAmount * 10 ** USDC_DECIMALS) / (ashPerUsdc * 10 ** ASH_DECIMALS);
    }

    // Scambio: invia USDC, ricevi ASH
    function swapUsdcForAsh(uint256 usdcAmount) external {
        require(usdcAmount > 0, "USDC amount cannot be zero");

        uint256 ashAmount = quoteAshForUsdc(usdcAmount);
        require(ash.balanceOf(address(this)) >= ashAmount, "Not enough ASH in contract");

        // Trasferisci USDC dal buyer al treasury
        usdc.safeTransferFrom(msg.sender, treasury, usdcAmount);
        // Trasferisci ASH dal contratto al buyer
        ash.safeTransfer(msg.sender, ashAmount);

        emit SwappedUsdcForAsh(msg.sender, usdcAmount, ashAmount);
    }

    // Scambio: invia ASH, ricevi USDC
    function swapAshForUsdc(uint256 ashAmount) external {
        require(ashAmount > 0, "ASH amount cannot be zero");

        uint256 usdcAmount = quoteUsdcForAsh(ashAmount);
        require(usdc.balanceOf(address(this)) >= usdcAmount, "Not enough USDC in contract");

        // Trasferisci ASH dal buyer al contratto
        ash.safeTransferFrom(msg.sender, address(this), ashAmount);
        // Trasferisci USDC dal contratto al buyer
        usdc.safeTransfer(msg.sender, usdcAmount);

        emit SwappedAshForUsdc(msg.sender, ashAmount, usdcAmount);
    }

    // Admin: cambia indirizzo treasury
    function setTreasury(address treasury_) external onlyOwner {
        require(treasury_ != address(0), "Treasury cannot be zero");
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    // Admin: cambia il prezzo fisso
    function setRate(uint256 ashPerUsdc_) external onlyOwner {
        require(ashPerUsdc_ > 0, "Rate cannot be zero");
        ashPerUsdc = ashPerUsdc_;
        emit RateUpdated(ashPerUsdc_);
    }

    // Admin: preleva ASH invenduto
    function withdrawAsh(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Recipient cannot be zero");
        ash.safeTransfer(to, amount);
    }

    // Admin: preleva USDC in eccesso
    function withdrawUsdc(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Recipient cannot be zero");
        usdc.safeTransfer(to, amount);
    }
}
