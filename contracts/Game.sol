// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ILayoutEligibilityVerifier.sol";
import "./interfaces/IGame.sol";

contract Game is IGame {
    uint256 public mapWidth;
    uint256 public mapHeight;
    Cell[] public map;
    mapping(address => uint256) public userClaimedCell;

    ILayoutEligibilityVerifier public layoutEligibilityVerifier;

    constructor(address _layoutEligibilityVerifier, uint256 _seed, uint256 _mapWidth, uint256 _mapHeight) {
        layoutEligibilityVerifier = ILayoutEligibilityVerifier(_layoutEligibilityVerifier);
        mapWidth = _mapWidth;
        mapHeight = _mapHeight;
        initializeMap(_seed);
    }

    function initializeMap(uint256 _seed) internal {
        uint256 totalCells = mapWidth * mapHeight;
        for (uint256 i = 0; i < totalCells; i++) {
            uint256 cellSeed = uint256(keccak256(abi.encodePacked(_seed, i)));
            map.push(Cell({
                owner: address(0),
                level: cellSeed % 5, // Random level from 0 to 4
                rate: 0,
                capacity: 0,
                energy: 0,
                lastUpdate: block.timestamp,
                seed: cellSeed
            }));
        }
    }


    function claimCell(uint256 _index, uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) public {
        require(map[_index].level == 0, "Cell is not level 0");
        require(map[_index].owner == address(0), "Cell already claimed");
        require(userClaimedCell[msg.sender] == 0, "Player already claimed a cell");

        require(layoutEligibilityVerifier.verifyProof(a, b, c, [map[_index].rate, map[_index].capacity]), "Invalid proof");

        map[_index].owner = msg.sender;
        userClaimedCell[msg.sender] = _index + 1; // Store the index of the claimed cell
    }

    function attackCell(uint256 _attackerIndex, uint256 _defenderIndex) public {
        require(map[_defenderIndex].owner != address(0), "Defender cell is not claimed");
        require(map[_defenderIndex].owner != msg.sender, "Cannot attack own cell");
        require(map[_attackerIndex].owner == msg.sender, "Not the owner of the attacker cell");

        uint256 attackerEnergy = getCellEnergy(_attackerIndex);
        uint256 defenderEnergy = getCellEnergy(_defenderIndex);

        if (attackerEnergy > defenderEnergy) {
            map[_defenderIndex].owner = msg.sender;
            map[_defenderIndex].rate = 0;
            map[_defenderIndex].capacity = 0;
            map[_defenderIndex].energy = 0;
            map[_defenderIndex].lastUpdate = block.timestamp;
        } else {
            uint256 energyUsed = attackerEnergy < defenderEnergy ? attackerEnergy : defenderEnergy;
            map[_attackerIndex].energy -= energyUsed;
            map[_defenderIndex].energy -= energyUsed;
        }
    }

    function setCellProperties(uint256 _index, uint256 _rate, uint256 _capacity, uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) public {
        require(map[_index].owner == msg.sender, "Not the owner of the cell");

        require(layoutEligibilityVerifier.verifyProof(a, b, c, [_rate, _capacity]), "Invalid proof");

        map[_index].rate = _rate;
        map[_index].capacity = _capacity;
        map[_index].lastUpdate = block.timestamp;
    }

    function getCellEnergy(uint256 _index) public view returns (uint256) {
        Cell memory cell = map[_index];
        if (cell.rate == 0 || cell.capacity == 0) return 0;

        uint256 timePassed = block.timestamp - cell.lastUpdate;
        uint256 energy = cell.energy + (timePassed * cell.rate);
        return energy > cell.capacity ? cell.capacity : energy;
    }

    function getMapData() public view returns (Cell[] memory) {
        return map;
    }
}
