// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;
import "./Forge.sol";

contract LiquidationFinder {
  struct Liquidation {
    address account;        // owner of oven
    uint ovenId;            // id of oven
    uint collateral;        // collateral amount
    uint amount;            // forged synthetic amount
    uint ratio;             // collateralization ratio
  }
  Forge forge;

  constructor(address forgeAddress) {
    forge = Forge(forgeAddress);
  }

  function getLiquidation(uint fassetId, uint maxRatio, int skip) public view returns(
    Liquidation memory liq
  ) {
    uint nUsers = forge.getUsersLength();
    for (uint256 i = nUsers-1; i >= 0; i--) {
      address userAddr = forge.users(i);
      uint nOvens = forge.getOvensLength(userAddr);
      for (uint256 y = 0; y < nOvens; y++) {
        (address acc, uint colla, uint am, uint token) = forge.ovens(userAddr,y);
        if (token != fassetId)
          continue;
        uint ovenRatio = forge.getOvenRatio(userAddr, y);
        if (ovenRatio < maxRatio) {
          if (skip > 0)
            skip--;
          else
            return Liquidation({
              account: acc,
              ovenId: y,
              collateral: colla,
              amount: am,
              ratio: ovenRatio
            });
        }
      }
      if (i == 0)
        return Liquidation({
          account: address(0),
          ovenId: 0,
          collateral: 0,
          amount: 0,
          ratio: 0
        });
    }
  }
}