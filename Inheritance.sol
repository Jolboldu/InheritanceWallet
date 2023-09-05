/**
 *Submitted for verification at Etherscan.io on 2023-09-05
*/

// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract InheritanceWallet {

    address payable public owner;
    address payable public heir;
    uint256 public lastWithdrawal;
    uint256 public timeForHeirToTakeOver = 30 days; // 1 month

    event CurrentState(
        address currentOwner,
        address currentHeir,
        bool canClaimOwnership,
        uint256 timeSinceLastWithdrawal
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier canClaimOwnership() {
        require(msg.sender == heir && block.timestamp > lastWithdrawal + timeForHeirToTakeOver, "Cannot claim ownership yet");
        _;
    }

    constructor(address payable _heir) {
        owner = payable(msg.sender);
        heir = _heir;
        lastWithdrawal = block.timestamp;
    }

    function deposit() external payable {}

    function withdraw(uint256 amount) external onlyOwner {
        require(amount == 0 || amount <= address(this).balance, "Insufficient funds");
        owner.transfer(amount);
        lastWithdrawal = block.timestamp; // reset the last withdrawal time
        this.logCurrentState();
    }

    function claimOwnership() external canClaimOwnership {
        owner = heir;
        lastWithdrawal = block.timestamp; // reset the last withdrawal time
        this.logCurrentState();
    }

    function setHeir(address payable _newHeir) external onlyOwner {
        heir = _newHeir;
        this.logCurrentState();
    }

    function logCurrentState() external {
        bool canClaim = block.timestamp > (lastWithdrawal + timeForHeirToTakeOver);
        uint256 timeSinceLast = block.timestamp - lastWithdrawal;
        emit CurrentState(owner, heir, canClaim, timeSinceLast);
    }
}