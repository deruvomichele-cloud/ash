// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AshSale is Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant ASH_DECIMALS = 18;

    IERC20 public immutable usdc;
    IERC20 public immutable ash;

    address public treasury;
    uint256 public ashPerUsdc;

    event Bought(address indexed buyer, uint256 usdcAmount, uint256 ashAmount);
    event TreasuryUpdated(address indexed treasury);
    event RateUpdated(uint256 ashPerUsdc);

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

    function quoteAsh(uint256 usdcAmount) public view returns (uint256) {
        return (usdcAmount * ashPerUsdc * 10 ** ASH_DECIMALS) / 10 ** USDC_DECIMALS;
    }

    function buy(uint256 usdcAmount) external {
        require(usdcAmount > 0, "USDC amount cannot be zero");

        uint256 ashAmount = quoteAsh(usdcAmount);
        require(ash.balanceOf(address(this)) >= ashAmount, "Not enough ASH in sale");

        usdc.safeTransferFrom(msg.sender, treasury, usdcAmount);
        ash.safeTransfer(msg.sender, ashAmount);

        emit Bought(msg.sender, usdcAmount, ashAmount);
    }

    function setTreasury(address treasury_) external onlyOwner {
        require(treasury_ != address(0), "Treasury cannot be zero");
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    function setRate(uint256 ashPerUsdc_) external onlyOwner {
        require(ashPerUsdc_ > 0, "Rate cannot be zero");
        ashPerUsdc = ashPerUsdc_;
        emit RateUpdated(ashPerUsdc_);
    }

    function withdrawUnsoldAsh(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Recipient cannot be zero");
        ash.safeTransfer(to, amount);
    }
}
