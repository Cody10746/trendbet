// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TrendBet
 * @dev A lightweight prediction market contract where users pick outcomes and winners split the pool.
 */
contract TrendBet {
    struct Market {
        string question;
        string optionA;
        string optionB;
        uint256 deadline;
        uint256 totalPool;
        uint256 totalA;
        uint256 totalB;
        bool resolved;
        uint8 winningOption; // 1 for A, 2 for B
    }

    address public owner;
    uint256 public protocolFeePercent = 2;
    uint256 public totalProtocolFees;
    uint256 public marketCount;

    mapping(uint256 => Market) public markets;
    // marketId => user => option => amount
    mapping(uint256 => mapping(address => mapping(uint8 => uint256))) public userStakes;
    // marketId => user => claimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event MarketCreated(uint256 indexed marketId, string question, uint256 deadline);
    event Staked(uint256 indexed marketId, address indexed user, uint8 option, uint256 amount);
    event MarketResolved(uint256 indexed marketId, uint8 winningOption);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createMarket(
        string memory _question,
        string memory _optionA,
        string memory _optionB,
        uint256 _deadline
    ) external onlyOwner {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        marketCount++;
        markets[marketCount] = Market({
            question: _question,
            optionA: _optionA,
            optionB: _optionB,
            deadline: _deadline,
            totalPool: 0,
            totalA: 0,
            totalB: 0,
            resolved: false,
            winningOption: 0
        });

        emit MarketCreated(marketCount, _question, _deadline);
    }

    function stake(uint256 _marketId, uint8 _option) external payable {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market already resolved");
        require(block.timestamp < market.deadline, "Market deadline passed");
        require(msg.value >= 0.001 ether, "Minimum stake is 0.001 ETH");
        require(_option == 1 || _option == 2, "Invalid option (1 or 2)");

        userStakes[_marketId][msg.sender][_option] += msg.value;
        market.totalPool += msg.value;

        if (_option == 1) {
            market.totalA += msg.value;
        } else {
            market.totalB += msg.value;
        }

        emit Staked(_marketId, msg.sender, _option, msg.value);
    }

    function resolveMarket(uint256 _marketId, uint8 _winningOption) external onlyOwner {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market already resolved");
        require(block.timestamp >= market.deadline, "Deadline not reached");
        require(_winningOption == 1 || _winningOption == 2, "Invalid winning option");

        market.resolved = true;
        market.winningOption = _winningOption;

        // Calculate protocol fee
        uint256 fee = (market.totalPool * protocolFeePercent) / 100;
        totalProtocolFees += fee;

        emit MarketResolved(_marketId, _winningOption);
    }

    function claimWinnings(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");
        require(!hasClaimed[_marketId][msg.sender], "Winnings already claimed");

        uint8 winner = market.winningOption;
        uint256 userStake = userStakes[_marketId][msg.sender][winner];
        require(userStake > 0, "No winning stake");

        uint256 totalWinningStakes = (winner == 1) ? market.totalA : market.totalB;
        
        // Winnings = (UserStake / TotalWinningStakes) * (TotalPool - ProtocolFee)
        uint256 poolAfterFee = market.totalPool - (market.totalPool * protocolFeePercent / 100);
        uint256 payout = (userStake * poolAfterFee) / totalWinningStakes;

        hasClaimed[_marketId][msg.sender] = true;
        
        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(_marketId, msg.sender, payout);
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = totalProtocolFees;
        totalProtocolFees = 0;
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer failed");
    }

    // Function to receive ETH
    receive() external payable {}
}
