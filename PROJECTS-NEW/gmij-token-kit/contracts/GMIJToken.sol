// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * GMIJ token for GodsIMiJ Empire.
 * Initial mint goes to a receiver. Owner can mint for emissions until governance replaces owner.
 */
contract GMIJToken is ERC20, ERC20Burnable, Ownable {
    constructor(
        address initialReceiver,
        uint256 initialSupplyWei
    ) ERC20("GMIJ", "GMIJ") Ownable(msg.sender) {
        _mint(initialReceiver, initialSupplyWei);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
