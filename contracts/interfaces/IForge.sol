// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IForge {
    function open(uint collateral, uint amount, uint synid) external;
    function close(uint id) external;
    function deposit(uint id, uint collateral) external;
    function withdraw(uint id, uint amount) external;
    function burn(uint id, uint amount) external;
    function mint(uint id, uint amount) external;
    function liquidate(address account, uint id, uint amount) external;
}