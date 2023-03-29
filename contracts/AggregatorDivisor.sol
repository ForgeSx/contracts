// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IAggregatorV3.sol";

/**
 * @title AggregatorDivisor
 * @notice This contract merges
 * two aggregators data into one
 * by dividing the first price by
 * the other.
 */
contract AggregatorDivisor {
  uint8 public decimals;
  address public oracle0;
  address public oracle1;
  uint8 public oracle0decimals;
  uint8 public oracle1decimals;

  constructor(
    uint8 _decimals,
    address _oracle0,
    address _oracle1
  ) public {
    decimals = _decimals;
    oracle0 = _oracle0;
    oracle1 = _oracle1;
    oracle0decimals = IAggregatorV3(oracle0).decimals();
    oracle1decimals = IAggregatorV3(oracle1).decimals();
  }

  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    (, int price0, uint startedAt0, uint updatedAt0, ) = IAggregatorV3(oracle0).latestRoundData();
    require(price0 > 0 && startedAt0 > 0 && updatedAt0 > 0, "Invalid oracle 0");
    (, int price1, uint startedAt1, uint updatedAt1, ) = IAggregatorV3(oracle1).latestRoundData();
    require(price1 > 0 && startedAt1 > 0 && updatedAt1 > 0, "Invalid oracle 1");

    uint finalUpdatedAt = updatedAt0 > updatedAt1 ? updatedAt0 : updatedAt1;
    uint finalStartedAt = startedAt0 > startedAt1 ? startedAt0 : startedAt1;
    uint composedPrice = 
      10**(decimals+oracle1decimals) * uint(price0) 
      / (uint(price1) * 10**(oracle0decimals));

    return (
      0,
      int(composedPrice),
      finalStartedAt,
      finalUpdatedAt,
      0
    );
  }
}