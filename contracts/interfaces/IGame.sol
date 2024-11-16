// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGame {
    struct Cell {
        address owner;
        uint256 level;
        uint256 rate;
        uint256 capacity;
        uint256 energy;
        uint256 lastUpdate;
        uint256 seed;
    }

    // function mapWidth() external view returns (uint256);
    // function mapHeight() external view returns (uint256);
    // function userStorage(address user) external view returns (uint256);
    function claimCell(uint256 _index) external;
    function attackCell(uint256 _attackerIndex, uint256 _defenderIndex) external;
    function setCellProperties(uint256 _index, uint256 _rate, uint256 _capacity, uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) external;
    function getCellEnergy(uint256 _index) external view returns (uint256);
    function getMapData() external view returns (Cell[] memory);
}
