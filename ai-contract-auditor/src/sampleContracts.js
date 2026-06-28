export const sampleContracts = [
  {
    name: "VulnerableVault",
    label: "重入漏洞金库",
    risk: "High",
    tags: ["reentrancy", "external-call"],
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract VulnerableVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");

        balances[msg.sender] = 0;
    }
}`,
  },
  {
    name: "LotteryWithTxOrigin",
    label: "tx.origin + 弱随机彩票",
    risk: "High",
    tags: ["authorization", "randomness"],
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LotteryWithTxOrigin {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function emergencyWithdraw(address payable to) external {
        require(tx.origin == owner, "Only owner");
        to.transfer(address(this).balance);
    }

    function drawWinner(address[] memory players) external view returns (address) {
        uint256 index = uint256(keccak256(abi.encodePacked(block.timestamp, blockhash(block.number - 1)))) % players.length;
        return players[index];
    }
}`,
  },
  {
    name: "SafeVault",
    label: "修复版金库",
    risk: "Low",
    tags: ["fixed", "checks-effects-interactions"],
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SafeVault {
    mapping(address => uint256) public balances;
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        balances[msg.sender] = 0;

        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
    }
}`,
  },
];

export function listSampleContracts() {
  return sampleContracts.map(({ name, label, risk, tags }) => ({ name, label, risk, tags }));
}

export function getSampleContract(name = "VulnerableVault") {
  return sampleContracts.find((sample) => sample.name === name) || sampleContracts[0];
}
