// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import './interfaces/IERC20.sol';
import './interfaces/IVotingEscrow.sol';
import './interfaces/IFeeCollector.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardsDistributor is Ownable {
    uint constant WEEK = 7 * 86400;
    
    // connected contracts
    address public feeCollector;
    address public ve;
    address public forge;
    address public usdc;

    // team share
    address public team;
    uint public teamShare; // out of 10000

    // storing each epoch data
    uint[] public epoch;
    mapping(uint => uint) public epochVeSupply;
    mapping(uint => uint) public epochForgeReward;
    mapping(uint => uint) public epochUsdcReward;

    // storing user last claim
    mapping(uint => uint) lastClaim;

    constructor(address _votingEscrow, address _feeCollector, address _usdc, address _team, uint _teamShare) {
        team = _team;
        teamShare = _teamShare;
        usdc = _usdc;
        feeCollector = _feeCollector;
        ve = _votingEscrow;
        forge = IVotingEscrow(ve).token();
        require(IERC20(forge).approve(ve, type(uint).max));
    }

    function setTeam(address _team) onlyOwner public {
        team = _team;
    }

    function setTeamShare(uint _teamShare) onlyOwner public {
        teamShare = _teamShare;
    }

    function epochId() external view returns (uint) {
        return epoch.length;
    }

    function nextEpoch() external {
        uint epochTs = block.timestamp;
        uint veSupply = IVotingEscrow(ve).totalSupply();
        require(veSupply > 0, "Need at least 1 user to distribute fees");
        if (epoch.length > 0) {
            require(block.timestamp >= epoch[epoch.length-1] + WEEK, "Cannot go to next epoch yet");
        }
        
        uint id = epoch.length;
        epoch.push(epochTs);

        // save total ve supply
        epochVeSupply[id] = veSupply;

        // colleting forge fees from fee collector
        epochForgeReward[id] = IERC20(forge).balanceOf(feeCollector);
        uint forgeForTeam = epochForgeReward[id] * teamShare / 10000;
        epochForgeReward[id] -= forgeForTeam;
        IFeeCollector(feeCollector).transferERC20(forge, team, forgeForTeam);
        IFeeCollector(feeCollector).transferERC20(forge, address(this), epochForgeReward[id]);
        
        // collecting oven fees (USDC) from fee collector
        epochUsdcReward[id] = IERC20(usdc).balanceOf(feeCollector);
        uint usdcForTeam = epochUsdcReward[id] * teamShare / 10000;
        epochUsdcReward[id] -= usdcForTeam;
        IFeeCollector(feeCollector).transferERC20(usdc, team, usdcForTeam);
        IFeeCollector(feeCollector).transferERC20(usdc, address(this), epochUsdcReward[id]);
    }

    function claimable(uint tokenId) public view returns (uint rewardForge, uint rewardUsdc) {
        rewardForge = 0;
        rewardUsdc = 0;
        uint i = lastClaim[tokenId];
        IVotingEscrow.Point memory pt = IVotingEscrow(ve).user_point_history(tokenId, 1);
        while (i < epoch.length) {
            if (pt.ts < epoch[i]) {
                rewardForge += (epochForgeReward[i] * IVotingEscrow(ve).balanceOfNFTAt(tokenId, epoch[i]) / epochVeSupply[i]);
                rewardUsdc += (epochUsdcReward[i] * IVotingEscrow(ve).balanceOfNFTAt(tokenId, epoch[i]) / epochVeSupply[i]);
            }
            i++;
        }
        return (rewardForge, rewardUsdc);
    }

    function claim(uint tokenId) public {
        require(IVotingEscrow(ve).ownerOf(tokenId) == msg.sender, "You do not own this NFT");
        (uint rewardForge, uint rewardUsdc) = claimable(tokenId);
        require(rewardForge > 0 || rewardUsdc > 0, "Nothing to claim");
        IVotingEscrow(ve).deposit_for(tokenId, rewardForge);
        IERC20(usdc).transfer(IVotingEscrow(ve).ownerOf(tokenId), rewardUsdc);
        lastClaim[tokenId] = epoch.length;
    }
}