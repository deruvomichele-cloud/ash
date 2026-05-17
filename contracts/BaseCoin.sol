// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BaseCoin is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupplyTokens,
        address initialOwner
    ) ERC20(name_, symbol_) {
        require(initialOwner != address(0), "Initial owner cannot be zero");
        _mint(initialOwner, initialSupplyTokens * 10 ** decimals());
    }
}
