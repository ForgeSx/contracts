// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ForgeToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
    
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
    
    function burn(address _from, uint256 _amount) external onlyOwner {
        _burn(_from, _amount);
    }
}